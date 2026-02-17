import type { AICommand, AppConfig } from '@shared/types'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useStore } from './useStore'

describe('useStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
        shell: 'auto',
      },
      terminalPid: null,
      aiCommand: null,
      isLoading: false,
      error: null,
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
        shell: 'bash',
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

      expect(window.electronAPI.getConfig).toHaveBeenCalled()
    })

    test('should call llmInit after loading config', async () => {
      await useStore.getState().initConfig()

      expect(window.electronAPI.llmInit).toHaveBeenCalledWith(
        expect.objectContaining({
          ollama: expect.objectContaining({ url: 'http://localhost:11434' }),
        })
      )
    })

    test('should not throw when llmInit fails during initConfig', async () => {
      vi.mocked(window.electronAPI.llmInit).mockRejectedValueOnce(
        new Error('Provider initialization failed')
      )

      await expect(useStore.getState().initConfig()).resolves.not.toThrow()
      expect(window.electronAPI.getConfig).toHaveBeenCalled()
    })

    test('should skip llmInit when provider config is incomplete', async () => {
      vi.mocked(window.electronAPI.getConfig).mockResolvedValueOnce({
        llmProvider: 'ollama',
        ollama: { url: '', model: 'llama2', temperature: 0.7, maxTokens: 1000 },
        claude: { apiKey: '', model: '', temperature: 0.7, maxTokens: 1000 },
        openai: { apiKey: '', model: '', temperature: 0.7, maxTokens: 1000 },
        theme: 'dark',
        fontSize: 14,
        shell: 'auto',
      })

      await useStore.getState().initConfig()

      expect(window.electronAPI.getConfig).toHaveBeenCalled()
      expect(window.electronAPI.llmInit).not.toHaveBeenCalled()
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
        intent: 'list_files',
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
