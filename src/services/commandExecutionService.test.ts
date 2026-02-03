import { beforeEach, describe, expect, vi } from 'vitest'
import {
  canExecuteCommand,
  createHistoryEntryFromConversation,
  executeCommand,
  extractRecentCommands,
  formatConfidence,
  getExecuteButtonText,
  getExecuteButtonTooltip,
} from './commandExecutionService'

// Mock de l'API Electron
const mockTerminalWrite = vi.fn()

// Setup du mock pour window.electronAPI
if (!global.window.electronAPI) {
  global.window.electronAPI = {} as never
}
global.window.electronAPI.terminalWrite = mockTerminalWrite

describe('commandExecutionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('executeCommand', () => {
    test('should execute command when terminalPid is set', async () => {
      mockTerminalWrite.mockResolvedValueOnce(undefined)

      const result = await executeCommand({
        command: 'ls -la',
        terminalPid: 12345,
      })

      expect(result.success).toBe(true)
      expect(mockTerminalWrite).toHaveBeenCalledWith(12345, 'ls -la\r')
    })

    test('should return error when terminalPid is null', async () => {
      const result = await executeCommand({
        command: 'ls -la',
        terminalPid: null,
        maxRetries: 0,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe("Le terminal n'est pas prêt. Veuillez réinitialiser l'application.")
    })

    test('should handle terminalWrite errors', async () => {
      const originalConsole = console.error
      console.error = vi.fn()

      mockTerminalWrite.mockRejectedValueOnce(new Error('Connection failed'))

      const result = await executeCommand({
        command: 'ls -la',
        terminalPid: 12345,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe("Erreur lors de l'exécution: Connection failed")

      console.error = originalConsole
    })
  })

  describe('canExecuteCommand', () => {
    test('should return true when terminalPid is set', () => {
      expect(canExecuteCommand(12345)).toBe(true)
    })

    test('should return false when terminalPid is null', () => {
      expect(canExecuteCommand(null)).toBe(false)
    })

    test('should return true when terminalPid is 0', () => {
      expect(canExecuteCommand(0)).toBe(true)
    })
  })

  describe('getExecuteButtonText', () => {
    test('should return "Exécuter" when terminalPid is set', () => {
      expect(getExecuteButtonText(12345)).toBe('Exécuter')
    })

    test('should return "Préparation..." when terminalPid is null', () => {
      expect(getExecuteButtonText(null)).toBe('Préparation...')
    })
  })

  describe('getExecuteButtonTooltip', () => {
    test('should return correct tooltip when terminalPid is set', () => {
      expect(getExecuteButtonTooltip(12345)).toBe('Exécuter la commande')
    })

    test('should return correct tooltip when terminalPid is null', () => {
      expect(getExecuteButtonTooltip(null)).toBe("Le terminal n'est pas encore prêt")
    })
  })

  describe('extractRecentCommands', () => {
    const conversation = [
      { type: 'user' as const, content: 'Liste les fichiers' },
      {
        type: 'ai' as const,
        content: 'Voici la commande',
        command: { command: 'ls -la' },
      },
      { type: 'user' as const, content: 'Détails' },
      {
        type: 'ai' as const,
        content: 'Voici une autre commande',
        command: { command: 'ls -lh' },
      },
      { type: 'user' as const, content: 'Question?' },
      {
        type: 'ai' as const,
        content: 'Réponse texte',
      },
    ]

    test('should extract command responses only', () => {
      const commands = extractRecentCommands(conversation)
      expect(commands).toEqual(['ls -la', 'ls -lh'])
    })

    test('should limit to 5 commands by default', () => {
      const longConversation = Array.from({ length: 10 }, (_, i) => ({
        type: 'ai' as const,
        content: `Command ${i}`,
        command: { command: `command${i}` },
      }))

      const commands = extractRecentCommands(longConversation)
      expect(commands).toHaveLength(5)
    })

    test('should respect custom limit', () => {
      const commands = extractRecentCommands(conversation, 1)
      expect(commands).toEqual(['ls -lh'])
    })

    test('should handle empty conversation', () => {
      const commands = extractRecentCommands([])
      expect(commands).toEqual([])
    })

    test('should handle conversation without commands', () => {
      const textOnlyConversation = [
        { type: 'user' as const, content: 'Question' },
        { type: 'ai' as const, content: 'Réponse' },
      ]

      const commands = extractRecentCommands(textOnlyConversation)
      expect(commands).toEqual([])
    })
  })

  describe('createHistoryEntryFromConversation', () => {
    const validConversation = [
      { type: 'user' as const, content: 'Liste les fichiers' },
      {
        type: 'ai' as const,
        content: 'Voici la commande',
        command: { command: 'ls -la' },
      },
    ]

    test('should create history entry from conversation', () => {
      const entry = createHistoryEntryFromConversation(validConversation)

      expect(entry).toEqual({
        userMessage: 'Liste les fichiers',
        aiResponse: { command: 'ls -la' },
        executed: true,
      })
    })

    test('should return null when conversation is empty', () => {
      const entry = createHistoryEntryFromConversation([])
      expect(entry).toBeNull()
    })

    test('should return null when last entry is not a command', () => {
      const conversation = [
        { type: 'user' as const, content: 'Question' },
        { type: 'ai' as const, content: 'Réponse texte' },
      ]

      const entry = createHistoryEntryFromConversation(conversation)
      expect(entry).toBeNull()
    })

    test('should return null when there is no previous entry', () => {
      const conversation = [
        {
          type: 'ai' as const,
          content: 'Voici la commande',
          command: { command: 'ls -la' },
        },
      ]

      const entry = createHistoryEntryFromConversation(conversation)
      expect(entry).toBeNull()
    })
  })

  describe('formatConfidence', () => {
    test('should format 0.95 as 95%', () => {
      expect(formatConfidence(0.95)).toBe('95%')
    })

    test('should format 0.5 as 50%', () => {
      expect(formatConfidence(0.5)).toBe('50%')
    })

    test('should format 1.0 as 100%', () => {
      expect(formatConfidence(1.0)).toBe('100%')
    })

    test('should format 0.0 as 0%', () => {
      expect(formatConfidence(0.0)).toBe('0%')
    })
  })
})
