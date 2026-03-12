import fs from 'node:fs/promises'
import path from 'node:path'
import { app } from 'electron'
import type { Checkpoint, CheckpointMetadata, ConversationMessage } from '../../shared/types'
import { Logger } from '../utils/logger'

const logger = new Logger('CheckpointService')

/**
 * Service for managing conversation checkpoints.
 * Checkpoints are created automatically after each user message,
 * allowing users to restore conversation state to any previous point.
 */
class CheckpointService {
  private filePath: string
  private cache: Map<string, Checkpoint[]> = new Map()
  private initialized = false

  constructor() {
    const userDataPath = app.getPath('userData')
    this.filePath = path.join(userDataPath, 'checkpoints.json')
  }

  /**
   * Ensure the checkpoints file exists
   */
  private async ensureFileExists(): Promise<void> {
    if (this.initialized) return

    try {
      await fs.access(this.filePath)
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify({}), 'utf-8')
    }
    this.initialized = true
  }

  /**
   * Read all checkpoints from disk
   */
  private async readAll(): Promise<Record<string, Checkpoint[]>> {
    await this.ensureFileExists()
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return {}
    }
  }

  /**
   * Save all checkpoints to disk
   */
  private async saveAll(data: Record<string, Checkpoint[]>): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  /**
   * Generate a unique checkpoint ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  /**
   * Get preview text from messages (last user message)
   */
  private getPreview(messages: ConversationMessage[]): string {
    // Find the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content.slice(0, 50) + (messages[i].content.length > 50 ? '...' : '')
      }
    }
    return 'Checkpoint'
  }

  /**
   * Create a checkpoint for a conversation (called automatically after user message)
   */
  async createCheckpoint(
    conversationId: string,
    messageIndex: number,
    messages: ConversationMessage[]
  ): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: this.generateId(),
      conversationId,
      messageIndex,
      messages: [...messages], // Deep copy
      createdAt: Date.now(),
    }

    const allCheckpoints = await this.readAll()
    if (!allCheckpoints[conversationId]) {
      allCheckpoints[conversationId] = []
    }
    allCheckpoints[conversationId].push(checkpoint)
    await this.saveAll(allCheckpoints)

    // Update cache
    this.cache.set(conversationId, allCheckpoints[conversationId])

    logger.debug(`Created checkpoint ${checkpoint.id} for conversation ${conversationId}`)
    return checkpoint
  }

  /**
   * Get all checkpoints for a conversation (metadata only)
   */
  async getCheckpoints(conversationId: string): Promise<CheckpointMetadata[]> {
    // Check cache first
    if (this.cache.has(conversationId)) {
      const checkpoints = this.cache.get(conversationId)
      if (checkpoints) {
        return checkpoints.map(cp => ({
          id: cp.id,
          conversationId: cp.conversationId,
          messageIndex: cp.messageIndex,
          createdAt: cp.createdAt,
          preview: this.getPreview(cp.messages),
        }))
      }
    }

    const allCheckpoints = await this.readAll()
    const checkpoints = allCheckpoints[conversationId] || []
    this.cache.set(conversationId, checkpoints)

    return checkpoints.map(cp => ({
      id: cp.id,
      conversationId: cp.conversationId,
      messageIndex: cp.messageIndex,
      createdAt: cp.createdAt,
      preview: this.getPreview(cp.messages),
    }))
  }

  /**
   * Get a specific checkpoint (full data)
   */
  async getCheckpoint(conversationId: string, checkpointId: string): Promise<Checkpoint | null> {
    const allCheckpoints = await this.readAll()
    const checkpoints = allCheckpoints[conversationId] || []
    return checkpoints.find(cp => cp.id === checkpointId) || null
  }

  /**
   * Restore conversation to a checkpoint (returns messages)
   */
  async restoreCheckpoint(
    conversationId: string,
    checkpointId: string
  ): Promise<ConversationMessage[] | null> {
    const checkpoint = await this.getCheckpoint(conversationId, checkpointId)
    if (!checkpoint) {
      return null
    }

    logger.info(`Restoring checkpoint ${checkpointId} for conversation ${conversationId}`)
    return [...checkpoint.messages]
  }

  /**
   * Restore conversation to a checkpoint by message index (returns messages)
   */
  async restoreCheckpointByIndex(
    conversationId: string,
    messageIndex: number
  ): Promise<ConversationMessage[] | null> {
    const allCheckpoints = await this.readAll()
    const checkpoints = allCheckpoints[conversationId] || []

    // Find checkpoint for this message index
    const checkpoint = checkpoints.find(cp => cp.messageIndex === messageIndex)
    if (!checkpoint) {
      logger.warn(
        `No checkpoint found for message index ${messageIndex} in conversation ${conversationId}`
      )
      return null
    }

    logger.info(
      `Restoring checkpoint for message index ${messageIndex} in conversation ${conversationId}`
    )
    return [...checkpoint.messages]
  }

  /**
   * Delete all checkpoints for a conversation (called when conversation is deleted)
   */
  async deleteCheckpointsForConversation(conversationId: string): Promise<void> {
    const allCheckpoints = await this.readAll()
    if (allCheckpoints[conversationId]) {
      delete allCheckpoints[conversationId]
      await this.saveAll(allCheckpoints)
      this.cache.delete(conversationId)
      logger.debug(`Deleted all checkpoints for conversation ${conversationId}`)
    }
  }

  /**
   * Clear all checkpoints (for testing/reset)
   */
  async clearAll(): Promise<void> {
    await this.saveAll({})
    this.cache.clear()
  }
}

// Singleton instance
let checkpointServiceInstance: CheckpointService | null = null

/**
 * Get or create the checkpoint service singleton
 */
export function getCheckpointService(): CheckpointService {
  if (!checkpointServiceInstance) {
    checkpointServiceInstance = new CheckpointService()
  }
  return checkpointServiceInstance
}
