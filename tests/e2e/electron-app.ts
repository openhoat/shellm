import { execSync } from 'node:child_process'
import path from 'node:path'
import { type ElectronApplication, _electron as electron, type Page } from '@playwright/test'
import { defaultMockAICommand, getMockInjectionScript, type LaunchOptions } from './mocks'

/**
 * Helper to launch the Electron application for E2E testing
 *
 * @param options - Launch options including mocks and environment variables
 * @returns The Electron application and the first page
 *
 * @example
 * // Launch with mock configuration
 * const { app, page } = await launchElectronApp({
 *   mocks: {
 *     commandExecution: { output: 'file1.txt\nfile2.txt', exitCode: 0 }
 *   }
 * })
 *
 * @example
 * // Launch with environment variables for config testing
 * const { app, page } = await launchElectronApp({
 *   env: {
 *     SHELLM_OLLAMA_URL: '',
 *     SHELLM_OLLAMA_MODEL: '',
 *   }
 * })
 */
export async function launchElectronApp(options: LaunchOptions = {}): Promise<{
  app: ElectronApplication
  page: Page
}> {
  const { mocks, env: customEnv } = options

  // Build the app first if needed
  const projectRoot = path.resolve(__dirname, '..', '..')

  // Check if dist-electron exists, if not build it
  try {
    execSync('test -d dist-electron/electron', { cwd: projectRoot, stdio: 'pipe' })
  } catch {
    // Build Electron app for E2E tests
    execSync('npm run build:electron', { cwd: projectRoot, stdio: 'inherit' })
  }

  // Build args for Electron
  const args = [
    path.join(projectRoot, 'dist-electron', 'electron', 'main.js'),
    // Start minimized to reduce visual distraction during tests
    '--start-minimized',
  ]

  // Add X11 and headless flags when running in headless mode (via xvfb-run)
  // This forces Electron to use X11 instead of Wayland, allowing xvfb to capture the display
  if (process.env.HEADLESS === 'true') {
    args.push('--no-sandbox')
    args.push('--ozone-platform=x11')
    args.push('--disable-gpu')
    args.push('--disable-software-rasterizer')
    args.push('--disable-dev-shm-usage')
  }

  // Build environment variables
  const env: Record<string, string> = {
    ...process.env,
    NODE_ENV: 'test',
    SHELLM_DEVTOOLS: 'false',
  }

  // Add custom environment variables (for config testing)
  if (customEnv) {
    Object.assign(env, customEnv)
  }

  // Add E2E mock environment variables based on mock options
  if (mocks) {
    // Mock errors
    if (mocks.errors) {
      const mockErrors: Record<string, string> = {}
      if (mocks.errors.llmGenerate) {
        mockErrors.llmGenerate = mocks.errors.llmGenerate.message
      }
      if (mocks.errors.terminalWrite) {
        mockErrors.terminalWrite = mocks.errors.terminalWrite.message
      }
      if (Object.keys(mockErrors).length > 0) {
        env.SHELLM_E2E_MOCK_ERRORS = JSON.stringify(mockErrors)
      }
    }

    // Mock connection failure
    if (mocks.errors?.llmConnectionFailed) {
      env.SHELLM_E2E_MOCK_CONNECTION_FAILED = 'true'
    }

    // Mock AI response - always set when mocks are provided, defaulting to defaultMockAICommand
    // The IPC error handler (SHELLM_E2E_MOCK_ERRORS) takes priority over this value
    env.SHELLM_E2E_MOCK_AI_RESPONSE = JSON.stringify(mocks.aiCommand ?? defaultMockAICommand)

    // Mock models
    if (mocks.models) {
      env.SHELLM_E2E_MOCK_MODELS = JSON.stringify(mocks.models)
    }
  }

  // Launch Electron app
  const app = await electron.launch({
    args,
    env,
  })

  try {
    // Get the browser context and inject mock script if provided
    const context = app.context()
    if (mocks) {
      const mockScript = getMockInjectionScript(mocks)
      await context.addInitScript(mockScript)
    }

    // Get the first window (with timeout to prevent indefinite hang in CI)
    const page = await app.firstWindow({ timeout: 15000 })

    // Wait for the page to load (with timeout)
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 })

    return { app, page }
  } catch (err) {
    // Ensure the app is closed if launch setup fails, so the process doesn't linger
    await app.close().catch(_closeErr => {
      // Ignore close errors during failed launch cleanup
    })
    throw err
  }
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
