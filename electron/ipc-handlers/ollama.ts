import axios, { type AxiosInstance } from 'axios'
import { type BrowserWindow, ipcMain } from 'electron'
import type { AICommand } from '../types/types'

interface OllamaConfig {
  url: string
  apiKey?: string
  model: string
  temperature?: number
  maxTokens?: number
}

class OllamaService {
  #axiosInstance: AxiosInstance
  #model: string
  #temperature: number
  #maxTokens: number

  constructor(config: OllamaConfig) {
    this.#axiosInstance = axios.create({
      baseURL: config.url,
      headers: {
        Authorization: config.apiKey ? `Bearer ${config.apiKey}` : '',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    })
    this.#model = config.model || 'llama2'
    this.#temperature = config.temperature ?? 0.7
    this.#maxTokens = config.maxTokens ?? 1000
  }

  async generateCommand(prompt: string, context?: string[]): Promise<AICommand> {
    const systemPrompt = `You are a helpful assistant that converts natural language requests into shell commands.

IMPORTANT: You MUST respond with ONLY valid JSON. No additional text before or after the JSON.

Analyze the user's request and determine the appropriate response type:

IF the request is a greeting, general conversation, or does not require a shell command:
Respond with this JSON:
{"type": "text", "content": "your response in natural language"}

IF the request requires a shell command to be executed:
Respond with this JSON:
{"type": "command", "intent": "brief description", "command": "exact shell command", "explanation": "clear explanation", "confidence": 0.95}

Examples:
"Hello" -> {"type": "text", "content": "Hello! How can I help you today?"}
"List files" -> {"type": "command", "intent": "list files", "command": "ls -la", "explanation": "Lists all files", "confidence": 0.95}
"What is 2+2?" -> {"type": "text", "content": "2+2 equals 4."}
"What time is it?" -> {"type": "command", "intent": "show current time", "command": "date", "explanation": "Displays current date and time", "confidence": 0.95}

Remember: Respond with ONLY the JSON, nothing else.`

    let fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`

    if (context && context.length > 0) {
      fullPrompt += `\n\nRecent commands for context:\n${context.join('\n')}`
    }
    const response = await this.#axiosInstance.post('/api/generate', {
      model: this.#model,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: this.#temperature * 0.5,
        num_predict: this.#maxTokens,
      },
    })

    const responseText = response.data.response

    const jsonMatch = responseText.match(/\{[\s\S]*}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const result = JSON.parse(jsonMatch[0])

    if (result.type === 'text') {
      const textCommand = {
        type: 'text' as const,
        content: result.content,
      }
      return textCommand
    }

    const shellCommand = {
      type: 'command' as const,
      intent: result.intent || 'Execute command',
      command: result.command || '',
      explanation: result.explanation || '',
      confidence: result.confidence || 0.5,
    }
    return shellCommand
  }

  async explainCommand(command: string): Promise<string> {
    const prompt = `Explain this shell command in simple terms: ${command}
Focus on:
1. What the command does
2. What each flag/parameter means
3. Any important side effects or risks
Keep it concise and clear.`
    const response = await this.#axiosInstance.post('/api/generate', {
      model: this.#model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: this.#temperature,
        num_predict: Math.min(this.#maxTokens, 500),
      },
    })

    return response.data.response
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.#axiosInstance.get('/api/tags')
      return response.status === 200
    } catch (_error) {
      return false
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.#axiosInstance.get('/api/tags')
      return response.data.models.map((model: { name: string }) => model.name)
    } catch (_error) {
      return []
    }
  }
}

export function createOllamaHandlers(
  _mainWindow: BrowserWindow,
  initialConfig?: OllamaConfig
): void {
  let service: OllamaService | null = null

  if (initialConfig) {
    service = new OllamaService(initialConfig)
  }

  ipcMain.handle('ollama:init', async (_event, config: OllamaConfig) => {
    service = new OllamaService(config)
  })

  ipcMain.handle('ollama:generate-command', async (_event, prompt: string, context?: string[]) => {
    if (!service) {
      throw new Error('Ollama service not initialized')
    }
    return await service.generateCommand(prompt, context)
  })

  ipcMain.handle('ollama:explain-command', async (_event, command: string) => {
    if (!service) {
      throw new Error('Ollama service not initialized')
    }
    return await service.explainCommand(command)
  })

  ipcMain.handle('ollama:test-connection', async () => {
    if (!service) {
      throw new Error('Ollama service not initialized')
    }
    return await service.testConnection()
  })

  ipcMain.handle('ollama:list-models', async () => {
    if (!service) {
      throw new Error('Ollama service not initialized')
    }
    return await service.listModels()
  })
}
