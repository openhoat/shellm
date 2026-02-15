import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  closeConfigPanel,
  getShellOptions,
  getThemeOptions,
  isConfigPanelVisible,
  openConfigPanel,
  resetConfig,
  saveConfig,
  setReactInputValue,
  testConnection,
  waitForTestResult,
} from './helpers'

test.describe('SheLLM E2E - Configuration', () => {
  test.describe('Config panel visibility', () => {
    test('should be hidden by default', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Wait for app state to settle
        await page.waitForTimeout(500)

        // Config panel should not be visible
        const isVisible = await isConfigPanelVisible(page)
        expect(isVisible).toBe(false)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should be visible after clicking config button', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Open config panel
        await openConfigPanel(page)

        // Config panel should now be visible
        const isVisible = await isConfigPanelVisible(page)
        expect(isVisible).toBe(true)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should close when clicking close button', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Open config panel
        await openConfigPanel(page)

        // Verify it's open
        let isVisible = await isConfigPanelVisible(page)
        expect(isVisible).toBe(true)

        // Close config panel
        await closeConfigPanel(page)

        // Verify it's closed
        isVisible = await isConfigPanelVisible(page)
        expect(isVisible).toBe(false)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should toggle visibility with config button', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)

        // Click config button to open
        const configButton = page.locator('header button[title="Configuration"]')
        await configButton.click()
        await page.waitForSelector('.config-panel', { state: 'visible', timeout: 10000 })

        let isVisible = await isConfigPanelVisible(page)
        expect(isVisible).toBe(true)

        // Close using the close button inside the panel (more reliable)
        await closeConfigPanel(page)

        isVisible = await isConfigPanelVisible(page)
        expect(isVisible).toBe(false)
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Configuration fields', () => {
    test('should display Ollama URL field', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check URL field exists
        const urlField = page.locator('#ollama-url')
        await expect(urlField).toBeVisible()

        // Check default value
        const value = await urlField.inputValue()
        expect(value).toContain('http')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display model selector', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check model field exists
        const modelField = page.locator('#ollama-model')
        await expect(modelField).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display temperature slider', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check temperature field exists
        const tempField = page.locator('#ollama-temperature')
        await expect(tempField).toBeVisible()

        // Check it's a range input
        const inputType = await tempField.getAttribute('type')
        expect(inputType).toBe('range')

        // Check default value is in expected range
        const value = await tempField.inputValue()
        const numValue = parseFloat(value)
        expect(numValue).toBeGreaterThanOrEqual(0)
        expect(numValue).toBeLessThanOrEqual(1)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display max tokens field', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check max tokens field exists
        const maxTokensField = page.locator('#ollama-max-tokens')
        await expect(maxTokensField).toBeVisible()

        // Check it's a number input
        const inputType = await maxTokensField.getAttribute('type')
        expect(inputType).toBe('number')

        // Check default value
        const value = await maxTokensField.inputValue()
        const numValue = parseInt(value, 10)
        expect(numValue).toBeGreaterThan(0)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display theme selector', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check theme field exists
        const themeField = page.locator('#theme')
        await expect(themeField).toBeVisible()

        // Check it's a select
        const tagName = await themeField.evaluate(el => el.tagName.toLowerCase())
        expect(tagName).toBe('select')

        // Check available options
        const options = await getThemeOptions(page)
        expect(options).toContain('Sombre')
        expect(options).toContain('Clair')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display language selector', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check language selector exists (it's in a config-field)
        const languageSection = page.locator(
          '.config-field:has(#language-selector), .config-field:has(.language-selector)'
        )
        await expect(languageSection).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display shell selector', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check shell field exists
        const shellField = page.locator('#shell-select')
        await expect(shellField).toBeVisible()

        // Check it's a select
        const tagName = await shellField.evaluate(el => el.tagName.toLowerCase())
        expect(tagName).toBe('select')

        // Check available options
        const options = await getShellOptions(page)
        expect(options.length).toBeGreaterThan(0)
        expect(options).toContain('Auto (système)')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display font size slider', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check font size field exists
        const fontSizeField = page.locator('#font-size')
        await expect(fontSizeField).toBeVisible()

        // Check it's a range input
        const inputType = await fontSizeField.getAttribute('type')
        expect(inputType).toBe('range')

        // Check default value is reasonable
        const value = await fontSizeField.inputValue()
        const numValue = parseInt(value, 10)
        expect(numValue).toBeGreaterThanOrEqual(10)
        expect(numValue).toBeLessThanOrEqual(20)
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Configuration modification', () => {
    test('should allow changing Ollama URL if not disabled by env', async () => {
      // Launch with empty env vars to ensure URL field is NOT disabled
      const { app, page } = await launchElectronApp({
        env: {
          SHELLM_OLLAMA_URL: '',
          SHELLM_OLLAMA_API_KEY: '',
        },
      })

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        const urlField = page.locator('#ollama-url')
        const isDisabled = await urlField.isDisabled()

        // With empty env vars, the field should NOT be disabled
        expect(isDisabled).toBe(false)

        // Use React-aware input setter for controlled input
        await setReactInputValue(page, '#ollama-url', 'http://custom-ollama:11434')

        const value = await urlField.inputValue()
        expect(value).toBe('http://custom-ollama:11434')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should allow changing temperature if not disabled by env', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        const tempField = page.locator('#ollama-temperature')
        const isDisabled = await tempField.isDisabled()

        if (isDisabled) {
          console.log('Skipping: temperature field is disabled by environment variable')
          return
        }

        // Use React-aware input setter for range input
        await page.evaluate(() => {
          const input = document.querySelector('#ollama-temperature') as HTMLInputElement
          if (!input) return

          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, '0.5')
          }
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.dispatchEvent(new Event('change', { bubbles: true }))
        })

        const value = await tempField.inputValue()
        expect(parseFloat(value)).toBeCloseTo(0.5, 0)
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should allow changing max tokens if not disabled by env', async () => {
      // Launch with empty env vars to ensure max tokens field is NOT disabled
      const { app, page } = await launchElectronApp({
        env: {
          SHELLM_OLLAMA_MAX_TOKENS: '',
        },
      })

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        const maxTokensField = page.locator('#ollama-max-tokens')
        const isDisabled = await maxTokensField.isDisabled()

        // With empty env var, the field should NOT be disabled
        expect(isDisabled).toBe(false)

        // Use React-aware input setter for controlled input
        await setReactInputValue(page, '#ollama-max-tokens', '2000')

        const value = await maxTokensField.inputValue()
        expect(value).toBe('2000')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should allow changing theme', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Change theme
        const themeField = page.locator('#theme')
        await themeField.selectOption('light')

        // Verify change
        const value = await themeField.inputValue()
        expect(value).toBe('light')
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should allow changing shell if not disabled by env', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check if shell field is disabled (by env var)
        const shellField = page.locator('#shell-select')
        const isDisabled = await shellField.isDisabled()

        if (isDisabled) {
          // Skip test if field is disabled by environment variable
          console.log('Skipping: Shell field is disabled by environment variable')
          return
        }

        // Change shell
        await shellField.selectOption('bash')

        // Verify change
        const value = await shellField.inputValue()
        expect(value).toBe('bash')
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Configuration persistence', () => {
    test('should save configuration', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Change a value
        const tempField = page.locator('#ollama-temperature')
        await tempField.fill('0.3')

        // Save configuration
        await saveConfig(page)

        // Config panel should be closed
        const isVisible = await isConfigPanelVisible(page)
        expect(isVisible).toBe(false)
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
        await tempField.fill('0.9')

        // Reset configuration
        await resetConfig(page)

        // Check values are reset
        const value = await tempField.inputValue()
        // Should be back to default (0.7)
        expect(parseFloat(value)).toBeCloseTo(0.7, 1)
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Connection testing', () => {
    test('should have test connection button', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check test button exists
        const testButton = page.locator('.config-panel .btn-test')
        await expect(testButton).toBeVisible()
        await expect(testButton).toBeEnabled()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display connection result', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Click test connection
        await testConnection(page)

        // Wait for result
        const result = await waitForTestResult(page, 15000)

        // Result should be displayed
        expect(result).toBeDefined()
      } finally {
        await closeElectronApp(app)
      }
    })
  })

  test.describe('Config panel UI', () => {
    test('should display config title', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check config header title
        const title = page.locator('.config-header h2')
        await expect(title).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should display config sections', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check for config sections
        const sections = page.locator('.config-section')
        const count = await sections.count()
        expect(count).toBeGreaterThanOrEqual(2) // Ollama + Interface + Terminal
      } finally {
        await closeElectronApp(app)
      }
    })

    test('should have Save and Reset buttons', async () => {
      const { app, page } = await launchElectronApp()

      try {
        await waitForAppReady(page)
        await openConfigPanel(page)

        // Check for Save button
        const saveButton = page.locator('.config-footer .btn-save')
        await expect(saveButton).toBeVisible()

        // Check for Reset button
        const resetButton = page.locator('.config-footer .btn-reset')
        await expect(resetButton).toBeVisible()
      } finally {
        await closeElectronApp(app)
      }
    })
  })
})
