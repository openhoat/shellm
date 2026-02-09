import type { AICommand, AppConfig, CommandInterpretation } from '@shared/types'

export interface ElectronAPI {
  // Config
  getConfig: () => Promise<AppConfig>
  getConfigEnvSources: () => Promise<{
    url: boolean
    apiKey: boolean
    model: boolean
    temperature: boolean
    maxTokens: boolean
  }>
  setConfig: (config: AppConfig) => Promise<AppConfig>
  resetConfig: () => Promise<AppConfig>

  // Terminal
  terminalCreate: () => Promise<number>
  terminalWrite: (pid: number, data: string) => Promise<void>
  terminalResize: (pid: number, cols: number, rows: number) => Promise<void>
  terminalDestroy: (pid: number) => Promise<void>
  terminalStartCapture: (pid: number) => Promise<boolean>
  terminalGetCapture: (pid: number) => Promise<string>

  // Terminal events
  onTerminalData: (callback: (data: { pid: number; data: string }) => void) => void
  onTerminalExit: (callback: (data: { pid: number; code: number }) => void) => void

  // Ollama
  ollamaInit: (config: {
    url: string
    apiKey?: string
    model: string
    temperature?: number
    maxTokens?: number
  }) => Promise<void>
  ollamaGenerateCommand: (prompt: string, context?: string[]) => Promise<AICommand>
  ollamaExplainCommand: (command: string) => Promise<string>
  ollamaInterpretOutput: (output: string, language?: string) => Promise<CommandInterpretation>
  ollamaTestConnection: () => Promise<boolean>
  ollamaListModels: () => Promise<string[]>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
