import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOllama } from '@langchain/ollama'
import type { OllamaConfig } from '@shared/types'
import { BaseLLMProvider } from './base-provider'

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
  } catch {
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
    } catch (_error) {
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
    } catch (_error) {
      return []
    }
  }
}
