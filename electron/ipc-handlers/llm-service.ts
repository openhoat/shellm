import fs from 'node:fs'
import path from 'node:path'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { ChatOllama } from '@langchain/ollama'
import type {
  AICommand,
  CommandInterpretation,
  ConversationMessage,
  OllamaConfig,
} from '@shared/types'
import { type BrowserWindow, ipcMain } from 'electron'
import { z } from 'zod'

// Constants
const MAX_CONVERSATION_HISTORY = 50
const MAX_OUTPUT_LINES = 50
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 1000

/**
 * Strip ANSI escape codes from a string
 * Handles standard ANSI color/style codes
 */
function stripAnsiCodes(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI codes require control characters
  const ansiRegex = /\x1B\[[0-9;]*[mGKH]/g
  return str.replace(ansiRegex, '')
}

/**
 * Strip OSC (Operating System Command) sequences from a string
 * Handles OSC sequences like window titles, clipboard operations, etc.
 */
function stripOscSequences(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: OSC codes require control characters
  const oscRegex = /\x1B\][^\x07]*(?:\x07|\x1B\\)/g
  return str.replace(oscRegex, '')
}

/**
 * Clean terminal output by removing ANSI codes, OSC sequences, and control characters
 * This makes the output readable for LLM interpretation
 */
function cleanTerminalOutput(str: string): string {
  return stripOscSequences(stripAnsiCodes(str))
    .replace(/\r/g, '')
    .replace(/\x1B\[\?[0-9;]*[hl]/g, '') // DEC private mode (e.g., cursor visibility)
    .replace(/\x1B\].*?(\x07|\x1B\\)/g, '') // Remaining OSC sequences
    .replace(/\x1B\[[0-9;]*[A-Za-z]/g, '') // Other ANSI sequences
    .replace(/[\x00-\x09\x0B-\x1F]/g, '') // Remove other control characters except newline
    .trim()
}

/**
 * Validate Ollama URL format
 */
function validateOllamaUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    // Ensure protocol is http or https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    // Ensure hostname is not empty
    if (!parsedUrl.hostname) {
      return false
    }
    return true
  } catch {
    return false
  }
}

