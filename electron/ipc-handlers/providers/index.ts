/**
 * LLM Provider Plugin System
 * Exports all providers and the registry for the plugin architecture
 */

// Types are re-exported from shared/types
export type {
  LLMProviderFactory,
  LLMProviderMetadata,
  ProviderInfo,
} from '@shared/types'
// Base provider class
export { BaseLLMProvider } from './base-provider'
// Provider implementations
export { ClaudeProvider, claudeProviderFactory, claudeProviderMetadata } from './claude-provider'
export { OllamaProvider, ollamaProviderFactory, ollamaProviderMetadata } from './ollama-provider'
export { OpenAIProvider, openaiProviderFactory, openaiProviderMetadata } from './openai-provider'
// Registry
export { ProviderRegistry, providerRegistry } from './registry'

/**
 * Initialize the provider registry with default providers
 * Should be called once at application startup
 */
export function initializeDefaultProviders(): void {
  // Import factories dynamically to avoid circular dependencies
  const { ollamaProviderFactory } = require('./ollama-provider')
  const { claudeProviderFactory } = require('./claude-provider')
  const { openaiProviderFactory } = require('./openai-provider')
  const { providerRegistry } = require('./registry')

  // Register default providers
  providerRegistry.register(ollamaProviderFactory)
  providerRegistry.register(claudeProviderFactory)
  providerRegistry.register(openaiProviderFactory)
}
