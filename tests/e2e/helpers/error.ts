import type { Page } from '@playwright/test'
import { SELECTORS } from '../selectors'
import { TIMEOUTS } from '../timeouts'

/**
 * Wait for error message to appear
 */
export async function waitForError(
  page: Page,
  timeout = TIMEOUTS.standard
): Promise<string | null> {
  const error = page.locator(SELECTORS.error)
  try {
    await error.waitFor({ state: 'visible', timeout })
    return error.textContent()
  } catch {
    return null
  }
}

/**
 * Check if error is visible
 */
export async function isErrorVisible(page: Page, _timeout = TIMEOUTS.standard): Promise<boolean> {
  const error = page.locator(SELECTORS.error)
  const errorMessage = page.locator(SELECTORS.errorMessage)

  try {
    // Check for error class first
    await error.waitFor({ state: 'visible', timeout: TIMEOUTS.standard })
    return true
  } catch {
    // If no error class, check for error message in AI response
    try {
      await errorMessage.waitFor({ state: 'visible', timeout: TIMEOUTS.standard })
      return true
    } catch {
      return false
    }
  }
}

/**
 * Mock electronAPI for error simulation
 * This replaces the API before the app uses it
 */
export async function mockElectronAPIForError(
  page: Page,
  methodName: string,
  error: Error
): Promise<void> {
  await page.evaluate(
    ({ method, errMsg }) => {
      // Store the original API
      const original = window.electronAPI
      if (!original) return

      // Create a new object with the mocked method
      window.electronAPI = {
        ...original,
        [method]: async () => {
          throw new Error(errMsg)
        },
      }
    },
    { method: methodName, errMsg: error.message }
  )
}
