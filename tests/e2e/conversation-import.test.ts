import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  getChatMessages,
  getConversationListItems,
  isWelcomeMessageVisible,
  loadConversation,
  openConversationList,
  sendMessage,
  waitForAIResponse,
  waitForChatReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

test.describe('Termaid E2E - Conversation Import & Load', () => {
  test.describe('Load saved conversation', () => {
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

    test('should display messages when loading a saved conversation', async () => {
      await waitForChatReady(page)

      // Create a conversation by sending a message
      await sendMessage(page, 'Hello from test conversation')
      await waitForAIResponse(page)

      // Verify messages exist before switching
      const messagesBeforeSwitch = await getChatMessages(page)
      expect(messagesBeforeSwitch.length).toBeGreaterThanOrEqual(2)

      // Start a new conversation to go back to welcome screen
      const newButton = page.locator(SELECTORS.newConversationButton)
      await newButton.click()

      // Wait for welcome screen to appear
      await page.waitForSelector(SELECTORS.chatWelcome, {
        state: 'visible',
        timeout: TIMEOUTS.standard,
      })
      const welcomeVisible = await isWelcomeMessageVisible(page)
      expect(welcomeVisible).toBe(true)

      // Open conversation list and verify our conversation appears
      await openConversationList(page)
      const items = await getConversationListItems(page)
      expect(items.length).toBeGreaterThanOrEqual(1)

      // Click on the saved conversation to load it
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
      // Write test import file to temp directory before launching the app
      // The real IPC handler reads from this file in test mode (NODE_ENV=test)
      const tempDir = os.tmpdir()
      const importData = JSON.stringify({
        $schema: 'termaid-export',
        exportDate: new Date().toISOString(),
        version: '1.0',
        conversations: [
          {
            id: 'imported-conv-1',
            title: 'Imported conversation',
            createdAt: Date.now() - 50000,
            updatedAt: Date.now() - 40000,
            messages: [
              { role: 'user', content: 'Hello from imported conversation' },
              { role: 'assistant', content: 'Response from imported conversation' },
            ],
          },
        ],
      })
      fs.writeFileSync(path.join(tempDir, 'test_import.json'), importData, 'utf-8')

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

      // Clean up the test import file
      try {
        fs.unlinkSync(path.join(os.tmpdir(), 'test_import.json'))
      } catch {
        // Ignore cleanup errors
      }
    })

    test('should import conversations and display them in the list', async () => {
      await waitForChatReady(page)

      // Verify import button is visible
      const importButton = page.locator(SELECTORS.importButton)
      await expect(importButton).toBeVisible()

      // Click the import button (triggers store action -> real IPC handler -> reads temp file)
      await importButton.click()

      // Wait for the import to complete (status message appears)
      await page.waitForSelector('.export-status', {
        state: 'visible',
        timeout: TIMEOUTS.standard,
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
