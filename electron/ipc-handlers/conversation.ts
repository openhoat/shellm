import { app, dialog, ipcMain } from 'electron'
import type { Conversation, ConversationMessage } from '../../shared/types'
import { getConversationService } from '../services/conversationService'
import { Logger } from '../utils/logger'

// Logger instance for conversation handlers
const logger = new Logger('Conversation')

/**
 * Create IPC handlers for conversation management
 */
export function createConversationHandlers(): void {
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

  ipcMain.handle(
    'conversation:update',
    async (_event, id: string, updates: Partial<Conversation>) => {
      return conversationService.updateConversation(id, updates)
    }
  )

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
    await conversationService.clearAllConversations()
    return true
  })

  // Import conversations from a JSON file
  ipcMain.handle('conversation:import', async () => {
    try {
      const fs = await import('node:fs')
      const path = await import('node:path')

      let filePath: string | undefined

      // In test mode, read from a predefined temp file
      if (process.env.NODE_ENV === 'test') {
        const tempDir = app.getPath('temp')
        filePath = path.join(tempDir, 'test_import.json')
        if (!fs.existsSync(filePath)) {
          return { success: false, error: 'Test import file not found' }
        }
      } else {
        const result = await dialog.showOpenDialog({
          title: 'Import Conversations',
          filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
        })

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, cancelled: true }
        }

        filePath = result.filePaths[0]
      }

      const jsonData = fs.readFileSync(filePath, 'utf-8')
      const importResult = await conversationService.importConversations(jsonData)

      return {
        success: true,
        imported: importResult.imported,
        skipped: importResult.skipped,
      }
    } catch (error) {
      logger.error('Failed to import conversations', error)
      return {
        success: false,
        cancelled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // Export a single conversation to JSON file
  ipcMain.handle('conversation:export', async (_event, id: string) => {
    try {
      const exportData = await conversationService.exportConversation(id)
      const conversation = await conversationService.getConversation(id)
      const defaultName = conversation
        ? `${conversation.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_export.json`
        : 'conversation_export.json'

      const fs = await import('node:fs')
      const path = await import('node:path')

      // In test mode, write to a temp file without showing a dialog
      if (process.env.NODE_ENV === 'test') {
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, defaultName)
        fs.writeFileSync(filePath, exportData, 'utf-8')
        return { success: true, filePath }
      }

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Conversation',
        defaultPath: defaultName,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })

      if (filePath) {
        fs.writeFileSync(filePath, exportData, 'utf-8')
        return { success: true, filePath }
      }

      return { success: false, cancelled: true }
    } catch (error) {
      logger.error('Failed to export conversation', error)
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
      const exportData = await conversationService.exportAllConversations()
      const date = new Date().toISOString().split('T')[0]
      const defaultName = `termaid_conversations_${date}.json`

      const fs = await import('node:fs')
      const path = await import('node:path')

      // In test mode, write to a temp file without showing a dialog
      if (process.env.NODE_ENV === 'test') {
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, defaultName)
        fs.writeFileSync(filePath, exportData, 'utf-8')
        return { success: true, filePath }
      }

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export All Conversations',
        defaultPath: defaultName,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })

      if (filePath) {
        fs.writeFileSync(filePath, exportData, 'utf-8')
        return { success: true, filePath }
      }

      return { success: false, cancelled: true }
    } catch (error) {
      logger.error('Failed to export all conversations', error)
      return {
        success: false,
        cancelled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
}
