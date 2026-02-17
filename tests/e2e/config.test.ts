import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  closeConfigPanel,
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

test.describe('SheLLM E2E - Configuration', () => {
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

  test.describe('Config panel visibility', () => {
    test('should be visible after clicking config button', async () => {
      await openConfigPanel(page)

      const isVisible = await isConfigPanelVisible(page)
      expect(isVisible).toBe(true)
    })

    test('should close when clicking close button', async () => {
      await openConfigPanel(page)

      let isVisible = await isConfigPanelVisible(page)
      expect(isVisible).toBe(true)

      await closeConfigPanel(page)

      isVisible = await isConfigPanelVisible(page)
      expect(isVisible).toBe(false)
    })
  })

  test.describe('Configuration fields', () => {
    test('should display Ollama URL field with default value', async () => {
      await openConfigPanel(page)

      const urlField = page.locator('#ollama-url')
      await expect(urlField).toBeVisible()

      const value = await urlField.inputValue()
      expect(value).toContain('http')
    })
  })

  test.describe('Configuration modification', () => {
    test('should allow changing Ollama URL if not disabled by env', async () => {
      await openConfigPanel(page)

      const urlField = page.locator('#ollama-url')
      const isDisabled = await urlField.isDisabled()

      expect(isDisabled).toBe(false)

      await setReactInputValue(page, '#ollama-url', 'http://custom-ollama:11434')

      const value = await urlField.inputValue()
      expect(value).toBe('http://custom-ollama:11434')
    })

    test('should allow changing theme', async () => {
      await openConfigPanel(page)

      const themeField = page.locator('#theme')
      await themeField.selectOption('light')

      const value = await themeField.inputValue()
      expect(value).toBe('light')
    })
  })

  test.describe('Configuration persistence', () => {
    test('should save configuration', async () => {
      await openConfigPanel(page)

      const tempField = page.locator('#ollama-temperature')
      await tempField.fill('0.3')

      await saveConfig(page)

      const isVisible = await isConfigPanelVisible(page)
      expect(isVisible).toBe(false)
    })

    test('should reset configuration to defaults', async () => {
      await openConfigPanel(page)

      const tempField = page.locator('#ollama-temperature')
      await tempField.fill('0.9')

      await resetConfig(page)

      const value = await tempField.inputValue()
      expect(parseFloat(value)).toBeCloseTo(0.7, 1)
    })
  })

  test.describe('Connection testing', () => {
    test('should display connection result', async () => {
      await openConfigPanel(page)

      await testConnection(page)

      const result = await waitForTestResult(page, 15000)

      expect(result).toBeDefined()
    })
  })
})
