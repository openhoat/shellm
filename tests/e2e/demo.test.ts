import type { ElectronApplication, Page } from '@playwright/test'
import { test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import { clickExecuteButton, sendMessage, waitForAIResponse, waitForCommandActions } from './helpers'

let app: ElectronApplication
let page: Page

test.describe('Termaid Demo', () => {
  test.beforeAll(async () => {
    const result = await launchElectronApp({ mocks: {} })
    app = result.app
    page = result.page
    await waitForAppReady(page)
    // Set viewport for video recording
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test.afterAll(async () => {
    await closeElectronApp(app)
  })

  test('should demonstrate Termaid features', async () => {
    // Wait for terminal to be ready
    await page.waitForSelector('.terminal-container', { state: 'visible' })
    await page.waitForTimeout(1500)

    // Show welcome screen
    await page.waitForTimeout(2000)

    // Send a command request
    await sendMessage(page, 'List all files')
    await page.waitForTimeout(500)

    // Wait for AI response
    await waitForAIResponse(page, 30000)
    await page.waitForTimeout(1500)

    // Wait for command actions
    await waitForCommandActions(page, 15000)
    await page.waitForTimeout(1000)

    // Execute the command
    await clickExecuteButton(page)
    await page.waitForTimeout(2000)

    // Open configuration panel
    const configButton = page.locator('header button[title="Configuration"]')
    await configButton.click()
    await page.waitForSelector('.config-panel', { state: 'visible' })
    await page.waitForTimeout(2000)

    // Close configuration
    await page.locator('.config-panel .close-button').click()
    await page.waitForSelector('.config-panel', { state: 'hidden' })
    await page.waitForTimeout(1000)

    // Final pause to show result
    await page.waitForTimeout(2000)
  })
})
