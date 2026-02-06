import type { AICommand, ConversationHistory } from '@shared/types'
import { describe, expect, test } from 'vitest'
import { chatService } from './chatService'

describe('chatService', () => {
  describe('formatConfidence', () => {
    test('should format 0.95 as 95%', () => {
      expect(chatService.formatConfidence(0.95)).toBe('95%')
    })

    test('should format 0.5 as 50%', () => {
      expect(chatService.formatConfidence(0.5)).toBe('50%')
    })

    test('should format 1.0 as 100%', () => {
      expect(chatService.formatConfidence(1.0)).toBe('100%')
    })

    test('should format 0.0 as 0%', () => {
      expect(chatService.formatConfidence(0.0)).toBe('0%')
    })
  })

  describe('canExecuteCommand', () => {
    test('should return true when terminalPid is set', () => {
      expect(chatService.canExecuteCommand(12345)).toBe(true)
    })

    test('should return false when terminalPid is null', () => {
      expect(chatService.canExecuteCommand(null)).toBe(false)
    })

    test('should return false when terminalPid is 0', () => {
      expect(chatService.canExecuteCommand(0)).toBe(true)
    })
  })

  describe('extractRecentCommands', () => {
    const conversation: ConversationHistory[] = [
      {
        id: '1',
        timestamp: Date.now(),
        userMessage: 'Liste les fichiers',
        aiResponse: {
          type: 'command',
          intent: 'list_files',
          command: 'ls -la',
          explanation: 'Liste',
          confidence: 0.95,
        },
        executed: true,
      },
      {
        id: '2',
        timestamp: Date.now(),
        userMessage: 'Comment ça marche ?',
        aiResponse: {
          type: 'text',
          content: 'Réponse',
        },
        executed: false,
      },
      {
        id: '3',
        timestamp: Date.now(),
        userMessage: 'Détails du dossier',
        aiResponse: {
          type: 'command',
          intent: 'list_files',
          command: 'ls -lh',
          explanation: 'Détails',
          confidence: 0.9,
        },
        executed: false,
      },
    ]

    test('should extract command responses only', () => {
      const commands = chatService.extractRecentCommands(conversation)
      expect(commands).toEqual(['ls -la', 'ls -lh'])
    })

    test('should limit to 5 commands by default', () => {
      const longConversation: ConversationHistory[] = Array.from({ length: 10 }, (_, i) => ({
        id: i.toString(),
        timestamp: Date.now(),
        userMessage: 'Test',
        aiResponse: {
          type: 'command',
          intent: 'test',
          command: `command${i}`,
          explanation: 'Test',
          confidence: 0.9,
        },
        executed: false,
      }))

      const commands = chatService.extractRecentCommands(longConversation)
      expect(commands).toHaveLength(5)
    })

    test('should respect custom limit', () => {
      const commands = chatService.extractRecentCommands(conversation, 1)
      expect(commands).toEqual(['ls -lh'])
    })
  })

  describe('createHistoryEntry', () => {
    test('should create a history entry with required fields', () => {
      const aiResponse: AICommand = {
        type: 'command',
        intent: 'list_files',
        command: 'ls -la',
        explanation: 'Liste',
        confidence: 0.95,
      }

      const entry = chatService.createHistoryEntry('Liste les fichiers', aiResponse)

      expect(entry.id).toBeDefined()
      expect(entry.timestamp).toBeDefined()
      expect(entry.userMessage).toBe('Liste les fichiers')
      expect(entry.aiResponse).toEqual(aiResponse)
      expect(entry.executed).toBe(false)
    })

    test('should create entry with executed = true when specified', () => {
      const aiResponse: AICommand = {
        type: 'command',
        intent: 'list_files',
        command: 'ls -la',
        explanation: 'Liste',
        confidence: 0.95,
      }

      const entry = chatService.createHistoryEntry('Test', aiResponse, true)

      expect(entry.executed).toBe(true)
    })
  })

  describe('isValidMessage', () => {
    test('should return true for non-empty message', () => {
      expect(chatService.isValidMessage('Hello')).toBe(true)
    })

    test('should return false for empty message', () => {
      expect(chatService.isValidMessage('')).toBe(false)
    })

    test('should return false for whitespace-only message', () => {
      expect(chatService.isValidMessage('   ')).toBe(false)
    })

    test('should return true for message with leading/trailing whitespace', () => {
      expect(chatService.isValidMessage('  Hello  ')).toBe(true)
    })
  })

  describe('sanitizeMessage', () => {
    test('should trim whitespace', () => {
      expect(chatService.sanitizeMessage('  Hello  ')).toBe('Hello')
    })

    test('should return empty string for whitespace-only', () => {
      expect(chatService.sanitizeMessage('   ')).toBe('')
    })

    test('should preserve inner whitespace', () => {
      expect(chatService.sanitizeMessage('Hello  World')).toBe('Hello  World')
    })
  })

  describe('formatErrorMessage', () => {
    test('should format Error object', () => {
      const error = new Error('Test error')
      expect(chatService.formatErrorMessage(error)).toBe('Test error')
    })

    test('should format unknown error', () => {
      expect(chatService.formatErrorMessage('string error')).toBe('Unknown error')
      expect(chatService.formatErrorMessage(null)).toBe('Unknown error')
      expect(chatService.formatErrorMessage(undefined)).toBe('Unknown error')
    })
  })

  describe('isCommandResponse', () => {
    test('should return true for command response', () => {
      const response: AICommand = {
        type: 'command',
        intent: 'list_files',
        command: 'ls -la',
        explanation: 'Liste',
        confidence: 0.95,
      }

      expect(chatService.isCommandResponse(response)).toBe(true)
    })

    test('should return false for text response', () => {
      const response: AICommand = {
        type: 'text',
        content: 'Hello',
      }

      expect(chatService.isCommandResponse(response)).toBe(false)
    })
  })

  describe('extractResponseContent', () => {
    test('should extract content from text response', () => {
      const response: AICommand = {
        type: 'text',
        content: 'Hello World',
      }

      expect(chatService.extractResponseContent(response)).toBe('Hello World')
    })

    test('should extract explanation from command response', () => {
      const response: AICommand = {
        type: 'command',
        intent: 'list_files',
        command: 'ls -la',
        explanation: 'Liste les fichiers',
        confidence: 0.95,
      }

      expect(chatService.extractResponseContent(response)).toBe('Liste les fichiers')
    })
  })
})
