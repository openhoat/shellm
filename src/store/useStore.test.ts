import type { AICommand, AppConfig, Conversation } from '@shared/types'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useStore } from './useStore'

describe('useStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store before each test
    useStore.setState({
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
      terminalPid: null,
      terminalOutput: [],
      aiCommand: null,
      isLoading: false,
      error: null,
      showConfigPanel: false,
      selectedCommand: null,
      conversations: [],
      currentConversationId: null,
      currentConversation: null,
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

  describe('Terminal Output', () => {
    test('should set terminal output', () => {
      useStore.getState().setTerminalOutput(['line1', 'line2'])
      const state = useStore.getState()

      expect(state.terminalOutput).toEqual(['line1', 'line2'])
    })

    test('should append terminal output', () => {
      useStore.getState().setTerminalOutput(['line1'])
      useStore.getState().appendTerminalOutput('line2')
      const state = useStore.getState()

      expect(state.terminalOutput).toEqual(['line1', 'line2'])
    })

    test('should limit terminal output to 100 lines', () => {
      const lines = Array.from({ length: 100 }, (_, i) => `line${i}`)
      useStore.getState().setTerminalOutput(lines)
      useStore.getState().appendTerminalOutput('new line')
      const state = useStore.getState()

      expect(state.terminalOutput.length).toBe(100)
      expect(state.terminalOutput[99]).toBe('new line')
      expect(state.terminalOutput[0]).toBe('line1')
    })

    test('should clear terminal output', () => {
      useStore.getState().setTerminalOutput(['line1', 'line2'])
      useStore.getState().clearTerminalOutput()
      const state = useStore.getState()

      expect(state.terminalOutput).toEqual([])
    })
  })

  describe('Conversations', () => {
    const mockConversation: Conversation = {
      id: 'conv-1',
      title: 'Test Conversation',
      messages: [
        { role: 'user', content: 'Hello', timestamp: Date.now() },
        { role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    test('should load conversations', async () => {
      vi.mocked(window.electronAPI.conversationGetAll).mockResolvedValueOnce([mockConversation])

      await useStore.getState().loadConversations()
      const state = useStore.getState()

      expect(state.conversations).toHaveLength(1)
      expect(state.conversations[0].id).toBe('conv-1')
    })

    test('should load a specific conversation', async () => {
      vi.mocked(window.electronAPI.conversationGet).mockResolvedValueOnce(mockConversation)

      await useStore.getState().loadConversation('conv-1')
      const state = useStore.getState()

      expect(state.currentConversationId).toBe('conv-1')
      expect(state.currentConversation?.id).toBe('conv-1')
    })

    test('should not update state when conversation not found', async () => {
      vi.mocked(window.electronAPI.conversationGet).mockResolvedValueOnce(null)

      await useStore.getState().loadConversation('non-existent')

      expect(useStore.getState().currentConversationId).toBeNull()
      expect(useStore.getState().currentConversation).toBeNull()
    })

    test('should create a conversation', async () => {
      vi.mocked(window.electronAPI.conversationCreate).mockResolvedValueOnce(mockConversation)

      await useStore.getState().createConversation('Hello')
      const state = useStore.getState()

      expect(state.conversations).toHaveLength(1)
      expect(state.currentConversationId).toBe('conv-1')
      expect(state.currentConversation?.id).toBe('conv-1')
    })

    test('should add message to conversation', async () => {
      // First set up a current conversation
      useStore.setState({
        currentConversationId: 'conv-1',
        conversations: [mockConversation],
        currentConversation: mockConversation,
      })

      const updatedConversation = {
        ...mockConversation,
        messages: [...mockConversation.messages, { role: 'user', content: 'New message', timestamp: Date.now() }],
      }
      vi.mocked(window.electronAPI.conversationAddMessage).mockResolvedValueOnce(updatedConversation)

      await useStore.getState().addMessageToConversation({
        role: 'user',
        content: 'New message',
        timestamp: Date.now(),
      })
      const state = useStore.getState()

      expect(state.currentConversation?.messages.length).toBe(3)
    })

    test('should not add message when no current conversation', async () => {
      useStore.setState({ currentConversationId: null })

      await useStore.getState().addMessageToConversation({
        role: 'user',
        content: 'Test',
        timestamp: Date.now(),
      })

      expect(window.electronAPI.conversationAddMessage).not.toHaveBeenCalled()
    })

    test('should update message in conversation', async () => {
      useStore.setState({
        currentConversationId: 'conv-1',
        conversations: [mockConversation],
        currentConversation: mockConversation,
      })

      const updatedConversation = {
        ...mockConversation,
        messages: [
          mockConversation.messages[0],
          { ...mockConversation.messages[1], content: 'Updated response' },
        ],
      }
      vi.mocked(window.electronAPI.conversationUpdateMessage).mockResolvedValueOnce(updatedConversation)

      await useStore.getState().updateMessageInConversation(1, { content: 'Updated response' })
      const state = useStore.getState()

      expect(state.currentConversation?.messages[1].content).toBe('Updated response')
    })

    test('should not update message when no current conversation', async () => {
      useStore.setState({ currentConversationId: null })

      await useStore.getState().updateMessageInConversation(0, { content: 'Updated' })

      expect(window.electronAPI.conversationUpdateMessage).not.toHaveBeenCalled()
    })

    test('should delete conversation', async () => {
      useStore.setState({
        conversations: [mockConversation],
        currentConversationId: 'conv-1',
        currentConversation: mockConversation,
      })

      vi.mocked(window.electronAPI.conversationDelete).mockResolvedValueOnce(undefined)

      await useStore.getState().deleteConversation('conv-1')
      const state = useStore.getState()

      expect(state.conversations).toHaveLength(0)
      expect(state.currentConversationId).toBeNull()
      expect(state.currentConversation).toBeNull()
    })

    test('should delete conversation without affecting current if different', async () => {
      const otherConversation = { ...mockConversation, id: 'conv-2' }
      useStore.setState({
        conversations: [mockConversation, otherConversation],
        currentConversationId: 'conv-1',
        currentConversation: mockConversation,
      })

      vi.mocked(window.electronAPI.conversationDelete).mockResolvedValueOnce(undefined)

      await useStore.getState().deleteConversation('conv-2')
      const state = useStore.getState()

      expect(state.conversations).toHaveLength(1)
      expect(state.currentConversationId).toBe('conv-1')
    })

    test('should clear all conversations', async () => {
      useStore.setState({
        conversations: [mockConversation],
        currentConversationId: 'conv-1',
        currentConversation: mockConversation,
      })

      vi.mocked(window.electronAPI.conversationClearAll).mockResolvedValueOnce(undefined)

      await useStore.getState().clearAllConversations()
      const state = useStore.getState()

      expect(state.conversations).toHaveLength(0)
      expect(state.currentConversationId).toBeNull()
      expect(state.currentConversation).toBeNull()
    })
  })

  describe('Config with different providers', () => {
    test('should initialize with claude provider when apiKey is set', async () => {
      vi.mocked(window.electronAPI.getConfig).mockResolvedValueOnce({
        llmProvider: 'claude',
        ollama: { url: '', model: '', temperature: 0.7, maxTokens: 1000 },
        claude: { apiKey: 'test-api-key', model: 'claude-3', temperature: 0.7, maxTokens: 1000 },
        openai: { apiKey: '', model: '', temperature: 0.7, maxTokens: 1000 },
        theme: 'dark',
        fontSize: 14,
        shell: 'auto',
      })

      await useStore.getState().initConfig()

      expect(window.electronAPI.llmInit).toHaveBeenCalled()
    })

    test('should initialize with openai provider when apiKey is set', async () => {
      vi.mocked(window.electronAPI.getConfig).mockResolvedValueOnce({
        llmProvider: 'openai',
        ollama: { url: '', model: '', temperature: 0.7, maxTokens: 1000 },
        claude: { apiKey: '', model: '', temperature: 0.7, maxTokens: 1000 },
        openai: { apiKey: 'test-openai-key', model: 'gpt-4', temperature: 0.7, maxTokens: 1000 },
        theme: 'dark',
        fontSize: 14,
        shell: 'auto',
      })

      await useStore.getState().initConfig()

      expect(window.electronAPI.llmInit).toHaveBeenCalled()
    })

    test('should skip llmInit when claude provider has no apiKey', async () => {
      vi.mocked(window.electronAPI.getConfig).mockResolvedValueOnce({
        llmProvider: 'claude',
        ollama: { url: '', model: '', temperature: 0.7, maxTokens: 1000 },
        claude: { apiKey: '', model: 'claude-3', temperature: 0.7, maxTokens: 1000 },
        openai: { apiKey: '', model: '', temperature: 0.7, maxTokens: 1000 },
        theme: 'dark',
        fontSize: 14,
        shell: 'auto',
      })

      await useStore.getState().initConfig()

      expect(window.electronAPI.llmInit).not.toHaveBeenCalled()
    })

    test('should skip llmInit when openai provider has no apiKey', async () => {
      vi.mocked(window.electronAPI.getConfig).mockResolvedValueOnce({
        llmProvider: 'openai',
        ollama: { url: '', model: '', temperature: 0.7, maxTokens: 1000 },
        claude: { apiKey: '', model: '', temperature: 0.7, maxTokens: 1000 },
        openai: { apiKey: '', model: 'gpt-4', temperature: 0.7, maxTokens: 1000 },
        theme: 'dark',
        fontSize: 14,
        shell: 'auto',
      })

      await useStore.getState().initConfig()

      expect(window.electronAPI.llmInit).not.toHaveBeenCalled()
    })
  })
})
