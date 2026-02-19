import type { AppConfig, Conversation, ConversationMessage } from '@shared/types'
import { contextBridge, desktopCapturer, ipcRenderer } from 'electron'

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
  terminalWaitForPrompt: (
    pid: number,
    options?: {
      maxWaitTimeMs?: number
      checkIntervalMs?: number
      minWaitTimeMs?: number
      customPatterns?: string[]
    }
  ) => ipcRenderer.invoke('terminal:waitForPrompt', pid, options),

  // Terminal events
  onTerminalData: (callback: (data: { pid: number; data: string }) => void) => {
    ipcRenderer.on('terminal:data', (_event, data) => callback(data))
  },
  onTerminalExit: (callback: (data: { pid: number; code: number }) => void) => {
    ipcRenderer.on('terminal:exit', (_event, data) => callback(data))
  },

  // LLM
  llmInit: (config: {
    url: string
    apiKey?: string
    model: string
    temperature?: number
    maxTokens?: number
  }) => ipcRenderer.invoke('llm:init', config),
  llmGenerateCommand: (
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ) => ipcRenderer.invoke('llm:generate-command', prompt, conversationHistory, language),
  llmExplainCommand: (command: string) => ipcRenderer.invoke('llm:explain-command', command),
  llmInterpretOutput: (output: string, language?: string) =>
    ipcRenderer.invoke('llm:interpret-output', output, language),
  llmTestConnection: () => ipcRenderer.invoke('llm:test-connection'),
  llmListModels: () => ipcRenderer.invoke('llm:list-models'),

  // Conversations
  conversationGetAll: () => ipcRenderer.invoke('conversation:get-all'),
  conversationGet: (id: string) => ipcRenderer.invoke('conversation:get', id),
  conversationCreate: (firstMessage: string) =>
    ipcRenderer.invoke('conversation:create', firstMessage),
  conversationAddMessage: (conversationId: string, message: ConversationMessage) =>
    ipcRenderer.invoke('conversation:add-message', conversationId, message),
  conversationUpdateMessage: (
    conversationId: string,
    messageIndex: number,
    updates: Partial<ConversationMessage>
  ) => ipcRenderer.invoke('conversation:update-message', conversationId, messageIndex, updates),
  conversationUpdate: (id: string, updates: Partial<Conversation>) =>
    ipcRenderer.invoke('conversation:update', id, updates),
  conversationDelete: (id: string) => ipcRenderer.invoke('conversation:delete', id),
  conversationClearAll: () => ipcRenderer.invoke('conversation:clear-all'),
  conversationExport: (id: string) => ipcRenderer.invoke('conversation:export', id),
  conversationExportAll: () => ipcRenderer.invoke('conversation:export-all'),

  // Desktop capturer for demo video recording
  desktopCapturer: {
    getSources: (options: { types: Array<'screen' | 'window'> }) =>
      desktopCapturer.getSources(options),
  },
})
