import { ipcMain } from 'electron'
import type { CheckpointMetadata, ConversationMessage } from '../../shared/types'
import { getCheckpointService } from '../services/checkpointService'
import { getConversationService } from '../services/conversationService'
import { Logger } from '../utils/logger'

const logger = new Logger('Checkpoint')

/**
 * Create IPC handlers for checkpoint management
 */
export function createCheckpointHandlers(): void {
  const checkpointService = getCheckpointService()
  const conversationService = getConversationService()

  // Get all checkpoints for a conversation
  ipcMain.handle('checkpoint:get-all', async (_event, conversationId: string) => {
    try {
      const checkpoints = await checkpointService.getCheckpoints(conversationId)
      return { success: true, checkpoints }
    } catch (error) {
      logger.error('Failed to get checkpoints', { conversationId, error })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Get a specific checkpoint
  ipcMain.handle('checkpoint:get', async (_event, conversationId: string, checkpointId: string) => {
    try {
      const checkpoint = await checkpointService.getCheckpoint(conversationId, checkpointId)
      return { success: true, checkpoint }
    } catch (error) {
      logger.error('Failed to get checkpoint', { conversationId, checkpointId, error })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Restore a checkpoint (returns messages)
  ipcMain.handle(
    'checkpoint:restore',
    async (_event, conversationId: string, checkpointId: string) => {
      try {
        const messages = await checkpointService.restoreCheckpoint(conversationId, checkpointId)
        return { success: true, messages }
      } catch (error) {
        logger.error('Failed to restore checkpoint', { conversationId, checkpointId, error })
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  // Restore by message index - works even without pre-existing checkpoint
  // Truncates the conversation to the specified message index
  ipcMain.handle(
    'checkpoint:restore-by-index',
    async (_event, conversationId: string, messageIndex: number) => {
      try {
        // First try to find a pre-existing checkpoint
        const checkpointMessages = await checkpointService.restoreCheckpointByIndex(
          conversationId,
          messageIndex
        )

        if (checkpointMessages) {
          // Found a checkpoint, use it
          // Also need to truncate the persisted conversation
          await conversationService.truncateMessages(conversationId, messageIndex)
          return { success: true, messages: checkpointMessages }
        }

        // No checkpoint found, truncate directly from conversation
        logger.info(
          `No checkpoint found for index ${messageIndex}, truncating conversation ${conversationId}`
        )
        const truncatedMessages = await conversationService.truncateMessages(
          conversationId,
          messageIndex
        )

        if (!truncatedMessages) {
          return {
            success: false,
            error: 'Failed to truncate conversation',
          }
        }

        return { success: true, messages: truncatedMessages }
      } catch (error) {
        logger.error('Failed to restore checkpoint by index', {
          conversationId,
          messageIndex,
          error,
        })
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )
}

/**
 * Type definition for IPC checkpoint responses
 */
export interface CheckpointGetAllResponse {
  success: boolean
  checkpoints?: CheckpointMetadata[]
  error?: string
}

export interface CheckpointGetResponse {
  success: boolean
  checkpoint?: ConversationMessage[]
  error?: string
}

export interface CheckpointRestoreResponse {
  success: boolean
  messages?: ConversationMessage[]
  error?: string
}
