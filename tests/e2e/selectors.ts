/**
 * Centralized CSS selectors for E2E tests
 * This file provides a single source of truth for all selectors used in tests
 */

export const SELECTORS = {
  // App structure
  app: '.app',
  header: 'header',
  chatPanel: '.chat-panel',
  terminalWrapper: '.terminal-wrapper',

  // Chat
  chatInput: '.chat-input textarea',
  chatMessage: '.chat-message',
  aiMessage: '.chat-message.ai',
  userMessage: '.chat-message.user',
  messageContent: '.message-content',
  chatWelcome: '.chat-welcome',
  loadingSpinner: '.loading-spinner',

  // Commands
  commandActions: '.command-actions',
  executeButton: '.command-actions .btn-execute',
  modifyButton: '.command-actions .btn-modify',
  cancelButton: '.command-actions .btn-cancel',
  aiCommandDisplay: '.ai-command-display',
  progressIndicator: '.progress-indicator',
  commandInterpretation: '.command-interpretation',
  interpretation: '.interpretation',

  // Config
  configPanel: '.config-panel',
  configButton:
    '[data-testid="config-button"], header button[title="Configuration"], header button[title="Configuration"]',
  configCloseButton: '.config-panel .close-button',
  configSaveButton: '.config-panel .btn-save',
  configResetButton: '.config-panel .btn-reset',
  configTestButton: '.config-panel .btn-test',
  testResult: '.test-result',
  modelSelector: '.model-selector',
  modelSelectorLoading: '.model-selector .loading-indicator',

  // Config fields
  ollamaUrl: '#ollama-url',
  ollamaTemperature: '#ollama-temperature',
  ollamaMaxTokens: '#ollama-max-tokens',
  theme: '#theme',
  llmProvider: '#llm-provider',
  shellSelect: '#shell-select',
  claudeApiKey: '#claude-api-key',
  openaiApiKey: '#openai-api-key',
  envBadge: '.env-badge',

  // Terminal
  terminalContainer: '.terminal-container',
  terminalContent: '.terminal-content',
  terminal: '.xterm',
  terminalXterm: '.terminal-content .xterm',

  // Conversation
  conversationDropdown: '.conversation-dropdown',
  conversationList: '.conversation-list',
  conversationItem: '.conversation-item',
  conversationTitle: '.conversation-title',
  conversationDelete: '.conversation-delete',
  conversationsButton: '[data-testid="conversations-button"]',
  newConversationButton: '[data-testid="new-conversation-button"]',
  exportButton: '.export-button',
  exportAllButton: '[data-testid="export-all-button"]',

  // Error states
  error: '.chat-message.ai.error',
  errorMessage: '.chat-message.ai:has-text("Error:")',
} as const

/**
 * Selector helper functions
 */
export function configField(fieldId: string): string {
  return `#${fieldId}`
}

export function modelSelectorInput(): string {
  return '.model-selector select, .model-selector input'
}

export function conversationItemByIndex(index: number): string {
  return `.conversation-list .conversation-item:nth-child(${index + 1})`
}
