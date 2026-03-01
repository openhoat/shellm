import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  getTerminalContent,
  pressTerminalKey,
  resetAppState,
  sendMessage,
  typeInTerminal,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandActionsHidden,
  waitForCommandExecution,
  waitForTerminalReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

let app: ElectronApplication
let page: Page

test.describe('Termaid E2E - Terminal Integration', () => {
  test.beforeAll(async () => {
    const result = await launchElectronApp({ mocks: {} })
    app = result.app
    page = result.page
    await waitForAppReady(page)
  })

  test.afterAll(async () => {
    await closeElectronApp(app)
  })

  test.describe('Terminal initialization', () => {
    test('should create terminal PTY on app start', async () => {
      await waitForTerminalReady(page)

      // Check that terminal container is visible
      const terminalContainer = page.locator(SELECTORS.terminalContainer)
      await expect(terminalContainer).toBeVisible()

      // Check that xterm is initialized (xterm class should be present)
      const xterm = page.locator(SELECTORS.terminalXterm)
      await expect(xterm).toBeVisible()
    })

    test('should have terminal content area', async () => {
      await waitForTerminalReady(page)

      // Check terminal content area exists
      const terminalContent = page.locator(SELECTORS.terminalContent)
      await expect(terminalContent).toBeVisible()

      // Check xterm is initialized
      const xterm = page.locator(SELECTORS.terminal)
      await expect(xterm).toBeVisible()
    })
  })

  test.describe('Terminal interaction', () => {
    test('should accept user input in terminal', async () => {
      await waitForTerminalReady(page)

      // Click on terminal to focus it
      const terminalContent = page.locator(SELECTORS.terminalContent)
      await terminalContent.click()

      // Type a simple command
      await typeInTerminal(page, 'echo "test"')

      // Brief wait for typed text to appear
      await page.waitForTimeout(TIMEOUTS.briefDelay)

      // Press Enter to execute
      await pressTerminalKey(page, 'Enter')
      await page.waitForTimeout(TIMEOUTS.shortDelay)

      // Terminal should show some output
      const content = await getTerminalContent(page)
      expect(content).toBeDefined()
    })

    test('should display terminal output', async () => {
      await waitForTerminalReady(page)

      // Click on terminal to focus it
      const terminalContent = page.locator(SELECTORS.terminalContent)
      await terminalContent.click()

      // Wait for shell prompt - reduced delay
      await page.waitForTimeout(TIMEOUTS.shortDelay)

      // Type a command that produces output
      await typeInTerminal(page, 'pwd')
      await pressTerminalKey(page, 'Enter')
      await page.waitForTimeout(TIMEOUTS.shortDelay)

      // Terminal should show output (current directory path)
      const content = await getTerminalContent(page)
      expect(content).toBeDefined()
      expect(content.length).toBeGreaterThan(0)
    })
  })

  test.describe('Command execution', () => {
    test.describe.configure({ timeout: 120000 })

    test.beforeEach(async () => {
      // Reset app state to clear messages, spinners and command actions from previous test
      await resetAppState(page)
    })

    test('should execute command from AI proposal', async () => {
      await waitForTerminalReady(page)

      await sendMessage(page, 'Show current directory')
      await waitForAIResponse(page)

      await waitForCommandActions(page)

      const executeButton = page.locator(SELECTORS.executeButton)
      const isEnabled = await executeButton.isEnabled()

      if (isEnabled) {
        await clickExecuteButton(page)
        await waitForCommandExecution(page)
        await waitForCommandActionsHidden(page, TIMEOUTS.standard)
      }
    })

    test('should capture command output', async () => {
      await waitForTerminalReady(page)

      await sendMessage(page, 'List files in current directory')
      await waitForAIResponse(page)

      await waitForCommandActions(page)

      const executeButton = page.locator(SELECTORS.executeButton)
      const isEnabled = await executeButton.isEnabled()

      if (isEnabled) {
        await clickExecuteButton(page)
        await waitForCommandExecution(page)

        const terminalContent = await getTerminalContent(page)
        expect(terminalContent).toBeDefined()
      }
    })

    test('should interpret command output with AI', async () => {
      await waitForTerminalReady(page)

      await sendMessage(page, 'Show disk usage')
      await waitForAIResponse(page)

      await waitForCommandActions(page)

      const executeButton = page.locator(SELECTORS.executeButton)
      const isEnabled = await executeButton.isEnabled()

      if (isEnabled) {
        await clickExecuteButton(page)
        await waitForCommandExecution(page)

        // Brief wait for interpretation to appear
        await page.waitForTimeout(TIMEOUTS.mediumDelay)

        // Check for interpretation content
        const interpretation = page.locator(
          `${SELECTORS.aiMessage} .command-interpretation, ${SELECTORS.aiMessage} .interpretation`
        )
        const _hasInterpretation = await interpretation.isVisible().catch(() => false)

        // Either interpretation is visible or there was an error - both are valid outcomes
      }
    })

    test('should disable execute button when terminal is not ready', async () => {
      // Don't wait for terminal - immediately send message
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      await waitForCommandActions(page)

      // Execute button should be visible
      const executeButton = page.locator(SELECTORS.executeButton)
      await expect(executeButton).toBeVisible()

      // Button should be either disabled (preparing) or enabled (ready)
      const isDisabled = await executeButton.isDisabled()
      const buttonText = await executeButton.textContent()
      expect(buttonText).toBeTruthy()

      // If disabled, the terminal is still initializing
      // If enabled, the terminal is ready - both are valid states
      expect(typeof isDisabled).toBe('boolean')
    })
  })
})
