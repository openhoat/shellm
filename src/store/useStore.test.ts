import type { AICommand, AppConfig, ConversationHistory } from '@shared/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from './useStore'

describe('useStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({
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
      terminalPid: null,
      aiCommand: null,
      isLoading: false,
      error: null,
      conversationHistory: [],
      showConfigPanel: false,
      selectedCommand: null,
    })
  })

  describe('Config', () => {
    test('should have default config', () => {
      const state = useStore.getState()
      expect(state.config.ollama.url).toBe('http://localhost:11434')
      expect(state.config.ollama.model).toBe('llama2')
      expect(state.config.ollama.temperature).toBe(0.7)
      expect(state.config.ollama.maxTokens).toBe(1000)
      expect(state.config.theme).toBe('dark')
      expect(state.config.fontSize).toBe(14)
    })

    test('should set config', () => {
      const newConfig: AppConfig = {
        ollama: {
          url: 'http://localhost:8080',
          model: 'mistral',
          temperature: 0.5,
          maxTokens: 2000,
        },
        theme: 'light',
        fontSize: 16,
      }

      useStore.getState().setConfig(newConfig)
      const state = useStore.getState()

      expect(state.config.ollama.url).toBe('http://localhost:8080')
      expect(state.config.ollama.model).toBe('mistral')
      expect(state.config.theme).toBe('light')
      expect(state.config.fontSize).toBe(16)
    })

    test('should initialize config from electronAPI', async () => {
      await useStore.getState().initConfig()
      const _state = useStore.getState()

      expect(window.electronAPI.getConfig).toHaveBeenCalled()
    })
  })

  describe('Terminal', () => {
    test('should set terminal pid', () => {
      useStore.getState().setTerminalPid(12345)
      const state = useStore.getState()

      expect(state.terminalPid).toBe(12345)
    })

    test('should clear terminal pid', () => {
      useStore.getState().setTerminalPid(12345)
      useStore.getState().setTerminalPid(null)
      const state = useStore.getState()

      expect(state.terminalPid).toBeNull()
    })
  })

  describe('AI', () => {
    test('should set AI command', () => {
      const command: AICommand = {
        type: 'command',
        command: 'ls -la',
        explanation: 'Liste tous les fichiers',
        confidence: 0.95,
      }

      useStore.getState().setAiCommand(command)
      const state = useStore.getState()

      expect(state.aiCommand).toEqual(command)
    })

    test('should set loading state', () => {
      useStore.getState().setIsLoading(true)
      let state = useStore.getState()
      expect(state.isLoading).toBe(true)

      useStore.getState().setIsLoading(false)
      state = useStore.getState()
      expect(state.isLoading).toBe(false)
    })

    test('should set error', () => {
      const errorMessage = 'Test error'
      useStore.getState().setError(errorMessage)
      const state = useStore.getState()

      expect(state.error).toBe(errorMessage)
    })

    test('should clear error', () => {
      useStore.getState().setError('Error')
      useStore.getState().setError(null)
      const state = useStore.getState()

      expect(state.error).toBeNull()
    })
  })

  describe('Conversation', () => {
    test('should add entry to history', () => {
      const entry: ConversationHistory = {
        id: '1',
        timestamp: Date.now(),
        userMessage: 'Liste les fichiers',
        aiResponse: {
          type: 'command',
          command: 'ls -la',
          explanation: 'Liste',
          confidence: 0.95,
        },
        executed: true,
      }

      useStore.getState().addToHistory(entry)
      const state = useStore.getState()

      expect(state.conversationHistory).toHaveLength(1)
      expect(state.conversationHistory[0]).toEqual(entry)
    })

    test('should clear history', () => {
      const entry: ConversationHistory = {
        id: '1',
        timestamp: Date.now(),
        userMessage: 'Test',
        aiResponse: {
          type: 'text',
          content: 'Response',
        },
        executed: false,
      }

      useStore.getState().addToHistory(entry)
      useStore.getState().clearHistory()
      const state = useStore.getState()

      expect(state.conversationHistory).toHaveLength(0)
    })

    test('should limit history to 100 entries', () => {
      // Add 101 entries
      for (let i = 0; i < 101; i++) {
        useStore.getState().addToHistory({
          id: i.toString(),
          timestamp: Date.now(),
          userMessage: `Message ${i}`,
          aiResponse: {
            type: 'text',
            content: `Response ${i}`,
          },
          executed: false,
        })
      }

      const state = useStore.getState()
      expect(state.conversationHistory).toHaveLength(100)
    })
  })

  describe('UI', () => {
    test('should toggle config panel', () => {
      let state = useStore.getState()
      expect(state.showConfigPanel).toBe(false)

      useStore.getState().toggleConfigPanel()
      state = useStore.getState()
      expect(state.showConfigPanel).toBe(true)

      useStore.getState().toggleConfigPanel()
      state = useStore.getState()
      expect(state.showConfigPanel).toBe(false)
    })

    test('should set selected command', () => {
      useStore.getState().setSelectedCommand('ls -la')
      const state = useStore.getState()

      expect(state.selectedCommand).toBe('ls -la')
    })

    test('should clear selected command', () => {
      useStore.getState().setSelectedCommand('ls -la')
      useStore.getState().setSelectedCommand(null)
      const state = useStore.getState()

      expect(state.selectedCommand).toBeNull()
    })
  })
})
