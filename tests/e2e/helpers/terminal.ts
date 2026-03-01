import type { Page } from '@playwright/test'
import { SELECTORS } from '../selectors'

/**
 * Get terminal content (text content from xterm)
 */
export async function getTerminalContent(page: Page): Promise<string> {
  const terminal = page.locator(SELECTORS.terminalXterm)
  return terminal.textContent() || ''
}

/**
 * Type in terminal (simulates user typing in xterm)
 */
export async function typeInTerminal(page: Page, text: string): Promise<void> {
  const terminal = page.locator(SELECTORS.terminalContent)
  await terminal.click()

  // Type character by character with small delays
  for (const char of text) {
    await page.keyboard.press(char)
    await page.waitForTimeout(50)
  }
}

/**
 * Press a key in terminal
 */
export async function pressTerminalKey(page: Page, key: string): Promise<void> {
  const terminal = page.locator(SELECTORS.terminalContent)
  await terminal.click()
  await page.keyboard.press(key)
}
