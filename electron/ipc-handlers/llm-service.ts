import type { AICommand, AppConfig } from '@shared/types'
import { type BrowserWindow, ipcMain } from 'electron'
import type { BaseLLMProvider } from './providers/base-provider'
import { ClaudeProvider } from './providers/claude-provider'
import { OllamaProvider } from './providers/ollama-provider'
import { OpenAIProvider } from './providers/openai-provider'

type WindowGetter = () => BrowserWindow | null

/**
 * Create the appropriate LLM provider based on configuration
 */
function createProvider(config: AppConfig): BaseLLMProvider {
  if (config.llmProvider === 'claude') {
    return new ClaudeProvider(config.claude)
  }
  if (config.llmProvider === 'openai') {
    return new OpenAIProvider(config.openai)
  }
  return new OllamaProvider(config.ollama)
}

/**
 * Create LLM service handlers for IPC
 *
 * @param _getWindow - Function to get the main window (unused, kept for API compatibility)
 * @param initialConfig - Initial application configuration
 */
export function createLLMHandlers(_getWindow: WindowGetter, initialConfig?: AppConfig): void {
  let service: BaseLLMProvider | null = null

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
    try {
      service = createProvider(initialConfig)
    } catch {
      // Invalid config at startup - service remains null, user will need to reconfigure
    }
  }

  // Initialize the LLM service with configuration
  ipcMain.handle('llm:init', async (_event, config: AppConfig) => {
    try {
      service = createProvider(config)
    } catch (error) {
      service = null
      throw new Error(
        `Failed to initialize LLM provider: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  })

  // Generate command from natural language
  ipcMain.handle(
    'llm:generate-command',
    async (
      _event,
      prompt: string,
      conversationHistory?: import('@shared/types').ConversationMessage[],
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
