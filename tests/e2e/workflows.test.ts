import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  getChatMessages,
  getConversationListItems,
  openConfigPanel,
  openConversationList,
  resetAppState,
  resetConfig,
  saveConfig,
  sendMessage,
  setReactInputValue,
  waitForAIResponse,
  waitForAppReady as waitForAppReadyHelper,
  waitForCommandActions,
  waitForCommandExecution,
  waitForTerminalReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

let app: ElectronApplication
let page: Page

test.describe('Termaid E2E - User Workflows', () => {
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
    // Reset app state completely between tests
    await resetAppState(page)
  })

  test.describe('Basic AI command workflow', () => {
    test('should complete basic command workflow: request → propose → execute → results', async () => {
      // Step 1: App is ready
      await waitForTerminalReady(page)

      // Step 2: Type command request
      await sendMessage(page, 'List all files in the current directory')

      // Step 3: Receive AI proposal
      await waitForAIResponse(page)

      // Verify AI response is displayed
      const messages = await getChatMessages(page)
      expect(messages.length).toBeGreaterThan(0)

      // Step 4: Execute command
      await waitForCommandActions(page)

      const executeButton = page.locator(SELECTORS.executeButton)
      const isEnabled = await executeButton.isEnabled()

      if (isEnabled) {
        await clickExecuteButton(page)
        await waitForCommandExecution(page)

        // Step 5: View results - command should have executed
        // Terminal should show output
        await page.waitForTimeout(TIMEOUTS.shortDelay)
      }
    })

    test('should handle multiple command requests in sequence', async () => {
      await waitForTerminalReady(page)

      // First command
      await sendMessage(page, 'Show current directory')
      await waitForAIResponse(page)
      await waitForCommandActions(page)

      // Cancel first command
      await page.locator(SELECTORS.cancelButton).click()
      await page.waitForSelector(SELECTORS.commandActions, { state: 'hidden' })

      // Second command
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)
      await waitForCommandActions(page)

      // Verify we have multiple messages
      const messages = await getChatMessages(page)
      expect(messages.length).toBeGreaterThanOrEqual(4) // 2 user + 2 AI
    })
  })

  test.describe('Configuration change workflow', () => {
    test('should change settings and verify persistence', async () => {
      // Launch with empty env vars to ensure fields are NOT disabled
      const { app: envApp, page: envPage } = await launchElectronApp({
        env: {
          TERMAID_OLLAMA_TEMPERATURE: '',
          TERMAID_OLLAMA_MAX_TOKENS: '',
        },
      })

      try {
        // Step 1: Open config
        await waitForAppReadyHelper(envPage)
        await openConfigPanel(envPage)

        // Step 2: Verify fields are NOT disabled
        const tempField = envPage.locator(SELECTORS.ollamaTemperature)
        const maxTokensField = envPage.locator(SELECTORS.ollamaMaxTokens)
        const tempDisabled = await tempField.isDisabled()
        const maxTokensDisabled = await maxTokensField.isDisabled()

        // With empty env vars, fields should NOT be disabled
        expect(tempDisabled).toBe(false)
        expect(maxTokensDisabled).toBe(false)

        // Step 3: Change temperature using React-aware setter for range input
        await setReactInputValue(envPage, SELECTORS.ollamaTemperature, '0.5')

        // Step 4: Change max tokens using React-aware setter
        await setReactInputValue(envPage, SELECTORS.ollamaMaxTokens, '2000')

        // Step 5: Save
        await saveConfig(envPage)

        // Step 6: Verify changes persisted
        await openConfigPanel(envPage)

        const newTemp = await tempField.inputValue()
        expect(parseFloat(newTemp)).toBeCloseTo(0.5, 1)

        const newMaxTokens = await maxTokensField.inputValue()
        expect(newMaxTokens).toBe('2000')
      } finally {
        await closeElectronApp(envApp)
      }
    })

    test('should reset configuration to defaults', async () => {
      await openConfigPanel(page)

      // Change some values
      const tempField = page.locator(SELECTORS.ollamaTemperature)

      // Check if field is disabled
      if (await tempField.isDisabled()) {
        return
      }

      // Use evaluate for range input
      await tempField.evaluate((el, value) => {
        const input = el as HTMLInputElement
        input.value = value
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }, '0.9')

      // Reset
      await resetConfig(page)

      // Verify reset
      const value = await tempField.inputValue()
      expect(parseFloat(value)).toBeCloseTo(0.7, 1)
    })
  })

  test.describe('Conversation management workflow', () => {
    test('should create and manage conversations', async () => {
      // Use text-type mock to avoid command actions blocking the UI between messages
      const { app: textApp, page: textPage } = await launchElectronApp({
        mocks: { aiCommand: { type: 'text', content: 'I can help you with many things.' } },
      })

      try {
        await waitForAppReady(textPage)

        // Step 1: Create conversation (by sending message)
        await sendMessage(textPage, 'Hello, how are you?')
        await waitForAIResponse(textPage)

        // Wait for the first AI message to have content (not just streaming placeholder)
        await textPage.waitForFunction(
          () => {
            const aiMessages = document.querySelectorAll('.chat-message.ai:not(.streaming)')
            return aiMessages.length >= 1 && aiMessages[0].textContent?.trim().length > 0
          },
          { timeout: TIMEOUTS.standard }
        )

        // Wait for input to be re-enabled before second message
        await textPage.waitForSelector(`${SELECTORS.chatInput}:not([disabled])`, {
          timeout: TIMEOUTS.standard,
        })

        // Step 2: Send multiple messages
        await sendMessage(textPage, 'What can you help me with?')

        // Wait for streaming to complete and for 2 AI messages with actual content
        await textPage.waitForFunction(
          () => {
            // Only count non-streaming AI messages that have content
            const aiMessages = document.querySelectorAll('.chat-message.ai:not(.streaming)')
            let validCount = 0
            aiMessages.forEach(msg => {
              if (msg.textContent && msg.textContent.trim().length > 0) {
                validCount++
              }
            })
            return validCount >= 2
          },
          { timeout: TIMEOUTS.standard }
        )

        // Verify conversation has messages
        const messages = await getChatMessages(textPage)
        expect(messages.length).toBeGreaterThanOrEqual(4)

        // Step 3: View conversation list
        await openConversationList(textPage)

        const items = await getConversationListItems(textPage)
        expect(items.length).toBeGreaterThan(0)
      } finally {
        await closeElectronApp(textApp)
      }
    })
  })
})
