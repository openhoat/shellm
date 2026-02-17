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
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test.afterAll(async () => {
    await closeElectronApp(app)
  })

  test('should demonstrate Termaid features', async () => {
    await page.waitForSelector('.terminal-container', { state: 'visible' })
    await page.waitForTimeout(300)

    await sendMessage(page, 'Check disk usage')
    await waitForAIResponse(page, 30000)
    await waitForCommandActions(page, 15000)
    await clickExecuteButton(page)
    await page.waitForTimeout(800)
  })
})
