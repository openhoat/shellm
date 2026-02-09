import type { AICommand, AppConfig, ConversationHistory } from '@shared/types'
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

  // Conversation
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

  // Conversation
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
