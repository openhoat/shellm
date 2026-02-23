import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { OPENAI_MODELS } from '@shared/models'
import type { OpenAIConfig } from '@shared/types'
import { BaseLLMProvider } from './base-provider'

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
      // biome-ignore lint/suspicious/noConsole: Debug logging for connection test errors
      console.error('[OpenAIProvider] Connection test failed:', error)
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
