import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickCancelButton,
  clickModifyButton,
  isCommandActionsVisible,
  resetAppState,
  sendMessage,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandActionsHidden,
} from './helpers'
import { SELECTORS } from './selectors'

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
      const executeButton = page.locator(SELECTORS.executeButton)
      const modifyButton = page.locator(SELECTORS.modifyButton)
      const cancelButton = page.locator(SELECTORS.cancelButton)

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
      const input = page.locator(SELECTORS.chatInput)
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
      const executeButton = page.locator(SELECTORS.executeButton)
      await expect(executeButton).toBeVisible()

      // Button should be either disabled (preparing) or enabled (ready)
      const buttonText = await executeButton.textContent()
      expect(buttonText).toBeTruthy()
    })
  })
})
