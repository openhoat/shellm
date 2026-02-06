import fs from 'node:fs'
import path from 'node:path'
import axios, { type AxiosInstance } from 'axios'
import { type BrowserWindow, ipcMain } from 'electron'
import type { AICommand } from '../types/types'

function loadPrompt(filename: string): string {
  const promptsDir = path.join(__dirname, '..', 'prompts')
  const filePath = path.join(promptsDir, filename)
  return fs.readFileSync(filePath, 'utf-8')
}

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
    const systemPrompt = loadPrompt('system-prompt.md')

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
    const promptTemplate = loadPrompt('explain-command-prompt.md')
    const prompt = promptTemplate.replace('{command}', command)
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
