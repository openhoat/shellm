import { contextBridge, ipcRenderer } from 'electron'
import type { AppConfig } from './types/types'

contextBridge.exposeInMainWorld('electronAPI', {
  // Config
  getConfig: () => ipcRenderer.invoke('config:get'),
  getConfigEnvSources: () => ipcRenderer.invoke('config:get-env-sources'),
  setConfig: (config: AppConfig) => ipcRenderer.invoke('config:set', config),
  resetConfig: () => ipcRenderer.invoke('config:reset'),

  // Terminal
  terminalCreate: () => ipcRenderer.invoke('terminal:create'),
  terminalWrite: (pid: number, data: string) => ipcRenderer.invoke('terminal:write', pid, data),
  terminalResize: (pid: number, cols: number, rows: number) =>
    ipcRenderer.invoke('terminal:resize', pid, cols, rows),
  terminalDestroy: (pid: number) => ipcRenderer.invoke('terminal:destroy', pid),
  terminalStartCapture: (pid: number) => ipcRenderer.invoke('terminal:startCapture', pid),
  terminalGetCapture: (pid: number) => ipcRenderer.invoke('terminal:getCapture', pid),

  // Terminal events
  onTerminalData: (callback: (data: { pid: number; data: string }) => void) => {
    ipcRenderer.on('terminal:data', (_event, data) => callback(data))
  },
  onTerminalExit: (callback: (data: { pid: number; code: number }) => void) => {
    ipcRenderer.on('terminal:exit', (_event, data) => callback(data))
  },

  // Ollama
  ollamaInit: (config: {
    url: string
    apiKey?: string
    model: string
    temperature?: number
    maxTokens?: number
  }) => ipcRenderer.invoke('ollama:init', config),
  ollamaGenerateCommand: (prompt: string, context?: string[]) =>
    ipcRenderer.invoke('ollama:generate-command', prompt, context),
  ollamaExplainCommand: (command: string) => ipcRenderer.invoke('ollama:explain-command', command),
  ollamaInterpretOutput: (output: string, language?: string) =>
    ipcRenderer.invoke('ollama:interpret-output', output, language),
  ollamaTestConnection: () => ipcRenderer.invoke('ollama:test-connection'),
  ollamaListModels: () => ipcRenderer.invoke('ollama:list-models'),
})
