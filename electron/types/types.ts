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

// Historique de conversation (ancien format, à migrer vers Conversation)
export interface ConversationHistory {
  id: string
  timestamp: number
  userMessage: string
  aiResponse: AICommand
  executed: boolean
}

// Message de conversation pour le LLM
export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

// Conversation complète avec persistance
export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ConversationMessage[]
}

// Liste des conversations
export interface ConversationsList {
  conversations: Conversation[]
}
