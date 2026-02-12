import * as path from 'node:path'
import { app, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { DEFAULT_CONFIG, mergeConfig } from '../shared/config'
import type { AppConfig } from '../shared/types'
import { createConfigHandlers } from './ipc-handlers/config'
import { createConversationHandlers } from './ipc-handlers/conversation'
import { createLLMHandlers } from './ipc-handlers/llm-service'
import { createTerminalHandlers } from './ipc-handlers/terminal'

interface StoreType {
  get: (key: string) => unknown
  set: (key: string, value: unknown) => void
}

const isStoreType = (value: unknown): value is StoreType => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const store = value as Record<string, unknown>
  return typeof store.get === 'function' && typeof store.set === 'function'
}

const isAppConfig = (value: unknown): value is AppConfig => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const config = value as Record<string, unknown>

  const ollama = config.ollama
  if (!ollama || typeof ollama !== 'object') {
    return false
  }

  const ollamaConfig = ollama as Record<string, unknown>
  if (typeof ollamaConfig.url !== 'string' || typeof ollamaConfig.model !== 'string') {
    return false
  }

  if (typeof ollamaConfig.temperature !== 'number' || typeof ollamaConfig.maxTokens !== 'number') {
    return false
  }

  if (typeof config.theme !== 'string' || typeof config.fontSize !== 'number') {
    return false
  }

  return true
}

const isDev = process.env.NODE_ENV === 'development' && !app.isPackaged

// Initialize store for configuration (with environment variables override)
const rawStore = new Store({
  defaults: {
    config: DEFAULT_CONFIG,
  },
})

const store = isStoreType(rawStore)
  ? rawStore
  : ({
      get: () => null,
      set: () => {
        /* No-op fallback */
      },
    } as StoreType)

let mainWindow: BrowserWindow | null = null

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    backgroundColor: '#1e1e1e',
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // Use relative path from compiled main.js location
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // Add error handler for loading issues
  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL) => {
      // biome-ignore lint/suspicious/noConsole: Error logging for debugging
      console.error('Failed to load:', errorCode, errorDescription, 'URL:', validatedURL)
    }
  )

  mainWindow.webContents.on('did-finish-load', () => {
    // biome-ignore lint/suspicious/noConsole: Success logging for debugging
    console.log('Page loaded successfully')
  })

  // Add keyboard shortcut to open DevTools (Ctrl+Shift+I or Cmd+Option+I)
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (
      (input.control || input.meta) &&
      input.shift &&
      (input.key.toLowerCase() === 'i' || input.key === 'I')
    ) {
      mainWindow?.webContents.toggleDevTools()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()
  if (mainWindow) {
    createTerminalHandlers(mainWindow)
    createConversationHandlers(mainWindow)

    // Get initial config and merge with environment variables
    const storedConfig = store.get('config')
    const validConfig = isAppConfig(storedConfig) ? storedConfig : DEFAULT_CONFIG
    const mergedConfig = mergeConfig(validConfig)
    createLLMHandlers(mainWindow, mergedConfig.ollama)

    createConfigHandlers(mainWindow, store)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
