import type { LLMProviderFactory, LLMProviderMetadata, ProviderInfo } from '@shared/types'

/**
 * Registry for LLM providers
 * Manages provider registration, discovery, and instantiation
 */
export class ProviderRegistry {
  private providers = new Map<string, LLMProviderFactory>()

  /**
   * Register a new provider factory
   * @param factory - The provider factory to register
   * @throws Error if a provider with the same name is already registered
   */
  register(factory: LLMProviderFactory): void {
    if (this.providers.has(factory.name)) {
      throw new Error(`Provider "${factory.name}" is already registered`)
    }
    this.providers.set(factory.name, factory)
  }

  /**
   * Unregister a provider
   * @param name - The name of the provider to unregister
   * @returns True if the provider was removed, false if it didn't exist
   */
  unregister(name: string): boolean {
    return this.providers.delete(name)
  }

  /**
   * Get a provider factory by name
   * @param name - The provider name
   * @returns The provider factory, or undefined if not found
   */
  get(name: string): LLMProviderFactory | undefined {
    return this.providers.get(name)
  }

  /**
   * Check if a provider is registered
   * @param name - The provider name
   * @returns True if the provider is registered
   */
  has(name: string): boolean {
    return this.providers.has(name)
  }

  /**
   * Get a list of all registered provider names
   * @returns Array of provider names
   */
  list(): string[] {
    return Array.from(this.providers.keys())
  }

  /**
   * Get metadata for all registered providers
   * @returns Array of provider metadata
   */
  listMetadata(): LLMProviderMetadata[] {
    return Array.from(this.providers.values()).map(factory => factory.metadata)
  }

  /**
   * Get detailed information about all providers
   * @param configs - Current configuration for each provider (to determine availability)
   * @returns Array of provider information
   */
  async getProviderInfos(
    configs: Record<string, unknown> = {} as unknown as Record<string, unknown>
  ): Promise<ProviderInfo[]> {
    const infos: ProviderInfo[] = []

    for (const [name, factory] of this.providers) {
      const config = configs[name]
      const isAvailable = config ? factory.validateConfig(config) : false

      let models: string[] | undefined
      if (isAvailable && config) {
        try {
          models = await factory.listModels(config as Record<string, unknown>)
        } catch {
          // Provider might not be reachable, continue without models
        }
      }

      infos.push({
        metadata: factory.metadata,
        isAvailable,
        models,
        defaultConfig: factory.getDefaultConfig(),
      })
    }

    return infos
  }

  /**
   * Create a provider instance
   * @param name - The provider name
   * @param config - Provider-specific configuration
   * @returns The provider instance
   * @throws Error if the provider is not registered or configuration is invalid
   */
  createProvider(name: string, config: unknown): unknown {
    const factory = this.providers.get(name)
    if (!factory) {
      throw new Error(`Unknown provider: "${name}". Available providers: ${this.list().join(', ')}`)
    }

    if (!factory.validateConfig(config)) {
      throw new Error(`Invalid configuration for provider "${name}"`)
    }

    return factory.create(config)
  }

  /**
   * Validate configuration for a provider
   * @param name - The provider name
   * @param config - Configuration to validate
   * @returns True if configuration is valid
   */
  validateConfig(name: string, config: unknown): boolean {
    const factory = this.providers.get(name)
    if (!factory) {
      return false
    }
    return factory.validateConfig(config)
  }

  /**
   * Get the default configuration for a provider
   * @param name - The provider name
   * @returns Default configuration, or undefined if provider not found
   */
  getDefaultConfig(name: string): Record<string, unknown> | undefined {
    const factory = this.providers.get(name)
    if (!factory) {
      return undefined
    }
    return factory.getDefaultConfig() as Record<string, unknown>
  }

  /**
   * Test connection for a provider
   * @param name - The provider name
   * @param config - Provider configuration
   * @returns True if connection successful
   */
  async testConnection(name: string, config: unknown): Promise<boolean> {
    const factory = this.providers.get(name)
    if (!factory) {
      throw new Error(`Unknown provider: "${name}"`)
    }

    if (!factory.validateConfig(config)) {
      return false
    }

    return factory.testConnection(config)
  }

  /**
   * List models for a provider
   * @param name - The provider name
   * @param config - Provider configuration
   * @returns List of available models
   */
  async listModels(name: string, config: unknown): Promise<string[]> {
    const factory = this.providers.get(name)
    if (!factory) {
      throw new Error(`Unknown provider: "${name}"`)
    }

    if (!factory.validateConfig(config)) {
      throw new Error(`Invalid configuration for provider "${name}"`)
    }

    return factory.listModels(config)
  }

  /**
   * Clear all registered providers
   */
  clear(): void {
    this.providers.clear()
  }

  /**
   * Get the number of registered providers
   */
  get size(): number {
    return this.providers.size
  }
}

/**
 * Global provider registry instance
 */
export const providerRegistry = new ProviderRegistry()
