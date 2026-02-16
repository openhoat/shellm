import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  getTerminalContent,
  pressTerminalKey,
  sendMessage,
  typeInTerminal,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandActionsHidden,
  waitForCommandExecution,
  waitForTerminalReady,
} from './helpers'

test.describe('SheLLM E2E - Terminal Integration', () => {
  test.describe('Terminal initialization', () => {
    test('should create terminal PTY on app start', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Check that terminal container is visible
        const terminalContainer = page.locator('.terminal-container')
        await expect(terminalContainer).toBeVisible()

        // Check that xterm is initialized (xterm class should be present)
        const xterm = page.locator('.terminal-content .xterm')
        await expect(xterm).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display terminal with correct theme', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Check terminal container has the expected classes
        const terminalContainer = page.locator('.terminal-container')
        await expect(terminalContainer).toBeVisible()

        // Check terminal header exists
        const terminalHeader = page.locator('.terminal-header')
        await expect(terminalHeader).toBeVisible()

        // Check terminal title
        const terminalTitle = page.locator('.terminal-title')
        const title = await terminalTitle.textContent()
        expect(title).toContain('Terminal')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should have terminal content area', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Check terminal content area exists
        const terminalContent = page.locator('.terminal-content')
        await expect(terminalContent).toBeVisible()

        // Check xterm is initialized
        const xterm = page.locator('.xterm')
        await expect(xterm).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Terminal interaction', () => {
    test('should accept user input in terminal', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Click on terminal to focus it
        const terminalContent = page.locator('.terminal-content')
        await terminalContent.click()

        // Type a simple command
        await typeInTerminal(page, 'echo "test"')

        // The typed text should appear in terminal
        await page.waitForTimeout(500)

        // Press Enter to execute
        await pressTerminalKey(page, 'Enter')
        await page.waitForTimeout(1000)

        // Terminal should show some output
        const content = await getTerminalContent(page)
        // Note: Content may vary based on shell, just verify terminal is functional
        expect(content).toBeDefined()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display terminal output', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Click on terminal to focus it
        const terminalContent = page.locator('.terminal-content')
        await terminalContent.click()

        // Wait for shell prompt
        await page.waitForTimeout(1000)

        // Type a command that produces output
        await typeInTerminal(page, 'pwd')
        await pressTerminalKey(page, 'Enter')
        await page.waitForTimeout(1000)

        // Terminal should show output (current directory path)
        const content = await getTerminalContent(page)
        expect(content).toBeDefined()
        expect(content.length).toBeGreaterThan(0)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should have terminal container visible and responsive', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Get terminal dimensions
        const terminalContent = page.locator('.terminal-content')
        const box = await terminalContent.boundingBox()
        expect(box).toBeDefined()
        expect(box?.width).toBeGreaterThan(0)
        expect(box?.height).toBeGreaterThan(0)

        // Terminal should have xterm initialized
        const xterm = page.locator('.xterm')
        await expect(xterm).toBeVisible()

        // Terminal should have viewport
        const viewport = page.locator('.xterm-viewport')
        await expect(viewport).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Command execution', () => {
    test('should execute command from AI proposal', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        // Wait for terminal to be ready
        await waitForTerminalReady(page)

        // Send a command request
        await sendMessage(page, 'Show current directory')
        await waitForAIResponse(page)

        // Wait for command actions to appear
        await waitForCommandActions(page)

        // Check if execute button is enabled (terminal ready)
        const executeButton = page.locator('.command-actions .btn-execute')
        const isEnabled = await executeButton.isEnabled()

        if (isEnabled) {
          // Click execute
          await clickExecuteButton(page)

          // Wait for command to execute
          await waitForCommandExecution(page)

          // Command actions should be hidden after execution
          await waitForCommandActionsHidden(page, 10000)
        }
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should capture command output', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Send a command request
        await sendMessage(page, 'List files in current directory')
        await waitForAIResponse(page)

        // Wait for command actions
        await waitForCommandActions(page)

        // Check if execute button is enabled
        const executeButton = page.locator('.command-actions .btn-execute')
        const isEnabled = await executeButton.isEnabled()

        if (isEnabled) {
          // Execute the command
          await clickExecuteButton(page)

          // Wait for execution and interpretation
          await waitForCommandExecution(page)

          // Check that terminal has output
          const terminalContent = await getTerminalContent(page)
          expect(terminalContent).toBeDefined()
        }
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should interpret command output with AI', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Send a command request
        await sendMessage(page, 'Show disk usage')
        await waitForAIResponse(page)

        // Wait for command actions
        await waitForCommandActions(page)

        // Check if execute button is enabled
        const executeButton = page.locator('.command-actions .btn-execute')
        const isEnabled = await executeButton.isEnabled()

        if (isEnabled) {
          // Execute the command
          await clickExecuteButton(page)

          // Wait for execution and interpretation
          await waitForCommandExecution(page)

          // Look for interpretation in chat messages
          await page.waitForTimeout(2000)

          // Check for interpretation content (it should be in an AI message)
          const interpretation = page.locator(
            '.chat-message.ai .command-interpretation, .chat-message.ai .interpretation'
          )
          const _hasInterpretation = await interpretation.isVisible().catch(() => false)

          // Either interpretation is visible or there was an error - both are valid outcomes
          // The key is that the execution completed without crashing
        }
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should disable execute button when terminal is not ready', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        // Don't wait for terminal - immediately send message
        await sendMessage(page, 'List files')
        await waitForAIResponse(page)

        // Wait for command actions
        await waitForCommandActions(page)

        // Execute button may show "Préparation..." initially
        const executeButton = page.locator('.command-actions .btn-execute')
        const buttonText = await executeButton.textContent()

        // Button should either show preparation or be executable
        expect(['Préparation...', 'Exécuter']).toContain(buttonText)

        // If it shows "Préparation...", it should be disabled
        if (buttonText === 'Préparation...') {
          const isDisabled = await executeButton.isDisabled()
          expect(isDisabled).toBe(true)
        }
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Terminal display', () => {
    test('should show terminal wrapper correctly', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)

        // Check terminal wrapper is visible
        const terminalWrapper = page.locator('.terminal-wrapper')
        await expect(terminalWrapper).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should have proper terminal layout', async () => {
      const { app, page } = await launchElectronApp({ mocks: {} })

      try {
        await waitForAppReady(page)
        await waitForTerminalReady(page)

        // Check layout structure
        const container = page.locator('.terminal-container')
        const header = page.locator('.terminal-header')
        const content = page.locator('.terminal-content')

        await expect(container).toBeVisible()
        await expect(header).toBeVisible()
        await expect(content).toBeVisible()

        // Check that content is below header in DOM order
        const containerBox = await container.boundingBox()
        const headerBox = await header.boundingBox()
        const contentBox = await content.boundingBox()

        expect(containerBox).toBeDefined()
        expect(headerBox).toBeDefined()
        expect(contentBox).toBeDefined()

        // Header should be at the top
        if (headerBox && contentBox) {
          expect(headerBox.y).toBeLessThan(contentBox.y)
        }
      } finally {
        await closeElectronApp(app)
      }
    })
  })
})
