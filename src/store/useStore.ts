import type { AICommand, AppConfig, Conversation, ConversationMessage } from '@shared/types'
import { create } from 'zustand'
import { Logger } from '@/utils/logger'

const logger = new Logger('useStore')

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

  // Chat reset
  chatResetKey: number
  incrementChatResetKey: () => void

  // UI
  showConfigPanel: boolean
  toggleConfigPanel: () => void
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

  // Chat reset
  chatResetKey: 0,
  incrementChatResetKey: () => set(state => ({ chatResetKey: state.chatResetKey + 1 })),

  // UI
  showConfigPanel: false,
  toggleConfigPanel: () => set(state => ({ showConfigPanel: !state.showConfigPanel })),
  selectedCommand: null,
  setSelectedCommand: command => set({ selectedCommand: command }),
}))
