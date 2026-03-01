import type { Page } from '@playwright/test'
import { SELECTORS } from '../selectors'
import { TIMEOUTS } from '../timeouts'

/**
 * Open the configuration panel
 */
export async function openConfigPanel(page: Page): Promise<void> {
  const configButton = page.locator(SELECTORS.configButton)
  await configButton.first().click()
  await page.waitForSelector(SELECTORS.configPanel, { state: 'visible' })
}

/**
 * Close the configuration panel
 */
export async function closeConfigPanel(page: Page): Promise<void> {
  const closeButton = page.locator(SELECTORS.configCloseButton)
  await closeButton.click()
  // Wait for the panel to be removed from DOM
  await page.waitForFunction(() => !document.querySelector('.config-panel'), {
    timeout: TIMEOUTS.standard,
  })
}

/**
 * Check if config panel is visible
 */
export async function isConfigPanelVisible(page: Page): Promise<boolean> {
  const panel = page.locator(SELECTORS.configPanel)
  return panel.isVisible()
}

/**
 * Set config field value
 */
export async function setConfigField(
  page: Page,
  fieldId: string,
  value: string | number
): Promise<void> {
  const field = page.locator(`#${fieldId}`)

  const tagName = await field.evaluate(el => el.tagName.toLowerCase())

  if (tagName === 'select') {
    await field.selectOption(value.toString())
  } else if (tagName === 'input') {
    const inputType = await field.getAttribute('type')
    if (inputType === 'range') {
      await field.fill(value.toString())
    } else {
      await field.fill(value.toString())
    }
  }
}

/**
 * Get config field value
 */
export async function getConfigFieldValue(page: Page, fieldId: string): Promise<string> {
  const field = page.locator(`#${fieldId}`)
  return field.inputValue()
}

/**
 * Click the test connection button in config panel
 */
export async function testConnection(page: Page): Promise<void> {
  const testButton = page.locator(SELECTORS.configTestButton)
  await testButton.click()
}

/**
 * Save configuration
 */
export async function saveConfig(page: Page): Promise<void> {
  const saveButton = page.locator(SELECTORS.configSaveButton)
  await saveButton.click()
  await page.waitForSelector(SELECTORS.configPanel, { state: 'hidden' })
}

/**
 * Reset configuration
 */
export async function resetConfig(page: Page): Promise<void> {
  const resetButton = page.locator(SELECTORS.configResetButton)
  await resetButton.click()
}

/**
 * Get test result message from config panel
 */
export async function getTestResult(page: Page): Promise<string | null> {
  const result = page.locator(SELECTORS.testResult)
  if (await result.isVisible()) {
    return result.textContent()
  }
  return null
}

/**
 * Wait for test result
 */
export async function waitForTestResult(
  page: Page,
  timeout = TIMEOUTS.connectionTest
): Promise<string | null> {
  const result = page.locator(SELECTORS.testResult)
  try {
    await result.waitFor({ state: 'visible', timeout })
    return result.textContent()
  } catch {
    return null
  }
}

/**
 * Check if model selector is loading
 */
export async function isModelSelectorLoading(page: Page): Promise<boolean> {
  const selector = page.locator(SELECTORS.modelSelector)
  const loading = selector.locator(SELECTORS.modelSelectorLoading)
  return loading.isVisible()
}

/**
 * Select a model from the dropdown
 */
export async function selectModel(page: Page, model: string): Promise<void> {
  const selector = page.locator('.model-selector select, .model-selector input')
  const tagName = await selector.evaluate(el => el.tagName.toLowerCase())

  if (tagName === 'select') {
    await selector.selectOption(model)
  } else {
    await selector.fill(model)
  }
}

/**
 * Check if an element is visible and enabled
 */
export async function isElementEnabled(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector)
  const isVisible = await element.isVisible()
  if (!isVisible) return false
  return element.isEnabled()
}

/**
 * Wait for an element to be enabled
 */
export async function waitForElementEnabled(
  page: Page,
  selector: string,
  timeout = TIMEOUTS.standard
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout })
  await page.waitForFunction(
    sel => {
      const el = document.querySelector(sel)
      return el && !el.hasAttribute('disabled')
    },
    selector,
    { timeout }
  )
}

/**
 * Get the value of an input field
 */
export async function getInputValue(page: Page, selector: string): Promise<string> {
  return page.locator(selector).inputValue()
}

/**
 * Check if env badge is displayed for a field
 */
export async function hasEnvBadge(page: Page, fieldId: string): Promise<boolean> {
  const field = page.locator(`#${fieldId}`).locator('xpath=..').locator(SELECTORS.envBadge)
  return field.isVisible()
}

/**
 * Get available shell options
 */
export async function getShellOptions(page: Page): Promise<string[]> {
  const select = page.locator(SELECTORS.shellSelect)
  const options = await select.locator('option').allTextContents()
  return options.map(o => o.trim())
}

/**
 * Get available theme options
 */
export async function getThemeOptions(page: Page): Promise<string[]> {
  const select = page.locator(SELECTORS.theme)
  const options = await select.locator('option').allTextContents()
  return options.map(o => o.trim())
}

/**
 * Set a React controlled input value properly
 * This triggers the proper React onChange events for controlled inputs
 */
export async function setReactInputValue(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  const input = page.locator(selector)

  // Get the input type
  const inputType = await input.getAttribute('type').catch(() => 'text')

  // For range inputs, use fill directly
  if (inputType === 'range') {
    await input.fill(value)
    // Dispatch events to trigger React onChange
    await input.evaluate(el => {
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await page.waitForTimeout(TIMEOUTS.minimalDelay)
    return
  }

  // For text, number, and other inputs - use type simulation
  await input.focus()

  // Select all existing content
  await input.press('Control+a')

  // Type the new value (this triggers proper keyboard/input events)
  await input.fill(value)

  // Press Enter to trigger change event
  await input.press('Enter')

  // Small delay for React to process
  await page.waitForTimeout(TIMEOUTS.minimalDelay)
}
