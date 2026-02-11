import { type BrowserWindow, ipcMain } from 'electron'
import { getConversationService } from '../services/conversationService'
import type { Conversation, ConversationMessage } from '../../shared/types'

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
  ipcMain.handle('conversation:add-message', async (_event, conversationId: string, message: ConversationMessage) => {
    return conversationService.addMessage(conversationId, message)
  })

  // Update a conversation
  ipcMain.handle('conversation:update', async (_event, id: string, updates: Partial<Conversation>) => {
    return conversationService.updateConversation(id, updates)
  })

  // Delete a conversation
  ipcMain.handle('conversation:delete', async (_event, id: string) => {
    return conversationService.deleteConversation(id)
  })

  // Clear all conversations (for testing/reset)
  ipcMain.handle('conversation:clear-all', async () => {
    conversationService.clearAllConversations()
    return true
  })
}