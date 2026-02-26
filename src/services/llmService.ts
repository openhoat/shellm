import type {
  AICommand,
  AppConfig,
  ConversationMessage,
  StreamingCallback,
  StreamingProgress,
} from '@shared/types'

/**
 * Generate a unique request ID for streaming
 */
function generateRequestId(): string {
  return `stream-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Cache entry for LLM responses
 */
interface CacheEntry {
  command: AICommand
  timestamp: number
}

/**
 * Cache configuration
 */
interface CacheConfig {
  ttl: number // Time to live in milliseconds (default: 5 minutes)
  maxSize: number // Maximum number of entries (default: 100)
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
}

/**
 * Interface for the Electron API (injectable for testability)
 */
export interface ElectronLLMAPI {
  init(config: AppConfig): Promise<void>
  generateCommand(
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ): Promise<AICommand>
  testConnection: () => Promise<boolean>
  listModels: () => Promise<string[]>
  // Streaming methods
  streamCommand?: (
    requestId: string,
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ) => Promise<AICommand>
  cancelStream?: (requestId: string) => Promise<boolean>
  onStreamProgress?: (
    requestId: string,
    callback: (progress: StreamingProgress) => void
  ) => () => void
}

/**
 * Service for the LLM API
 * The Electron API is injected to allow mocking in tests
 */
export class LLMService {
  #electronAPI: ElectronLLMAPI
  #cache: Map<string, CacheEntry>
  #cacheConfig: CacheConfig

  constructor(electronAPI: ElectronLLMAPI, cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.#electronAPI = electronAPI
    this.#cache = new Map()
    this.#cacheConfig = cacheConfig
  }

  /**
   * Generates a cache key from prompt, history, and language
   */
  #generateCacheKey(
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ): string {
    const historyJson = JSON.stringify(conversationHistory || [])
    return `${prompt}|${historyJson}|${language || 'en'}`
  }

  /**
   * Gets a cached response if valid
   */
  #getCachedResponse(cacheKey: string): AICommand | null {
    const entry = this.#cache.get(cacheKey)
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > this.#cacheConfig.ttl) {
      this.#cache.delete(cacheKey)
      return null
    }

    return entry.command
  }

  /**
   * Stores a response in the cache with LRU eviction
   */
  #cacheResponse(cacheKey: string, command: AICommand): void {
    // Evict oldest entry if cache is full
    if (this.#cache.size >= this.#cacheConfig.maxSize) {
      const firstKey = this.#cache.keys().next().value
      if (firstKey) {
        this.#cache.delete(firstKey)
      }
    }

    this.#cache.set(cacheKey, {
      command,
      timestamp: Date.now(),
    })
  }

  /**
   * Generate a command from natural language description
   */
  async generateCommand(
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ): Promise<AICommand> {
    const cacheKey = this.#generateCacheKey(prompt, conversationHistory, language)

    // Check cache first
    const cachedResponse = this.#getCachedResponse(cacheKey)
    if (cachedResponse) {
      return cachedResponse
    }

    // Generate new response
    const command = await this.#electronAPI.generateCommand(prompt, conversationHistory, language)

    // Cache the response
    this.#cacheResponse(cacheKey, command)

    return command
  }

  /**
   * Initialize the LLM service with configuration
   */
  async initialize(config: AppConfig): Promise<void> {
    return this.#electronAPI.init(config)
  }

  /**
   * Test connection to the LLM service
   */
  async testConnection(): Promise<boolean> {
    return this.#electronAPI.testConnection()
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    return this.#electronAPI.listModels()
  }

  /**
   * Clears the cache (useful when changing model or configuration)
   */
  clearCache(): void {
    this.#cache.clear()
  }

  /**
   * Gets current cache size (for debugging/monitoring)
   */
  getCacheSize(): number {
    return this.#cache.size
  }

  /**
   * Stream a command generation with progress updates
   * Returns the final result and provides progress updates via callback
   */
  async streamCommand(
    prompt: string,
    onProgress: StreamingCallback,
    conversationHistory?: ConversationMessage[],
    language?: string
  ): Promise<AICommand> {
    // Check if streaming is available
    if (!this.#electronAPI.streamCommand || !this.#electronAPI.onStreamProgress) {
      // Fallback to non-streaming
      onProgress({ type: 'connecting' })
      const command = await this.generateCommand(prompt, conversationHistory, language)
      onProgress({ type: 'complete', partialCommand: command })
      return command
    }

    const requestId = generateRequestId()

    return new Promise((resolve, reject) => {
      // Set up progress listener
      const unsubscribe = this.#electronAPI.onStreamProgress?.(requestId, progress => {
        onProgress(progress)

        // Handle completion
        if (progress.type === 'complete' && progress.partialCommand) {
          unsubscribe()
          resolve(progress.partialCommand)
        }

        // Handle error
        if (progress.type === 'error') {
          unsubscribe()
          reject(new Error(progress.error || 'Streaming failed'))
        }
      })

      // Start streaming
      this.#electronAPI
        .streamCommand?.(requestId, prompt, conversationHistory, language)
        .then(result => {
          // Result might come through the invoke response or through progress events
          if (result) {
            unsubscribe()
            resolve(result)
          }
        })
        .catch(error => {
          unsubscribe()
          reject(error)
        })
    })
  }

  /**
   * Cancel an active streaming request
   */
  async cancelStream(requestId: string): Promise<boolean> {
    if (!this.#electronAPI.cancelStream) {
      return false
    }
    return this.#electronAPI.cancelStream(requestId)
  }

  /**
   * Creates an instance with the real Electron API
   */
  static createWithRealAPI(): LLMService {
    return new LLMService({
      init: config => window.electronAPI.llmInit(config),
      generateCommand: (prompt, recentCommands) =>
        window.electronAPI.llmGenerateCommand(prompt, recentCommands),
      testConnection: () => window.electronAPI.llmTestConnection(),
      listModels: () => window.electronAPI.llmListModels(),
      // Streaming methods
      streamCommand: (requestId, prompt, conversationHistory, language) =>
        window.electronAPI.llmStreamCommand(requestId, prompt, conversationHistory, language),
      cancelStream: requestId => window.electronAPI.llmCancelStream(requestId),
      onStreamProgress: (requestId, callback) =>
        window.electronAPI.onLlmStreamProgress(requestId, callback),
    })
  }
}

/**
 * Singleton instance with the real Electron API
 */
export const llmService = LLMService.createWithRealAPI()
