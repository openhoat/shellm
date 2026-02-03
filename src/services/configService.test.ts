import type { AppConfig, OllamaConfig } from '@shared/types'
import { describe, expect, it } from 'vitest'
import { configService } from './configService'

describe('configService', () => {
  describe('validateOllamaConfig', () => {
    test('should validate a correct config', () => {
      const config: OllamaConfig = {
        url: 'http://localhost:11434',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 1000,
      }

      const result = configService.validateOllamaConfig(config)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should return errors for missing URL', () => {
      const config: OllamaConfig = {
        url: '',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 1000,
      }

      const result = configService.validateOllamaConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain("L'URL Ollama est requise")
    })

    test('should return errors for invalid URL', () => {
      const config: OllamaConfig = {
        url: 'not-a-valid-url',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 1000,
      }

      const result = configService.validateOllamaConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain("L'URL Ollama n'est pas valide")
    })

    test('should return errors for missing model', () => {
      const config: OllamaConfig = {
        url: 'http://localhost:11434',
        model: '',
        temperature: 0.7,
        maxTokens: 1000,
      }

      const result = configService.validateOllamaConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le modèle est requis')
    })

    test('should return errors for temperature out of range', () => {
      const config1: OllamaConfig = {
        url: 'http://localhost:11434',
        model: 'llama2',
        temperature: 1.5,
        maxTokens: 1000,
      }

      const result1 = configService.validateOllamaConfig(config1)

      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('La température doit être entre 0 et 1')

      const config2: OllamaConfig = {
        url: 'http://localhost:11434',
        model: 'llama2',
        temperature: -0.1,
        maxTokens: 1000,
      }

      const result2 = configService.validateOllamaConfig(config2)

      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('La température doit être entre 0 et 1')
    })

    test('should return errors for maxTokens out of range', () => {
      const config1: OllamaConfig = {
        url: 'http://localhost:11434',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 50,
      }

      const result1 = configService.validateOllamaConfig(config1)

      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('Le nombre de tokens doit être entre 100 et 4000')

      const config2: OllamaConfig = {
        url: 'http://localhost:11434',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 5000,
      }

      const result2 = configService.validateOllamaConfig(config2)

      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('Le nombre de tokens doit être entre 100 et 4000')
    })
  })

  describe('isValidUrl', () => {
    test('should return true for valid HTTP URL', () => {
      expect(configService.isValidUrl('http://localhost:11434')).toBe(true)
    })

    test('should return true for valid HTTPS URL', () => {
      expect(configService.isValidUrl('https://example.com')).toBe(true)
    })

    test('should return false for invalid URL', () => {
      expect(configService.isValidUrl('not-a-url')).toBe(false)
    })

    test('should return false for non-HTTP protocol', () => {
      expect(configService.isValidUrl('ftp://example.com')).toBe(false)
    })

    test('should return false for empty string', () => {
      expect(configService.isValidUrl('')).toBe(false)
    })
  })

  describe('formatTestResult', () => {
    test('should format success result', () => {
      const result = configService.formatTestResult(true)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Connexion réussie !')
    })

    test('should format failure result', () => {
      const result = configService.formatTestResult(false)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Échec de la connexion')
    })
  })

  describe('createDefaultConfig', () => {
    test('should create default config', () => {
      const config = configService.createDefaultConfig()

      expect(config.ollama.url).toBe('http://localhost:11434')
      expect(config.ollama.model).toBe('llama2')
      expect(config.ollama.temperature).toBe(0.7)
      expect(config.ollama.maxTokens).toBe(1000)
      expect(config.theme).toBe('dark')
      expect(config.fontSize).toBe(14)
    })
  })

  describe('mergeConfigs', () => {
    test('should merge config with override', () => {
      const base: AppConfig = {
        ollama: {
          url: 'http://localhost:11434',
          model: 'llama2',
          temperature: 0.7,
          maxTokens: 1000,
        },
        theme: 'dark',
        fontSize: 14,
      }

      const override: Partial<AppConfig> = {
        theme: 'light',
        ollama: {
          model: 'mistral',
        },
      }

      const merged = configService.mergeConfigs(base, override)

      expect(merged.theme).toBe('light')
      expect(merged.ollama.model).toBe('mistral')
      expect(merged.ollama.url).toBe('http://localhost:11434') // Keep base value
    })
  })

  describe('isFromEnv', () => {
    test('should return true for env field', () => {
      const envSources = {
        url: true,
        model: false,
      }

      expect(configService.isFromEnv(envSources, 'url')).toBe(true)
      expect(configService.isFromEnv(envSources, 'model')).toBe(false)
    })
  })

  describe('formatEnvVarName', () => {
    test('should format env var names correctly', () => {
      expect(configService.formatEnvVarName('url')).toBe('SHELLM_OLLAMA_URL')
      expect(configService.formatEnvVarName('apiKey')).toBe('SHELLM_OLLAMA_API_KEY')
      expect(configService.formatEnvVarName('model')).toBe('SHELLM_OLLAMA_MODEL')
      expect(configService.formatEnvVarName('temperature')).toBe('SHELLM_OLLAMA_TEMPERATURE')
      expect(configService.formatEnvVarName('maxTokens')).toBe('SHELLM_OLLAMA_MAX_TOKENS')
    })

    test('should return empty string for unknown field', () => {
      expect(configService.formatEnvVarName('unknown')).toBe('')
    })
  })
})
