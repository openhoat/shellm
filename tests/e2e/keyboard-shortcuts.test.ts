import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  cancelActionByShortcut,
  clearAllConversationsByShortcut,
  executeCommandByShortcut,
  getChatMessages,
  isCommandActionsVisible,
  isConfigPanelVisible,
  isWelcomeMessageVisible,
  openConfigPanel,
  openConversationList,
  resetAppState,
  sendMessage,
  typeInChat,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandActionsHidden,
  waitForTerminalReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

let app: ElectronApplication
let page: Page

test.describe('Termaid E2E - Keyboard Shortcuts', () => {
  test.beforeAll(async () => {
    const result = await launchElectronApp({ mocks: {} })
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

  test.describe('Escape key shortcuts', () => {
    test('should cancel command proposal when Escape is pressed', async () => {
      await sendMessage(page, 'List all files')
      await waitForAIResponse(page)
      await waitForCommandActions(page)

      // Verify command actions are visible before pressing Escape
      const beforeEscape = await isCommandActionsVisible(page)
      expect(beforeEscape).toBe(true)

      // Press Escape to cancel
      await cancelActionByShortcut(page)

      // Command actions should be hidden
      await waitForCommandActionsHidden(page)
      const afterEscape = await isCommandActionsVisible(page)
      expect(afterEscape).toBe(false)
    })

    test('should close config panel when Escape is pressed', async () => {
      await openConfigPanel(page)

      // Verify config panel is visible
      const panelVisible = await isConfigPanelVisible(page)
      expect(panelVisible).toBe(true)

      // Press Escape to close
      await cancelActionByShortcut(page)

      // Wait for config panel to close
      await expect(page.locator(SELECTORS.configPanel)).not.toBeVisible({
        timeout: TIMEOUTS.standard,
      })
    })

    test('should close conversation dropdown when Escape is pressed', async () => {
      await openConversationList(page)

      // Verify dropdown is visible
      const dropdown = page.locator(SELECTORS.conversationDropdown)
      await expect(dropdown).toBeVisible()

      // Press Escape to close
      await cancelActionByShortcut(page)

      // Wait for dropdown to close
      await expect(dropdown).not.toBeVisible({ timeout: TIMEOUTS.standard })
    })
  })

  test.describe('Ctrl+K shortcut', () => {
    test('should clear current conversation', async () => {
      // Send a message and wait for AI response
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Verify messages exist
      const messagesBefore = await getChatMessages(page)
      expect(messagesBefore.length).toBeGreaterThan(0)

      // Cancel any command actions first so Ctrl+K works cleanly
      if (await isCommandActionsVisible(page)) {
        await cancelActionByShortcut(page)
        await waitForCommandActionsHidden(page)
      }

      // Press Ctrl+K to clear
      await clearAllConversationsByShortcut(page)

      // Wait for conversation to be cleared
      await page.waitForFunction(
        () =>
          !!document.querySelector('.chat-welcome') ||
          document.querySelectorAll('.chat-message').length === 0,
        { timeout: TIMEOUTS.standard }
      )

      // Verify messages are cleared or welcome screen returns
      const welcomeVisible = await isWelcomeMessageVisible(page)
      const messagesAfter = await getChatMessages(page)
      expect(welcomeVisible || messagesAfter.length === 0).toBe(true)
    })

    test('should work even when command actions are visible', async () => {
      // Send a message and wait for command actions
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)
      await waitForCommandActions(page)

      // Verify command actions are visible
      const actionsVisible = await isCommandActionsVisible(page)
      expect(actionsVisible).toBe(true)

      // Press Ctrl+K to clear
      await clearAllConversationsByShortcut(page)

      // Wait for conversation to be cleared
      await page.waitForFunction(
        () =>
          !!document.querySelector('.chat-welcome') ||
          document.querySelectorAll('.chat-message').length === 0,
        { timeout: TIMEOUTS.standard }
      )

      // Verify cleanup occurred
      const welcomeVisible = await isWelcomeMessageVisible(page)
      const messagesAfter = await getChatMessages(page)
      expect(welcomeVisible || messagesAfter.length === 0).toBe(true)
    })
  })

  test.describe('Ctrl+Enter shortcut', () => {
    test('should execute proposed command when command actions are visible', async () => {
      // Wait for terminal to be ready
      await waitForTerminalReady(page)

      // Send a message and wait for command actions
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)
      await waitForCommandActions(page)

      // Check if execute button is enabled
      const executeButton = page.locator(SELECTORS.executeButton)
      const isEnabled = await executeButton.isEnabled()

      if (isEnabled) {
        // Press Ctrl+Enter to execute
        await executeCommandByShortcut(page)

        // Command actions should disappear after execution
        await waitForCommandActionsHidden(page, TIMEOUTS.standard)

        const actionsVisible = await isCommandActionsVisible(page)
        expect(actionsVisible).toBe(false)
      }
    })
  })

  test.describe('Chat input shortcuts', () => {
    test('should send message when Enter is pressed', async () => {
      // Type a message in the chat input
      await typeInChat(page, 'Hello from keyboard test')

      // Press Enter to send
      const input = page.locator(SELECTORS.chatInput)
      await input.press('Enter')

      // Wait for message to appear in chat
      await page.waitForSelector(SELECTORS.userMessage, {
        state: 'visible',
        timeout: TIMEOUTS.standard,
      })

      // Verify the message appears in the chat
      const messages = await getChatMessages(page)
      expect(messages.length).toBeGreaterThan(0)
      expect(messages.some(m => m.includes('Hello from keyboard test'))).toBe(true)
    })

    test('should allow focusing chat textarea', async () => {
      const input = page.locator(SELECTORS.chatInput)

      // Click on the chat textarea
      await input.click()

      // Verify it is focused
      const isFocused = await input.evaluate(el => document.activeElement === el)
      expect(isFocused).toBe(true)
    })
  })
})
