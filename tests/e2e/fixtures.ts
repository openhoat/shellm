import { test as base, type ElectronApplication, type Page } from '@playwright/test'
import { closeElectronApp, launchElectronApp } from './electron-app'

/**
 * Custom test fixture for Electron E2E tests
 * Provides app and page fixtures that are automatically managed
 *
 * Mock behavior:
 * - UI mode (UI_MODE=true): Real LLM, no mocks
 * - Headless/CI mode: Mocks enabled for fast, reliable tests
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
