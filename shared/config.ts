import type { AppConfig, OllamaConfig } from './types'

// Noms des variables d'environnement
export const ENV_VAR_OLLAMA_URL = 'SHELLM_OLLAMA_URL'
export const ENV_VAR_OLLAMA_API_KEY = 'SHELLM_OLLAMA_API_KEY'
export const ENV_VAR_OLLAMA_MODEL = 'SHELLM_OLLAMA_MODEL'
export const ENV_VAR_OLLAMA_TEMPERATURE = 'SHELLM_OLLAMA_TEMPERATURE'
export const ENV_VAR_OLLAMA_MAX_TOKENS = 'SHELLM_OLLAMA_MAX_TOKENS'

// Configuration par défaut de l'Ollama
export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  url: 'http://localhost:11434',
  // model: 'llama3.2:3b',
  model: 'gemini-3-flash-preview:cloud',
  temperature: 0.7,
  maxTokens: 1000,
}

// Configuration par défaut de l'application
export const DEFAULT_CONFIG: AppConfig = {
  ollama: DEFAULT_OLLAMA_CONFIG,
  theme: 'dark',
  fontSize: 14,
}

interface EnvOllamaConfig {
  url: string | undefined
  apiKey?: string | undefined
  model: string | undefined
  temperature?: number | undefined
  maxTokens?: number | undefined
}

/**
 * Charge la configuration depuis les variables d'environnement
 */
export function getEnvConfig(): { ollama: EnvOllamaConfig } {
  return {
    ollama: {
      url: process.env[ENV_VAR_OLLAMA_URL] ?? undefined,
      apiKey: process.env[ENV_VAR_OLLAMA_API_KEY] ?? undefined,
      model: process.env[ENV_VAR_OLLAMA_MODEL] ?? undefined,
      temperature: process.env[ENV_VAR_OLLAMA_TEMPERATURE]
        ? parseFloat(process.env[ENV_VAR_OLLAMA_TEMPERATURE])
        : undefined,
      maxTokens: process.env[ENV_VAR_OLLAMA_MAX_TOKENS]
        ? parseInt(process.env[ENV_VAR_OLLAMA_MAX_TOKENS], 10)
        : undefined,
    },
  }
}

/**
 * Fusionne la configuration stockée avec les variables d'environnement
 * Les variables d'environnement ont priorité sur la configuration stockée
 */
export function mergeConfig(storedConfig: AppConfig): AppConfig {
  const envConfig = getEnvConfig()
  const mergedConfig: AppConfig = { ...storedConfig }

  if (envConfig.ollama) {
    mergedConfig.ollama = {
      ...storedConfig.ollama,
      url: envConfig.ollama.url ?? storedConfig.ollama.url,
      apiKey: envConfig.ollama.apiKey ?? storedConfig.ollama.apiKey,
      model: envConfig.ollama.model ?? storedConfig.ollama.model,
      temperature: envConfig.ollama.temperature ?? storedConfig.ollama.temperature,
      maxTokens: envConfig.ollama.maxTokens ?? storedConfig.ollama.maxTokens,
    }
  }

  return mergedConfig
}

/**
 * Retourne les informations sur les sources des variables d'environnement
 */
export function getEnvSources(): {
  url: boolean
  apiKey: boolean
  model: boolean
  temperature: boolean
  maxTokens: boolean
} {
  return {
    url: !!process.env[ENV_VAR_OLLAMA_URL],
    apiKey: !!process.env[ENV_VAR_OLLAMA_API_KEY],
    model: !!process.env[ENV_VAR_OLLAMA_MODEL],
    temperature: !!process.env[ENV_VAR_OLLAMA_TEMPERATURE],
    maxTokens: !!process.env[ENV_VAR_OLLAMA_MAX_TOKENS],
  }
}
