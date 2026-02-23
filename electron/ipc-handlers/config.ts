import { type BrowserWindow, ipcMain } from 'electron'
import { DEFAULT_CONFIG, getEnvSources, mergeConfig } from '../../shared/config'
import type { AppConfig } from '../../shared/types'

interface StoreType {
  get: (key: string) => unknown
  set: (key: string, value: unknown) => void
}

type WindowGetter = () => BrowserWindow | null

const VALID_LLM_PROVIDERS = ['ollama', 'claude', 'openai'] as const
const VALID_THEMES = ['dark', 'light'] as const
const VALID_CHAT_LANGUAGES = ['auto', 'en', 'fr'] as const

const isLLMSubConfig = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false
  const cfg = value as Record<string, unknown>
  if (typeof cfg.model !== 'string') return false
  if (cfg.temperature !== undefined && typeof cfg.temperature !== 'number') return false
  if (cfg.maxTokens !== undefined && typeof cfg.maxTokens !== 'number') return false
  return true
}

const isAppConfig = (value: unknown): value is AppConfig => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const config = value as Partial<AppConfig>

  // Check required ollama fields
  if (!config.ollama || typeof config.ollama !== 'object') {
    return false
  }

  if (typeof config.ollama.url !== 'string' || typeof config.ollama.model !== 'string') {
    return false
  }

  if (
    typeof config.ollama.temperature !== 'number' ||
    typeof config.ollama.maxTokens !== 'number'
  ) {
    return false
  }

  if (typeof config.theme !== 'string' || typeof config.fontSize !== 'number') {
    return false
  }

  // Validate theme value
  if (!VALID_THEMES.includes(config.theme as (typeof VALID_THEMES)[number])) {
    return false
  }

  // Validate llmProvider
  if (
    config.llmProvider !== undefined &&
    !VALID_LLM_PROVIDERS.includes(config.llmProvider as (typeof VALID_LLM_PROVIDERS)[number])
  ) {
    return false
  }

  // Validate claude sub-config if present
  if (config.claude !== undefined && !isLLMSubConfig(config.claude)) {
    return false
  }

  // Validate openai sub-config if present
  if (config.openai !== undefined && !isLLMSubConfig(config.openai)) {
    return false
  }

  // Validate shell
  if (config.shell !== undefined && typeof config.shell !== 'string') {
    return false
  }

  // Validate chatLanguage
  if (
    config.chatLanguage !== undefined &&
    !VALID_CHAT_LANGUAGES.includes(config.chatLanguage as (typeof VALID_CHAT_LANGUAGES)[number])
  ) {
    return false
  }

  return true
}

/**
 * Normalize a stored config to ensure all required fields exist (backward compat)
 */
function normalizeConfig(config: AppConfig): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    ollama: { ...DEFAULT_CONFIG.ollama, ...config.ollama },
    claude: config.claude ? { ...DEFAULT_CONFIG.claude, ...config.claude } : DEFAULT_CONFIG.claude,
    llmProvider: config.llmProvider ?? DEFAULT_CONFIG.llmProvider,
  }
}

export function createConfigHandlers(getWindow: WindowGetter, store: StoreType): void {
  // Get config (merged with environment variables)
  ipcMain.handle('config:get', async () => {
    const storedConfig = store.get('config')
    const validConfig = isAppConfig(storedConfig) ? normalizeConfig(storedConfig) : DEFAULT_CONFIG
    return mergeConfig(validConfig)
  })

  // Get environment source info (which fields come from environment)
  ipcMain.handle('config:get-env-sources', async () => {
    return getEnvSources()
  })

  // Set config
  ipcMain.handle('config:set', async (_event, config: AppConfig) => {
    if (!isAppConfig(config)) {
      throw new Error('Invalid config object')
    }

    store.set('config', config)

    // Notify renderer of config change
    const window = getWindow()
    if (window) {
      window.webContents.send('config:changed', config)
    }

    return config
  })

  // Reset config
  ipcMain.handle('config:reset', async () => {
    store.set('config', DEFAULT_CONFIG)

    // Notify renderer of config change
    const window = getWindow()
    if (window) {
      window.webContents.send('config:changed', DEFAULT_CONFIG)
    }

    return DEFAULT_CONFIG
  })
}
