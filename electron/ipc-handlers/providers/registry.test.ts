import type { LLMProviderFactory } from '@shared/types'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ProviderRegistry } from './registry'

// Mock provider factory for testing
const createMockFactory = (name: string): LLMProviderFactory<{ url: string }> => ({
  name,
  metadata: {
    name,
    displayName: `Mock ${name}`,
    requiresApiKey: false,
    supportsStreaming: true,
  },
  create: vi.fn().mockReturnValue({ test: true }),
  validateConfig: vi.fn().mockReturnValue(true),
  getDefaultConfig: vi.fn().mockReturnValue({ url: 'http://localhost:11434' }),
  listModels: vi.fn().mockResolvedValue(['model1', 'model2']),
  testConnection: vi.fn().mockResolvedValue(true),
})

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry

  beforeEach(() => {
    registry = new ProviderRegistry()
  })

  describe('register', () => {
    test('should register a provider factory', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      expect(registry.has('test-provider')).toBe(true)
      expect(registry.get('test-provider')).toBe(factory)
    })

    test('should throw error when registering duplicate provider', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      expect(() => registry.register(factory)).toThrow(
        'Provider "test-provider" is already registered'
      )
    })
  })

  describe('unregister', () => {
    test('should unregister a provider', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      expect(registry.unregister('test-provider')).toBe(true)
      expect(registry.has('test-provider')).toBe(false)
    })

    test('should return false when unregistering non-existent provider', () => {
      expect(registry.unregister('non-existent')).toBe(false)
    })
  })

  describe('get', () => {
    test('should return registered factory', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      expect(registry.get('test-provider')).toBe(factory)
    })

    test('should return undefined for non-existent provider', () => {
      expect(registry.get('non-existent')).toBeUndefined()
    })
  })

  describe('has', () => {
    test('should return true for registered provider', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      expect(registry.has('test-provider')).toBe(true)
    })

    test('should return false for non-existent provider', () => {
      expect(registry.has('non-existent')).toBe(false)
    })
  })

  describe('list', () => {
    test('should return list of registered provider names', () => {
      registry.register(createMockFactory('provider1'))
      registry.register(createMockFactory('provider2'))

      expect(registry.list()).toEqual(['provider1', 'provider2'])
    })

    test('should return empty array when no providers registered', () => {
      expect(registry.list()).toEqual([])
    })
  })

  describe('listMetadata', () => {
    test('should return metadata for all registered providers', () => {
      const factory1 = createMockFactory('provider1')
      const factory2 = createMockFactory('provider2')
      registry.register(factory1)
      registry.register(factory2)

      const metadata = registry.listMetadata()

      expect(metadata).toHaveLength(2)
      expect(metadata).toContainEqual(factory1.metadata)
      expect(metadata).toContainEqual(factory2.metadata)
    })
  })

  describe('getProviderInfos', () => {
    test('should return provider info for all registered providers', async () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      const configs = { 'test-provider': { url: 'http://localhost:11434' } }
      const infos = await registry.getProviderInfos(configs)

      expect(infos).toHaveLength(1)
      expect(infos[0].metadata).toEqual(factory.metadata)
      expect(infos[0].isAvailable).toBe(true)
      expect(infos[0].models).toEqual(['model1', 'model2'])
    })

    test('should mark provider as unavailable when config is invalid', async () => {
      const factory: LLMProviderFactory<{ url: string }> = {
        name: 'test-provider',
        metadata: {
          name: 'test-provider',
          displayName: 'Test Provider',
          requiresApiKey: true,
          supportsStreaming: true,
        },
        create: vi.fn(),
        validateConfig: vi.fn().mockReturnValue(false),
        getDefaultConfig: vi.fn().mockReturnValue({ url: '' }),
        listModels: vi.fn().mockResolvedValue([]),
        testConnection: vi.fn().mockResolvedValue(true),
      }
      registry.register(factory)

      const infos = await registry.getProviderInfos({ 'test-provider': {} })

      expect(infos[0].isAvailable).toBe(false)
      expect(infos[0].models).toBeUndefined()
    })

    test('should handle missing config', async () => {
      registry.register(createMockFactory('test-provider'))

      const infos = await registry.getProviderInfos()

      expect(infos[0].isAvailable).toBe(false)
    })
  })

  describe('createProvider', () => {
    test('should create provider instance', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      const config = { url: 'http://localhost:11434' }
      const provider = registry.createProvider('test-provider', config)

      expect(factory.create).toHaveBeenCalledWith(config)
      expect(provider).toEqual({ test: true })
    })

    test('should throw error for unknown provider', () => {
      expect(() => registry.createProvider('unknown', {})).toThrow('Unknown provider: "unknown"')
    })

    test('should throw error for invalid config', () => {
      const factory: LLMProviderFactory<{ url: string }> = {
        name: 'test-provider',
        metadata: {
          name: 'test-provider',
          displayName: 'Test Provider',
          requiresApiKey: true,
          supportsStreaming: true,
        },
        create: vi.fn(),
        validateConfig: vi.fn().mockReturnValue(false),
        getDefaultConfig: vi.fn().mockReturnValue({ url: '' }),
        listModels: vi.fn().mockResolvedValue([]),
        testConnection: vi.fn().mockResolvedValue(true),
      }
      registry.register(factory)

      expect(() => registry.createProvider('test-provider', {})).toThrow(
        'Invalid configuration for provider "test-provider"'
      )
    })
  })

  describe('validateConfig', () => {
    test('should return true for valid config', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      expect(registry.validateConfig('test-provider', { url: 'test' })).toBe(true)
      expect(factory.validateConfig).toHaveBeenCalledWith({ url: 'test' })
    })

    test('should return false for unknown provider', () => {
      expect(registry.validateConfig('unknown', {})).toBe(false)
    })
  })

  describe('getDefaultConfig', () => {
    test('should return default config for registered provider', () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      const config = registry.getDefaultConfig('test-provider')

      expect(config).toEqual({ url: 'http://localhost:11434' })
    })

    test('should return undefined for unknown provider', () => {
      expect(registry.getDefaultConfig('unknown')).toBeUndefined()
    })
  })

  describe('testConnection', () => {
    test('should return connection test result', async () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      const result = await registry.testConnection('test-provider', { url: 'test' })

      expect(result).toBe(true)
      expect(factory.testConnection).toHaveBeenCalledWith({ url: 'test' })
    })

    test('should throw error for unknown provider', async () => {
      await expect(registry.testConnection('unknown', {})).rejects.toThrow(
        'Unknown provider: "unknown"'
      )
    })

    test('should return false for invalid config', async () => {
      const factory: LLMProviderFactory<{ url: string }> = {
        name: 'test-provider',
        metadata: {
          name: 'test-provider',
          displayName: 'Test Provider',
          requiresApiKey: true,
          supportsStreaming: true,
        },
        create: vi.fn(),
        validateConfig: vi.fn().mockReturnValue(false),
        getDefaultConfig: vi.fn().mockReturnValue({ url: '' }),
        listModels: vi.fn().mockResolvedValue([]),
        testConnection: vi.fn().mockResolvedValue(true),
      }
      registry.register(factory)

      const result = await registry.testConnection('test-provider', {})

      expect(result).toBe(false)
    })
  })

  describe('listModels', () => {
    test('should return models for provider', async () => {
      const factory = createMockFactory('test-provider')
      registry.register(factory)

      const models = await registry.listModels('test-provider', { url: 'test' })

      expect(models).toEqual(['model1', 'model2'])
    })

    test('should throw error for unknown provider', async () => {
      await expect(registry.listModels('unknown', {})).rejects.toThrow(
        'Unknown provider: "unknown"'
      )
    })

    test('should throw error for invalid config', async () => {
      const factory: LLMProviderFactory<{ url: string }> = {
        name: 'test-provider',
        metadata: {
          name: 'test-provider',
          displayName: 'Test Provider',
          requiresApiKey: true,
          supportsStreaming: true,
        },
        create: vi.fn(),
        validateConfig: vi.fn().mockReturnValue(false),
        getDefaultConfig: vi.fn().mockReturnValue({ url: '' }),
        listModels: vi.fn().mockResolvedValue([]),
        testConnection: vi.fn().mockResolvedValue(true),
      }
      registry.register(factory)

      await expect(registry.listModels('test-provider', {})).rejects.toThrow(
        'Invalid configuration for provider "test-provider"'
      )
    })
  })

  describe('clear', () => {
    test('should clear all registered providers', () => {
      registry.register(createMockFactory('provider1'))
      registry.register(createMockFactory('provider2'))

      registry.clear()

      expect(registry.size).toBe(0)
      expect(registry.list()).toEqual([])
    })
  })

  describe('size', () => {
    test('should return number of registered providers', () => {
      expect(registry.size).toBe(0)

      registry.register(createMockFactory('provider1'))
      expect(registry.size).toBe(1)

      registry.register(createMockFactory('provider2'))
      expect(registry.size).toBe(2)
    })
  })
})
