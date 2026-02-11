import { type BrowserWindow, ipcMain } from 'electron'
import type { OllamaConfig } from '../types/types'
import { createLangChainOllamaHandlers } from './langchain-ollama'

/**
 * Create IPC handlers using LangChain-based Ollama service
 * This replaces the old manual Axios implementation with LangChain
 */
export function createOllamaHandlers(
  _mainWindow: BrowserWindow,
  initialConfig?: OllamaConfig
): void {
  const handlers = createLangChainOllamaHandlers(initialConfig)

  ipcMain.handle('ollama:init', async (_event, config: OllamaConfig) => {
    await handlers.init(config)
  })

  ipcMain.handle('ollama:generate-command', async (_event, prompt: string, context?: string[], language?: string) => {
    return await handlers.generateCommand(prompt, context, language)
  })

  ipcMain.handle('ollama:explain-command', async (_event, command: string) => {
    return await handlers.explainCommand(command)
  })

  ipcMain.handle('ollama:interpret-output', async (_event, output: string, language?: string) => {
    return await handlers.interpretOutput(output, language)
  })

  ipcMain.handle('ollama:test-connection', async () => {
    return await handlers.testConnection()
  })

  ipcMain.handle('ollama:list-models', async () => {
    return await handlers.listModels()
  })
}
