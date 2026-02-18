import type { Page } from '@playwright/test'

/**
 * Wait for the app to be ready (main container visible)
 */
export async function waitForAppReady(page: Page, timeout = 10000): Promise<void> {
  await page.waitForSelector('.app', { state: 'visible', timeout })
}

/**
 * Wait for the chat panel to be ready
 */
export async function waitForChatReady(page: Page, timeout = 10000): Promise<void> {
  await page.waitForSelector('.chat-panel', { state: 'visible', timeout })
  // Wait for the input to be enabled (not loading)
  await page.waitForSelector('.chat-input textarea:not([disabled])', { state: 'visible', timeout })
}

/**
 * Wait for the terminal PTY to be created (terminalPid set in store)
 */
export async function waitForTerminalReady(page: Page, timeout = 15000): Promise<void> {
  // Wait for terminal container to be visible
  await page.waitForSelector('.terminal-container', { state: 'visible', timeout })
  // Wait for PTY initialization - reduced from 1000ms to 500ms
  await page.waitForTimeout(500)
}

/**
 * Send a chat message
 */
export async function sendMessage(page: Page, message: string): Promise<void> {
  const input = page.locator('.chat-input textarea')
  await input.fill(message)
  await input.press('Enter')
}

/**
 * Type in chat input without sending
 */
export async function typeInChat(page: Page, text: string): Promise<void> {
  const input = page.locator('.chat-input textarea')
  await input.fill(text)
}

/**
 * Clear chat input
 */
export async function clearChatInput(page: Page): Promise<void> {
  const input = page.locator('.chat-input textarea')
  await input.fill('')
}

/**
 * Wait for AI response to appear in chat
 */
export async function waitForAIResponse(page: Page, timeout = 30000): Promise<void> {
  // Wait for loading spinner to appear and then disappear
  const loadingSpinner = page.locator('.loading-spinner')
  const isVisible = await loadingSpinner.isVisible().catch(() => false)

  if (isVisible) {
    await loadingSpinner.waitFor({ state: 'hidden', timeout })
  }

  // Wait for AI message to appear
  await page.waitForSelector('.chat-message.ai', { timeout })
}

/**
 * Wait for command execution to complete
 */
export async function waitForCommandExecution(page: Page, timeout = 30000): Promise<void> {
  // Wait for progress indicator to appear
  const progressIndicator = page.locator('.progress-indicator')

  // Wait for progress to appear and then disappear
  try {
    await progressIndicator.waitFor({ state: 'visible', timeout: 5000 })
    await progressIndicator.waitFor({ state: 'hidden', timeout })
  } catch {
    // Progress might have already completed, that's fine
  }

  // Wait for interpretation to complete
  const interpretingSpinner = page.locator('.chat-message.ai:has-text("Analyse")')
  try {
    await interpretingSpinner.waitFor({ state: 'hidden', timeout: 5000 })
  } catch {
    // Interpretation might have already completed
  }
}

/**
 * Get all chat messages
 */
export async function getChatMessages(page: Page): Promise<string[]> {
  const messages = page.locator('.chat-message')
  const count = await messages.count()
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const content = await messages.nth(i).locator('.message-content').textContent()
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
  const messages = page.locator('.chat-message.user')
  const count = await messages.count()
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const content = await messages.nth(i).locator('.message-content').textContent()
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
  const messages = page.locator('.chat-message.ai')
  const count = await messages.count()
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const content = await messages.nth(i).locator('.message-content').textContent()
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
  const welcome = page.locator('.chat-welcome')
  return welcome.isVisible()
}

/**
 * Check if loading spinner is visible
 */
export async function isLoadingVisible(page: Page): Promise<boolean> {
  const spinner = page.locator('.loading-spinner')
  return spinner.isVisible()
}

/**
 * Open the configuration panel
 */
export async function openConfigPanel(page: Page): Promise<void> {
  const configButton = page.locator('header button[title="Configuration"]')
  await configButton.click()
  await page.waitForSelector('.config-panel', { state: 'visible' })
}

/**
 * Close the configuration panel
 */
export async function closeConfigPanel(page: Page): Promise<void> {
  const closeButton = page.locator('.config-panel .close-button')
  await closeButton.click()
  // Wait for the panel to be removed from DOM
  await page.waitForFunction(() => !document.querySelector('.config-panel'), { timeout: 10000 })
}

