import type {
  AICommand,
  AppConfig,
  Conversation,
  ConversationMessage,
  StreamingProgress,
} from '@shared/types'

/**
 * Result of waiting for shell prompt
 */
export interface WaitForPromptResult {
  /** Whether a prompt was detected */
  detected: boolean
  /** The captured output */
  output: string
  /** Whether the wait timed out */
  timedOut: boolean
}

/**
 * Configuration options for prompt detection
 */
export interface PromptDetectionOptions {
  /** Maximum time to wait for prompt detection (ms) */
  maxWaitTimeMs?: number
  /** Interval between prompt checks (ms) */
  checkIntervalMs?: number
  /** Minimum time to wait before checking for prompt (ms) */
  minWaitTimeMs?: number
  /** Additional custom prompt patterns (regex strings) */
  customPatterns?: string[]
}

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
    llmProvider: boolean
    claudeApiKey: boolean
    claudeModel: boolean
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
  terminalWaitForPrompt: (
    pid: number,
    options?: PromptDetectionOptions
  ) => Promise<WaitForPromptResult>

  // Terminal events (return unsubscribe functions for cleanup)
  onTerminalData: (callback: (data: { pid: number; data: string }) => void) => () => void
  onTerminalExit: (callback: (data: { pid: number; code: number }) => void) => () => void

  // LLM
  llmInit: (config: AppConfig) => Promise<void>
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

  // LLM Streaming
  llmStreamCommand: (
    requestId: string,
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ) => Promise<AICommand>
  llmCancelStream: (requestId: string) => Promise<boolean>
  onLlmStreamProgress: (
    requestId: string,
    callback: (progress: StreamingProgress) => void
  ) => () => void

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
