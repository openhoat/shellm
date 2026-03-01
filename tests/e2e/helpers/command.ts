import type { Page } from '@playwright/test'
import { SELECTORS } from '../selectors'
import { TIMEOUTS } from '../timeouts'

/**
 * Get command proposal text
 */
export async function getCommandProposal(page: Page): Promise<string | null> {
  const commandDisplay = page.locator(SELECTORS.aiCommandDisplay)
  if (await commandDisplay.isVisible()) {
    return commandDisplay.textContent()
  }
  return null
}

/**
 * Check if Execute button is visible
 */
export async function isExecuteButtonVisible(page: Page): Promise<boolean> {
  const button = page.locator(SELECTORS.executeButton)
  return button.isVisible()
}

/**
 * Click Execute button
 */
export async function clickExecuteButton(page: Page): Promise<void> {
  const button = page.locator(SELECTORS.executeButton)
  await button.click()
}

/**
 * Click Modify button
 */
export async function clickModifyButton(page: Page): Promise<void> {
  const button = page.locator(SELECTORS.modifyButton)
  await button.click()
}

/**
 * Click Cancel button
 */
export async function clickCancelButton(page: Page): Promise<void> {
  const button = page.locator(SELECTORS.cancelButton)
  await button.click()
}

/**
 * Check if command actions are visible
 */
export async function isCommandActionsVisible(page: Page): Promise<boolean> {
  const actions = page.locator(SELECTORS.commandActions)
  return actions.isVisible()
}

/**
 * Wait for command actions to appear
 */
export async function waitForCommandActions(
  page: Page,
  timeout = TIMEOUTS.standard
): Promise<void> {
  await page.waitForSelector(SELECTORS.commandActions, { state: 'visible', timeout })
}

/**
 * Wait for command actions to disappear
 */
export async function waitForCommandActionsHidden(
  page: Page,
  timeout = TIMEOUTS.standard
): Promise<void> {
  await page.waitForSelector(SELECTORS.commandActions, { state: 'hidden', timeout })
}

/**
 * Wait for command execution to complete
 */
export async function waitForCommandExecution(
  page: Page,
  timeout = TIMEOUTS.aiResponse
): Promise<void> {
  // Wait for progress indicator to appear
  const progressIndicator = page.locator(SELECTORS.progressIndicator)

  // Wait for progress to appear and then disappear
  try {
    await progressIndicator.waitFor({ state: 'visible', timeout: TIMEOUTS.standard })
    await progressIndicator.waitFor({ state: 'hidden', timeout })
  } catch {
    // Progress might have already completed, that's fine
  }

  // Wait for any loading spinner to disappear (interpretation can take 30s+ with LLM)
  const loadingSpinner = page.locator(SELECTORS.loadingSpinner)
  try {
    const spinnerVisible = await loadingSpinner.isVisible().catch(() => false)
    if (spinnerVisible) {
      await loadingSpinner.waitFor({ state: 'hidden', timeout: TIMEOUTS.commandExecution })
    }
  } catch {
    // Interpretation might have already completed
  }
}
