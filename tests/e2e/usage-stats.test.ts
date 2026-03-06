import type { ElectronApplication, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { closeElectronApp, launchElectronApp, waitForAppReady } from './electron-app'
import {
  clickExecuteButton,
  resetAppState,
  sendMessage,
  waitForAIResponse,
  waitForCommandActions,
  waitForCommandExecution,
  waitForTerminalReady,
} from './helpers'
import { SELECTORS } from './selectors'
import { TIMEOUTS } from './timeouts'

let app: ElectronApplication
let page: Page

test.describe('Termaid E2E - Usage Statistics', () => {
  test.beforeAll(async () => {
    const result = await launchElectronApp({ mocks: {} })
    app = result.app
    page = result.page
    await waitForAppReady(page)
  })

  test.afterAll(async () => {
    await closeElectronApp(app)
  })

  test.beforeEach(async () => {
    // Reset app state between tests
    await resetAppState(page)
    await page.waitForTimeout(TIMEOUTS.shortDelay)

    // Ensure stats panel is closed
    const statsPanel = page.locator(SELECTORS.statsPanel)
    const isPanelVisible = await statsPanel.isVisible().catch(() => false)
    if (isPanelVisible) {
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    }
  })

  test.describe('Stats Panel UI', () => {
    test('should open and close stats panel', async () => {
      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Verify panel is visible
      const panel = page.locator(SELECTORS.statsPanel)
      await expect(panel).toBeVisible()

      // Close by clicking X button
      await page.click(SELECTORS.statsPanelClose)
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
      await expect(panel).not.toBeVisible()
    })

    test('should close stats panel by clicking outside', async () => {
      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Click on overlay (outside panel)
      await page.click(SELECTORS.statsPanelOverlay, { position: { x: 10, y: 10 }, force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })

      const panel = page.locator(SELECTORS.statsPanel)
      await expect(panel).not.toBeVisible()
    })

    test('should close stats panel with Escape key', async () => {
      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Press Escape
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })

      const panel = page.locator(SELECTORS.statsPanel)
      await expect(panel).not.toBeVisible()
    })
  })

  test.describe('Stats Collection', () => {
    test('should track command execution statistics', async () => {
      await waitForTerminalReady(page)

      // Generate and execute a command to create statistics
      await sendMessage(page, 'Show current directory')
      await waitForAIResponse(page)
      await waitForCommandActions(page)

      const executeButton = page.locator(SELECTORS.executeButton)
      const isEnabled = await executeButton.isEnabled()

      if (isEnabled) {
        await clickExecuteButton(page)
        await waitForCommandExecution(page)
      }

      // Wait a bit for stats to be recorded
      await page.waitForTimeout(TIMEOUTS.shortDelay)

      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Verify stats are displayed
      const statCards = page.locator(SELECTORS.statCard)
      const count = await statCards.count()
      expect(count).toBeGreaterThan(0)

      // Check that total commands is at least 1
      const totalCommandsCard = page.locator(SELECTORS.statCard).first()
      const totalCommandsValue = await totalCommandsCard.locator('.stat-value').textContent()
      expect(Number.parseInt(totalCommandsValue || '0', 10)).toBeGreaterThan(0)

      // Close panel at end
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })

    test('should show provider-specific statistics', async () => {
      await waitForTerminalReady(page)

      // Generate a command
      await sendMessage(page, 'List files')
      await waitForAIResponse(page)

      // Wait for stats to be recorded
      await page.waitForTimeout(TIMEOUTS.shortDelay)

      // Open stats panel with force to avoid overlay issues
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Check for provider cards
      const providerCards = page.locator(SELECTORS.providerCard)
      const count = await providerCards.count()

      // Should have at least one provider (ollama by default)
      expect(count).toBeGreaterThan(0)

      // Verify provider card has metrics
      if (count > 0) {
        const firstProviderCard = providerCards.first()
        const providerName = await firstProviderCard.locator('.provider-name').textContent()
        expect(providerName).toBeTruthy()

        // Check that metrics are displayed
        const metrics = firstProviderCard.locator('.metric')
        const metricsCount = await metrics.count()
        expect(metricsCount).toBeGreaterThan(0)
      }

      // Close panel at end of test
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })
  })

  test.describe('Period Filtering', () => {
    test('should switch between different time periods', async () => {
      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Get period buttons
      const periodButtons = page.locator(SELECTORS.periodButton)
      const buttonCount = await periodButtons.count()
      expect(buttonCount).toBeGreaterThanOrEqual(4) // All, 24h, 7d, 30d

      // Click on "Last 24h" button
      const button24h = periodButtons.nth(1)
      await button24h.click()

      // Verify button is active
      const hasActiveClass = await button24h.evaluate(el => el.classList.contains('active'))
      expect(hasActiveClass).toBe(true)

      // Click on "Last 7 days"
      const button7d = periodButtons.nth(2)
      await button7d.click()

      // Verify button is active
      const hasActiveClass7d = await button7d.evaluate(el => el.classList.contains('active'))
      expect(hasActiveClass7d).toBe(true)

      // Click on "All Time"
      const buttonAll = periodButtons.nth(0)
      await buttonAll.click()

      // Verify button is active
      const hasActiveClassAll = await buttonAll.evaluate(el => el.classList.contains('active'))
      expect(hasActiveClassAll).toBe(true)

      // Close panel at end
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })
  })

  test.describe('Stats Actions', () => {
    test('should clear statistics', async () => {
      await waitForTerminalReady(page)

      // Generate a command to create some stats
      await sendMessage(page, 'Show current directory')
      await waitForAIResponse(page)
      await page.waitForTimeout(TIMEOUTS.shortDelay)

      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Get initial total commands
      const totalCommandsCardBefore = page.locator(SELECTORS.statCard).first()
      const totalCommandsValueBefore = await totalCommandsCardBefore
        .locator('.stat-value')
        .textContent()
      const commandsCountBefore = Number.parseInt(totalCommandsValueBefore || '0', 10)

      // Set up dialog handler before clicking
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm')
        await dialog.accept()
      })

      // Click clear button
      await page.click(SELECTORS.clearStatsButton)

      // Remove the handler
      page.removeAllListeners('dialog')

      // Wait for stats to be cleared
      await page.waitForTimeout(TIMEOUTS.shortDelay)

      // Close and reopen panel to refresh
      await page.keyboard.press('Escape')
      await page.waitForTimeout(TIMEOUTS.shortDelay)
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Verify stats are cleared
      const totalCommandsCardAfter = page.locator(SELECTORS.statCard).first()
      const totalCommandsValueAfter = await totalCommandsCardAfter
        .locator('.stat-value')
        .textContent()
      const commandsCountAfter = Number.parseInt(totalCommandsValueAfter || '0', 10)

      expect(commandsCountAfter).toBeLessThan(commandsCountBefore)

      // Close panel at end
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })
  })

  test.describe('Stats Display', () => {
    test('should display all stat cards', async () => {
      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Verify all main stat cards are present
      const statCards = page.locator(SELECTORS.statCard)
      const count = await statCards.count()

      // Should have at least 4 cards: Total, Success, Failed, Success Rate
      expect(count).toBeGreaterThanOrEqual(4)

      // Verify each card has a label and value
      for (let i = 0; i < count; i++) {
        const card = statCards.nth(i)
        const label = await card.locator('.stat-label').textContent()
        const value = await card.locator('.stat-value').textContent()

        expect(label).toBeTruthy()
        expect(value).toBeTruthy()
      }

      // Close panel at end
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })

    test('should show overall section title', async () => {
      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Check for "Overall Statistics" section
      const overallSection = page.locator('.stats-section').first()
      const heading = await overallSection.locator('h3').textContent()

      expect(heading).toBeTruthy()

      // Close panel at end
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })

    test('should show period selector', async () => {
      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Verify period selector exists
      const periodSelector = page.locator(SELECTORS.periodSelector)
      await expect(periodSelector).toBeVisible()

      // Verify it has buttons
      const buttons = periodSelector.locator('button')
      const buttonCount = await buttons.count()
      expect(buttonCount).toBeGreaterThanOrEqual(4)

      // Close panel at end
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })
  })

  test.describe('Multiple Commands Workflow', () => {
    test('should track statistics for multiple commands', async () => {
      await waitForTerminalReady(page)

      // Execute multiple commands
      const commands = ['Show current directory', 'List files', 'Show date']

      for (const command of commands) {
        await sendMessage(page, command)
        await waitForAIResponse(page)
        await page.waitForTimeout(TIMEOUTS.shortDelay)

        // Cancel to move to next command quickly (use keyboard instead of click)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }

      // Open stats panel
      await page.click(SELECTORS.statsButton, { force: true })
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'visible', timeout: 10000 })

      // Verify total commands increased
      const totalCommandsCard = page.locator(SELECTORS.statCard).first()
      const totalCommandsValue = await totalCommandsCard.locator('.stat-value').textContent()
      const totalCommands = Number.parseInt(totalCommandsValue || '0', 10)

      expect(totalCommands).toBeGreaterThanOrEqual(commands.length)

      // Close panel at end
      await page.keyboard.press('Escape')
      await page.waitForSelector(SELECTORS.statsPanel, { state: 'hidden' })
    })
  })
})
