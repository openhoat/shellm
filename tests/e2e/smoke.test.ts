import { expect, test } from './fixtures'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

test.describe('Termaid E2E - Smoke Tests', () => {
  test('should launch the application successfully', async ({ page }) => {
    // Verify the app window exists
    // Verify the main app container is visible
    const appContainer = page.locator(SELECTORS.app)
    await expect(appContainer).toBeVisible()
  })

  test('should display the header component', async ({ page }) => {
    // Verify header is visible
    const header = page.locator(SELECTORS.header)
    await expect(header).toBeVisible()
  })

  test('should display the terminal component', async ({ page }) => {
    // Verify terminal wrapper is visible
    const terminalWrapper = page.locator(SELECTORS.terminalWrapper)
    await expect(terminalWrapper).toBeVisible()
  })

  test('should display the chat panel component', async ({ page }) => {
    // Verify chat panel is visible
    const chatPanel = page.locator(SELECTORS.chatPanel)
    await expect(chatPanel).toBeVisible()
  })

  test('should have correct window dimensions', async ({ page }) => {
    // Get the app container dimensions
    const appContainer = page.locator(SELECTORS.app)
    const boundingBox = await appContainer.boundingBox()

    // Verify the app container has reasonable dimensions
    expect(boundingBox).toBeDefined()
    expect(boundingBox?.width).toBeGreaterThanOrEqual(800)
    expect(boundingBox?.height).toBeGreaterThanOrEqual(600)
  })

  test('should hide config panel by default', async ({ page }) => {
    // Config panel should not be visible by default
    const configPanel = page.locator(SELECTORS.configPanel)

    // Wait a bit for the app state to settle
    await page.waitForTimeout(TIMEOUTS.shortDelay)

    // Config panel should be hidden (not visible in the DOM or hidden)
    const isVisible = await configPanel.isVisible().catch(() => false)
    expect(isVisible).toBe(false)
  })
})
