/**
 * Tests for OllamaProvider URL validation
 */

import { describe, expect, test, vi } from 'vitest'

// Mock langchain modules to avoid real API calls
vi.mock('@langchain/core/prompts', () => ({
  ChatPromptTemplate: { fromMessages: vi.fn() },
}))

vi.mock('@langchain/ollama', () => ({
  ChatOllama: vi.fn(),
}))

import type { OllamaConfig } from '@shared/types'
import { OllamaProvider } from './ollama-provider'

const validConfig: OllamaConfig = {
  url: 'http://localhost:11434',
  model: 'llama2',
}

describe('OllamaProvider', () => {
  describe('URL validation', () => {
    test('should accept a valid HTTP URL', () => {
      expect(() => new OllamaProvider(validConfig)).not.toThrow()
    })

    test('should accept a valid HTTPS URL', () => {
      expect(
        () => new OllamaProvider({ ...validConfig, url: 'https://ollama.example.com' })
      ).not.toThrow()
    })

    test('should reject an empty URL', () => {
      expect(() => new OllamaProvider({ ...validConfig, url: '' })).toThrow(/Ollama URL is empty/)
    })

    test('should reject a whitespace-only URL', () => {
      expect(() => new OllamaProvider({ ...validConfig, url: '   ' })).toThrow(
        /Ollama URL is empty/
      )
    })

    test('should reject an invalid URL format', () => {
      expect(() => new OllamaProvider({ ...validConfig, url: 'not-a-url' })).toThrow(
        /Invalid Ollama URL/
      )
    })

    test('should reject a URL with unsupported protocol', () => {
      expect(() => new OllamaProvider({ ...validConfig, url: 'ftp://localhost:11434' })).toThrow(
        /Invalid Ollama URL protocol/
      )
    })

    test('should accept URL with port number', () => {
      expect(
        () => new OllamaProvider({ ...validConfig, url: 'http://192.168.1.100:11434' })
      ).not.toThrow()
    })

    test('should accept URL with path', () => {
      expect(
        () => new OllamaProvider({ ...validConfig, url: 'http://localhost:11434/api' })
      ).not.toThrow()
    })
  })
})
