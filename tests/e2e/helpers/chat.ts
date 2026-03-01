import type { Page } from '@playwright/test'
import { SELECTORS } from '../selectors'
import { TIMEOUTS } from '../timeouts'

/**
 * Send a chat message
 */
export async function sendMessage(page: Page, message: string): Promise<void> {
  const input = page.locator(SELECTORS.chatInput)
  await input.fill(message)
  await input.press('Enter')
}

/**
 * Type in chat input without sending
 */
export async function typeInChat(page: Page, text: string): Promise<void> {
  const input = page.locator(SELECTORS.chatInput)
  await input.fill(text)
}

/**
 * Clear chat input
 */
export async function clearChatInput(page: Page): Promise<void> {
  const input = page.locator(SELECTORS.chatInput)
  await input.fill('')
}

/**
 * Wait for AI response to appear in chat
 */
export async function waitForAIResponse(page: Page, timeout = TIMEOUTS.aiResponse): Promise<void> {
  // Wait for loading spinner to appear and then disappear
  const loadingSpinner = page.locator(SELECTORS.loadingSpinner)
  const isVisible = await loadingSpinner.isVisible().catch(() => false)

  if (isVisible) {
    await loadingSpinner.waitFor({ state: 'hidden', timeout })
  }

  // Wait for AI message to appear
  await page.waitForSelector(SELECTORS.aiMessage, { timeout })
}

/**
 * Get all chat messages
 */
export async function getChatMessages(page: Page): Promise<string[]> {
  const messages = page.locator(SELECTORS.chatMessage)
  const count = await messages.count()
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const content = await messages.nth(i).locator(SELECTORS.messageContent).textContent()
    if (content) {
      result.push(content.trim())
    }
  }

  return result
}

/**
 * Get user messages only
 */
export async function getUserMessages(page: Page): Promise<string[]> {
  const messages = page.locator(SELECTORS.userMessage)
  const count = await messages.count()
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const content = await messages.nth(i).locator(SELECTORS.messageContent).textContent()
    if (content) {
      result.push(content.trim())
    }
  }

  return result
}

/**
 * Get AI messages only
 */
export async function getAIMessages(page: Page): Promise<string[]> {
  const messages = page.locator(SELECTORS.aiMessage)
  const count = await messages.count()
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const content = await messages.nth(i).locator(SELECTORS.messageContent).textContent()
    if (content) {
      result.push(content.trim())
    }
  }

  return result
}

/**
 * Check if welcome message is displayed
 */
export async function isWelcomeMessageVisible(page: Page): Promise<boolean> {
  const welcome = page.locator(SELECTORS.chatWelcome)
  return welcome.isVisible()
}

/**
 * Check if loading spinner is visible
 */
export async function isLoadingVisible(page: Page): Promise<boolean> {
  const spinner = page.locator(SELECTORS.loadingSpinner)
  return spinner.isVisible()
}

/**
 * Wait for a specific number of chat messages
 */
export async function waitForMessageCount(
  page: Page,
  count: number,
  timeout = TIMEOUTS.aiResponse
): Promise<void> {
  await page.waitForFunction(
    expectedCount => {
      const messages = document.querySelectorAll('.chat-message')
      return messages.length >= expectedCount
    },
    count,
    { timeout }
  )
}
