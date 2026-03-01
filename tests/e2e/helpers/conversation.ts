import type { Page } from '@playwright/test'
import { SELECTORS } from '../selectors'
import { TIMEOUTS } from '../timeouts'

/**
 * Open conversation list dropdown
 */
export async function openConversationList(page: Page): Promise<void> {
  const button = page.locator(SELECTORS.conversationsButton)

  // Retry up to 3 times in case the dropdown doesn't appear
  for (let attempt = 0; attempt < 3; attempt++) {
    await button.click()
    try {
      await page.waitForSelector(SELECTORS.conversationDropdown, {
        state: 'visible',
        timeout: TIMEOUTS.standard,
      })
      return
    } catch {
      // Click again to toggle (might have opened and closed)
      await page.waitForTimeout(TIMEOUTS.briefDelay)
    }
  }

  // Final attempt with longer timeout
  await button.click()
  await page.waitForSelector(SELECTORS.conversationDropdown, {
    state: 'visible',
    timeout: TIMEOUTS.standard,
  })
}

/**
 * Close conversation list dropdown
 */
export async function closeConversationList(page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForSelector(SELECTORS.conversationDropdown, {
    state: 'hidden',
    timeout: TIMEOUTS.standard,
  })
}

/**
 * Get conversation list items
 */
export async function getConversationListItems(page: Page): Promise<string[]> {
  const items = page.locator(`${SELECTORS.conversationList} ${SELECTORS.conversationTitle}`)
  const count = await items.count()
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const text = await items.nth(i).textContent()
    if (text) {
      result.push(text.trim())
    }
  }

  return result
}

/**
 * Delete a conversation from the list
 */
export async function deleteConversation(page: Page, index: number): Promise<void> {
  // Handle the confirm dialog
  page.once('dialog', dialog => dialog.accept())

  const deleteButton = page
    .locator(SELECTORS.conversationItem)
    .nth(index)
    .locator(SELECTORS.conversationDelete)
  await deleteButton.click()
}

/**
 * Create a new conversation
 */
export async function createNewConversation(page: Page): Promise<void> {
  const newButton = page.locator(SELECTORS.newConversationButton)
  await newButton.click()
}
