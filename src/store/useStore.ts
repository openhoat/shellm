import type {
  AICommand,
  AppConfig,
  Conversation,
  ConversationMessage,
  ValidationResult,
} from '@shared/types'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { Logger } from '@/utils/logger'

const logger = new Logger('useStore')

// Selectors for optimized re-renders
// Config
const selectConfig = (state: AppState) => state.config
const selectSetConfig = (state: AppState) => state.setConfig
const selectInitConfig = (state: AppState) => state.initConfig

// Terminal
const selectTerminalPid = (state: AppState) => state.terminalPid
const selectSetTerminalPid = (state: AppState) => state.setTerminalPid
const selectTerminalOutput = (state: AppState) => state.terminalOutput
const selectSetTerminalOutput = (state: AppState) => state.setTerminalOutput
const selectAppendTerminalOutput = (state: AppState) => state.appendTerminalOutput
const selectClearTerminalOutput = (state: AppState) => state.clearTerminalOutput

// AI
const selectAiCommand = (state: AppState) => state.aiCommand
const selectSetAiCommand = (state: AppState) => state.setAiCommand
const selectIsLoading = (state: AppState) => state.isLoading
const selectSetIsLoading = (state: AppState) => state.setIsLoading
const selectError = (state: AppState) => state.error
const selectSetError = (state: AppState) => state.setError

// Conversations
const selectConversations = (state: AppState) => state.conversations
const selectCurrentConversationId = (state: AppState) => state.currentConversationId
const selectCurrentConversation = (state: AppState) => state.currentConversation
const selectLoadConversations = (state: AppState) => state.loadConversations
const selectLoadConversation = (state: AppState) => state.loadConversation
const selectCreateConversation = (state: AppState) => state.createConversation
const selectAddMessageToConversation = (state: AppState) => state.addMessageToConversation
const selectUpdateMessageInConversation = (state: AppState) => state.updateMessageInConversation
const selectDeleteConversation = (state: AppState) => state.deleteConversation
const selectClearAllConversations = (state: AppState) => state.clearAllConversations
const selectImportConversations = (state: AppState) => state.importConversations
const selectStartNewConversation = (state: AppState) => state.startNewConversation
const selectRestoreCheckpoint = (state: AppState) => state.restoreCheckpoint

// Chat reset
const selectChatResetKey = (state: AppState) => state.chatResetKey
const selectIncrementChatResetKey = (state: AppState) => state.incrementChatResetKey

// Command validation
const selectPendingCommandValidation = (state: AppState) => state.pendingCommandValidation
const selectSetPendingCommandValidation = (state: AppState) => state.setPendingCommandValidation

// UI
const selectShowConfigPanel = (state: AppState) => state.showConfigPanel
const selectToggleConfigPanel = (state: AppState) => state.toggleConfigPanel
const selectShowStatsPanel = (state: AppState) => state.showStatsPanel
const selectToggleStatsPanel = (state: AppState) => state.toggleStatsPanel
const selectShowLogViewer = (state: AppState) => state.showLogViewer
const selectToggleLogViewer = (state: AppState) => state.toggleLogViewer
const selectSelectedCommand = (state: AppState) => state.selectedCommand
const selectSetSelectedCommand = (state: AppState) => state.setSelectedCommand

// Optimized hooks - use these instead of useStore() destructuring to prevent unnecessary re-renders
// Config
export const useConfig = () => useStore(selectConfig, useShallow)
export const useSetConfig = () => useStore(selectSetConfig)
export const useInitConfig = () => useStore(selectInitConfig)

// Terminal
export const useTerminalPid = () => useStore(selectTerminalPid)
export const useSetTerminalPid = () => useStore(selectSetTerminalPid)
export const useTerminalOutput = () => useStore(selectTerminalOutput, useShallow)
export const useSetTerminalOutput = () => useStore(selectSetTerminalOutput)
export const useAppendTerminalOutput = () => useStore(selectAppendTerminalOutput)
export const useClearTerminalOutput = () => useStore(selectClearTerminalOutput)

// AI
export const useAiCommand = () => useStore(selectAiCommand)
export const useSetAiCommand = () => useStore(selectSetAiCommand)
export const useIsLoading = () => useStore(selectIsLoading)
export const useSetIsLoading = () => useStore(selectSetIsLoading)
export const useError = () => useStore(selectError)
export const useSetError = () => useStore(selectSetError)

// Conversations
export const useConversations = () => useStore(selectConversations, useShallow)
export const useCurrentConversationId = () => useStore(selectCurrentConversationId)
export const useCurrentConversation = () => useStore(selectCurrentConversation)
export const useLoadConversations = () => useStore(selectLoadConversations)
export const useLoadConversation = () => useStore(selectLoadConversation)
export const useCreateConversation = () => useStore(selectCreateConversation)
export const useAddMessageToConversation = () => useStore(selectAddMessageToConversation)
export const useUpdateMessageInConversation = () => useStore(selectUpdateMessageInConversation)
export const useDeleteConversation = () => useStore(selectDeleteConversation)
export const useClearAllConversations = () => useStore(selectClearAllConversations)
export const useImportConversations = () => useStore(selectImportConversations)
export const useStartNewConversation = () => useStore(selectStartNewConversation)

