import { execSync } from 'node:child_process'
import path from 'node:path'
import { type ElectronApplication, _electron as electron, type Page } from '@playwright/test'

/**
 * Helper to launch the Electron application for E2E testing
 */
export async function launchElectronApp(): Promise<{
  app: ElectronApplication
  page: Page
}> {
  // Build the app first if needed
  const projectRoot = path.resolve(__dirname, '..', '..')

  // Check if dist-electron exists, if not build it
  try {
    execSync('test -d dist-electron/electron', { cwd: projectRoot, stdio: 'pipe' })
  } catch {
    // Build Electron app for E2E tests
    execSync('npm run build:electron', { cwd: projectRoot, stdio: 'inherit' })
  }

  // Launch Electron app
  const app = await electron.launch({
    args: [path.join(projectRoot, 'dist-electron', 'electron', 'main.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      SHELLM_DEVTOOLS: 'false',
    },
  })

  // Get the first window
  const page = await app.firstWindow()

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded')

  return { app, page }
}

/**
 * Helper to close the Electron application
 */
export async function closeElectronApp(app: ElectronApplication): Promise<void> {
  await app.close()
}

/**
 * Wait for the app to be ready
 */
export async function waitForAppReady(page: Page): Promise<void> {
  // Wait for the main app container to be visible
  await page.waitForSelector('.app', { state: 'visible', timeout: 10000 })
}

/**
 * Get the window title
 */
export async function getWindowTitle(page: Page): Promise<string | null> {
  return page.title()
}

/**
 * Check if an element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector)
    return element.isVisible()
  } catch {
    return false
  }
}
