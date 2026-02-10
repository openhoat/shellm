import fs from 'node:fs'
import path from 'node:path'
import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { z } from 'zod'
import type { AICommand, CommandInterpretation, OllamaConfig } from '../types/types'

function loadPrompt(filename: string): string {
  const promptsDir = path.join(__dirname, '..', 'prompts')
  const filePath = path.join(promptsDir, filename)
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * LangChain-based Ollama service with structured output parsing
 */
class LangChainOllamaService {
  #model: ChatOllama
  #temperature: number
  #maxTokens: number

  constructor(config: OllamaConfig) {
    this.#model = new ChatOllama({
      model: config.model || 'llama2',
      baseUrl: config.url,
      temperature: config.temperature ?? 0.7,
      numPredict: config.maxTokens ?? 1000,
    })
    this.#temperature = config.temperature ?? 0.7
    this.#maxTokens = config.maxTokens ?? 1000
  }

  /**
   * Generate a shell command from natural language description
   */
  async generateCommand(prompt: string, context?: string[], language: string = 'en'): Promise<AICommand> {
    const systemPrompt = loadPrompt('system-prompt.md')

    // Add language hint and instructions for JSON output
    let fullInput = prompt
    if (context && context.length > 0) {
      fullInput += `\n\nRecent commands for context:\n${context.join('\n')}`
    }
    fullInput += `\n\n[Language hint: User interface language is ${language}]`

    // Create prompt template
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['human', '{input}'],
    ])

    const chain = promptTemplate.pipe(this.#model)

    try {
      const result = await chain.invoke({ input: fullInput })
      const responseText = result.content as string

      // Try to parse JSON response
      let jsonMatch = responseText.match(/\{[\s\S]*"type"[\s\S]*\}/)
      if (!jsonMatch) {
        jsonMatch = responseText.match(/\{[\s\S]*\}/)
      }

      if (!jsonMatch) {
        return {
          type: 'text',
          content: this.getFallbackMessage('unable_to_generate', language),
        }
      }

      try {
        const parsed = JSON.parse(jsonMatch[0])
        const commandSchema = z.object({
          type: z.enum(['command', 'text']),
          intent: z.string().optional(),
          command: z.string().optional(),
          explanation: z.string().optional(),
          confidence: z.number().optional(),
          content: z.string().optional(),
        })

        const validated = commandSchema.parse(parsed)

        // Convert LangChain result to AICommand format
        if (validated.type === 'text') {
          return {
            type: 'text',
            content: validated.content || '',
          }
        }

        return {
          type: 'command',
          intent: validated.intent || 'Execute command',
          command: validated.command || '',
          explanation: validated.explanation || '',
          confidence: validated.confidence || 0.5,
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError)
        return {
          type: 'text',
          content: this.getFallbackMessage('parsing_failed', language),
        }
      }
    } catch (error) {
      console.error('Error in generateCommand:', error)
      return {
        type: 'text',
        content: this.getFallbackMessage('unable_to_generate', language),
      }
    }
  }

  /**
   * Explain a shell command
   */
  async explainCommand(command: string): Promise<string> {
    const promptTemplate = loadPrompt('explain-command-prompt.md')
    const prompt = promptTemplate.replace('{command}', command)

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['human', prompt],
    ])

    const chain = chatPrompt.pipe(this.#model)

    try {
      const result = await chain.invoke({})
      return result.content as string
    } catch (error) {
      console.error('Error in explainCommand:', error)
      return 'Unable to explain the command. Please try again.'
    }
  }

  /**
   * Interpret terminal output
   */
  async interpretOutput(output: string, language = 'en'): Promise<CommandInterpretation> {
    // Limit output to first 50 lines to reduce processing time
    const lines = output.split('\n').slice(0, 50).join('\n')
    const systemPrompt = loadPrompt('interpret-output-prompt.md')
    const prompt = systemPrompt.replace('{command_output}', lines).replace('{language}', language)

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', prompt],
    ])

    const chain = chatPrompt.pipe(this.#model)

    try {
      const result = await chain.invoke({})
      const responseText = result.content as string

      // Try to parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          const interpretationSchema = z.object({
            summary: z.string(),
            key_findings: z.array(z.string()),
            warnings: z.array(z.string()),
            errors: z.array(z.string()),
            recommendations: z.array(z.string()),
            successful: z.boolean(),
          })

          const validated = interpretationSchema.parse(parsed)

          return {
            summary: validated.summary || 'Command output received',
            key_findings: validated.key_findings || [],
            warnings: validated.warnings || [],
            errors: validated.errors || [],
            recommendations: validated.recommendations || [],
            successful: validated.successful ?? true,
          }
        } catch (parseError) {
          console.error('Error parsing interpretation JSON:', parseError)
        }
      }

      // Fallback: simple interpretation based on output
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
    } catch (error) {
      console.error('Error in interpretOutput:', error)
      // Fallback: simple interpretation based on output
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
   * Test connection to Ollama
   */
  async testConnection(): Promise<boolean> {
    try {
      // Simple test call
      const chain = ChatPromptTemplate.fromMessages([['human', 'Hi']])
        .pipe(this.#model)
      await chain.invoke({})
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      // Access the Ollama API directly through the model
      const response = await fetch(`${this.#model.baseUrl}/api/tags`)
      const data = (await response.json()) as { models: { name: string }[] }
      return data.models.map((model) => model.name)
    } catch (error) {
      console.error('Error listing models:', error)
      return []
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
}

/**
 * Create LangChain-based Ollama handlers for IPC
 */
export function createLangChainOllamaHandlers(initialConfig?: OllamaConfig) {
  let service: LangChainOllamaService | null = null

  if (initialConfig) {
    service = new LangChainOllamaService(initialConfig)
  }

  return {
    /**
     * Initialize the service with configuration
     */
    async init(config: OllamaConfig): Promise<void> {
      service = new LangChainOllamaService(config)
    },

    /**
     * Generate command from natural language
     */
    async generateCommand(prompt: string, context?: string[], language?: string): Promise<AICommand> {
      if (!service) {
        throw new Error('LangChain Ollama service not initialized')
      }
      return await service.generateCommand(prompt, context, language)
    },

    /**
     * Explain a shell command
     */
    async explainCommand(command: string): Promise<string> {
      if (!service) {
        throw new Error('LangChain Ollama service not initialized')
      }
      return await service.explainCommand(command)
    },

    /**
     * Interpret terminal output
     */
    async interpretOutput(output: string, language?: string): Promise<CommandInterpretation> {
      if (!service) {
        throw new Error('LangChain Ollama service not initialized')
      }
      return await service.interpretOutput(output, language)
    },

    /**
     * Test connection to Ollama
     */
    async testConnection(): Promise<boolean> {
      if (!service) {
        throw new Error('LangChain Ollama service not initialized')
      }
      return await service.testConnection()
    },

    /**
     * List available models
     */
    async listModels(): Promise<string[]> {
      if (!service) {
        throw new Error('LangChain Ollama service not initialized')
      }
      return await service.listModels()
    },
  }
}