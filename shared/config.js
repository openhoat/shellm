Object.defineProperty(exports, '__esModule', { value: true })
exports.DEFAULT_CONFIG =
  exports.DEFAULT_CLAUDE_CONFIG =
  exports.DEFAULT_OLLAMA_CONFIG =
  exports.ENV_VAR_SHELL =
  exports.ENV_VAR_CLAUDE_MODEL =
  exports.ENV_VAR_CLAUDE_API_KEY =
  exports.ENV_VAR_OLLAMA_MAX_TOKENS =
  exports.ENV_VAR_OLLAMA_TEMPERATURE =
  exports.ENV_VAR_OLLAMA_MODEL =
  exports.ENV_VAR_OLLAMA_API_KEY =
  exports.ENV_VAR_OLLAMA_URL =
  exports.ENV_VAR_LLM_PROVIDER =
    void 0
exports.getEnvConfig = getEnvConfig
exports.mergeConfig = mergeConfig
exports.getEnvSources = getEnvSources
// Environment variable names
exports.ENV_VAR_LLM_PROVIDER = 'SHELLM_LLM_PROVIDER'
exports.ENV_VAR_OLLAMA_URL = 'SHELLM_OLLAMA_URL'
exports.ENV_VAR_OLLAMA_API_KEY = 'SHELLM_OLLAMA_API_KEY'
exports.ENV_VAR_OLLAMA_MODEL = 'SHELLM_OLLAMA_MODEL'
exports.ENV_VAR_OLLAMA_TEMPERATURE = 'SHELLM_OLLAMA_TEMPERATURE'
exports.ENV_VAR_OLLAMA_MAX_TOKENS = 'SHELLM_OLLAMA_MAX_TOKENS'
exports.ENV_VAR_CLAUDE_API_KEY = 'SHELLM_CLAUDE_API_KEY'
exports.ENV_VAR_CLAUDE_MODEL = 'SHELLM_CLAUDE_MODEL'
exports.ENV_VAR_SHELL = 'SHELLM_SHELL'
// Default Ollama configuration
exports.DEFAULT_OLLAMA_CONFIG = {
  url: 'http://localhost:11434',
  // model: 'llama3.2:3b',
  model: 'gemini-3-flash-preview:cloud',
  temperature: 0.7,
  maxTokens: 1000,
}
// Default Claude configuration
exports.DEFAULT_CLAUDE_CONFIG = {
  apiKey: '',
  model: 'claude-haiku-4-5-20251001',
  temperature: 0.7,
  maxTokens: 1000,
}
// Default application configuration
exports.DEFAULT_CONFIG = {
  llmProvider: 'ollama',
  ollama: exports.DEFAULT_OLLAMA_CONFIG,
  claude: exports.DEFAULT_CLAUDE_CONFIG,
  theme: 'dark',
  fontSize: 14,
  shell: 'auto',
}
/**
 * Load configuration from environment variables
 */
function getEnvConfig() {
  return {
    ollama: {
      url: process.env[exports.ENV_VAR_OLLAMA_URL] ?? undefined,
      apiKey: process.env[exports.ENV_VAR_OLLAMA_API_KEY] ?? undefined,
      model: process.env[exports.ENV_VAR_OLLAMA_MODEL] ?? undefined,
      temperature: process.env[exports.ENV_VAR_OLLAMA_TEMPERATURE]
        ? parseFloat(process.env[exports.ENV_VAR_OLLAMA_TEMPERATURE])
        : undefined,
      maxTokens: process.env[exports.ENV_VAR_OLLAMA_MAX_TOKENS]
        ? parseInt(process.env[exports.ENV_VAR_OLLAMA_MAX_TOKENS], 10)
        : undefined,
    },
    claude: {
      apiKey: process.env[exports.ENV_VAR_CLAUDE_API_KEY] ?? undefined,
      model: process.env[exports.ENV_VAR_CLAUDE_MODEL] ?? undefined,
    },
    app: {
      llmProvider: process.env[exports.ENV_VAR_LLM_PROVIDER] ?? undefined,
      shell: process.env[exports.ENV_VAR_SHELL] ?? undefined,
    },
  }
}
/**
 * Merge stored configuration with environment variables
 * Environment variables take priority over stored configuration
 */
function mergeConfig(storedConfig) {
  const envConfig = getEnvConfig()
  const mergedConfig = { ...storedConfig }
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
    if (envConfig.app.llmProvider === 'ollama' || envConfig.app.llmProvider === 'claude') {
      mergedConfig.llmProvider = envConfig.app.llmProvider
    }
    mergedConfig.shell = envConfig.app.shell ?? storedConfig.shell
  }
  return mergedConfig
}
/**
 * Return information about environment variable sources
 */
function getEnvSources() {
  return {
    url: !!process.env[exports.ENV_VAR_OLLAMA_URL],
    apiKey: !!process.env[exports.ENV_VAR_OLLAMA_API_KEY],
    model: !!process.env[exports.ENV_VAR_OLLAMA_MODEL],
    temperature: !!process.env[exports.ENV_VAR_OLLAMA_TEMPERATURE],
    maxTokens: !!process.env[exports.ENV_VAR_OLLAMA_MAX_TOKENS],
    shell: !!process.env[exports.ENV_VAR_SHELL],
    llmProvider: !!process.env[exports.ENV_VAR_LLM_PROVIDER],
    claudeApiKey: !!process.env[exports.ENV_VAR_CLAUDE_API_KEY],
    claudeModel: !!process.env[exports.ENV_VAR_CLAUDE_MODEL],
  }
}
