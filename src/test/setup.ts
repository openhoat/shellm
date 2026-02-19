import '@testing-library/jest-dom'
import type { AICommand, AppConfig, Conversation } from '@shared/types'
import { vi } from 'vitest'

// Mock de window.electronAPI
const mockTerminalWrite = vi.fn()
const mockTerminalCreate = vi.fn().mockResolvedValue(12345)
const mockTerminalResize = vi.fn().mockResolvedValue(undefined)
const mockTerminalDestroy = vi.fn().mockResolvedValue(undefined)
const mockTerminalStartCapture = vi.fn().mockResolvedValue(true)
const mockTerminalGetCapture = vi.fn().mockResolvedValue('')
const mockTerminalWaitForPrompt = vi
  .fn()
  .mockResolvedValue({ detected: true, output: '', timedOut: false })
const mockOnTerminalData = vi.fn()
const mockOnTerminalExit = vi.fn()

const defaultAICommand: AICommand = {
  type: 'command',
  intent: 'list_files',
  command: 'ls -la',
  explanation: 'Liste tous les fichiers avec détails',
  confidence: 0.95,
}

const mockLlmGenerateCommand = vi.fn().mockResolvedValue(defaultAICommand)
const mockLlmExplainCommand = vi.fn().mockResolvedValue('This command lists files')
const mockLlmInterpretOutput = vi.fn().mockResolvedValue({
  summary: 'Command executed successfully',
  key_findings: [],
  warnings: [],
  errors: [],
  recommendations: [],
  successful: true,
})
const mockLlmTestConnection = vi.fn().mockResolvedValue(true)
const mockLlmListModels = vi.fn().mockResolvedValue(['llama2', 'mistral'])

const defaultAppConfig: AppConfig = {
  llmProvider: 'ollama',
  ollama: {
    url: 'http://localhost:11434',
    model: 'llama2',
    temperature: 0.7,
    maxTokens: 1000,
  },
  claude: { apiKey: '', model: 'claude-haiku-4-5-20251001', temperature: 0.7, maxTokens: 1000 },
  openai: { apiKey: '', model: 'gpt-4o', temperature: 0.7, maxTokens: 1000 },
  theme: 'dark',
  fontSize: 14,
  shell: 'auto',
}

const mockGetConfig = vi.fn().mockResolvedValue(defaultAppConfig)
const mockSetConfig = vi.fn().mockResolvedValue(defaultAppConfig)
const mockResetConfig = vi.fn().mockResolvedValue(defaultAppConfig)
const mockGetConfigEnvSources = vi.fn().mockResolvedValue({
  url: false,
  apiKey: false,
  model: false,
  temperature: false,
  maxTokens: false,
  shell: false,
  llmProvider: false,
  claudeApiKey: false,
  claudeModel: false,
})
const mockLlmInit = vi.fn().mockResolvedValue(undefined)

// Conversation mocks
const defaultConversation: Conversation = {
  id: 'test-conv-1',
  title: 'Test Conversation',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const mockConversationGetAll = vi.fn().mockResolvedValue([])
const mockConversationGet = vi.fn().mockResolvedValue(null)
const mockConversationCreate = vi.fn().mockResolvedValue(defaultConversation)
const mockConversationAddMessage = vi.fn().mockResolvedValue(defaultConversation)
const mockConversationUpdateMessage = vi.fn().mockResolvedValue(defaultConversation)
const mockConversationUpdate = vi.fn().mockResolvedValue(defaultConversation)
const mockConversationDelete = vi.fn().mockResolvedValue(true)
const mockConversationClearAll = vi.fn().mockResolvedValue(undefined)
const mockConversationExport = vi
  .fn()
  .mockResolvedValue({ success: true, filePath: '/test/export.json' })
const mockConversationExportAll = vi
  .fn()
  .mockResolvedValue({ success: true, filePath: '/test/exports.json' })

Object.defineProperty(global, 'window', {
  value: {
    ...window,
    electronAPI: {
      // Terminal
      terminalWrite: mockTerminalWrite,
      terminalCreate: mockTerminalCreate,
      terminalResize: mockTerminalResize,
      terminalDestroy: mockTerminalDestroy,
      terminalStartCapture: mockTerminalStartCapture,
      terminalGetCapture: mockTerminalGetCapture,
      terminalWaitForPrompt: mockTerminalWaitForPrompt,
      onTerminalData: mockOnTerminalData,
      onTerminalExit: mockOnTerminalExit,
      // Config
      getConfig: mockGetConfig,
      setConfig: mockSetConfig,
      resetConfig: mockResetConfig,
      getConfigEnvSources: mockGetConfigEnvSources,
      // LLM
      llmInit: mockLlmInit,
      llmGenerateCommand: mockLlmGenerateCommand,
      llmExplainCommand: mockLlmExplainCommand,
      llmInterpretOutput: mockLlmInterpretOutput,
      llmTestConnection: mockLlmTestConnection,
      llmListModels: mockLlmListModels,
      // Conversations
      conversationGetAll: mockConversationGetAll,
      conversationGet: mockConversationGet,
      conversationCreate: mockConversationCreate,
      conversationAddMessage: mockConversationAddMessage,
      conversationUpdateMessage: mockConversationUpdateMessage,
      conversationUpdate: mockConversationUpdate,
      conversationDelete: mockConversationDelete,
      conversationClearAll: mockConversationClearAll,
      conversationExport: mockConversationExport,
      conversationExportAll: mockConversationExportAll,
    },
  },
  writable: true,
})

// Export des mocks pour les tests
export {
  mockTerminalWrite,
  mockTerminalCreate,
  mockTerminalResize,
  mockTerminalDestroy,
  mockTerminalStartCapture,
  mockTerminalGetCapture,
  mockTerminalWaitForPrompt,
  mockOnTerminalData,
  mockOnTerminalExit,
  mockLlmGenerateCommand,
  mockLlmExplainCommand,
  mockLlmInterpretOutput,
  mockLlmTestConnection,
  mockLlmListModels,
  mockGetConfig,
  mockSetConfig,
  mockResetConfig,
  mockGetConfigEnvSources,
  mockLlmInit,
  mockConversationGetAll,
  mockConversationGet,
  mockConversationCreate,
  mockConversationAddMessage,
  mockConversationUpdateMessage,
  mockConversationUpdate,
  mockConversationDelete,
  mockConversationClearAll,
  mockConversationExport,
  mockConversationExportAll,
  defaultAppConfig,
  defaultAICommand,
  defaultConversation,
}