// Checkpoints
export const useRestoreCheckpoint = () => useStore(selectRestoreCheckpoint)

// Chat reset
export const useChatResetKey = () => useStore(selectChatResetKey)
export const useIncrementChatResetKey = () => useStore(selectIncrementChatResetKey)

// Command validation
export const usePendingCommandValidation = () => useStore(selectPendingCommandValidation)
export const useSetPendingCommandValidation = () => useStore(selectSetPendingCommandValidation)

// UI
export const useShowConfigPanel = () => useStore(selectShowConfigPanel)
export const useToggleConfigPanel = () => useStore(selectToggleConfigPanel)
export const useShowStatsPanel = () => useStore(selectShowStatsPanel)
export const useToggleStatsPanel = () => useStore(selectToggleStatsPanel)
export const useShowLogViewer = () => useStore(selectShowLogViewer)
export const useToggleLogViewer = () => useStore(selectToggleLogViewer)
export const useSelectedCommand = () => useStore(selectSelectedCommand)
export const useSetSelectedCommand = () => useStore(selectSetSelectedCommand)

interface AppState {
  // Config
  config: AppConfig
  setConfig: (config: AppConfig) => void
  initConfig: () => Promise<void>

  // Terminal
  terminalPid: number | null
  setTerminalPid: (pid: number | null) => void
  terminalOutput: string[]
  setTerminalOutput: (output: string[]) => void
  appendTerminalOutput: (line: string) => void
  clearTerminalOutput: () => void

