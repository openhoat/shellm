import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { OPENAI_MODELS } from '@shared/models'
import type { LLMProviderFactory, LLMProviderMetadata, OpenAIConfig } from '@shared/types'
import { Logger } from '../../utils/logger'
import { BaseLLMProvider } from './base-provider'

// Logger instance for OpenAI provider
const logger = new Logger('OpenAIProvider')

/**
 * OpenAI LLM provider
 */
export class OpenAIProvider extends BaseLLMProvider {
  constructor(config: OpenAIConfig) {
    super(config.temperature, config.maxTokens)

    this.model = new ChatOpenAI({
      model: config.model || 'gpt-4o',
      apiKey: config.apiKey,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    })
  }

  /**
   * Test connection to OpenAI API
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
   * Return the list of available OpenAI models
   */
  async listModels(): Promise<string[]> {
    return OPENAI_MODELS
  }
}

/**
 * OpenAI provider metadata
 */
export const openaiProviderMetadata: LLMProviderMetadata = {
  name: 'openai',
  displayName: 'OpenAI',
  description: 'OpenAI GPT models - industry-leading language models for various tasks',
  version: '1.0.0',
  requiresApiKey: true,
  supportsStreaming: true,
  websiteUrl: 'https://openai.com',
  icon: 'openai',
}

/**
 * Default configuration for OpenAI provider
 */
const DEFAULT_OPENAI_CONFIG: OpenAIConfig = {
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
}

/**
 * OpenAI provider factory
 */
export const openaiProviderFactory: LLMProviderFactory<OpenAIConfig> = {
  name: 'openai',
  metadata: openaiProviderMetadata,

  create(config: OpenAIConfig): OpenAIProvider {
    return new OpenAIProvider(config)
  },

  validateConfig(config: unknown): config is OpenAIConfig {
    if (typeof config !== 'object' || config === null) {
      return false
    }
    const cfg = config as Record<string, unknown>
    return typeof cfg.apiKey === 'string' && cfg.apiKey.length > 0 && typeof cfg.model === 'string'
  },

  getDefaultConfig(): OpenAIConfig {
    return { ...DEFAULT_OPENAI_CONFIG }
  },

  async listModels(): Promise<string[]> {
    return OPENAI_MODELS
  },

  async testConnection(config: OpenAIConfig): Promise<boolean> {
    try {
      const provider = new OpenAIProvider(config)
      return await provider.testConnection()
    } catch {
      return false
    }
  },
}
