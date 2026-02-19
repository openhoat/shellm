import fs from 'node:fs'
import path from 'node:path'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { stripAnsiCodes, stripOscSequences } from '@shared/ansi'
import type { AICommand, CommandInterpretation, ConversationMessage } from '@shared/types'
import { z } from 'zod'

// Constants
const MAX_CONVERSATION_HISTORY = 50
const MAX_OUTPUT_LINES = 50
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 1000

/**
 * Clean terminal output by removing ANSI codes, OSC sequences, and control characters
 */
function cleanTerminalOutput(str: string): string {
  return (
    stripOscSequences(stripAnsiCodes(str))
      .replace(/\r/g, '')
      // biome-ignore lint/suspicious/noControlCharactersInRegex: required for ANSI escape sequence stripping
      .replace(/\u001B\[\?[0-9;]*[hl]/g, '')
      // biome-ignore lint/suspicious/noControlCharactersInRegex: required for OSC sequence stripping
      .replace(/\u001B\].*?(\u0007|\u001B\\)/g, '')
      // biome-ignore lint/suspicious/noControlCharactersInRegex: required for ANSI escape sequence stripping
      .replace(/\u001B\[[0-9;]*[A-Za-z]/g, '')
      // biome-ignore lint/suspicious/noControlCharactersInRegex: required for control character removal
      .replace(/[\u0000-\u0009\u000B-\u001F]/g, '')
      .trim()
  )
}

function loadPrompt(filename: string): string {
  const promptsDir = path.join(__dirname, '..', '..', 'prompts')
  const filePath = path.join(promptsDir, filename)
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * Abstract base class for LLM providers
 * Contains shared logic for command generation, explanation, and output interpretation
 */
export abstract class BaseLLMProvider {
  protected model!: BaseChatModel
  protected temperature: number
  protected maxTokens: number

  constructor(temperature?: number, maxTokens?: number) {
    this.temperature = temperature ?? DEFAULT_TEMPERATURE
    this.maxTokens = maxTokens ?? DEFAULT_MAX_TOKENS
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

    const messages: (HumanMessage | AIMessage)[] = []

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

    const enhancedSystemPrompt = `${systemPrompt}\n\n[Language hint: User interface language is ${language}]`

    const commandSchema = z.object({
      type: z.enum(['command', 'text']),
      intent: z.string().optional(),
      command: z.string().optional(),
      explanation: z.string().optional(),
      confidence: z.number().optional(),
      content: z.string().optional(),
    })

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', enhancedSystemPrompt],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ])

    const chain = promptTemplate.pipe(this.model.withStructuredOutput(commandSchema))

    try {
      const result = await chain.invoke({ input: prompt, history: messages })

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
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for structured output errors
      console.error('[BaseLLMProvider] Structured output failed, using fallback:', error)
      let fallbackResponseText: string | null = null

      try {
        const fallbackChain = ChatPromptTemplate.fromMessages([
          ['system', enhancedSystemPrompt],
          new MessagesPlaceholder('history'),
          ['human', '{input}'],
        ]).pipe(this.model)

        const fallbackResult = await fallbackChain.invoke({ input: prompt, history: messages })
        fallbackResponseText = fallbackResult.content as string
      } catch (fallbackError) {
        const isQuotaError =
          String(fallbackError).includes('429') ||
          String(fallbackError).toLowerCase().includes('usage limit')
        return {
          type: 'text',
          content: this.getFallbackMessage(
            isQuotaError ? 'quota_exceeded' : 'parsing_failed',
            language
          ),
        }
      }

      const codeBlockMatch = fallbackResponseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      const textToSearch = codeBlockMatch ? codeBlockMatch[1] : fallbackResponseText

      let jsonMatch = textToSearch.match(/\{[^{}]*"type"[^{}]*\}/)
      if (!jsonMatch) {
        jsonMatch = textToSearch.match(/\{(?:[^{}]|\{[^{}]*\})*\}/)
      }

      if (!jsonMatch) {
        return { type: 'text', content: fallbackResponseText.trim() }
      }

      try {
        const parsed = JSON.parse(jsonMatch[0])
        const validated = commandSchema.parse(parsed)

        if (validated.type === 'text') {
          return { type: 'text', content: validated.content || '' }
        }

        return {
          type: 'command',
          intent: validated.intent || 'Execute command',
          command: validated.command || '',
          explanation: validated.explanation || '',
          confidence: validated.confidence || 0.5,
        }
      } catch (parseError) {
        // biome-ignore lint/suspicious/noConsole: Debug logging for command parsing errors
        console.error('[BaseLLMProvider] Failed to parse fallback JSON response:', parseError)
        return { type: 'text', content: fallbackResponseText.trim() }
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

    const chain = chatPrompt.pipe(this.model)

    try {
      const result = await chain.invoke({})
      return result.content as string
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for explain command errors
      console.error('[BaseLLMProvider] Failed to explain command:', error)
      return 'Unable to explain the command. Please try again.'
    }
  }

  /**
   * Interpret terminal output
   */
  async interpretOutput(output: string, language = 'en'): Promise<CommandInterpretation> {
    const cleanedOutput = cleanTerminalOutput(output)

    const lines = cleanedOutput.split('\n').slice(0, MAX_OUTPUT_LINES).join('\n')
    const systemPrompt = loadPrompt('interpret-output-prompt.md')

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['human', `{command_output}\n{language}`],
    ])

    const chain = chatPrompt.pipe(this.model)

    try {
      const result = await chain.invoke({
        command_output: lines,
        language,
      })
      const responseText = result.content as string

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
          // biome-ignore lint/suspicious/noConsole: Debug logging for interpretation parsing errors
          console.error('[BaseLLMProvider] Failed to parse interpretation JSON:', parseError)
        }
      }

      const hasErrors = /error|fail|permission denied|cannot|no such file|not found/i.test(
        cleanedOutput
      )
      const isSuccessful = !hasErrors && cleanedOutput.trim().length > 0

      const keyFindings: string[] = []
      const warnings: string[] = []
      const errors: string[] = []

      if (isSuccessful) {
        const memLine = cleanedOutput.match(
          /Mem:\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)/
        )
        if (memLine) {
          keyFindings.push(`Total memory: ${memLine[1]}`)
          keyFindings.push(`Used: ${memLine[2]}`)
          keyFindings.push(`Free: ${memLine[3]}`)
          keyFindings.push(`Available: ${memLine[6]}`)
        } else {
          const memSimple = cleanedOutput.match(
            /Mem:\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)/
          )
          if (memSimple) {
            keyFindings.push(`Total memory: ${memSimple[1]}`)
            keyFindings.push(`Used: ${memSimple[2]}`)
            keyFindings.push(`Free: ${memSimple[3]}`)
          }
        }

        const swapInfo = cleanedOutput.match(
          /Swap:\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)\s+([\d,.]+[A-Za-z]*)/
        )
        if (swapInfo) {
          keyFindings.push(`Swap total: ${swapInfo[1]}`)
          keyFindings.push(`Swap used: ${swapInfo[2]}`)
          keyFindings.push(`Swap free: ${swapInfo[3]}`)
        } else if (/Filesystem.*Size.*Used.*Avail/i.test(cleanedOutput)) {
          const dfLines = cleanedOutput.split('\n')
          for (const line of dfLines) {
            const match = line.match(
              /\/dev\/[\w]+\s+([\d.]+[A-Z]+)\s+([\d.]+[A-Z]+)\s+([\d.]+[A-Z]+)\s+([\d.]+%)\s+([\d.]+[A-Z]+)/
            )
            if (match) {
              keyFindings.push(`${match[1]}: ${match[2]} (${match[4]}% used)`)
            }
          }
        } else if (/^[\w-]+\s+/i.test(cleanedOutput)) {
          const fileCount = cleanedOutput.split('\n').filter(line => line.trim().length > 0).length
          keyFindings.push(`Listed ${fileCount} items`)
        } else if (/PID\s+.*TIME.*COMMAND/i.test(cleanedOutput)) {
          const processCount = cleanedOutput
            .split('\n')
            .filter(line => line.trim().length > 0 && !line.includes('PID')).length
          keyFindings.push(`Found ${processCount} processes`)
        } else if (/ping|ICMP|bytes from/i.test(cleanedOutput)) {
          if (/time=/i.test(cleanedOutput)) {
            const timeMatch = cleanedOutput.match(/time=([\d.]+)\s*ms/)
            if (timeMatch) {
              keyFindings.push(`Response time: ${timeMatch[1]}ms`)
            }
          }
        } else {
          const outputLines = cleanedOutput.split('\n').filter(line => line.trim().length > 0)
          if (outputLines.length > 0) {
            keyFindings.push(`Command executed successfully`)
            keyFindings.push(`Output: ${outputLines[0].substring(0, 80)}`)
          }
        }

        const warningMatches = cleanedOutput.match(/warning|deprecated|cannot/i)
        if (warningMatches) {
          warnings.push('Warnings present in output')
        }
      }

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
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for output interpretation errors
      console.error('[BaseLLMProvider] Failed to interpret output:', error)
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
  abstract testConnection(): Promise<boolean>

  /**
   * List available models from LLM provider
   */
  abstract listModels(): Promise<string[]>

  /**
   * Get localized fallback messages for error cases
   */
  protected getFallbackMessage(
    errorType: 'unable_to_generate' | 'parsing_failed' | 'quota_exceeded',
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
      quota_exceeded: {
        en: 'Your LLM usage quota has been reached. Please wait or upgrade your plan to continue.',
        fr: "Votre quota d'utilisation LLM est épuisé. Veuillez patienter ou mettre à niveau votre abonnement pour continuer.",
      },
    }
    return (
      messages[errorType][language as keyof (typeof messages)['unable_to_generate']] ||
      messages[errorType].en
    )
  }
}
