import { type BrowserWindow, ipcMain } from 'electron'
import { DEFAULT_CONFIG, getEnvSources, mergeConfig } from '../../shared/config'
import type { AppConfig } from '../../shared/types'

interface StoreType {
  get: (key: string) => unknown
  set: (key: string, value: unknown) => void
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

export function createConfigHandlers(mainWindow: BrowserWindow, store: StoreType): void {
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
    store.set('config', config)

    // Notify renderer of config change
    mainWindow.webContents.send('config:changed', config)

    return config
  })

  // Reset config
  ipcMain.handle('config:reset', async () => {
    store.set('config', DEFAULT_CONFIG)

    // Notify renderer of config change
    mainWindow.webContents.send('config:changed', DEFAULT_CONFIG)

    return DEFAULT_CONFIG
  })
}
