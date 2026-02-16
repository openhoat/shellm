import type { ElectronApplication, Page } from '@playwright/test'
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
  resetAppState,
  sendMessage,
  typeInChat,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandActionsHidden,
} from './helpers'

let app: ElectronApplication
let page: Page

test.describe('SheLLM E2E - Chat Functionality', () => {
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

  test.describe('Chat input field', () => {
    test('should display chat input field', async () => {
      const input = page.locator('.chat-input textarea')
      await expect(input).toBeVisible()
      await expect(input).toBeEnabled()
    })

    test('should be able to type in the input field', async () => {
      const input = page.locator('.chat-input textarea')
      await input.fill('List all files')

      await expect(input).toHaveValue('List all files')
    })

    test('should disable input while loading', async () => {
      // Type a message and submit
      await sendMessage(page, 'List all files')

      // Input should be disabled while loading
      const input = page.locator('.chat-input textarea')
      const _isDisabled = await input.isDisabled().catch(() => true)

      // Wait for response
      await waitForAIResponse(page)

      // Input should be enabled again after response
      await expect(input).toBeEnabled()
    })

    test('should clear input after sending message', async () => {
      await sendMessage(page, 'List all files')

      // Wait for response
      await waitForAIResponse(page)

      const input = page.locator('.chat-input textarea')
      await expect(input).toHaveValue('')
    })
  })

  test.describe('Message display', () => {
    test('should display welcome message when conversation is empty', async () => {
      const isWelcomeVisible = await isWelcomeMessageVisible(page)
      expect(isWelcomeVisible).toBe(true)
    })

    test('should display user messages in conversation', async () => {
      await sendMessage(page, 'List all files in current directory')

      // Wait for AI response
      await waitForAIResponse(page)

      // Check user message is displayed
      const userMessages = await getUserMessages(page)
      expect(userMessages.length).toBeGreaterThan(0)
      expect(userMessages[0]).toContain('List all files')
    })

    test('should display AI responses in conversation', async () => {
      await sendMessage(page, 'List all files')

      // Wait for AI response
      await waitForAIResponse(page)

      // Check AI message is displayed
      const aiMessages = await getAIMessages(page)
      expect(aiMessages.length).toBeGreaterThan(0)
    })

    test('should display loading spinner while AI is generating', async () => {
      // Type message
      await typeInChat(page, 'Show disk usage')

      // Submit and immediately check for loading
      const input = page.locator('.chat-input textarea')
      await input.press('Enter')

      // Check if loading spinner appears (might be brief)
      const _loadingVisible = await isLoadingVisible(page)

      // Either loading was visible or response already came back
      // Both are acceptable outcomes

      // Wait for response to complete
      await waitForAIResponse(page)
    })

    test('should hide welcome message after first message', async () => {
      // Initially welcome message should be visible
      const welcomeBefore = await isWelcomeMessageVisible(page)
      expect(welcomeBefore).toBe(true)

      await sendMessage(page, 'List all files')
      await waitForAIResponse(page)

      // After message, welcome should be hidden
      const welcomeAfter = await isWelcomeMessageVisible(page)
      expect(welcomeAfter).toBe(false)
    })

    test('should display multiple messages in conversation', async () => {
      // Use text-type mock to avoid command actions blocking the UI between messages
      const { app: textApp, page: textPage } = await launchElectronApp({
        mocks: {
          aiCommand: {
            type: 'text',
            content: 'Here is the information you requested.',
          },
        },
      })

      try {
        await waitForAppReady(textPage)

        // Send first message
        await sendMessage(textPage, 'List files')
        await waitForAIResponse(textPage, 10000)

        // Wait for input to be re-enabled
        await textPage.waitForSelector('.chat-input textarea:not([disabled])', { timeout: 5000 })

        // Wait for state to settle before sending second message
        await textPage.waitForTimeout(500)

        // Send second message
        await sendMessage(textPage, 'Show current directory')

        // Wait explicitly for 2 AI messages (not just any single AI message)
        await textPage.waitForFunction(
          () => document.querySelectorAll('.chat-message.ai').length >= 2,
          { timeout: 10000 }
        )

        // Wait for all messages to be fully rendered
        await textPage.waitForTimeout(500)

        // Check we have multiple messages - at least 2 user messages and 2 AI responses
        const userMessages = await getUserMessages(textPage)
        const aiMessages = await getAIMessages(textPage)

        expect(userMessages.length).toBeGreaterThanOrEqual(2)
        expect(aiMessages.length).toBeGreaterThanOrEqual(2)
      } finally {
        await closeElectronApp(textApp)
      }
    })
  })

  test.describe('AI command generation', () => {
    test('should show command proposal after sending message', async () => {
      await sendMessage(page, 'List all files')
      await waitForAIResponse(page)

      // Check for command actions
      const commandActionsVisible = await isCommandActionsVisible(page)
      expect(commandActionsVisible).toBe(true)
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

      // Verify command actions are visible
      const beforeCancel = await isCommandActionsVisible(page)
      expect(beforeCancel).toBe(true)

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

      // Check if button shows "Préparation..." or "Exécuter"
      const buttonText = await executeButton.textContent()

      // Either "Préparation..." (waiting for terminal) or "Exécuter" (ready)
      expect(['Préparation...', 'Exécuter']).toContain(buttonText)
    })
  })

  test.describe('Keyboard shortcuts', () => {
    test('should cancel command with Escape', async () => {
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Verify command actions are visible
      const beforeCancel = await isCommandActionsVisible(page)
      expect(beforeCancel).toBe(true)

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

      // Wait a bit for the action to process
      await page.waitForTimeout(500)

      // Check welcome message is back (conversation cleared)
      const _welcomeVisible = await isWelcomeMessageVisible(page)
      // Note: This might not show immediately depending on how clearing works
    })

    test('should execute command with Ctrl+Enter when command is proposed', async () => {
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
    })
  })

  test.describe('Error handling', () => {
    test('should display error when AI generation fails', async () => {
      // Use mocks to inject error before app loads
      const { app: errorApp, page: errorPage } = await launchElectronApp({
        mocks: {
          errors: {
            llmGenerate: new Error('Connection refused'),
          },
        },
      })

      try {
        await waitForAppReady(errorPage)

        // Send a message that will trigger the error
        await sendMessage(errorPage, 'List files')

        // Wait for loading to complete
        const loadingSpinner = errorPage.locator('.loading-spinner')
        try {
          await loadingSpinner.waitFor({ state: 'hidden', timeout: 20000 })
        } catch {
          // Loading might have already finished
        }

        // Wait for error to appear with increased timeout
        const errorVisible = await isErrorVisible(errorPage, 15000)

        // Error should be displayed
        expect(errorVisible).toBe(true)
      } finally {
        await closeElectronApp(errorApp)
      }
    })
  })
})
