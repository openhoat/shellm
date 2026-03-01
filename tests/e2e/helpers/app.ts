import type { Page } from '@playwright/test'
import { SELECTORS } from '../selectors'
import { TIMEOUTS } from '../timeouts'

/**
 * Wait for the app to be ready (main container visible)
 */
export async function waitForAppReady(page: Page, timeout = TIMEOUTS.standard): Promise<void> {
  await page.waitForSelector(SELECTORS.app, { state: 'visible', timeout })
}

/**
 * Wait for the chat panel to be ready
 */
export async function waitForChatReady(page: Page, timeout = TIMEOUTS.standard): Promise<void> {
  await page.waitForSelector(SELECTORS.chatPanel, { state: 'visible', timeout })
  // Wait for the input to be enabled (not loading)
  await page.waitForSelector(`${SELECTORS.chatInput}:not([disabled])`, {
    state: 'visible',
    timeout,
  })
}

/**
 * Wait for the terminal PTY to be created (terminalPid set in store)
 */
export async function waitForTerminalReady(
  page: Page,
  timeout = TIMEOUTS.terminalInit
): Promise<void> {
  // Wait for terminal container to be visible
  await page.waitForSelector(SELECTORS.terminalContainer, { state: 'visible', timeout })
  // Wait for PTY initialization - reduced from 1000ms to 500ms
  await page.waitForTimeout(TIMEOUTS.briefDelay)
}

/**
 * Reset app state between tests
 * This ensures a clean slate by:
 * 1. Canceling any pending command actions (Escape)
 * 2. Closing config panel if open
 * 3. Closing conversation dropdown if open
 * 4. Clearing all conversations (Ctrl+K)
 * 5. Waiting for welcome screen or empty state
 */
export async function resetAppState(page: Page): Promise<void> {
  // Cancel any pending command actions
  const commandActions = page.locator(SELECTORS.commandActions)
  if (await commandActions.isVisible({ timeout: TIMEOUTS.briefDelay }).catch(() => false)) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(TIMEOUTS.minimalDelay)
  }

  // Close config panel if open
  if (
    await page
      .locator(SELECTORS.configPanel)
      .isVisible()
      .catch(() => false)
  ) {
    await page.keyboard.press('Escape')
    await page
      .waitForFunction(() => !document.querySelector('.config-panel'), {
        timeout: TIMEOUTS.standard,
      })
      .catch(() => undefined)
  }

  // Close conversation dropdown if open
  if (
    await page
      .locator(SELECTORS.conversationDropdown)
      .isVisible()
      .catch(() => false)
  ) {
    await page.keyboard.press('Escape')
    await page
      .waitForSelector(SELECTORS.conversationDropdown, {
        state: 'hidden',
        timeout: TIMEOUTS.standard,
      })
      .catch(() => undefined)
  }

  // Clear all conversations via Ctrl+K
  await page.keyboard.press('Control+k')

  // Wait for welcome message or empty state
  await page
    .waitForFunction(
      () =>
        !!document.querySelector('.chat-welcome') ||
        document.querySelectorAll('.chat-message').length === 0,
      { timeout: TIMEOUTS.standard }
    )
    .catch(() => undefined)
}