  // AI
  aiCommand: AICommand | null
  setAiCommand: (command: AICommand | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // Conversation (new system)
  conversations: Conversation[]
  currentConversationId: string | null
  currentConversation: Conversation | null
  loadConversations: () => Promise<void>
  loadConversation: (id: string) => Promise<void>
  createConversation: (firstMessage: string) => Promise<void>
  addMessageToConversation: (message: ConversationMessage) => Promise<void>
  updateMessageInConversation: (
    messageIndex: number,
    updates: Partial<ConversationMessage>
  ) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  clearAllConversations: () => Promise<void>
  importConversations: () => Promise<{
    success: boolean
    imported?: number
    skipped?: number
    error?: string
  }>
  startNewConversation: () => void

  // Checkpoints
  restoreCheckpoint: (checkpointId: string) => Promise<void>

  // Chat reset
  chatResetKey: number
  incrementChatResetKey: () => void

  // Command validation warning
  pendingCommandValidation: {
    command: string
    validation: ValidationResult
    onConfirm: () => void
  } | null
  setPendingCommandValidation: (
    pending: {
      command: string
      validation: ValidationResult
      onConfirm: () => void
    } | null
  ) => void

  // UI
  showConfigPanel: boolean
  toggleConfigPanel: () => void
  showStatsPanel: boolean
  toggleStatsPanel: () => void
  showLogViewer: boolean
  toggleLogViewer: () => void
  selectedCommand: string | null
  setSelectedCommand: (command: string | null) => void
}

export const useStore = create<AppState>((set, _get) => ({
  // Config
  config: {
    llmProvider: 'ollama',
    ollama: {
      url: 'http://localhost:11434',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 1000,
    },
    claude: {
      apiKey: '',
      model: 'claude-haiku-4-5-20251001',
      temperature: 0.7,
      maxTokens: 1000,
    },
    openai: {
      apiKey: '',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000,
    },
    theme: 'dark',
    fontSize: 14,
    shell: 'auto',
    chatLanguage: 'auto',
  },
  setConfig: config => set({ config }),
  initConfig: async () => {
    const config = await window.electronAPI.getConfig()
    set({ config })
    // Initialize LLM service only if the active provider config looks valid
    const canInit =
      (config.llmProvider === 'ollama' && !!config.ollama?.url) ||
      (config.llmProvider === 'claude' && !!config.claude?.apiKey) ||
      (config.llmProvider === 'openai' && !!config.openai?.apiKey)
    if (canInit) {
      try {
        await window.electronAPI.llmInit(config)
      } catch (error) {
        logger.warn('LLM initialization failed, user can reconfigure later:', error)
      }
    }
  },

  // Terminal
  terminalPid: null,
  setTerminalPid: pid => set({ terminalPid: pid }),
  terminalOutput: [],
  setTerminalOutput: output => set({ terminalOutput: output }),
  appendTerminalOutput: line =>
    set(state => ({
      terminalOutput: [...state.terminalOutput, line].slice(-100),
    })),
  clearTerminalOutput: () => set({ terminalOutput: [] }),

  // AI
  aiCommand: null,
  setAiCommand: command => set({ aiCommand: command }),
  isLoading: false,
  setIsLoading: loading => set({ isLoading: loading }),
  error: null,
  setError: error => set({ error }),

  // Conversation (new system)
  conversations: [],
  currentConversationId: null,
  currentConversation: null,
  loadConversations: async () => {
    try {
      const conversations = await window.electronAPI.conversationGetAll()
      set({ conversations })
    } catch (error) {
      logger.error('Failed to load conversations:', error)
    }
  },
  loadConversation: async id => {
    try {
      const conversation = await window.electronAPI.conversationGet(id)
      if (conversation) {
        set({ currentConversationId: id, currentConversation: conversation })
      }
    } catch (error) {
      logger.error('Failed to load conversation:', error)
    }
  },
  createConversation: async firstMessage => {
    try {
      const newConversation = await window.electronAPI.conversationCreate(firstMessage)
      set(state => ({
        conversations: [newConversation, ...state.conversations],
        currentConversationId: newConversation.id,
        currentConversation: newConversation,
      }))
    } catch (error) {
      logger.error('Failed to create conversation:', error)
    }
  },
  addMessageToConversation: async message => {
    const { currentConversationId } = _get()
    if (!currentConversationId) return

    try {
      const updatedConversation = await window.electronAPI.conversationAddMessage(
        currentConversationId,
        message
      )
      if (updatedConversation) {
        set(state => ({
          currentConversation: updatedConversation,
          conversations: state.conversations.map(conv =>
            conv.id === updatedConversation.id ? updatedConversation : conv
          ),
        }))
      }
    } catch (error) {
      logger.error('Failed to add message to conversation:', error)
    }
  },
  updateMessageInConversation: async (messageIndex, updates) => {
    const { currentConversationId } = _get()
    if (!currentConversationId) return

    try {
      const updatedConversation = await window.electronAPI.conversationUpdateMessage(
        currentConversationId,
        messageIndex,
        updates
      )
      if (updatedConversation) {
        set(state => ({
          currentConversation: updatedConversation,
          conversations: state.conversations.map(conv =>
            conv.id === updatedConversation.id ? updatedConversation : conv
          ),
        }))
      }
    } catch (error) {
      logger.error('Failed to update message in conversation:', error)
    }
  },
  deleteConversation: async id => {
    try {
      await window.electronAPI.conversationDelete(id)
      set(state => {
        const newConversations = state.conversations.filter(conv => conv.id !== id)
        if (state.currentConversationId === id) {
          return {
            conversations: newConversations,
            currentConversationId: null,
            currentConversation: null,
          }
        }
        return { conversations: newConversations }
      })
    } catch (error) {
      logger.error('Failed to delete conversation:', error)
    }
  },
  clearAllConversations: async () => {
    try {
      await window.electronAPI.conversationClearAll()
      set({
        conversations: [],
        currentConversationId: null,
        currentConversation: null,
      })
    } catch (error) {
      logger.error('Failed to clear all conversations:', error)
    }
  },
  importConversations: async () => {
    try {
      const result = await window.electronAPI.conversationImport()
      if (result.success) {
        const conversations = await window.electronAPI.conversationGetAll()
        set({ conversations })
      }
      return result
    } catch (error) {
      logger.error('Failed to import conversations:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
  startNewConversation: () => {
    set({
      currentConversationId: null,
      currentConversation: null,
    })
  },

  // Checkpoints
  restoreCheckpoint: async (checkpointId: string) => {
    const { currentConversationId } = _get()
    if (!currentConversationId) return

    try {
      // checkpointId is expected to be in format "conversationId-messageIndex"
      // Extract messageIndex from checkpointId
      const messageIndex = parseInt(checkpointId.split('-').pop() || '0', 10)

      const result = await window.electronAPI.checkpointRestoreByIndex(
        currentConversationId,
        messageIndex
      )
      if (result.success && result.messages) {
        // Update the current conversation with the restored messages
        const restoredMessages = result.messages
        set(state => ({
          currentConversation: state.currentConversation
            ? { ...state.currentConversation, messages: restoredMessages }
            : null,
        }))
      }
    } catch (error) {
      logger.error('Failed to restore checkpoint:', error)
    }
  },

  // Chat reset
  chatResetKey: 0,
  incrementChatResetKey: () => set(state => ({ chatResetKey: state.chatResetKey + 1 })),

  // UI
  showConfigPanel: false,
  toggleConfigPanel: () => set(state => ({ showConfigPanel: !state.showConfigPanel })),
  showStatsPanel: false,
  toggleStatsPanel: () => set(state => ({ showStatsPanel: !state.showStatsPanel })),
  showLogViewer: false,
  toggleLogViewer: () => set(state => ({ showLogViewer: !state.showLogViewer })),
  selectedCommand: null,
  setSelectedCommand: command => set({ selectedCommand: command }),
}))
