import { test as base, type ElectronApplication, type Page } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

/**
 * Custom test fixture for Electron E2E tests
 * Provides app and page fixtures that are automatically managed
 *
 * Mock behavior:
 * - UI mode (UI_MODE=true): Real LLM, no mocks
 * - Headless/CI mode: Mocks enabled for fast, reliable tests
 */

/**
 * Test fixtures provided by this module
 */
export const test = base.extend<{
  app: ElectronApplication
  page: Page
}>({
  // Launch the Electron app before each test
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern requires empty object
  app: async ({}, use): Promise<void> => {
    // In UI mode, don't use mocks (real LLM)
    // In headless/CI mode, use mocks
    const useMocks = process.env.UI_MODE !== 'true'
    const { app } = await launchElectronApp({ mocks: useMocks ? {} : undefined })
    await use(app)
    await closeElectronApp(app)
  },

  // Get the first window page
  page: async ({ app }, use): Promise<void> => {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await use(page)
  },
})

export { expect } from '@playwright/test'

/**
 * Test options for launching app with custom configuration
 */
export interface TestOptions {
  /** Mock configuration for API responses */
  mocks?: Parameters<typeof launchElectronApp>[0]['mocks']
  /** Environment variables to inject */
  env?: Record<string, string>
  /** Locale for i18n testing */
  locale?: string
  /** Use real LLM instead of mocks */
  realLlm?: boolean
}

/**
 * Launch app with custom options for testing
 * Use this when you need custom mocks or environment variables
 */
export async function launchTestApp(options: TestOptions = {}): Promise<{
  app: ElectronApplication
  page: Page
}> {
  const result = await launchElectronApp(options)
  await waitForAppReady(result.page)
  return result
}

/**
 * Close the test app
 */
export async function closeTestApp(app: ElectronApplication): Promise<void> {
  await closeElectronApp(app)
}

// Re-export everything needed for tests
export { SELECTORS, TIMEOUTS }
export * from './helpers'
