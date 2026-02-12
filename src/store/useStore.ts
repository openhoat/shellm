import type {
  AICommand,
  AppConfig,
  Conversation,
  ConversationHistory,
  ConversationMessage,
} from '@shared/types'
import { create } from 'zustand'

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
  deleteConversation: (id: string) => Promise<void>
  clearAllConversations: () => Promise<void>

  // Conversation (old system - kept for backward compatibility)
  conversationHistory: ConversationHistory[]
  addToHistory: (entry: ConversationHistory) => void
  clearHistory: () => void

  // UI
  showConfigPanel: boolean
  toggleConfigPanel: () => void
  selectedCommand: string | null
  setSelectedCommand: (command: string | null) => void
}

export const useStore = create<AppState>((set, _get) => ({
  // Config
  config: {
    ollama: {
      url: 'http://localhost:11434',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 1000,
    },
    theme: 'dark',
    fontSize: 14,
    shell: 'auto',
  },
  setConfig: config => set({ config }),
  initConfig: async () => {
    const config = await window.electronAPI.getConfig()
    set({ config })
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
    const conversations = await window.electronAPI.conversationGetAll()
    set({ conversations })
  },
  loadConversation: async id => {
    const conversation = await window.electronAPI.conversationGet(id)
    if (conversation) {
      set({ currentConversationId: id, currentConversation: conversation })
    }
  },
  createConversation: async firstMessage => {
    const newConversation = await window.electronAPI.conversationCreate(firstMessage)
    set(state => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: newConversation.id,
      currentConversation: newConversation,
    }))
  },
  addMessageToConversation: async message => {
    const { currentConversationId } = _get()
    if (!currentConversationId) return

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
  },
  deleteConversation: async id => {
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
  },
  clearAllConversations: async () => {
    await window.electronAPI.conversationClearAll()
    set({
      conversations: [],
      currentConversationId: null,
      currentConversation: null,
    })
  },

  // Conversation (old system - kept for backward compatibility)
  conversationHistory: [],
  addToHistory: entry =>
    set(state => ({
      conversationHistory: [entry, ...state.conversationHistory].slice(0, 100),
    })),
  clearHistory: () => set({ conversationHistory: [] }),

  // UI
  showConfigPanel: false,
  toggleConfigPanel: () => set(state => ({ showConfigPanel: !state.showConfigPanel })),
  selectedCommand: null,
  setSelectedCommand: command => set({ selectedCommand: command }),
}))
