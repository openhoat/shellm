import type { AppConfig, ClaudeConfig, OllamaConfig } from './types'

// Environment variable names
export const ENV_VAR_LLM_PROVIDER = 'SHELLM_LLM_PROVIDER'
export const ENV_VAR_OLLAMA_URL = 'SHELLM_OLLAMA_URL'
export const ENV_VAR_OLLAMA_API_KEY = 'SHELLM_OLLAMA_API_KEY'
export const ENV_VAR_OLLAMA_MODEL = 'SHELLM_OLLAMA_MODEL'
export const ENV_VAR_OLLAMA_TEMPERATURE = 'SHELLM_OLLAMA_TEMPERATURE'
export const ENV_VAR_OLLAMA_MAX_TOKENS = 'SHELLM_OLLAMA_MAX_TOKENS'
export const ENV_VAR_CLAUDE_API_KEY = 'SHELLM_CLAUDE_API_KEY'
export const ENV_VAR_CLAUDE_MODEL = 'SHELLM_CLAUDE_MODEL'
export const ENV_VAR_SHELL = 'SHELLM_SHELL'

// Default Ollama configuration
export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  url: 'http://localhost:11434',
  // model: 'llama3.2:3b',
  model: 'gemini-3-flash-preview:cloud',
  temperature: 0.7,
  maxTokens: 1000,
}

// Default Claude configuration
export const DEFAULT_CLAUDE_CONFIG: ClaudeConfig = {
  apiKey: '',
  model: 'claude-haiku-4-5-20251001',
  temperature: 0.7,
  maxTokens: 1000,
}

// Default application configuration
export const DEFAULT_CONFIG: AppConfig = {
  llmProvider: 'ollama',
  ollama: DEFAULT_OLLAMA_CONFIG,
  claude: DEFAULT_CLAUDE_CONFIG,
  theme: 'dark',
  fontSize: 14,
  shell: 'auto',
}

interface EnvOllamaConfig {
  url: string | undefined
  apiKey?: string | undefined
  model: string | undefined
  temperature?: number | undefined
  maxTokens?: number | undefined
}

interface EnvClaudeConfig {
  apiKey?: string | undefined
  model?: string | undefined
}

interface EnvAppConfig {
  llmProvider: string | undefined
  shell: string | undefined
}

/**
 * Load configuration from environment variables
 */
export function getEnvConfig(): {
  ollama: EnvOllamaConfig
  claude: EnvClaudeConfig
  app: EnvAppConfig
} {
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
    claude: {
      apiKey: process.env[ENV_VAR_CLAUDE_API_KEY] ?? undefined,
      model: process.env[ENV_VAR_CLAUDE_MODEL] ?? undefined,
    },
    app: {
      llmProvider: process.env[ENV_VAR_LLM_PROVIDER] ?? undefined,
      shell: process.env[ENV_VAR_SHELL] ?? undefined,
    },
  }
}

/**
 * Merge stored configuration with environment variables
 * Environment variables take priority over stored configuration
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

  if (envConfig.claude) {
    mergedConfig.claude = {
      ...storedConfig.claude,
      apiKey: envConfig.claude.apiKey ?? storedConfig.claude.apiKey,
      model: envConfig.claude.model ?? storedConfig.claude.model,
    }
  }

  if (envConfig.app) {
    if (
      envConfig.app.llmProvider === 'ollama' ||
      envConfig.app.llmProvider === 'claude'
    ) {
      mergedConfig.llmProvider = envConfig.app.llmProvider
    }
    mergedConfig.shell = envConfig.app.shell ?? storedConfig.shell
  }

  return mergedConfig
}

/**
 * Return information about environment variable sources
 */
export function getEnvSources(): {
  url: boolean
  apiKey: boolean
  model: boolean
  temperature: boolean
  maxTokens: boolean
  shell: boolean
  llmProvider: boolean
  claudeApiKey: boolean
  claudeModel: boolean
} {
  return {
    url: !!process.env[ENV_VAR_OLLAMA_URL],
    apiKey: !!process.env[ENV_VAR_OLLAMA_API_KEY],
    model: !!process.env[ENV_VAR_OLLAMA_MODEL],
    temperature: !!process.env[ENV_VAR_OLLAMA_TEMPERATURE],
    maxTokens: !!process.env[ENV_VAR_OLLAMA_MAX_TOKENS],
    shell: !!process.env[ENV_VAR_SHELL],
    llmProvider: !!process.env[ENV_VAR_LLM_PROVIDER],
    claudeApiKey: !!process.env[ENV_VAR_CLAUDE_API_KEY],
    claudeModel: !!process.env[ENV_VAR_CLAUDE_MODEL],
  }
}
