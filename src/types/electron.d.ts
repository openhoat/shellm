import type { AICommand, AppConfig, Conversation, ConversationMessage } from '@shared/types'

export interface ElectronAPI {
  // Config
  getConfig: () => Promise<AppConfig>
  getConfigEnvSources: () => Promise<{
    url: boolean
    apiKey: boolean
    model: boolean
    temperature: boolean
    maxTokens: boolean
    shell: boolean
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

  // LLM
  llmInit: (config: {
    url: string
    apiKey?: string
    model: string
    temperature?: number
    maxTokens?: number
  }) => Promise<void>
  llmGenerateCommand: (
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ) => Promise<AICommand>
  llmExplainCommand: (command: string) => Promise<string>
  llmInterpretOutput: (
    output: string,
    language?: string
  ) => Promise<{
    summary: string
    key_findings: string[]
    warnings: string[]
    errors: string[]
    recommendations: string[]
    successful: boolean
  }>
  llmTestConnection: () => Promise<boolean>
  llmListModels: () => Promise<string[]>

  // Conversations
  conversationGetAll: () => Promise<Conversation[]>
  conversationGet: (id: string) => Promise<Conversation | null>
  conversationCreate: (firstMessage: string) => Promise<Conversation>
  conversationAddMessage: (
    conversationId: string,
    message: ConversationMessage
  ) => Promise<Conversation | null>
  conversationUpdateMessage: (
    conversationId: string,
    messageIndex: number,
    updates: Partial<ConversationMessage>
  ) => Promise<Conversation | null>
  conversationUpdate: (id: string, updates: Partial<Conversation>) => Promise<Conversation | null>
  conversationDelete: (id: string) => Promise<boolean>
  conversationClearAll: () => Promise<void>
  conversationExport: (id: string) => Promise<{
    success: boolean
    cancelled?: boolean
    filePath?: string
    error?: string
  }>
  conversationExportAll: () => Promise<{
    success: boolean
    cancelled?: boolean
    filePath?: string
    error?: string
  }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
