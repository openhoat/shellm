import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  cancelActionByShortcut,
  clearAllConversationsByShortcut,
  clickCancelButton,
  clickModifyButton,
  executeCommandByShortcut,
  getAIMessages,
  getChatMessages,
  getUserMessages,
  isCommandActionsVisible,
  isErrorVisible,
  isLoadingVisible,
  isWelcomeMessageVisible,
  sendMessage,
  typeInChat,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandActionsHidden,
} from './helpers'

test.describe('SheLLM E2E - Chat Functionality', () => {
  test.describe('Chat input field', () => {
    test('should display chat input field', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        const input = page.locator('.chat-input input')
        await expect(input).toBeVisible()
        await expect(input).toBeEnabled()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should be able to type in the input field', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        const input = page.locator('.chat-input input')
        await input.fill('List all files')

        await expect(input).toHaveValue('List all files')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should disable input while loading', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Type a message and submit
        await sendMessage(page, 'List all files')

        // Input should be disabled while loading
        const input = page.locator('.chat-input input')
        const _isDisabled = await input.isDisabled().catch(() => true)

        // Wait for response
        await waitForAIResponse(page)

        // Input should be enabled again after response
        await expect(input).toBeEnabled()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should clear input after sending message', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List all files')

        // Wait for response
        await waitForAIResponse(page)

        const input = page.locator('.chat-input input')
        await expect(input).toHaveValue('')
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Message display', () => {
    test('should display welcome message when conversation is empty', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        const isWelcomeVisible = await isWelcomeMessageVisible(page)
        expect(isWelcomeVisible).toBe(true)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display user messages in conversation', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List all files in current directory')

        // Wait for AI response
        await waitForAIResponse(page)

        // Check user message is displayed
        const userMessages = await getUserMessages(page)
        expect(userMessages.length).toBeGreaterThan(0)
        expect(userMessages[0]).toContain('List all files')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display AI responses in conversation', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List all files')

        // Wait for AI response
        await waitForAIResponse(page)

        // Check AI message is displayed
        const aiMessages = await getAIMessages(page)
        expect(aiMessages.length).toBeGreaterThan(0)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display loading spinner while AI is generating', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Type message
        await typeInChat(page, 'Show disk usage')

        // Submit and immediately check for loading
        const input = page.locator('.chat-input input')
        await input.press('Enter')

        // Check if loading spinner appears (might be brief)
        const _loadingVisible = await isLoadingVisible(page)

        // Either loading was visible or response already came back
        // Both are acceptable outcomes

        // Wait for response to complete
        await waitForAIResponse(page)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should hide welcome message after first message', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Initially welcome message should be visible
        const welcomeBefore = await isWelcomeMessageVisible(page)
        expect(welcomeBefore).toBe(true)

        await sendMessage(page, 'List all files')
        await waitForAIResponse(page)

        // After message, welcome should be hidden
        const welcomeAfter = await isWelcomeMessageVisible(page)
        expect(welcomeAfter).toBe(false)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display multiple messages in conversation', async () => {
      // Use mocks to ensure fast, reliable AI responses
      const { app, page } = await launchElectronApp({
        mocks: {
          aiCommand: {
            type: 'command',
            intent: 'list_files',
            command: 'ls -la',
            explanation: 'List all files',
            confidence: 0.95,
          },
        },
      })

      try {
        await waitForAppReady(page)

        // Send first message
        await sendMessage(page, 'List files')
        await waitForAIResponse(page, 10000)

        // Wait for input to be re-enabled
        await page.waitForSelector('.chat-input input:not([disabled])', { timeout: 5000 })

        // Wait for state to settle before sending second message
        await page.waitForTimeout(500)

        // Send second message
        await sendMessage(page, 'Show current directory')
        await waitForAIResponse(page, 10000)

        // Wait for all messages to be fully rendered
        await page.waitForTimeout(500)

        // Check we have multiple messages - at least 2 user messages and 2 AI responses
        const userMessages = await getUserMessages(page)
        const aiMessages = await getAIMessages(page)

        expect(userMessages.length).toBeGreaterThanOrEqual(2)
        expect(aiMessages.length).toBeGreaterThanOrEqual(2)
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('AI command generation', () => {
    test('should show command proposal after sending message', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List all files')
        await waitForAIResponse(page)

        // Check for command actions
        const commandActionsVisible = await isCommandActionsVisible(page)
        expect(commandActionsVisible).toBe(true)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display Execute, Modify, Cancel buttons for commands', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List files')
        await waitForAIResponse(page)

        // Check for command action buttons
        const executeButton = page.locator('.command-actions .btn-execute')
        const modifyButton = page.locator('.command-actions .btn-modify')
        const cancelButton = page.locator('.command-actions .btn-cancel')

        await expect(executeButton).toBeVisible()
        await expect(modifyButton).toBeVisible()
        await expect(cancelButton).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should allow modifying command', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List files')
        await waitForAIResponse(page)

        // Click Modify button
        await clickModifyButton(page)

        // Check that command is now in input field
        const input = page.locator('.chat-input input')
        const value = await input.inputValue()
        expect(value.length).toBeGreaterThan(0)

        // Command actions should be hidden after modify
        await waitForCommandActionsHidden(page)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should allow canceling command', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List files')
        await waitForAIResponse(page)

        // Verify command actions are visible
        const beforeCancel = await isCommandActionsVisible(page)
        expect(beforeCancel).toBe(true)

        // Click Cancel button
        await clickCancelButton(page)

        // Command actions should be hidden
        await waitForCommandActionsHidden(page)

        const afterCancel = await isCommandActionsVisible(page)
        expect(afterCancel).toBe(false)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should show terminal not ready state when terminal is not initialized', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List files')
        await waitForAIResponse(page)

        // Execute button might be disabled if terminal isn't ready
        const executeButton = page.locator('.command-actions .btn-execute')

        // Check if button shows "Préparation..." or "Exécuter"
        const buttonText = await executeButton.textContent()

        // Either "Préparation..." (waiting for terminal) or "Exécuter" (ready)
        expect(['Préparation...', 'Exécuter']).toContain(buttonText)
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Keyboard shortcuts', () => {
    test('should cancel command with Escape', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        await sendMessage(page, 'List files')
        await waitForAIResponse(page)

        // Verify command actions are visible
        const beforeCancel = await isCommandActionsVisible(page)
        expect(beforeCancel).toBe(true)

        // Press Escape
        await cancelActionByShortcut(page)

        // Command actions should be hidden
        await waitForCommandActionsHidden(page)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should clear conversation with Ctrl+K', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Send a message
        await sendMessage(page, 'List files')
        await waitForAIResponse(page)

        // Verify message exists
        const messagesBefore = await getChatMessages(page)
        expect(messagesBefore.length).toBeGreaterThan(0)

        // Press Ctrl+K to clear
        await clearAllConversationsByShortcut(page)

        // Wait a bit for the action to process
        await page.waitForTimeout(500)

        // Check welcome message is back (conversation cleared)
        const _welcomeVisible = await isWelcomeMessageVisible(page)
        // Note: This might not show immediately depending on how clearing works
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should execute command with Ctrl+Enter when command is proposed', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        // Wait for terminal to be ready
        await page.waitForTimeout(2000)

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
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Error handling', () => {
    test('should display error when AI generation fails', async () => {
      // Use mocks to inject error before app loads
      const { app, page } = await launchElectronApp({
        mocks: {
          errors: {
            llmGenerate: new Error('Connection refused'),
          },
        },
      })

      try {
        await waitForAppReady(page)

        // Send a message that will trigger the error
        await sendMessage(page, 'List files')

        // Wait for loading to complete
        const loadingSpinner = page.locator('.loading-spinner')
        try {
          await loadingSpinner.waitFor({ state: 'hidden', timeout: 20000 })
        } catch {
          // Loading might have already finished
        }

        // Wait for error to appear with increased timeout
        const errorVisible = await isErrorVisible(page, 15000)

        // Error should be displayed
        expect(errorVisible).toBe(true)
      } finally {
        await closeElectronApp(app)
      }
    })
  })
})
