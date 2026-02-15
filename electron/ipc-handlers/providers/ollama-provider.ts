import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOllama } from '@langchain/ollama'
import type { OllamaConfig } from '@shared/types'
import { BaseLLMProvider } from './base-provider'

/**
 * Validate Ollama URL format
 */
function validateOllamaUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    if (!parsedUrl.hostname) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Ollama LLM provider
 */
export class OllamaProvider extends BaseLLMProvider {
  #baseUrl: string

  constructor(config: OllamaConfig) {
    super(config.temperature, config.maxTokens)

    if (!validateOllamaUrl(config.url)) {
      throw new Error(`Invalid Ollama URL: ${config.url}. URL must be a valid HTTP/HTTPS URL.`)
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
    } catch (_error) {
      return false
    }
  }

  /**
   * List available models from Ollama API
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.#baseUrl}/api/tags`)
      const data = (await response.json()) as { models: { name: string }[] }
      return data.models.map(model => model.name)
    } catch (_error) {
      return []
    }
  }
}
