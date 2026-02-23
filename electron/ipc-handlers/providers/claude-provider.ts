import { ChatAnthropic } from '@langchain/anthropic'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { CLAUDE_MODELS } from '@shared/models'
import type { ClaudeConfig } from '@shared/types'
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
