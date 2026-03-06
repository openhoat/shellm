import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import type { Conversation } from '@shared/types'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  getChatMessages,
  getConversationListItems,
  isWelcomeMessageVisible,
  loadConversation,
  openConversationList,
  waitForChatReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

// Pre-seeded conversations to simulate previously saved data
const seededConversations: Conversation[] = [
  {
    id: 'conv-seeded-1',
    title: 'Seeded conversation for load test',
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 10000,
    messages: [
      { role: 'user', content: 'Hello from seeded conversation' },
      { role: 'assistant', content: 'AI response from seeded conversation' },
    ],
  },
]

test.describe('Termaid E2E - Conversation Import & Load', () => {
  test.describe('Load saved conversation', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        locale: 'en',
        mocks: {
          aiCommand: { type: 'text', content: 'Mock AI response.' },
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

    test('should display messages when loading a saved conversation', async () => {
      await waitForChatReady(page)

      // Welcome screen should be visible initially
      const welcomeVisible = await isWelcomeMessageVisible(page)
      expect(welcomeVisible).toBe(true)

      // Open conversation list and verify seeded conversation appears
      await openConversationList(page)
      const items = await getConversationListItems(page)
      expect(items.length).toBeGreaterThanOrEqual(1)
      expect(items[0]).toContain('Seeded conversation')

      // Click on the seeded conversation to load it
      await loadConversation(page, 0)

      // Wait for messages to appear
      await page.waitForSelector(SELECTORS.chatMessage, {
        state: 'visible',
        timeout: TIMEOUTS.standard,
      })

      // Welcome screen should be hidden now
      const welcomeAfterLoad = await isWelcomeMessageVisible(page)
      expect(welcomeAfterLoad).toBe(false)

      // Verify the conversation messages are displayed
      const messages = await getChatMessages(page)
      expect(messages.length).toBeGreaterThanOrEqual(2)
    })
  })

  test.describe('Import conversations', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        locale: 'en',
        mocks: {
          aiCommand: { type: 'text', content: 'Mock AI response.' },
        },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should import conversations and display them in the list', async () => {
      await waitForChatReady(page)

      // Verify import button is visible
      const importButton = page.locator(SELECTORS.importButton)
      await expect(importButton).toBeVisible()

      // Import conversations via the API (simulates the import flow)
      const importResult = await page.evaluate(async () => {
        return window.electronAPI.conversationImport()
      })
      expect(importResult.success).toBe(true)
      expect(importResult.imported).toBeGreaterThan(0)

      // Refresh the conversation list in the store
      await page.evaluate(async () => {
        // Trigger a re-load of conversations
        const conversations = await window.electronAPI.conversationGetAll()
        return conversations.length
      })

      // Open conversation list and verify imported conversation appears
      await openConversationList(page)
      const items = await getConversationListItems(page)
      expect(items.length).toBeGreaterThanOrEqual(1)
      expect(items.some(item => item.includes('Imported conversation'))).toBe(true)
    })

    test('should load an imported conversation and display its messages', async () => {
      // Ensure the dropdown is open
      const dropdownVisible = await page
        .locator(SELECTORS.conversationDropdown)
        .isVisible()
        .catch(() => false)

      if (!dropdownVisible) {
        await openConversationList(page)
      }

      // Find the imported conversation and click on it
      const items = await getConversationListItems(page)
      const importedIndex = items.findIndex(item => item.includes('Imported conversation'))
      expect(importedIndex).toBeGreaterThanOrEqual(0)

      await loadConversation(page, importedIndex)

      // Wait for messages to appear
      await page.waitForSelector(SELECTORS.chatMessage, {
        state: 'visible',
        timeout: TIMEOUTS.standard,
      })

      // Welcome screen should be hidden
      const welcomeVisible = await isWelcomeMessageVisible(page)
      expect(welcomeVisible).toBe(false)

      // Verify messages from the imported conversation are displayed
      const messages = await getChatMessages(page)
      expect(messages.length).toBeGreaterThanOrEqual(2)
    })
  })
})