/**
 * Check if config panel is visible
 */
export async function isConfigPanelVisible(page: Page): Promise<boolean> {
  const panel = page.locator('.config-panel')
  return panel.isVisible()
}

/**
 * Set config field value
 */
export async function setConfigField(
  page: Page,
  fieldId: string,
  value: string | number
): Promise<void> {
  const field = page.locator(`#${fieldId}`)

  const tagName = await field.evaluate(el => el.tagName.toLowerCase())

  if (tagName === 'select') {
    await field.selectOption(value.toString())
  } else if (tagName === 'input') {
    const inputType = await field.getAttribute('type')
    if (inputType === 'range') {
      await field.fill(value.toString())
    } else {
      await field.fill(value.toString())
    }
  }
}

/**
 * Get config field value
 */
export async function getConfigFieldValue(page: Page, fieldId: string): Promise<string> {
  const field = page.locator(`#${fieldId}`)
  return field.inputValue()
}

/**
 * Click the test connection button in config panel
 */
export async function testConnection(page: Page): Promise<void> {
  const testButton = page.locator('.config-panel .btn-test')
  await testButton.click()
}

/**
 * Save configuration
 */
export async function saveConfig(page: Page): Promise<void> {
  const saveButton = page.locator('.config-panel .btn-save')
  await saveButton.click()
  await page.waitForSelector('.config-panel', { state: 'hidden' })
}

/**
 * Reset configuration
 */
export async function resetConfig(page: Page): Promise<void> {
  const resetButton = page.locator('.config-panel .btn-reset')
  await resetButton.click()
}

/**
 * Get command proposal text
 */
export async function getCommandProposal(page: Page): Promise<string | null> {
  const commandDisplay = page.locator('.ai-command-display')
  if (await commandDisplay.isVisible()) {
    return commandDisplay.textContent()
  }
  return null
}

/**
 * Check if Execute button is visible
 */
export async function isExecuteButtonVisible(page: Page): Promise<boolean> {
  const button = page.locator('.command-actions .btn-execute')
  return button.isVisible()
}

/**
 * Click Execute button
 */
export async function clickExecuteButton(page: Page): Promise<void> {
  const button = page.locator('.command-actions .btn-execute')
  await button.click()
}

/**
 * Click Modify button
 */
export async function clickModifyButton(page: Page): Promise<void> {
  const button = page.locator('.command-actions .btn-modify')
  await button.click()
}

/**
 * Click Cancel button
 */
export async function clickCancelButton(page: Page): Promise<void> {
  const button = page.locator('.command-actions .btn-cancel')
  await button.click()
}

/**
 * Check if command actions are visible
 */
export async function isCommandActionsVisible(page: Page): Promise<boolean> {
  const actions = page.locator('.command-actions')
  return actions.isVisible()
}

/**
 * Wait for command actions to appear
 */
export async function waitForCommandActions(page: Page, timeout = 10000): Promise<void> {
  await page.waitForSelector('.command-actions', { state: 'visible', timeout })
}

/**
 * Wait for command actions to disappear
 */
export async function waitForCommandActionsHidden(page: Page, timeout = 10000): Promise<void> {
  await page.waitForSelector('.command-actions', { state: 'hidden', timeout })
}

/**
 * Get terminal content (text content from xterm)
 */
export async function getTerminalContent(page: Page): Promise<string> {
  const terminal = page.locator('.terminal-content .xterm')
  return terminal.textContent() || ''
}

/**
 * Type in terminal (simulates user typing in xterm)
 */
export async function typeInTerminal(page: Page, text: string): Promise<void> {
  const terminal = page.locator('.terminal-content')
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
  const terminal = page.locator('.terminal-content')
  await terminal.click()
  await page.keyboard.press(key)
}

/**
 * Open conversation list dropdown
 */
export async function openConversationList(page: Page): Promise<void> {
  const button = page.locator('header button[title="Conversations"]')
  await button.click()
  await page.waitForSelector('.conversation-dropdown', { state: 'visible' })
}

/**
 * Close conversation list dropdown
 */
