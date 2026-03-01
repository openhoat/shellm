/**
 * E2E Test Helpers
 * Re-exports all helpers from focused modules
 */

// App helpers
export {
  resetAppState,
  waitForAppReady,
  waitForChatReady,
  waitForTerminalReady,
} from './app'

// Chat helpers
export {
  clearChatInput,
  getAIMessages,
  getChatMessages,
  getUserMessages,
  isLoadingVisible,
  isWelcomeMessageVisible,
  sendMessage,
  typeInChat,
  waitForAIResponse,
  waitForMessageCount,
} from './chat'

// Command helpers
export {
  clickCancelButton,
  clickExecuteButton,
  clickModifyButton,
  getCommandProposal,
  isCommandActionsVisible,
  isExecuteButtonVisible,
  waitForCommandActions,
  waitForCommandActionsHidden,
  waitForCommandExecution,
} from './command'

// Config helpers
export {
  closeConfigPanel,
  getConfigFieldValue,
  getInputValue,
  getShellOptions,
  getTestResult,
  getThemeOptions,
  hasEnvBadge,
  isConfigPanelVisible,
  isElementEnabled,
  isModelSelectorLoading,
  openConfigPanel,
  resetConfig,
  saveConfig,
  selectModel,
  setConfigField,
  setReactInputValue,
  testConnection,
  waitForElementEnabled,
  waitForTestResult,
} from './config'
// Conversation helpers
export {
  closeConversationList,
  createNewConversation,
  deleteConversation,
  getConversationListItems,
  openConversationList,
} from './conversation'
// Error helpers
export {
  isErrorVisible,
  mockElectronAPIForError,
  waitForError,
} from './error'
// Keyboard shortcuts
export {
  cancelActionByShortcut,
  clearAllConversationsByShortcut,
  executeCommandByShortcut,
} from './keyboard'
// Terminal helpers
export {
  getTerminalContent,
  pressTerminalKey,
  typeInTerminal,
} from './terminal'

// Video recording helpers
export {
  startVideoRecording,
  stopVideoRecording,
} from './video'
