import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  isErrorVisible,
  openConfigPanel,
  sendMessage,
  testConnection,
  waitForError,
  waitForTestResult,
} from './helpers'

test.describe('Termaid E2E - Error Handling', () => {
  // Each error scenario needs its own app instance since errors are configured at launch time

  test.describe('LLM generation error', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: {
          errors: { llmGenerate: new Error('LLM service unavailable') },
        },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should display error message when LLM fails', async () => {
      await sendMessage(page, 'List files')

      const errorText = await waitForError(page)
      expect(errorText).toBeTruthy()

      const errorVisible = await isErrorVisible(page)
      expect(errorVisible).toBe(true)
    })

    test('should keep the app functional after LLM error', async () => {
      // Verify the chat input is still usable
      const input = page.locator('.chat-input textarea')
      await expect(input).toBeVisible()
      await expect(input).toBeEnabled()

      // Verify the header is still visible
      const header = page.locator('header')
      await expect(header).toBeVisible()

      // Verify config panel can still be opened
      await openConfigPanel(page)
      const configPanel = page.locator('.config-panel')
      await expect(configPanel).toBeVisible()

      // Close config panel
      await page.keyboard.press('Escape')
    })
  })

  test.describe('Connection test failure', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: {
          errors: { llmConnectionFailed: true },
        },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should display failure when connection test fails', async () => {
      await openConfigPanel(page)

      await testConnection(page)

      const result = await waitForTestResult(page, 15000)
      expect(result).toBeTruthy()

      // The test result should indicate failure
      const testResultElement = page.locator('.test-result')
      await expect(testResultElement).toBeVisible()
    })
  })

  test.describe('Connection test success', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: {},
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should display success when connection test succeeds', async () => {
      await openConfigPanel(page)

      await testConnection(page)

      const result = await waitForTestResult(page, 15000)
      expect(result).toBeTruthy()

      // The test result should indicate success
      const testResultElement = page.locator('.test-result')
      await expect(testResultElement).toBeVisible()
    })
  })

  test.describe('App recovery after error', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: {
          errors: { llmGenerate: new Error('Temporary LLM failure') },
        },
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should show error on first message', async () => {
      await sendMessage(page, 'Show disk usage')

      const errorVisible = await isErrorVisible(page)
      expect(errorVisible).toBe(true)
    })

    test('should remain interactive after error', async () => {
      // Verify chat input is still functional
      const input = page.locator('.chat-input textarea')
      await input.fill('Test input')
      const value = await input.inputValue()
      expect(value).toBe('Test input')
      await input.fill('')

      // Verify config panel opens and closes correctly
      await openConfigPanel(page)
      const configPanel = page.locator('.config-panel')
      await expect(configPanel).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(page.locator('.config-panel')).not.toBeVisible({ timeout: 5000 })

      // Verify terminal section is still present
      const terminalWrapper = page.locator('.terminal-wrapper')
      await expect(terminalWrapper).toBeVisible()
    })
  })

  test.describe('Empty message handling', () => {
    let app: ElectronApplication
    let page: Page

    test.beforeAll(async () => {
      const result = await launchElectronApp({
        mocks: {},
      })
      app = result.app
      page = result.page
      await waitForAppReady(page)
    })

    test.afterAll(async () => {
      await closeElectronApp(app)
    })

    test('should not crash when sending an empty message', async () => {
      const input = page.locator('.chat-input textarea')
      await input.fill('')
      await input.press('Enter')

      // Brief wait for any async processing
      await page.waitForTimeout(500)

      // Verify the app is still functional
      await expect(input).toBeVisible()
      await expect(input).toBeEnabled()

      // Verify no error messages appeared
      const errorVisible = await isErrorVisible(page, 2000)
      expect(errorVisible).toBe(false)
    })

    test('should allow sending a valid message after empty attempt', async () => {
      await sendMessage(page, 'List files')

      // Wait for the AI response (should work normally)
      const aiMessage = page.locator('.chat-message.ai')
      await aiMessage.first().waitFor({ state: 'visible', timeout: 15000 })

      // Verify the response appeared
      const count = await aiMessage.count()
      expect(count).toBeGreaterThan(0)
    })
  })
})
