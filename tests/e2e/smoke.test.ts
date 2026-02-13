import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'

test.describe('SheLLM E2E - Smoke Tests', () => {
  test('should launch the application successfully', async () => {
    const { app, page } = await launchElectronApp()

    try {
      // Verify the app window exists
      expect(app).toBeDefined()
      expect(page).toBeDefined()

      // Wait for the app to be ready
      await waitForAppReady(page)

      // Verify the main app container is visible
      const appContainer = page.locator('.app')
      await expect(appContainer).toBeVisible()
    } finally {
      await closeElectronApp(app)
    }
  })

  test('should display the header component', async () => {
    const { app, page } = await launchElectronApp()

    try {
      await waitForAppReady(page)

      // Verify header is visible
      const header = page.locator('header')
      await expect(header).toBeVisible()
    } finally {
      await closeElectronApp(app)
    }
  })

  test('should display the terminal component', async () => {
    const { app, page } = await launchElectronApp()

    try {
      await waitForAppReady(page)

      // Verify terminal wrapper is visible
      const terminalWrapper = page.locator('.terminal-wrapper')
      await expect(terminalWrapper).toBeVisible()
    } finally {
      await closeElectronApp(app)
    }
  })

  test('should display the chat panel component', async () => {
    const { app, page } = await launchElectronApp()

    try {
      await waitForAppReady(page)

      // Verify chat panel is visible (it should have a chat-container or similar)
      const chatPanel = page.locator('.chat-panel')
      await expect(chatPanel).toBeVisible()
    } finally {
      await closeElectronApp(app)
    }
  })

  test('should have correct window dimensions', async () => {
    const { app, page } = await launchElectronApp()

    try {
      await waitForAppReady(page)

      // Get the app container dimensions
      const appContainer = page.locator('.app')
      const boundingBox = await appContainer.boundingBox()

      // Verify the app container has reasonable dimensions
      expect(boundingBox).toBeDefined()
      expect(boundingBox?.width).toBeGreaterThanOrEqual(800)
      expect(boundingBox?.height).toBeGreaterThanOrEqual(600)
    } finally {
      await closeElectronApp(app)
    }
  })

  test('should hide config panel by default', async () => {
    const { app, page } = await launchElectronApp()

    try {
      await waitForAppReady(page)

      // Config panel should not be visible by default
      const configPanel = page.locator('.config-panel')

      // Wait a bit for the app state to settle
      await page.waitForTimeout(500)

      // Config panel should be hidden (not visible in the DOM or hidden)
      const isVisible = await configPanel.isVisible().catch(() => false)
      expect(isVisible).toBe(false)
    } finally {
      await closeElectronApp(app)
    }
  })
})
