import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOllama } from '@langchain/ollama'
import type { LLMProviderFactory, LLMProviderMetadata, OllamaConfig } from '@shared/types'
import { Logger } from '../../utils/logger'
import { BaseLLMProvider } from './base-provider'

// Logger instance for Ollama provider
const logger = new Logger('OllamaProvider')

/**
 * Validate Ollama URL format and return an error message if invalid
 */
function validateOllamaUrl(url: string): string | undefined {
  if (!url || !url.trim()) {
    return 'Ollama URL is empty. Please configure a valid URL (e.g. http://localhost:11434).'
  }
  try {
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return `Invalid Ollama URL protocol: "${parsedUrl.protocol}". Only HTTP and HTTPS are supported.`
    }
    if (!parsedUrl.hostname) {
      return 'Invalid Ollama URL: missing hostname.'
    }
    return undefined
  } catch (error) {
    logger.error('URL validation failed', error)
    return `Invalid Ollama URL: "${url}". URL must be a valid HTTP/HTTPS URL (e.g. http://localhost:11434).`
  }
}

/**
 * Ollama LLM provider
 */
export class OllamaProvider extends BaseLLMProvider {
  #baseUrl: string

  constructor(config: OllamaConfig) {
    super(config.temperature, config.maxTokens)

    const urlError = validateOllamaUrl(config.url)
    if (urlError) {
      throw new Error(urlError)
    }

    this.#baseUrl = config.url
    this.model = new ChatOllama({
      model: config.model || 'llama2',
      baseUrl: config.url,
      temperature: this.temperature,
      numPredict: this.maxTokens,
    })
  }

  /**
   * Test connection to Ollama
   */
  async testConnection(): Promise<boolean> {
    try {
      const chain = ChatPromptTemplate.fromMessages([['human', 'Hi']]).pipe(this.model)
      await chain.invoke({})
      return true
    } catch (error) {
      logger.error('Connection test failed', error)
      return false
    }
  }

  /**
   * List available models from Ollama API
   */
  async listModels(): Promise<string[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${this.#baseUrl}/api/tags`, { signal: controller.signal })
      clearTimeout(timeoutId)
      const data = (await response.json()) as { models: { name: string }[] }
      return data.models.map(model => model.name)
    } catch (error) {
      logger.error('Failed to list models', error)
      return []
    }
  }
}

/**
 * Ollama provider metadata
 */
export const ollamaProviderMetadata: LLMProviderMetadata = {
  name: 'ollama',
  displayName: 'Ollama',
  description: 'Local LLM inference with Ollama - run models on your own machine',
  version: '1.0.0',
  requiresApiKey: false,
  supportsStreaming: true,
  websiteUrl: 'https://ollama.ai',
  icon: 'server',
}

/**
 * Default configuration for Ollama provider
 */
const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  url: 'http://localhost:11434',
  model: 'llama3.2:3b',
  temperature: 0.7,
  maxTokens: 1000,
}

/**
 * Ollama provider factory
 */
export const ollamaProviderFactory: LLMProviderFactory<OllamaConfig> = {
  name: 'ollama',
  metadata: ollamaProviderMetadata,

  create(config: OllamaConfig): OllamaProvider {
    return new OllamaProvider(config)
  },

  validateConfig(config: unknown): config is OllamaConfig {
    if (typeof config !== 'object' || config === null) {
      return false
    }
    const cfg = config as Record<string, unknown>
    return typeof cfg.url === 'string' && typeof cfg.model === 'string'
  },

  getDefaultConfig(): OllamaConfig {
    return { ...DEFAULT_OLLAMA_CONFIG }
  },

  async listModels(config: OllamaConfig): Promise<string[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${config.url}/api/tags`, { signal: controller.signal })
      clearTimeout(timeoutId)
      const data = (await response.json()) as { models: { name: string }[] }
      return data.models.map(model => model.name)
    } catch (error) {
      logger.error('Factory failed to list models', error)
      return []
    }
  },

  async testConnection(config: OllamaConfig): Promise<boolean> {
    try {
      const provider = new OllamaProvider(config)
      return await provider.testConnection()
    } catch {
      return false
    }
  },
}
