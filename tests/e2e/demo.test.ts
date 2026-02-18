import type { ElectronApplication, Page } from '@playwright/test'
import { test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  isCommandActionsVisible,
  resetAppState,
  sendMessage,
  waitForAIResponse,
  waitForTerminalReady,
} from './helpers'

let app: ElectronApplication
let page: Page

/**
 * Demo test for generating a showcase video
 * This test simulates a typical user interaction with Termaid
 */
test.describe('Termaid Demo', () => {
  test.beforeAll(async () => {
    // Launch with default mocks - simpler and more reliable
    const result = await launchElectronApp({ mocks: {} })
    app = result.app
    page = result.page
    await waitForAppReady(page)
    // Use a wider window to avoid scrollbars
    await page.setViewportSize({ width: 1400, height: 800 })
  })

  test.afterAll(async () => {
    await closeElectronApp(app)
  })

  test.beforeEach(async () => {
    // Reset app state between tests
    await resetAppState(page)
  })

  test('should demonstrate Termaid features', async () => {
    // Wait for terminal to be ready
    await waitForTerminalReady(page)

    // Let the UI fully render before starting
    await page.waitForTimeout(500)

    // Focus on the chat input for visual effect
    const chatInput = page.locator('.chat-input textarea')
    await chatInput.focus()
    await page.waitForTimeout(300)

    // Send a message
    await sendMessage(page, 'Show me the current directory')

    // Wait for AI to process and respond
    await waitForAIResponse(page, 30000)

    // Verify command actions are visible
    const commandActionsVisible = await isCommandActionsVisible(page)
    if (!commandActionsVisible) {
      // If not visible, take a screenshot for debugging
      await page.screenshot({ path: 'test-results/demo-debug.png' })
      throw new Error('Command actions not visible after AI response')
    }

    // Let user see the command proposal
    await page.waitForTimeout(1500)

    // Click Execute button
    await clickExecuteButton(page)

    // Wait for command execution animation
    await page.waitForTimeout(2000)
  })
})
