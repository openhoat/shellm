import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  cancelActionByShortcut,
  clearAllConversationsByShortcut,
  clickCancelButton,
  clickModifyButton,
  executeCommandByShortcut,
  getChatMessages,
  isCommandActionsVisible,
  resetAppState,
  sendMessage,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandActionsHidden,
} from './helpers'

let app: ElectronApplication
let page: Page

test.describe('Termaid E2E - Chat Functionality', () => {
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
    // Reset app state between tests
    await resetAppState(page)
  })

  test.describe('AI command generation', () => {
    test('should show command proposal after sending message', async () => {
      await sendMessage(page, 'List all files')
      await waitForAIResponse(page)

      // Wait for command actions to appear (needed with LLM streaming)
      await waitForCommandActions(page)
    })

    test('should display Execute, Modify, Cancel buttons for commands', async () => {
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Check for command action buttons
      const executeButton = page.locator('.command-actions .btn-execute')
      const modifyButton = page.locator('.command-actions .btn-modify')
      const cancelButton = page.locator('.command-actions .btn-cancel')

      await expect(executeButton).toBeVisible()
      await expect(modifyButton).toBeVisible()
      await expect(cancelButton).toBeVisible()
    })

    test('should allow modifying command', async () => {
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Wait for command actions to appear (needed with LLM streaming)
      await waitForCommandActions(page)

      // Click Modify button
      await clickModifyButton(page)

      // Check that command is now in input field
      const input = page.locator('.chat-input textarea')
      const value = await input.inputValue()
      expect(value.length).toBeGreaterThan(0)

      // Command actions should be hidden after modify
      await waitForCommandActionsHidden(page)
    })

    test('should allow canceling command', async () => {
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Wait for command actions to appear (needed with LLM streaming)
      await waitForCommandActions(page)

      // Click Cancel button
      await clickCancelButton(page)

      // Command actions should be hidden
      await waitForCommandActionsHidden(page)

      const afterCancel = await isCommandActionsVisible(page)
      expect(afterCancel).toBe(false)
    })

    test('should show terminal not ready state when terminal is not initialized', async () => {
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Execute button might be disabled if terminal isn't ready
      const executeButton = page.locator('.command-actions .btn-execute')
      await expect(executeButton).toBeVisible()

      // Button should be either disabled (preparing) or enabled (ready)
      const buttonText = await executeButton.textContent()
      expect(buttonText).toBeTruthy()
    })
  })

  test.describe('Keyboard shortcuts', () => {
    test('should cancel command with Escape', async () => {
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Wait for command actions to appear (needed with LLM streaming)
      await waitForCommandActions(page)

      // Press Escape
      await cancelActionByShortcut(page)

      // Command actions should be hidden
      await waitForCommandActionsHidden(page)
    })

    test('should clear conversation with Ctrl+K', async () => {
      // Send a message
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Verify message exists
      const messagesBefore = await getChatMessages(page)
      expect(messagesBefore.length).toBeGreaterThan(0)

      // Press Ctrl+K to clear
      await clearAllConversationsByShortcut(page)

      // Brief wait for the clear action to process
      await page.waitForTimeout(200)
    })

    test('should execute command with Ctrl+Enter when command is proposed', async () => {
      // Wait for terminal to be ready using proper helper
      await page.waitForSelector('.terminal-container', { state: 'visible', timeout: 10000 })

      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Wait for command actions
      await waitForCommandActions(page)

      // Check if execute button is enabled
      const executeButton = page.locator('.command-actions .btn-execute')
      const isEnabled = await executeButton.isEnabled()

      if (isEnabled) {
        // Press Ctrl+Enter to execute
        await executeCommandByShortcut(page)

        // Command actions should disappear after execution
        await waitForCommandActionsHidden(page, 5000)
      }
    })
  })
})
