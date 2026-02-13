import type { AICommand, ConversationMessage, OllamaConfig } from '@shared/types'

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
 * Interface pour l'API Electron (injectée pour testabilité)
 */
export interface ElectronOllamaAPI {
  init(config: OllamaConfig): Promise<void>
  generateCommand(
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ): Promise<AICommand>
  testConnection: () => Promise<boolean>
  listModels: () => Promise<string[]>
}

/**
 * Service pur pour l'API Ollama
 * L'API Electron est injectée pour permettre le mocking dans les tests
 */
export class OllamaService {
  #electronAPI: ElectronOllamaAPI
  #cache: Map<string, CacheEntry>
  #cacheConfig: CacheConfig

  constructor(electronAPI: ElectronOllamaAPI, cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG) {
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
   * Génère une commande à partir d'une description en langage naturel
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
   * Initialise le service Ollama avec la configuration
   */
  async initialize(config: OllamaConfig): Promise<void> {
    return this.#electronAPI.init(config)
  }

  /**
   * Teste la connexion au service Ollama
   */
  async testConnection(): Promise<boolean> {
    return this.#electronAPI.testConnection()
  }

  /**
   * Liste les modèles disponibles
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
   * Crée une instance avec l'API Electron réelle
   */
  static createWithRealAPI(): OllamaService {
    return new OllamaService({
      init: config => window.electronAPI.llmInit(config),
      generateCommand: (prompt, recentCommands) =>
        window.electronAPI.llmGenerateCommand(prompt, recentCommands),
      testConnection: () => window.electronAPI.llmTestConnection(),
      listModels: () => window.electronAPI.llmListModels(),
    })
  }
}

/**
 * Instance singleton avec l'API Electron réelle
 */
export const ollamaService = OllamaService.createWithRealAPI()
