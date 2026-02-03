Object.defineProperty(exports, '__esModule', { value: true })
exports.DEFAULT_CONFIG =
  exports.DEFAULT_OLLAMA_CONFIG =
  exports.ENV_VAR_OLLAMA_MAX_TOKENS =
  exports.ENV_VAR_OLLAMA_TEMPERATURE =
  exports.ENV_VAR_OLLAMA_MODEL =
  exports.ENV_VAR_OLLAMA_API_KEY =
  exports.ENV_VAR_OLLAMA_URL =
    void 0
exports.getEnvConfig = getEnvConfig
exports.mergeConfig = mergeConfig
exports.getEnvSources = getEnvSources
// Noms des variables d'environnement
exports.ENV_VAR_OLLAMA_URL = 'SHELLM_OLLAMA_URL'
exports.ENV_VAR_OLLAMA_API_KEY = 'SHELLM_OLLAMA_API_KEY'
exports.ENV_VAR_OLLAMA_MODEL = 'SHELLM_OLLAMA_MODEL'
exports.ENV_VAR_OLLAMA_TEMPERATURE = 'SHELLM_OLLAMA_TEMPERATURE'
exports.ENV_VAR_OLLAMA_MAX_TOKENS = 'SHELLM_OLLAMA_MAX_TOKENS'
// Configuration par défaut de l'Ollama
exports.DEFAULT_OLLAMA_CONFIG = {
  url: 'http://localhost:11434',
  // model: 'llama3.2:3b',
  model: 'gemini-3-flash-preview:cloud',
  temperature: 0.7,
  maxTokens: 1000,
}
// Configuration par défaut de l'application
exports.DEFAULT_CONFIG = {
  ollama: exports.DEFAULT_OLLAMA_CONFIG,
  theme: 'dark',
  fontSize: 14,
}
/**
 * Charge la configuration depuis les variables d'environnement
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
  }
}
/**
 * Fusionne la configuration stockée avec les variables d'environnement
 * Les variables d'environnement ont priorité sur la configuration stockée
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
  return mergedConfig
}
/**
 * Retourne les informations sur les sources des variables d'environnement
 */
function getEnvSources() {
  return {
    url: !!process.env[exports.ENV_VAR_OLLAMA_URL],
    apiKey: !!process.env[exports.ENV_VAR_OLLAMA_API_KEY],
    model: !!process.env[exports.ENV_VAR_OLLAMA_MODEL],
    temperature: !!process.env[exports.ENV_VAR_OLLAMA_TEMPERATURE],
    maxTokens: !!process.env[exports.ENV_VAR_OLLAMA_MAX_TOKENS],
  }
}
