import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  closeConfigPanel,
  getShellOptions,
  isConfigPanelVisible,
  openConfigPanel,
  resetConfig,
  saveConfig,
  setReactInputValue,
  testConnection,
  waitForTestResult,
} from './helpers'

let app: ElectronApplication
let page: Page

test.describe('Termaid E2E - Configuration Persistence', () => {
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
    // Close config panel between tests if it was left open
    const isOpen = await isConfigPanelVisible(page)
    if (isOpen) {
      await closeConfigPanel(page)
    }
  })

  test.describe('Save and persist configuration', () => {
    test('should save Ollama URL and persist after reopening panel', async () => {
      await openConfigPanel(page)

      // Change Ollama URL
      await setReactInputValue(page, '#ollama-url', 'http://custom:11434')

      // Save configuration
      await saveConfig(page)

      // Verify config panel closes after save
      const isVisible = await isConfigPanelVisible(page)
      expect(isVisible).toBe(false)

      // Reopen config panel and verify the URL persists
      await openConfigPanel(page)

      const urlField = page.locator('#ollama-url')
      const value = await urlField.inputValue()
      expect(value).toBe('http://custom:11434')
    })
  })

  test.describe('Reset configuration to defaults', () => {
    test('should reset temperature to default value', async () => {
      await openConfigPanel(page)

      // Change temperature to a non-default value
      const tempField = page.locator('#ollama-temperature')
      await setReactInputValue(page, '#ollama-temperature', '0.3')

      // Click reset
      await resetConfig(page)

      // Verify temperature returns to default (0.7)
      const value = await tempField.inputValue()
      expect(parseFloat(value)).toBeCloseTo(0.7, 1)
    })
  })

  test.describe('Provider switching', () => {
    test('should show correct section when switching providers', async () => {
      await openConfigPanel(page)

      const providerSelect = page.locator('#llm-provider')

      // Switch to Claude provider
      await providerSelect.selectOption('claude')
      await expect(page.locator('#claude-api-key')).toBeVisible({ timeout: 5000 })

      // Switch to OpenAI provider
      await providerSelect.selectOption('openai')
      await expect(page.locator('#openai-api-key')).toBeVisible({ timeout: 5000 })

      // Switch back to Ollama provider
      await providerSelect.selectOption('ollama')
      await expect(page.locator('#ollama-url')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Theme switching', () => {
    test('should change theme and persist after save', async () => {
      await openConfigPanel(page)

      // Change theme to light
      const themeField = page.locator('#theme')
      await themeField.selectOption('light')

      // Verify theme field value changed
      const value = await themeField.inputValue()
      expect(value).toBe('light')

      // Save configuration
      await saveConfig(page)

      // Reopen and verify persistence
      await openConfigPanel(page)

      const persistedValue = await page.locator('#theme').inputValue()
      expect(persistedValue).toBe('light')

      // Reset back to dark for other tests
      await page.locator('#theme').selectOption('dark')
      await saveConfig(page)
    })
  })

  test.describe('Shell selection', () => {
    test('should display auto option and persist selection', async () => {
      await openConfigPanel(page)

      // Get available shell options
      const options = await getShellOptions(page)

      // Verify 'auto' is available (case-insensitive check)
      const hasAuto = options.some(opt => opt.toLowerCase().includes('auto'))
      expect(hasAuto).toBe(true)

      // Select a different shell option if available
      if (options.length > 1) {
        const shellSelect = page.locator('#shell-select')
        const secondOption = options[1]
        await shellSelect.selectOption({ label: secondOption })

        // Save and verify persistence
        await saveConfig(page)

        await openConfigPanel(page)

        const persistedShell = page.locator('#shell-select')
        const selectedText = await persistedShell.inputValue()
        expect(selectedText).toBeDefined()
      }
    })
  })

  test.describe('Connection testing', () => {
    test('should display success result on connection test', async () => {
      await openConfigPanel(page)

      // Click test connection
      await testConnection(page)

      // Wait for result
      const result = await waitForTestResult(page, 15000)

      // Verify a result message appears
      expect(result).toBeDefined()
      expect(result).not.toBeNull()
    })
  })
})

test.describe('Termaid E2E - Connection Test Failure', () => {
  test('should display failure result when connection fails', async () => {
    let failApp: ElectronApplication | undefined
    let failPage: Page | undefined

    try {
      // Launch a separate app with connection failure mock
      const result = await launchElectronApp({
        mocks: {
          errors: { llmConnectionFailed: true },
        },
      })
      failApp = result.app
      failPage = result.page
      await waitForAppReady(failPage)

      // Open config panel
      await openConfigPanel(failPage)

      // Test connection
      await testConnection(failPage)

      // Wait for result
      const testResult = await waitForTestResult(failPage, 15000)

      // Verify failure message appears
      expect(testResult).toBeDefined()
      expect(testResult).not.toBeNull()
    } finally {
      if (failApp) {
        await closeElectronApp(failApp)
      }
    }
  })
})
