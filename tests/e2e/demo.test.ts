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
    // Launch with custom mock for demo video
    const result = await launchElectronApp({
      mocks: {
        // Custom AI response for demo - use df -h for disk space
        aiCommand: {
          type: 'command',
          intent: 'show_disk_space',
          command: 'df -h',
          explanation: 'Display available disk space on all filesystems',
          confidence: 0.95,
        },
        // Mock command execution output
        commandExecution: {
          output:
            'Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p3  477G  156G  297G  35% /\ntmpfs           7.8G   38M  7.7G   1% /dev/shm',
          exitCode: 0,
        },
      },
    })
    app = result.app
    page = result.page
    await waitForAppReady(page)
    // Use a wider window for better visibility
    await page.setViewportSize({ width: 1600, height: 900 })
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
    await sendMessage(page, 'Show disk space')

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
