import { type BrowserWindow, dialog, ipcMain } from 'electron'
import type { Conversation, ConversationMessage } from '../../shared/types'
import { getConversationService } from '../services/conversationService'

/**
 * Create IPC handlers for conversation management
 */
export function createConversationHandlers(_mainWindow: BrowserWindow): void {
  const conversationService = getConversationService()

  // Get all conversations
  ipcMain.handle('conversation:get-all', async () => {
    return conversationService.getAllConversations()
  })

  // Get a specific conversation by ID
  ipcMain.handle('conversation:get', async (_event, id: string) => {
    return conversationService.getConversation(id)
  })

  // Create a new conversation
  ipcMain.handle('conversation:create', async (_event, firstMessage: string) => {
    return conversationService.createConversation(firstMessage)
  })

  // Add a message to a conversation
  ipcMain.handle(
    'conversation:add-message',
    async (_event, conversationId: string, message: ConversationMessage) => {
      return conversationService.addMessage(conversationId, message)
    }
  )

  // Update a conversation
  ipcMain.handle(
    'conversation:update',
    async (_event, id: string, updates: Partial<Conversation>) => {
      return conversationService.updateConversation(id, updates)
    }
  )

  // Update a specific message in a conversation
  ipcMain.handle(
    'conversation:update-message',
    async (
      _event,
      conversationId: string,
      messageIndex: number,
      updates: Partial<ConversationMessage>
    ) => {
      return conversationService.updateMessage(conversationId, messageIndex, updates)
    }
  )

  // Delete a conversation
  ipcMain.handle('conversation:delete', async (_event, id: string) => {
    return conversationService.deleteConversation(id)
  })

  // Clear all conversations (for testing/reset)
  ipcMain.handle('conversation:clear-all', async () => {
    conversationService.clearAllConversations()
    return true
  })

  // Export a single conversation to JSON file
  ipcMain.handle('conversation:export', async (_event, id: string) => {
    try {
      const exportData = conversationService.exportConversation(id)
      const conversation = conversationService.getConversation(id)
      const defaultName = conversation
        ? `${conversation.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_export.json`
        : 'conversation_export.json'

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Conversation',
        defaultPath: defaultName,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })

      if (filePath) {
        const fs = await import('node:fs')
        fs.writeFileSync(filePath, exportData, 'utf-8')
        return { success: true, filePath }
      }

      return { success: false, cancelled: true }
    } catch (error) {
      // Error exporting conversation
      return {
        success: false,
        cancelled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // Export all conversations to JSON file
  ipcMain.handle('conversation:export-all', async () => {
    try {
      const exportData = conversationService.exportAllConversations()
      const date = new Date().toISOString().split('T')[0]
      const defaultName = `shellm_conversations_${date}.json`

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export All Conversations',
        defaultPath: defaultName,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })

      if (filePath) {
        const fs = await import('node:fs')
        fs.writeFileSync(filePath, exportData, 'utf-8')
        return { success: true, filePath }
      }

      return { success: false, cancelled: true }
    } catch (error) {
      // Error exporting conversations
      return {
        success: false,
        cancelled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
}
