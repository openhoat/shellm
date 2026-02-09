// Configuration Ollama
export interface OllamaConfig {
  url: string
  apiKey?: string
  model: string
  temperature?: number
  maxTokens?: number
}

// Configuration application
export interface AppConfig {
  ollama: OllamaConfig
  theme: 'dark' | 'light'
  fontSize: number
}

// Messages IPC
export interface IpcMessage<T = unknown> {
  type: string
  payload?: T
}

// Messages terminal
export interface TerminalMessage {
  type: 'command' | 'output' | 'error'
  content: string
}

// Commande IA
export type AICommand = AICommandText | AICommandShell

export interface AICommandText {
  type: 'text'
  content: string
}

export interface AICommandShell {
  type: 'command'
  intent: string
  command: string
  explanation: string
  confidence: number
}

// Interprétation de sortie de commande
export interface CommandInterpretation {
  summary: string
  key_findings: string[]
  warnings: string[]
  errors: string[]
  recommendations: string[]
  successful: boolean
}

// Historique de conversation
export interface ConversationHistory {
  id: string
  timestamp: number
  userMessage: string
  aiResponse: AICommand
  executed: boolean
}

// Configuration par défaut et fonctions utilitaires
export { DEFAULT_CONFIG, getEnvConfig, getEnvSources, mergeConfig } from './config'
