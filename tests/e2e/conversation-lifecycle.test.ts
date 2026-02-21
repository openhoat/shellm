import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import type { Conversation } from '@shared/types'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  createNewConversation,
  deleteConversation,
  getChatMessages,
  getConversationListItems,
  openConversationList,
  resetAppState,
  sendMessage,
  waitForAIResponse,
  waitForChatReady,
} from './helpers'

// Pre-seeded conversations for tests that need existing data
const seededConversations: Conversation[] = [
  {
    id: 'conv-seed-1',
    title: 'First seeded conversation',
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 10000,
    messages: [
      { role: 'user', content: 'Hello from first conversation' },
      { role: 'assistant', content: 'Response from first conversation' },
    ],
  },
  {
    id: 'conv-seed-2',
    title: 'Second seeded conversation',
    createdAt: Date.now() - 30000,
    updatedAt: Date.now() - 20000,
    messages: [
      { role: 'user', content: 'Hello from second conversation' },
      { role: 'assistant', content: 'Response from second conversation' },
    ],
  },
]

test.describe('Termaid E2E - Conversation Lifecycle', () => {
  test.describe('Create conversation', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: { aiCommand: { type: 'text', content: 'This is a helpful AI response.' } },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test.beforeEach(async () => {
      await resetAppState(page)
    })

    test('should create a conversation when sending a message', async () => {
      await waitForChatReady(page)

      // Send a message to trigger conversation creation
      await sendMessage(page, 'Hello, this is my first message')
      await waitForAIResponse(page)

      // Verify messages appear in the chat
      const messages = await getChatMessages(page)
      expect(messages.length).toBeGreaterThanOrEqual(2)

      // Open conversation list and verify the new conversation appears
      await openConversationList(page)
      const items = await getConversationListItems(page)
      expect(items.length).toBeGreaterThan(0)
    })

    test('should set conversation title based on first message', async () => {
      await waitForChatReady(page)

      const firstMessage = 'Show me disk usage'
      await sendMessage(page, firstMessage)
      await waitForAIResponse(page)

      // Open conversation list and check the title
      await openConversationList(page)
      const items = await getConversationListItems(page)
      expect(items.length).toBeGreaterThan(0)
      // The mock creates a title from the first 50 chars of the message
      expect(items[0]).toContain(firstMessage)
    })
  })

  test.describe('Multiple conversations', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: { aiCommand: { type: 'text', content: 'AI response for multi-conversation test.' } },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should handle creating multiple conversations', async () => {
      await waitForChatReady(page)

      // Create first conversation by sending a message
      await sendMessage(page, 'First conversation message')
      await waitForAIResponse(page)

      // Open conversation list and verify it appears
      await openConversationList(page)
      const itemsAfterFirst = await getConversationListItems(page)
      expect(itemsAfterFirst.length).toBeGreaterThanOrEqual(1)

      // Close the dropdown before creating a new conversation
      await page.keyboard.press('Escape')
      await page.waitForSelector('.conversation-dropdown', { state: 'hidden', timeout: 5000 })

      // Create a new conversation
      await createNewConversation(page)
      await waitForChatReady(page)

      // Send a message in the new conversation
      await waitForChatReady(page)
      await sendMessage(page, 'Second conversation message')
      await waitForAIResponse(page)

      // Open conversation list and verify both conversations exist
      await openConversationList(page)
      const itemsAfterSecond = await getConversationListItems(page)
      expect(itemsAfterSecond.length).toBeGreaterThanOrEqual(2)
    })
  })

  test.describe('Delete conversation', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: {
          aiCommand: { type: 'text', content: 'Response for delete test.' },
          conversations: seededConversations,
        },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should delete a conversation from the list', async () => {
      // Open conversation list to see pre-seeded conversations
      await openConversationList(page)

      const itemsBefore = await getConversationListItems(page)
      expect(itemsBefore.length).toBe(2)

      // Delete the first conversation (handles confirm dialog internally)
      await deleteConversation(page, 0)

      // Wait for the deletion to process
      await page.waitForTimeout(300)

      // Verify the conversation was removed
      const itemsAfter = await getConversationListItems(page)
      expect(itemsAfter.length).toBe(1)
    })
  })

  test.describe('Export conversations', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: {
          aiCommand: { type: 'text', content: 'Response for export test.' },
          conversations: [seededConversations[0]],
        },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should export current conversation', async () => {
      // Open conversation list to reveal export button
      await openConversationList(page)

      // Click the "Export Current" button
      const exportButton = page.locator('.export-button')
      await exportButton.click()

      // Verify export status message appears
      const exportStatus = page.locator('.export-status')
      await exportStatus.waitFor({ state: 'visible', timeout: 5000 })
      const statusText = await exportStatus.textContent()
      expect(statusText).toBeTruthy()
    })

    test('should export all conversations', async () => {
      // Click the export all button in the header
      const exportAllButton = page.locator('header button[title="Export all conversations"]')
      await exportAllButton.click()

      // Verify export status message appears
      const exportStatus = page.locator('.export-status')
      await exportStatus.waitFor({ state: 'visible', timeout: 5000 })
      const statusText = await exportStatus.textContent()
      expect(statusText).toBeTruthy()
    })
  })
})