export async function closeConversationList(page: Page): Promise<void> {
  // Click outside to close
  await page.keyboard.press('Escape')
  await page.waitForSelector('.conversation-dropdown', { state: 'hidden' })
}

/**
 * Get conversation list items
 */
export async function getConversationListItems(page: Page): Promise<string[]> {
  const items = page.locator('.conversation-list .conversation-item .conversation-title')
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
    .locator('.conversation-list .conversation-item')
    .nth(index)
    .locator('.conversation-delete')
  await deleteButton.click()
}

/**
 * Create a new conversation
 */
export async function createNewConversation(page: Page): Promise<void> {
  const newButton = page.locator('header button[title="New conversation"]')
  await newButton.click()
}

/**
 * Wait for error message to appear
 */
export async function waitForError(page: Page, timeout = 10000): Promise<string | null> {
  const error = page.locator('.chat-message.ai.error')
  try {
    await error.waitFor({ state: 'visible', timeout })
    return error.textContent()
  } catch {
    return null
  }
}

/**
 * Check if error is visible
 */
export async function isErrorVisible(page: Page, _timeout = 10000): Promise<boolean> {
  const error = page.locator('.chat-message.ai.error')
  const errorMessage = page.locator('.chat-message.ai:has-text("Error:")')

  try {
    // Check for error class first
    await error.waitFor({ state: 'visible', timeout: 5000 })
    return true
  } catch {
    // If no error class, check for error message in AI response
    try {
      await errorMessage.waitFor({ state: 'visible', timeout: 5000 })
      return true
    } catch {
      return false
    }
  }
}

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

/**
 * Get test result message from config panel
 */
export async function getTestResult(page: Page): Promise<string | null> {
  const result = page.locator('.test-result')
  if (await result.isVisible()) {
    return result.textContent()
  }
  return null
}

/**
 * Wait for test result
 */
export async function waitForTestResult(page: Page, timeout = 10000): Promise<string | null> {
  const result = page.locator('.test-result')
  try {
    await result.waitFor({ state: 'visible', timeout })
    return result.textContent()
  } catch {
    return null
  }
}

/**
 * Check if model selector is loading
 */
export async function isModelSelectorLoading(page: Page): Promise<boolean> {
  const selector = page.locator('.model-selector')
  const loading = selector.locator('.loading-indicator')
  return loading.isVisible()
}

/**
 * Select a model from the dropdown
 */
export async function selectModel(page: Page, model: string): Promise<void> {
  const selector = page.locator('.model-selector select, .model-selector input')
  const tagName = await selector.evaluate(el => el.tagName.toLowerCase())

  if (tagName === 'select') {
    await selector.selectOption(model)
  } else {
    await selector.fill(model)
  }
}

/**
 * Check if an element is visible and enabled
 */
export async function isElementEnabled(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector)
  const isVisible = await element.isVisible()
  if (!isVisible) return false
  return element.isEnabled()
}

/**
 * Wait for an element to be enabled
 */
export async function waitForElementEnabled(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout })
  await page.waitForFunction(
    sel => {
      const el = document.querySelector(sel)
      return el && !el.hasAttribute('disabled')
    },
    selector,
    { timeout }
  )
}

/**
 * Get the value of an input field
 */
export async function getInputValue(page: Page, selector: string): Promise<string> {
  return page.locator(selector).inputValue()
}

/**
 * Check if env badge is displayed for a field
 */
export async function hasEnvBadge(page: Page, fieldId: string): Promise<boolean> {
  const field = page.locator(`#${fieldId}`).locator('xpath=..').locator('.env-badge')
  return field.isVisible()
}

/**
 * Get available shell options
 */
export async function getShellOptions(page: Page): Promise<string[]> {
  const select = page.locator('#shell-select')
  const options = await select.locator('option').allTextContents()
  return options.map(o => o.trim())
}

/**
 * Get available theme options
 */
export async function getThemeOptions(page: Page): Promise<string[]> {
  const select = page.locator('#theme')
  const options = await select.locator('option').allTextContents()
  return options.map(o => o.trim())
}

/**
 * Set a React controlled input value properly
 * This triggers the proper React onChange events for controlled inputs
 */
