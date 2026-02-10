import fs from 'node:fs'
import path from 'node:path'
import axios, { type AxiosInstance } from 'axios'
import { type BrowserWindow, ipcMain } from 'electron'
import type { AICommand, CommandInterpretation } from '../types/types'

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

  async generateCommand(prompt: string, context?: string[], language: string = 'en'): Promise<AICommand> {
    const systemPrompt = loadPrompt('system-prompt.md')

    let fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`

    if (context && context.length > 0) {
      fullPrompt += `\n\nRecent commands for context:\n${context.join('\n')}`
    }

    // Add language hint to help the AI detect the user's language
    fullPrompt += `\n\n[Language hint: User interface language is ${language}]`
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

    // Try multiple patterns to find valid JSON
    let jsonMatch = responseText.match(/\{[\s\S]*"type"[\s\S]*}/)
    if (!jsonMatch) {
      jsonMatch = responseText.match(/\{[\s\S]*}/)
    }

    if (!jsonMatch) {
      // Fallback: return a text response instead of throwing an error
      return {
        type: 'text',
        content: this.getFallbackMessage('unable_to_generate', language),
      }
    }

    try {
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
    } catch (_parseError) {
      // Fallback: return a text response if JSON parsing fails
      return {
        type: 'text',
        content: this.getFallbackMessage('parsing_failed', language),
      }
    }
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

  async interpretOutput(output: string, language = 'en'): Promise<CommandInterpretation> {
    // Limit output to first 50 lines to reduce processing time
    const lines = output.split('\n').slice(0, 50).join('\n')
    const systemPrompt = loadPrompt('interpret-output-prompt.md')
    const prompt = systemPrompt.replace('{command_output}', lines).replace('{language}', language)

    try {
      const response = await this.#axiosInstance.post('/api/generate', {
        model: this.#model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1, // Very low temperature for extremely consistent JSON
          num_predict: 2000, // Increase to 2000 to allow complete JSON generation
          top_p: 0.9, // Add top_p for better quality
          repeat_penalty: 1.1, // Avoid repetition
        },
      })

      const responseText = response.data.response

      // Try multiple patterns to find JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        // Fallback: create a simple interpretation based on the output
        const hasErrors = /error|fail|permission denied|cannot|no such file/i.test(output)
        const isSuccessful = !hasErrors && output.trim().length > 0

        return {
          summary: isSuccessful ? 'Command executed successfully' : 'Command encountered issues',
          key_findings: isSuccessful ? ['Output received from command'] : [],
          warnings: [],
          errors: hasErrors ? ['Command encountered errors'] : [],
          recommendations: hasErrors ? ['Check command syntax and permissions'] : [],
          successful: isSuccessful,
        }
      }

      try {
        const result = JSON.parse(jsonMatch[0])

        return {
          summary: result.summary || 'Command output received',
          key_findings: Array.isArray(result.key_findings) ? result.key_findings : [],
          warnings: Array.isArray(result.warnings) ? result.warnings : [],
          errors: Array.isArray(result.errors) ? result.errors : [],
          recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
          successful: result.successful ?? true,
        }
      } catch (_parseError) {
        // Fallback if JSON parsing fails
        return {
          summary: 'Unable to parse interpretation',
          key_findings: [],
          warnings: [],
          errors: ['Failed to parse AI response'],
          recommendations: ['Try running the command again'],
          successful: true,
        }
      }
    } catch (_error) {
      // Fallback: create a simple interpretation based on the output
      const hasErrors = /error|fail|permission denied|cannot|no such file/i.test(output)
      const isSuccessful = !hasErrors && output.trim().length > 0

      return {
        summary: isSuccessful ? 'Command executed successfully' : 'Command encountered issues',
        key_findings: isSuccessful ? ['Output received from command'] : [],
        warnings: [],
        errors: hasErrors ? ['Command encountered errors'] : [],
        recommendations: hasErrors ? ['Check command syntax and permissions'] : [],
        successful: isSuccessful,
      }
    }
  }

  /**
   * Get localized fallback messages for error cases
   */
  private getFallbackMessage(errorType: 'unable_to_generate' | 'parsing_failed', language: string): string {
    const messages = {
      unable_to_generate: {
        en: "I couldn't generate a command for that request. Could you please clarify what you'd like me to do?",
        fr: "Je n'ai pas pu générer de commande pour cette demande. Pourriez-vous préciser ce que vous souhaitez que je fasse ?",
      },
      parsing_failed: {
        en: "I had trouble understanding that request. Could you try rephrasing it or providing more details?",
        fr: "J'ai eu du mal à comprendre cette demande. Pourriez-vous la reformuler ou donner plus de détails ?",
      },
    }
    return messages[errorType][language as keyof typeof messages['unable_to_generate']] || messages[errorType].en
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

  ipcMain.handle('ollama:generate-command', async (_event, prompt: string, context?: string[], language?: string) => {
    if (!service) {
      throw new Error('Ollama service not initialized')
    }
    return await service.generateCommand(prompt, context, language)
  })

  ipcMain.handle('ollama:explain-command', async (_event, command: string) => {
    if (!service) {
      throw new Error('Ollama service not initialized')
    }
    return await service.explainCommand(command)
  })

  ipcMain.handle('ollama:interpret-output', async (_event, output: string, language?: string) => {
    if (!service) {
      throw new Error('Ollama service not initialized')
    }
    return await service.interpretOutput(output, language)
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
