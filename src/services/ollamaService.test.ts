import { describe, expect, test, beforeEach, vi } from 'vitest'
import type { OllamaConfig } from '@shared/types'
import type { ElectronOllamaAPI } from './ollamaService'
import { OllamaService } from './ollamaService'

describe('OllamaService', () => {
  const mockConfig: OllamaConfig = {
    url: 'http://localhost:11434',
    model: 'llama3.2',
  }

  const mockCommand = {
    command: 'ls -la',
    explanation: 'List all files with detailed information',
  }

  let mockElectronAPI: ElectronOllamaAPI
  let service: OllamaService

  beforeEach(() => {
    vi.clearAllMocks()
    mockElectronAPI = {
      init: vi.fn().mockResolvedValue(undefined),
      generateCommand: vi.fn().mockResolvedValue(mockCommand),
      testConnection: vi.fn().mockResolvedValue(true),
      listModels: vi.fn().mockResolvedValue(['llama3.2', 'mistral']),
    }
    service = new OllamaService(mockElectronAPI, {
      ttl: 1000, // 1 second for faster tests
      maxSize: 3, // Small size for testing eviction
    })
  })

  test('should initialize with Electron API', async () => {
    await service.initialize(mockConfig)
    expect(mockElectronAPI.init).toHaveBeenCalledWith(mockConfig)
  })

  test('should generate command through Electron API', async () => {
    const result = await service.generateCommand('list files')
    expect(result).toEqual(mockCommand)
    expect(mockElectronAPI.generateCommand).toHaveBeenCalledWith('list files', undefined, undefined)
  })

  test('should test connection', async () => {
    const result = await service.testConnection()
    expect(result).toBe(true)
    expect(mockElectronAPI.testConnection).toHaveBeenCalled()
  })

  test('should list models', async () => {
    const result = await service.listModels()
    expect(result).toEqual(['llama3.2', 'mistral'])
    expect(mockElectronAPI.listModels).toHaveBeenCalled()
  })

  describe('Caching', () => {
    test('should cache response for identical prompts', async () => {
      await service.generateCommand('list files')
      await service.generateCommand('list files')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(1)
    })

    test('should not cache responses with different prompts', async () => {
      await service.generateCommand('list files')
      await service.generateCommand('show current directory')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(2)
    })

    test('should not cache responses with different conversation history', async () => {
      const history1 = [{ role: 'user' as const, content: 'list files' }]
      const history2 = [{ role: 'user' as const, content: 'show directory' }]

      await service.generateCommand('list files', history1)
      await service.generateCommand('list files', history2)

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(2)
    })

    test('should not cache responses with different language', async () => {
      await service.generateCommand('list files', undefined, 'en')
      await service.generateCommand('list files', undefined, 'fr')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(2)
    })

    test('should expire cache entries after TTL', async () => {
      await service.generateCommand('list files')
      await service.generateCommand('list files')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(1)

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100))

      await service.generateCommand('list files')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(2)
    })

    test('should evict oldest entry when cache is full', async () => {
      const maxSize = 3

      // Fill cache
      await service.generateCommand('command 1')
      await service.generateCommand('command 2')
      await service.generateCommand('command 3')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(3)

      // Add one more entry (should evict 'command 1')
      await service.generateCommand('command 4')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(4)

      // Request 'command 1' again - should not be cached
      await service.generateCommand('command 1')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(5)
    })

    test('should clear cache', async () => {
      await service.generateCommand('list files')
      await service.generateCommand('list files')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(1)
      expect(service.getCacheSize()).toBe(1)

      service.clearCache()

      expect(service.getCacheSize()).toBe(0)

      await service.generateCommand('list files')

      expect(mockElectronAPI.generateCommand).toHaveBeenCalledTimes(2)
    })

    test('should return cache size', async () => {
      expect(service.getCacheSize()).toBe(0)

      await service.generateCommand('list files')

      expect(service.getCacheSize()).toBe(1)
    })
  })
})