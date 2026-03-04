import { ChatAnthropic } from '@langchain/anthropic'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { CLAUDE_MODELS } from '@shared/models'
import type { ClaudeConfig, LLMProviderFactory, LLMProviderMetadata } from '@shared/types'
import { BaseLLMProvider } from './base-provider'

/**
 * Claude (Anthropic) LLM provider
 */
export class ClaudeProvider extends BaseLLMProvider {
  constructor(config: ClaudeConfig) {
    super(config.temperature, config.maxTokens)

    this.model = new ChatAnthropic({
      model: config.model || 'claude-haiku-4-5-20251001',
      apiKey: config.apiKey,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    })
  }

  /**
   * Test connection to Claude API
   */
  async testConnection(): Promise<boolean> {
    try {
      const chain = ChatPromptTemplate.fromMessages([['human', 'Hi']]).pipe(this.model)
      await chain.invoke({})
      return true
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for connection test errors
      console.error('[ClaudeProvider] Connection test failed:', error)
      return false
    }
  }

  /**
   * Return the list of available Claude models
   */
  async listModels(): Promise<string[]> {
    return CLAUDE_MODELS
  }
}

/**
 * Claude provider metadata
 */
export const claudeProviderMetadata: LLMProviderMetadata = {
  name: 'claude',
  displayName: 'Claude (Anthropic)',
  description: 'Anthropic Claude API - powerful AI assistant with excellent reasoning capabilities',
  version: '1.0.0',
  requiresApiKey: true,
  supportsStreaming: true,
  websiteUrl: 'https://anthropic.com',
  icon: 'brain',
}

/**
 * Default configuration for Claude provider
 */
const DEFAULT_CLAUDE_CONFIG: ClaudeConfig = {
  apiKey: '',
  model: 'claude-haiku-4-5-20251001',
  temperature: 0.7,
  maxTokens: 1000,
}

/**
 * Claude provider factory
 */
export const claudeProviderFactory: LLMProviderFactory<ClaudeConfig> = {
  name: 'claude',
  metadata: claudeProviderMetadata,

  create(config: ClaudeConfig): ClaudeProvider {
    return new ClaudeProvider(config)
  },

  validateConfig(config: unknown): config is ClaudeConfig {
    if (typeof config !== 'object' || config === null) {
      return false
    }
    const cfg = config as Record<string, unknown>
    return typeof cfg.apiKey === 'string' && cfg.apiKey.length > 0 && typeof cfg.model === 'string'
  },

  getDefaultConfig(): ClaudeConfig {
    return { ...DEFAULT_CLAUDE_CONFIG }
  },

  async listModels(): Promise<string[]> {
    return CLAUDE_MODELS
  },

  async testConnection(config: ClaudeConfig): Promise<boolean> {
    try {
      const provider = new ClaudeProvider(config)
      return await provider.testConnection()
    } catch {
      return false
    }
  },
}
