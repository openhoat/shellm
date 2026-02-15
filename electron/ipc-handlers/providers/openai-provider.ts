import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import type { OpenAIConfig } from '@shared/types'
import { BaseLLMProvider } from './base-provider'

// Available OpenAI models
export const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']

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
    } catch (_error) {
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
