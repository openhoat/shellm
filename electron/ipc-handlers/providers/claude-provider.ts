import { ChatAnthropic } from '@langchain/anthropic'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { ClaudeConfig } from '@shared/types'
import { BaseLLMProvider } from './base-provider'

// Available Claude models
export const CLAUDE_MODELS = [
  'claude-opus-4-6',
  'claude-sonnet-4-5-20250929',
  'claude-haiku-4-5-20251001',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307',
]

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
