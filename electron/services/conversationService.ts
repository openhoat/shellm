import fs from 'node:fs/promises'
import path from 'node:path'
import { app } from 'electron'
import type { Conversation, ConversationMessage, ConversationsList } from '../../shared/types'

// Cache entry with TTL
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const DEFAULT_TTL_MS = 60_000 // 1 minute

/**
 * Service for managing conversation persistence on disk
 */
class ConversationService {
  private filePath: string
  private cache: Map<string, CacheEntry<Conversation>> = new Map()
  private listCache: CacheEntry<Conversation[]> | null = null
  private ttlMs: number

  constructor(ttlMs: number = DEFAULT_TTL_MS) {
    const userDataPath = app.getPath('userData')
    this.filePath = path.join(userDataPath, 'conversations.json')
    this.ttlMs = ttlMs
    // Sync initialization for backward compatibility
    this.ensureFileExistsSync()
  }

  /**
   * Ensure the conversations file exists (sync version for constructor)
   */
  private ensureFileExistsSync(): void {
    const fsSync = require('node:fs')
    const dir = path.dirname(this.filePath)
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true })
    }
    if (!fsSync.existsSync(this.filePath)) {
      fsSync.writeFileSync(this.filePath, JSON.stringify({ conversations: [] }), 'utf-8')
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(entry: CacheEntry<unknown> | undefined | null): boolean {
    if (!entry) return false
    return Date.now() < entry.expiresAt
  }

  /**
   * Invalidate cache for a specific conversation
   */
  private invalidateCache(conversationId?: string): void {
    if (conversationId) {
      this.cache.delete(conversationId)
    } else {
      this.cache.clear()
    }
    this.listCache = null
  }

  /**
   * Read conversations from disk (async)
   */
  private async read(): Promise<ConversationsList> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      return JSON.parse(data) as ConversationsList
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for conversation read errors
      console.error('[ConversationService] Failed to read conversations file:', error)
      return { conversations: [] }
    }
  }

  /**
   * Save conversations to disk (async)
   */
  private async save(data: ConversationsList): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  /**
   * Generate a conversation title from the first user message
   */
  private generateTitle(firstMessage: string): string {
    const truncated = firstMessage.slice(0, 50)
    return truncated + (firstMessage.length > 50 ? '...' : '')
  }

  /**
   * Create a new conversation
   */
  async createConversation(firstMessage: string): Promise<Conversation> {
    const data = await this.read()
    const now = Date.now()
    const newConversation: Conversation = {
      id: `${now}-${Math.random().toString(36).slice(2, 11)}`,
      title: this.generateTitle(firstMessage),
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    data.conversations.push(newConversation)
    await this.save(data)
    this.invalidateCache()
    return newConversation
  }

  /**
   * Get all conversations
   */
  async getAllConversations(): Promise<Conversation[]> {
    // Check list cache
    if (this.listCache && this.isCacheValid(this.listCache)) {
      return this.listCache.data
    }

    const data = await this.read()
    const sorted = data.conversations.sort((a, b) => b.updatedAt - a.updatedAt)

    // Update cache
    this.listCache = {
      data: sorted,
      expiresAt: Date.now() + this.ttlMs,
    }

    return sorted
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    // Check single-item cache
    const cached = this.cache.get(id)
    if (cached && this.isCacheValid(cached)) {
      return cached.data
    }

    const data = await this.read()
    const conversation = data.conversations.find(conv => conv.id === id) || null

    if (conversation) {
      this.cache.set(id, {
        data: conversation,
        expiresAt: Date.now() + this.ttlMs,
      })
    }

    return conversation
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string,
    message: ConversationMessage
  ): Promise<Conversation | null> {
    const data = await this.read()
    const conversation = data.conversations.find(conv => conv.id === conversationId)

    if (!conversation) {
      return null
    }

    conversation.messages.push(message)
    conversation.updatedAt = Date.now()

    await this.save(data)
    this.invalidateCache(conversationId)
    return conversation
  }

  /**
   * Update a conversation (e.g., rename)
   */
  async updateConversation(
    id: string,
    updates: Partial<Conversation>
  ): Promise<Conversation | null> {
    const data = await this.read()
    const conversation = data.conversations.find(conv => conv.id === id)

    if (!conversation) {
      return null
    }

    Object.assign(conversation, updates, { updatedAt: Date.now() })

    await this.save(data)
    this.invalidateCache(id)
    return conversation
  }

  /**
   * Update a specific message in a conversation
   */
  async updateMessage(
    conversationId: string,
    messageIndex: number,
    updates: Partial<ConversationMessage>
  ): Promise<Conversation | null> {
    const data = await this.read()
    const conversation = data.conversations.find(conv => conv.id === conversationId)

    if (!conversation) {
      return null
    }

    if (messageIndex < 0 || messageIndex >= conversation.messages.length) {
      return null
    }

    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updates,
    }
    conversation.updatedAt = Date.now()

    await this.save(data)
    this.invalidateCache(conversationId)
    return conversation
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<boolean> {
    const data = await this.read()
    const initialLength = data.conversations.length
    data.conversations = data.conversations.filter(conv => conv.id !== id)

    if (data.conversations.length < initialLength) {
      await this.save(data)
      this.invalidateCache(id)
      return true
    }

    return false
  }

  /**
   * Clear all conversations (for testing or reset)
   */
  async clearAllConversations(): Promise<void> {
    await this.save({ conversations: [] })
    this.invalidateCache()
  }

  /**
   * Export a single conversation to JSON format
   */
  async exportConversation(id: string): Promise<string> {
    const conversation = await this.getConversation(id)
    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`)
    }

    const exportData = {
      $schema: 'https://github.com/openhoat/termaid/schemas/conversation-export.schema.json',
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      conversations: [conversation],
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Export all conversations to JSON format
   */
  async exportAllConversations(): Promise<string> {
    const conversations = await this.getAllConversations()

    const exportData = {
      $schema: 'https://github.com/openhoat/termaid/schemas/conversation-export.schema.json',
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      conversations,
    }

    return JSON.stringify(exportData, null, 2)
  }
}

// Singleton instance
let conversationServiceInstance: ConversationService | null = null

/**
 * Get or create the conversation service singleton
 */
export function getConversationService(): ConversationService {
  if (!conversationServiceInstance) {
    conversationServiceInstance = new ConversationService()
  }
  return conversationServiceInstance
}
