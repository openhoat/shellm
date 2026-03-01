import type { Page } from '@playwright/test'

/**
 * Clear all conversations via keyboard shortcut (Ctrl+K)
 */
export async function clearAllConversationsByShortcut(page: Page): Promise<void> {
  await page.keyboard.press('Control+k')
}

/**
 * Execute command via keyboard shortcut (Ctrl+Enter)
 */
export async function executeCommandByShortcut(page: Page): Promise<void> {
  await page.keyboard.press('Control+Enter')
}

/**
 * Cancel action via keyboard shortcut (Escape)
 */
export async function cancelActionByShortcut(page: Page): Promise<void> {
  await page.keyboard.press('Escape')
}
