import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import type { Conversation, ConversationMessage, ConversationsList } from '../../shared/types'

/**
 * Service for managing conversation persistence on disk
 */
class ConversationService {
  private filePath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.filePath = path.join(userDataPath, 'conversations.json')
    this.ensureFileExists()
  }

  /**
   * Ensure the conversations file exists
   */
  private ensureFileExists(): void {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (!fs.existsSync(this.filePath)) {
      this.save({ conversations: [] })
    }
  }

  /**
   * Read conversations from disk
   */
  private read(): ConversationsList {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8')
      return JSON.parse(data) as ConversationsList
    } catch (_error) {
      // Error reading conversations
      return { conversations: [] }
    }
  }

  /**
   * Save conversations to disk
   */
  private save(data: ConversationsList): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  /**
   * Generate a conversation title from the first user message
   */
  private generateTitle(firstMessage: string): string {
    // Truncate to 50 characters max
    const truncated = firstMessage.slice(0, 50)
    return truncated + (firstMessage.length > 50 ? '...' : '')
  }

  /**
   * Create a new conversation
   */
  createConversation(firstMessage: string): Conversation {
    const data = this.read()
    const now = Date.now()
    const newConversation: Conversation = {
      id: `${now}-${Math.random().toString(36).slice(2, 11)}`,
      title: this.generateTitle(firstMessage),
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    data.conversations.push(newConversation)
    this.save(data)
    return newConversation
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    const data = this.read()
    // Sort by updatedAt descending (most recent first)
    return data.conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  /**
   * Get a conversation by ID
   */
  getConversation(id: string): Conversation | null {
    const data = this.read()
    return data.conversations.find(conv => conv.id === id) || null
  }

  /**
   * Add a message to a conversation
   */
  addMessage(conversationId: string, message: ConversationMessage): Conversation | null {
    const data = this.read()
    const conversation = data.conversations.find(conv => conv.id === conversationId)

    if (!conversation) {
      return null
    }

    conversation.messages.push(message)
    conversation.updatedAt = Date.now()

    this.save(data)
    return conversation
  }

  /**
   * Update a conversation (e.g., rename)
   */
  updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
    const data = this.read()
    const conversation = data.conversations.find(conv => conv.id === id)

    if (!conversation) {
      return null
    }

    Object.assign(conversation, updates, { updatedAt: Date.now() })

    this.save(data)
    return conversation
  }

  /**
   * Update a specific message in a conversation
   * Used to add command output and interpretation after execution
   */
  updateMessage(
    conversationId: string,
    messageIndex: number,
    updates: Partial<ConversationMessage>
  ): Conversation | null {
    const data = this.read()
    const conversation = data.conversations.find(conv => conv.id === conversationId)

    if (!conversation) {
      return null
    }

    if (messageIndex < 0 || messageIndex >= conversation.messages.length) {
      return null
    }

    // Merge the updates into the existing message
    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updates,
    }
    conversation.updatedAt = Date.now()

    this.save(data)
    return conversation
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): boolean {
    const data = this.read()
    const initialLength = data.conversations.length
    data.conversations = data.conversations.filter(conv => conv.id !== id)

    if (data.conversations.length < initialLength) {
      this.save(data)
      return true
    }

    return false
  }

  /**
   * Clear all conversations (for testing or reset)
   */
  clearAllConversations(): void {
    this.save({ conversations: [] })
  }

  /**
   * Export a single conversation to JSON format
   */
  exportConversation(id: string): string {
    const conversation = this.getConversation(id)
    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`)
    }

    const exportData = {
      $schema: 'https://github.com/openhoat/shellm/schemas/conversation-export.schema.json',
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      conversations: [conversation],
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Export all conversations to JSON format
   */
  exportAllConversations(): string {
    const conversations = this.getAllConversations()

    const exportData = {
      $schema: 'https://github.com/openhoat/shellm/schemas/conversation-export.schema.json',
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