function loadPrompt(filename: string): string {
  const promptsDir = path.join(__dirname, '..', 'prompts')
  const filePath = path.join(promptsDir, filename)
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * LLM service with LangChain for structured output parsing
 * Designed to be provider-agnostic while currently using Ollama
 */
class LLMService {
  #model: ChatOllama
  #temperature: number
  #maxTokens: number

  constructor(config: OllamaConfig) {
    // Validate URL before creating the model
    if (!validateOllamaUrl(config.url)) {
      throw new Error(`Invalid Ollama URL: ${config.url}. URL must be a valid HTTP/HTTPS URL.`)
    }

    this.#model = new ChatOllama({
      model: config.model || 'llama2',
      baseUrl: config.url,
      temperature: config.temperature ?? DEFAULT_TEMPERATURE,
      numPredict: config.maxTokens ?? DEFAULT_MAX_TOKENS,
    })
    this.#temperature = config.temperature ?? DEFAULT_TEMPERATURE
    this.#maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS
  }

  /**
   * Generate a shell command from natural language description
   */
  async generateCommand(
    prompt: string,
    conversationHistory?: ConversationMessage[],
    language: string = 'en'
  ): Promise<AICommand> {
    const systemPrompt = loadPrompt('system-prompt.md')

    // Build messages from conversation history
    const messages: (HumanMessage | AIMessage)[] = []

    // Add conversation history (limited to last MAX_CONVERSATION_HISTORY messages to avoid token limits)
    if (conversationHistory && conversationHistory.length > 0) {
      const limitedHistory = conversationHistory.slice(-MAX_CONVERSATION_HISTORY)
      for (const msg of limitedHistory) {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content))
        } else {
          messages.push(new AIMessage(msg.content))
        }
      }
    }

    // Add language hint to the system prompt
    const enhancedSystemPrompt = `${systemPrompt}\n\n[Language hint: User interface language is ${language}]`

    // Define the Zod schema for structured output
    const commandSchema = z.object({
      type: z.enum(['command', 'text']),
      intent: z.string().optional(),
      command: z.string().optional(),
      explanation: z.string().optional(),
      confidence: z.number().optional(),
      content: z.string().optional(),
    })

    // Create prompt template with conversation history support
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', enhancedSystemPrompt],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ])

    // Use LangChain's withStructuredOutput for better parsing
    const chain = promptTemplate.pipe(this.#model.withStructuredOutput(commandSchema))

    try {
      const result = await chain.invoke({ input: prompt, history: messages })

      // Convert LangChain result to AICommand format
      if (result.type === 'text') {
        return {
          type: 'text',
          content: result.content || '',
        }
      }

      return {
        type: 'command',
        intent: result.intent || 'Execute command',
        command: result.command || '',
        explanation: result.explanation || '',
        confidence: result.confidence || 0.5,
      }
    } catch (_error) {
      // Error in generateCommand - fall back to manual parsing

      try {
        const fallbackChain = ChatPromptTemplate.fromMessages([
          ['system', enhancedSystemPrompt],
          new MessagesPlaceholder('history'),
          ['human', '{input}'],
        ]).pipe(this.#model)

        const fallbackResult = await fallbackChain.invoke({ input: prompt, history: messages })
        const responseText = fallbackResult.content as string

        // Try to parse JSON response manually
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

        const parsed = JSON.parse(jsonMatch[0])
        const validated = commandSchema.parse(parsed)

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
      } catch {
        // Error parsing JSON response
        return {
          type: 'text',
          content: this.getFallbackMessage('parsing_failed', language),
        }
      }
    }
  }

  /**
   * Explain a shell command
   */
  async explainCommand(command: string): Promise<string> {
    const promptTemplate = loadPrompt('explain-command-prompt.md')
    const prompt = promptTemplate.replace('{command}', command)

    const chatPrompt = ChatPromptTemplate.fromMessages([['human', prompt]])

    const chain = chatPrompt.pipe(this.#model)

    try {
      const result = await chain.invoke({})
      return result.content as string
    } catch (_error) {
      // Error in explainCommand
      return 'Unable to explain the command. Please try again.'
    }
  }

  /**
   * Interpret terminal output
   */
  async interpretOutput(output: string, language = 'en'): Promise<CommandInterpretation> {
    // Clean the output first to remove ANSI codes and control characters
    const cleanedOutput = cleanTerminalOutput(output)

    // Limit output to first MAX_OUTPUT_LINES lines to reduce processing time
    const lines = cleanedOutput.split('\n').slice(0, MAX_OUTPUT_LINES).join('\n')
    const systemPrompt = loadPrompt('interpret-output-prompt.md')

    // Escape the output to prevent template injection issues
    const _escapedOutput = lines.replace(/"/g, '\\"').replace(/\n/g, '\\n')

    // Create the messages with the output as a separate message to avoid template issues
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['human', `{command_output}\n{language}`],
    ])

    const chain = chatPrompt.pipe(this.#model)

    try {
      const result = await chain.invoke({
        command_output: lines,
        language,
      })
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
        } catch (_parseError) {
          // Error parsing interpretation JSON
        }
      }

      // Fallback: intelligent interpretation based on output analysis
      const hasErrors = /error|fail|permission denied|cannot|no such file|not found/i.test(
        cleanedOutput
      )
      const isSuccessful = !hasErrors && cleanedOutput.trim().length > 0

      const keyFindings: string[] = []
      const warnings: string[] = []
      const errors: string[] = []

      // Analyze specific command outputs
      if (isSuccessful) {
        // Memory analysis (free command)
        // The output format is: Mem: total used free shared buff/cache available
        // We need to capture units (Gi, Mi, etc.) in addition to numbers
        const memLine = cleanedOutput.match(
          /Mem:\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)/
        )
        if (memLine) {
          keyFindings.push(`Total memory: ${memLine[1]}`)
          keyFindings.push(`Used: ${memLine[2]}`)
          keyFindings.push(`Free: ${memLine[3]}`)
          keyFindings.push(`Available: ${memLine[6]}`)
        } else {
          // Fallback to simpler regex for older free output format
          const memSimple = cleanedOutput.match(
            /Mem:\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)/
          )
          if (memSimple) {
            keyFindings.push(`Total memory: ${memSimple[1]}`)
            keyFindings.push(`Used: ${memSimple[2]}`)
            keyFindings.push(`Free: ${memSimple[3]}`)
          }
        }

        // Swap analysis
        const swapInfo = cleanedOutput.match(
          /Swap:\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)/
        )
        if (swapInfo) {
          keyFindings.push(`Swap total: ${swapInfo[1]}`)
          keyFindings.push(`Swap used: ${swapInfo[2]}`)
          keyFindings.push(`Swap free: ${swapInfo[3]}`)
        }

        // Disk usage analysis (df command)
        else if (/Filesystem.*Size.*Used.*Avail/i.test(cleanedOutput)) {
          const dfLines = cleanedOutput.split('\n')
          for (const line of dfLines) {
            const match = line.match(
              /\/dev\/[\w]+\s+([\d.]+[A-Z]+)\s+([\d.]+[A-Z]+)\s+([\d.]+[A-Z]+)\s+([\d.]+%)\s+([\d.]+[A-Z]+)/
            )
            if (match) {
              keyFindings.push(`${match[1]}: ${match[2]} (${match[4]}% used)`)
            }
          }
        }

        // File listing (ls command)
        else if (/^[\w-]+\s+/i.test(cleanedOutput)) {
          const fileCount = cleanedOutput.split('\n').filter(line => line.trim().length > 0).length
          keyFindings.push(`Listed ${fileCount} items`)
        }

        // Process listing (ps command)
        else if (/PID\s+.*TIME.*COMMAND/i.test(cleanedOutput)) {
          const processCount = cleanedOutput
            .split('\n')
            .filter(line => line.trim().length > 0 && !line.includes('PID')).length
          keyFindings.push(`Found ${processCount} processes`)
        }

        // Network info (ping, ip, etc.)
        else if (/ping|ICMP|bytes from/i.test(cleanedOutput)) {
          if (/time=/i.test(cleanedOutput)) {
            const timeMatch = cleanedOutput.match(/time=([\d.]+)\s*ms/)
            if (timeMatch) {
              keyFindings.push(`Response time: ${timeMatch[1]}ms`)
            }
          }
        }

        // Generic successful output
        else {
          const outputLines = cleanedOutput.split('\n').filter(line => line.trim().length > 0)
          if (outputLines.length > 0) {
            keyFindings.push(`Command executed successfully`)
            keyFindings.push(`Output: ${outputLines[0].substring(0, 80)}`)
          }
        }

        // Check for warnings
        const warningMatches = cleanedOutput.match(/warning|deprecated|cannot/i)
        if (warningMatches) {
          warnings.push('Warnings present in output')
        }
      }

      // Error extraction
      if (hasErrors) {
        const errorLinesList = cleanedOutput.split('\n').filter(line => line.trim().length > 0)
        const errorLines = errorLinesList.filter(line =>
          /error|fail|denied|cannot|no such file|not found/i.test(line)
        )

        if (errorLines.length > 0) {
          errors.push(errorLines[0].substring(0, 120))
        } else if (errorLinesList.length > 0) {
          errors.push(errorLinesList[0].substring(0, 120))
        }
      }

      return {
        summary: isSuccessful ? 'Command executed successfully' : 'Command encountered issues',
        key_findings: keyFindings.length > 0 ? keyFindings : ['Output received from command'],
        warnings,
        errors,
        recommendations: hasErrors ? ['Check command syntax and permissions'] : [],
        successful: isSuccessful,
      }
    } catch (_error) {
      // Error in interpretOutput
      // Fallback: simple interpretation based on cleaned output
      const cleanedFallbackOutput = cleanTerminalOutput(output)
      const hasErrors = /error|fail|permission denied|cannot|no such file/i.test(
        cleanedFallbackOutput
      )
      const isSuccessful = !hasErrors && cleanedFallbackOutput.trim().length > 0

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
   * Test connection to LLM provider
   */
  async testConnection(): Promise<boolean> {
    try {
      // Simple test call
      const chain = ChatPromptTemplate.fromMessages([['human', 'Hi']]).pipe(this.#model)
      await chain.invoke({})
      return true
    } catch (_error) {
      // Connection test failed
      return false
    }
  }

  /**
   * List available models from LLM provider
   */
  async listModels(): Promise<string[]> {
    try {
      // Access the Ollama API directly
      const response = await fetch(`${this.#model.baseUrl}/api/tags`)
      const data = (await response.json()) as { models: { name: string }[] }
      return data.models.map(model => model.name)
    } catch (_error) {
      // Error listing models
      return []
    }
  }

  /**
   * Get localized fallback messages for error cases
   */
  private getFallbackMessage(
    errorType: 'unable_to_generate' | 'parsing_failed',
    language: string
  ): string {
    const messages = {
      unable_to_generate: {
        en: "I couldn't generate a command for that request. Could you please clarify what you'd like me to do?",
        fr: "Je n'ai pas pu générer de commande pour cette demande. Pourriez-vous préciser ce que vous souhaitez que je fasse ?",
      },
      parsing_failed: {
        en: 'I had trouble understanding that request. Could you try rephrasing it or providing more details?',
        fr: "J'ai eu du mal à comprendre cette demande. Pourriez-vous la reformuler ou donner plus de détails ?",
      },
    }
    return (
      messages[errorType][language as keyof (typeof messages)['unable_to_generate']] ||
      messages[errorType].en
    )
  }
}

/**
 * Create LLM service handlers for IPC
 * Provides a unified interface for LLM interactions (currently using LangChain + Ollama)
 *
 * @param mainWindow - Electron main window (unused, kept for API compatibility)
 * @param initialConfig - Initial LLM configuration
 * @returns IPC handlers setup function
 */
export function createLLMHandlers(_mainWindow: BrowserWindow, initialConfig?: OllamaConfig): void {
  let service: LLMService | null = null

  // Check for E2E test mock mode (parse safely)
  let mockErrors: Record<string, string> | null = null
  try {
    if (process.env.SHELLM_E2E_MOCK_ERRORS) {
      mockErrors = JSON.parse(process.env.SHELLM_E2E_MOCK_ERRORS)
    }
  } catch {
    // Invalid JSON, ignore
  }

  const mockConnectionFailed = process.env.SHELLM_E2E_MOCK_CONNECTION_FAILED === 'true'

  let mockModels: string[] | null = null
  try {
    if (process.env.SHELLM_E2E_MOCK_MODELS) {
      mockModels = JSON.parse(process.env.SHELLM_E2E_MOCK_MODELS)
    }
  } catch {
    // Invalid JSON, ignore
  }

  let mockAIResponse: AICommand | null = null
  try {
    if (process.env.SHELLM_E2E_MOCK_AI_RESPONSE) {
      mockAIResponse = JSON.parse(process.env.SHELLM_E2E_MOCK_AI_RESPONSE)
    }
  } catch {
    // Invalid JSON, ignore
  }

  if (initialConfig) {
    service = new LLMService(initialConfig)
  }

  // Initialize the LLM service with configuration
  ipcMain.handle('llm:init', async (_event, config: OllamaConfig) => {
    service = new LLMService(config)
  })

  // Generate command from natural language
  ipcMain.handle(
    'llm:generate-command',
    async (
      _event,
      prompt: string,
      conversationHistory?: ConversationMessage[],
      language?: string
    ) => {
      // E2E mock: simulate errors
      if (mockErrors?.llmGenerate) {
        throw new Error(mockErrors.llmGenerate)
      }

      // E2E mock: return predefined response
      if (mockAIResponse) {
        return mockAIResponse
      }

      if (!service) {
        throw new Error('LLM service not initialized')
      }
      return await service.generateCommand(prompt, conversationHistory, language)
    }
  )

  // Explain a shell command
  ipcMain.handle('llm:explain-command', async (_event, command: string) => {
    if (!service) {
      throw new Error('LLM service not initialized')
    }
    return await service.explainCommand(command)
  })

  // Interpret terminal output
  ipcMain.handle('llm:interpret-output', async (_event, output: string, language?: string) => {
    if (!service) {
      throw new Error('LLM service not initialized')
    }
    return await service.interpretOutput(output, language)
  })

  // Test connection to LLM provider
  ipcMain.handle('llm:test-connection', async () => {
    // E2E mock: simulate connection failure
    if (mockConnectionFailed) {
      return false
    }

    if (!service) {
      throw new Error('LLM service not initialized')
    }
    return await service.testConnection()
  })

  // List available models
  ipcMain.handle('llm:list-models', async () => {
    // E2E mock: return predefined models
    if (mockModels) {
      return mockModels
    }

    if (!service) {
      throw new Error('LLM service not initialized')
    }
    return await service.listModels()
  })
}
