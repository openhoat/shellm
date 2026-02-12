import '@testing-library/jest-dom'
import type { AICommand, AppConfig } from '@shared/types'
import { vi } from 'vitest'

// Mock de window.electronAPI
const mockTerminalWrite = vi.fn()
const mockTerminalCreate = vi.fn().mockResolvedValue(12345)

const defaultAICommand: AICommand = {
  type: 'command',
  intent: 'list_files',
  command: 'ls -la',
  explanation: 'Liste tous les fichiers avec détails',
  confidence: 0.95,
}

const mockOllamaGenerateCommand = vi.fn().mockResolvedValue(defaultAICommand)

const defaultAppConfig: AppConfig = {
  ollama: {
    url: 'http://localhost:11434',
    model: 'llama2',
    temperature: 0.7,
    maxTokens: 1000,
  },
  theme: 'dark',
  fontSize: 14,
}

const mockGetConfig = vi.fn().mockResolvedValue(defaultAppConfig)
const mockSetConfig = vi.fn()

Object.defineProperty(global, 'window', {
  value: {
    ...window,
    electronAPI: {
      terminalWrite: mockTerminalWrite,
      terminalCreate: mockTerminalCreate,
      ollamaGenerateCommand: mockOllamaGenerateCommand,
      getConfig: mockGetConfig,
      setConfig: mockSetConfig,
    },
  },
  writable: true,
})

// Export des mocks pour les tests
export {
  mockTerminalWrite,
  mockTerminalCreate,
  mockOllamaGenerateCommand,
  mockGetConfig,
  mockSetConfig,
}