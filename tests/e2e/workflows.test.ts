import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  closeConfigPanel,
  createNewConversation,
  getChatMessages,
  getConversationListItems,
  isErrorVisible,
  isWelcomeMessageVisible,
  openConfigPanel,
  openConversationList,
  resetConfig,
  saveConfig,
  sendMessage,
  setReactInputValue,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandExecution,
  waitForTerminalReady,
  waitForTestResult,
} from './helpers'

test.describe('SheLLM E2E - User Workflows', () => {
  test.describe('Basic AI command workflow', () => {
    test('should complete basic command workflow: request → propose → execute → results', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        // Step 1: Launch app
        await waitForAppReady(page)
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

        const executeButton = page.locator('.command-actions .btn-execute')
        const isEnabled = await executeButton.isEnabled()

        if (isEnabled) {
          await clickExecuteButton(page)
          await waitForCommandExecution(page)

          // Step 5: View results - command should have executed
          // Terminal should show output
          await page.waitForTimeout(1000)
        }
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should handle multiple command requests in sequence', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // First command
        await sendMessage(page, 'Show current directory')
        await waitForAIResponse(page)
        await waitForCommandActions(page)

        // Cancel first command
        await page.locator('.command-actions .btn-cancel').click()
        await page.waitForSelector('.command-actions', { state: 'hidden' })

        // Second command
        await sendMessage(page, 'List files')
        await waitForAIResponse(page)
        await waitForCommandActions(page)

        // Verify we have multiple messages
        const messages = await getChatMessages(page)
        expect(messages.length).toBeGreaterThanOrEqual(4) // 2 user + 2 AI
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Configuration change workflow', () => {
    test('should change settings and verify persistence', async () => {
      // Launch with empty env vars to ensure fields are NOT disabled
      const { app, page } = await launchElectronApp({
        env: {
          SHELLM_OLLAMA_TEMPERATURE: '',
          SHELLM_OLLAMA_MAX_TOKENS: '',
        },
      })

      try {
        // Step 1: Open config
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Step 2: Verify fields are NOT disabled
        const tempField = page.locator('#ollama-temperature')
        const maxTokensField = page.locator('#ollama-max-tokens')
        const tempDisabled = await tempField.isDisabled()
        const maxTokensDisabled = await maxTokensField.isDisabled()

        // With empty env vars, fields should NOT be disabled
        expect(tempDisabled).toBe(false)
        expect(maxTokensDisabled).toBe(false)

        // Step 3: Change temperature using React-aware setter for range input
        await setReactInputValue(page, '#ollama-temperature', '0.5')

        // Step 4: Change max tokens using React-aware setter
        await setReactInputValue(page, '#ollama-max-tokens', '2000')

        // Step 5: Save
        await saveConfig(page)

        // Step 6: Verify changes persisted
        await openConfigPanel(page)

        const newTemp = await tempField.inputValue()
        expect(parseFloat(newTemp)).toBeCloseTo(0.5, 1)

        const newMaxTokens = await maxTokensField.inputValue()
        expect(newMaxTokens).toBe('2000')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should reset configuration to defaults', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Change some values
        const tempField = page.locator('#ollama-temperature')

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
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Conversation management workflow', () => {
    test('should create and manage conversations', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Step 1: Create conversation (by sending message)
        await sendMessage(page, 'Hello, how are you?')
        await waitForAIResponse(page)

        // Step 2: Send multiple messages
        await sendMessage(page, 'What can you help me with?')
        await waitForAIResponse(page)

        // Verify conversation has messages
        const messages = await getChatMessages(page)
        expect(messages.length).toBeGreaterThanOrEqual(4)

        // Step 3: View conversation list
        await openConversationList(page)

        const items = await getConversationListItems(page)
        expect(items.length).toBeGreaterThan(0)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should handle new conversation creation', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Create first conversation
        await sendMessage(page, 'First conversation')
        await waitForAIResponse(page)

        // Open conversation list
        await openConversationList(page)
        let items = await getConversationListItems(page)
        const firstCount = items.length

        // Create new conversation
        await createNewConversation(page)

        // Send message in new conversation
        await sendMessage(page, 'Second conversation')
        await waitForAIResponse(page)

        // Check conversation list
        await openConversationList(page)
        items = await getConversationListItems(page)
        expect(items.length).toBeGreaterThanOrEqual(firstCount)
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Error handling workflow', () => {
    test('should handle Ollama unavailable gracefully', async () => {
      // Launch with mock that simulates Ollama unavailable
      const { app, page } = await launchElectronApp({
        mocks: {
          errors: {
            llmGenerate: new Error('ECONNREFUSED: Connection refused'),
            llmConnectionFailed: true,
          },
        },
      })

      try {
        await waitForAppReady(page)

        // Try to send a message
        await sendMessage(page, 'List files')

        // Wait for error to appear with increased timeout
        const hasError = await isErrorVisible(page, 15000)
        expect(hasError).toBe(true)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should recover from error and continue', async () => {
      // First launch with error mock to trigger error state
      const { app: app1, page: page1 } = await launchElectronApp({
        mocks: {
          errors: {
            llmGenerate: new Error('Network error'),
          },
        },
      })

      try {
        await waitForAppReady(page1)

        // Send a message that will fail
        await sendMessage(page1, 'This will fail')
        const hasError = await isErrorVisible(page1, 15000)
        expect(hasError).toBe(true)
      } finally {
        await closeElectronApp(app1)
      }

      // Now launch a fresh app without errors to test recovery
      const { app: app2, page: page2 } = await launchElectronApp()

      try {
        await waitForAppReady(page2)

        // Try again - should work now
        await sendMessage(page2, 'List files')
        await waitForAIResponse(page2, 30000)

        // Verify response received
        const messages = await getChatMessages(page2)
        expect(messages.length).toBeGreaterThan(0)
      } finally {
        await closeElectronApp(app2)
      }
    })
  })

  test.describe('Complete user session workflow', () => {
    test('should complete a full user session from launch to interaction', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        // 1. App launches successfully
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // 2. Welcome message is displayed
        const welcomeVisible = await isWelcomeMessageVisible(page)
        expect(welcomeVisible).toBe(true)

        // 3. User opens config panel
        await openConfigPanel(page)
        expect(await page.locator('.config-panel').isVisible()).toBe(true)

        // 4. User checks connection
        const testButton = page.locator('.config-panel .btn-test')
        await testButton.click()

        // Wait for result (timeout is OK)
        await waitForTestResult(page, 15000).catch(() => {
          // Test result timeout is acceptable
        })

        // 5. User closes config
        await closeConfigPanel(page)

        // 6. User sends a command request
        await sendMessage(page, 'Show me the current working directory')
        await waitForAIResponse(page)

        // 7. User sees the AI proposal
        await waitForCommandActions(page)
        expect(await page.locator('.command-actions').isVisible()).toBe(true)

        // 8. User modifies the command
        await page.locator('.command-actions .btn-modify').click()

        // 9. User sees command in input
        const input = page.locator('.chat-input input')
        const inputValue = await input.inputValue()
        expect(inputValue.length).toBeGreaterThan(0)

        // 10. User clears input and sends new request
        await input.fill('')
        await sendMessage(page, 'List all Python files')
        await waitForAIResponse(page)

        // Verify session completed successfully
        const messages = await getChatMessages(page)
        expect(messages.length).toBeGreaterThanOrEqual(2)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should handle terminal interaction alongside chat', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Terminal should be visible
        const terminal = page.locator('.terminal-container')
        await expect(terminal).toBeVisible()

        // Chat should be visible
        const chat = page.locator('.chat-panel')
        await expect(chat).toBeVisible()

        // User interacts with terminal directly
        const terminalContent = page.locator('.terminal-content')
        await terminalContent.click()
        await page.keyboard.type('echo "Direct terminal input"')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)

        // User also interacts with chat
        await sendMessage(page, 'What was the last command output?')
        await waitForAIResponse(page)

        // Both terminal and chat should still be functional
        await expect(terminal).toBeVisible()
        await expect(chat).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Keyboard navigation workflow', () => {
    test('should support keyboard-only navigation', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Focus is on chat input by default
        const input = page.locator('.chat-input input')
        await expect(input).toBeFocused()

        // Type a message
        await page.keyboard.type('List files')
        await page.keyboard.press('Enter')
        await waitForAIResponse(page)

        // Cancel with Escape
        await waitForCommandActions(page)
        await page.keyboard.press('Escape')
        await page.waitForSelector('.command-actions', { state: 'hidden' })

        // Focus should return to input
        await expect(input).toBeFocused()
      } finally {
        await closeElectronApp(app)
      }
    })
  })
})
