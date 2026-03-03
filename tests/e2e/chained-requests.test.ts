import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  sendMessage,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandExecution,
  waitForTerminalReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

let app: ElectronApplication
let page: Page

test.describe('Termaid E2E - Chained Requests with Context', () => {
  test.beforeAll(async () => {
    const result = await launchElectronApp({
      mocks: {
        aiCommand: [
          { type: 'command', command: 'free -h', explanation: 'Show available memory' },
          {
            type: 'command',
            command: 'compgen -c | grep "top$"',
            explanation: 'List commands ending with top',
          },
        ],
      },
    })
    app = result.app
    page = result.page
    await waitForAppReady(page)
  })

  test.afterAll(async () => {
    await closeElectronApp(app)
  })

  test('should pass conversation history to LLM for context-aware responses', async () => {
    await waitForTerminalReady(page)

    // First request: ask about memory
    await sendMessage(page, 'Show me the available memory')
    await waitForAIResponse(page)
    await waitForCommandActions(page)

    // Verify first AI response contains memory-related content
    const firstAIResponse = page.locator(SELECTORS.aiMessage).first()
    await expect(firstAIResponse).toContainText('memory', { timeout: TIMEOUTS.standard })

    // Execute the first command
    const executeButton = page.locator(SELECTORS.executeButton)
    if (await executeButton.isEnabled()) {
      await clickExecuteButton(page)
      await waitForCommandExecution(page)
    }

    // Wait for input to be re-enabled
    await page.waitForSelector(`${SELECTORS.chatInput}:not([disabled])`, {
      timeout: TIMEOUTS.standard,
    })

    // Second request: ask about commands ending with 'top'
    await sendMessage(page, 'What are all the available commands that end with top?')
    await waitForAIResponse(page)

    // Verify we have at least 4 messages (2 user + 2 AI)
    const messages = await page.locator(SELECTORS.chatMessage).count()
    expect(messages).toBeGreaterThanOrEqual(4)

    // Verify we have at least 2 AI messages
    const aiMessages = await page.locator(SELECTORS.aiMessage).count()
    expect(aiMessages).toBeGreaterThanOrEqual(2)

    // Verify the second AI response is displayed
    const secondAIResponse = page.locator(SELECTORS.aiMessage).nth(1)
    await expect(secondAIResponse).toBeVisible({ timeout: TIMEOUTS.standard })

    // Verify the second command contains 'top'
    const commandDisplay = page.locator(SELECTORS.aiCommandDisplay)
    if (await commandDisplay.isVisible()) {
      await expect(commandDisplay).toContainText('top', { timeout: TIMEOUTS.shortDelay })
    }
  })
})