export async function setReactInputValue(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  const input = page.locator(selector)

  // Get the input type
  const inputType = await input.getAttribute('type').catch(() => 'text')

  // For range inputs, use fill directly
  if (inputType === 'range') {
    await input.fill(value)
    // Dispatch events to trigger React onChange
    await input.evaluate(el => {
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await page.waitForTimeout(100)
    return
  }

  // For text, number, and other inputs - use type simulation
  await input.focus()

  // Select all existing content
  await input.press('Control+a')

  // Type the new value (this triggers proper keyboard/input events)
  await input.fill(value)

  // Press Enter to trigger change event
  await input.press('Enter')

  // Small delay for React to process
  await page.waitForTimeout(100)
}

/**
 * Wait for a specific number of chat messages
 */
export async function waitForMessageCount(
  page: Page,
  count: number,
  timeout = 30000
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

/**
 * Mock electronAPI for error simulation
 * This replaces the API before the app uses it
 */
export async function mockElectronAPIForError(
  page: Page,
  methodName: string,
  error: Error
): Promise<void> {
  await page.evaluate(
    ({ method, errMsg }) => {
      // Store the original API
      const original = window.electronAPI
      if (!original) return

      // Create a new object with the mocked method
      window.electronAPI = {
        ...original,
        [method]: async () => {
          throw new Error(errMsg)
        },
      }
    },
    { method: methodName, errMsg: error.message }
  )
}

/**
 * Reset app state between tests
 * This ensures a clean slate by:
 * 1. Canceling any pending command actions (Escape)
 * 2. Closing config panel if open
 * 3. Clearing all conversations (Ctrl+K)
 * 4. Brief wait for state to settle
 */
export async function resetAppState(page: Page): Promise<void> {
  // Cancel any pending command actions
  const commandActions = page.locator('.command-actions')
  if (await commandActions.isVisible({ timeout: 200 }).catch(() => false)) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(100)
  }

  // Close config panel if open
  const configPanel = page.locator('.config-panel')
  if (await configPanel.isVisible({ timeout: 200 }).catch(() => false)) {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(100)
  }

  // Clear all conversations
  await page.keyboard.press('Control+k')

  // Brief wait for the clear action to process
  await page.waitForTimeout(200)
}

/**
 * Start video recording using getDisplayMedia API
 * This captures the current tab/window for demo video generation
 * Returns a promise that resolves when recording starts
 */
export async function startVideoRecording(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Check supported MIME type
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4'

    // Get display media stream - prefer current tab
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1600 },
        height: { ideal: 900 },
        frameRate: { ideal: 30 },
      },
      audio: false,
      // @ts-expect-error - preferCurrentTab is a newer API
      preferCurrentTab: true,
    } as MediaStreamConstraints)

    // Create MediaRecorder with supported mime type
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2500000,
    })

    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    // Handle stream end (user stops sharing)
    stream.getVideoTracks()[0].onended = () => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
    }

    // Store in window for later access
    // @ts-expect-error - storing state in window
    window.__videoRecording = { mediaRecorder, chunks, stream }

    // Start recording with 100ms chunks
    mediaRecorder.start(100)
  })
}

/**
 * Stop video recording and return video data as base64 string
 * The caller is responsible for saving the file
 */
export async function stopVideoRecording(page: Page): Promise<string> {
  const base64Video = await page.evaluate(async () => {
    // @ts-expect-error - accessing stored state
    const recording = window.__videoRecording
    if (!recording || !recording.mediaRecorder) {
      throw new Error('No active video recording')
    }

    return new Promise<string>((resolve, reject) => {
      const { mediaRecorder, chunks, stream } = recording

      // Set up handlers BEFORE calling stop()
      mediaRecorder.onstop = () => {
        // Stop all tracks to release the stream
        for (const track of stream.getTracks()) {
          track.stop()
        }

        // Create blob from chunks and convert to base64
        const blob = new Blob(chunks, { type: 'video/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          // Remove data URL prefix
          const base64Data = base64.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = () => reject(new Error('Failed to read blob'))
        reader.readAsDataURL(blob)
      }

      mediaRecorder.onerror = event => {
        const errorEvent = event as ErrorEvent & { error?: Error }
        reject(new Error(`MediaRecorder error: ${errorEvent.error?.message || 'unknown error'}`))
      }

      // Stop the recorder
      mediaRecorder.stop()
    })
  })

  return base64Video
}
