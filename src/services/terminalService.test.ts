import { describe, expect, test } from 'vitest'
import { terminalService } from './terminalService'

describe('terminalService', () => {
  describe('validateTerminal', () => {
    test('should validate when terminalPid is set', () => {
      const result = terminalService.validateTerminal(12345)

      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    test('should not validate when terminalPid is null', () => {
      const result = terminalService.validateTerminal(null)

      expect(result.valid).toBe(false)
      expect(result.error).toBe(
        "Le terminal n'est pas prêt. Veuillez réessayer dans quelques secondes."
      )
    })
  })

  describe('formatCommandForTerminal', () => {
    test('should add carriage return to command', () => {
      const formatted = terminalService.formatCommandForTerminal('ls -la')
      expect(formatted).toBe('ls -la\r')
    })

    test('should handle command with existing whitespace', () => {
      const formatted = terminalService.formatCommandForTerminal('ls -la  ')
      expect(formatted).toBe('ls -la  \r')
    })

    test('should handle empty command', () => {
      const formatted = terminalService.formatCommandForTerminal('')
      expect(formatted).toBe('\r')
    })
  })

  describe('sanitizeCommand', () => {
    test('should trim whitespace', () => {
      const sanitized = terminalService.sanitizeCommand('  ls -la  ')
      expect(sanitized).toBe('ls -la')
    })

    test('should return empty string for whitespace-only', () => {
      const sanitized = terminalService.sanitizeCommand('   ')
      expect(sanitized).toBe('')
    })

    test('should preserve inner whitespace', () => {
      const sanitized = terminalService.sanitizeCommand('ls  -la')
      expect(sanitized).toBe('ls  -la')
    })
  })

  describe('isValidCommand', () => {
    test('should return true for non-empty command', () => {
      expect(terminalService.isValidCommand('ls -la')).toBe(true)
    })

    test('should return false for empty command', () => {
      expect(terminalService.isValidCommand('')).toBe(false)
    })

    test('should return false for whitespace-only command', () => {
      expect(terminalService.isValidCommand('   ')).toBe(false)
    })

    test('should return true for command with leading/trailing whitespace', () => {
      expect(terminalService.isValidCommand('  ls -la  ')).toBe(true)
    })
  })

  describe('canExecuteCommand', () => {
    test('should return true when terminalPid is set and not loading', () => {
      expect(terminalService.canExecuteCommand(12345, false)).toBe(true)
    })

    test('should return false when terminalPid is null', () => {
      expect(terminalService.canExecuteCommand(null, false)).toBe(false)
    })

    test('should return false when loading', () => {
      expect(terminalService.canExecuteCommand(12345, true)).toBe(false)
    })

    test('should return false when both null and loading', () => {
      expect(terminalService.canExecuteCommand(null, true)).toBe(false)
    })
  })

  describe('getExecuteButtonText', () => {
    test('should return "Exécuter" when terminalPid is set', () => {
      expect(terminalService.getExecuteButtonText(12345)).toBe('Exécuter')
    })

    test('should return "Préparation..." when terminalPid is null', () => {
      expect(terminalService.getExecuteButtonText(null)).toBe('Préparation...')
    })
  })

  describe('getExecuteButtonTooltip', () => {
    test('should return correct tooltip when terminalPid is set', () => {
      expect(terminalService.getExecuteButtonTooltip(12345)).toBe('Exécuter la commande')
    })

    test('should return correct tooltip when terminalPid is null', () => {
      expect(terminalService.getExecuteButtonTooltip(null)).toBe(
        "Le terminal n'est pas encore prêt"
      )
    })
  })

  describe('isCommandSafe', () => {
    test('should return true for safe commands', () => {
      expect(terminalService.isCommandSafe('ls -la').safe).toBe(true)
      expect(terminalService.isCommandSafe('pwd').safe).toBe(true)
      expect(terminalService.isCommandSafe('grep test file.txt').safe).toBe(true)
    })

    test('should detect dangerous rm -rf / command', () => {
      const result = terminalService.isCommandSafe('rm -rf /')
      expect(result.safe).toBe(false)
      expect(result.reason).toBe('Commande potentiellement dangereuse détectée: rm -rf /')
    })

    test('should detect dangerous mkfs command', () => {
      const result = terminalService.isCommandSafe('mkfs.ext4 /dev/sda1')
      expect(result.safe).toBe(false)
      expect(result.reason).toBe('Commande potentiellement dangereuse détectée: mkfs')
    })

    test('should detect dangerous dd command', () => {
      const result = terminalService.isCommandSafe('dd if=/dev/zero of=/dev/sda')
      expect(result.safe).toBe(false)
      expect(result.reason).toBe('Commande potentiellement dangereuse détectée: dd if=/dev/zero')
    })

    test('should be case insensitive for dangerous commands', () => {
      const result = terminalService.isCommandSafe('RM -RF /')
      expect(result.safe).toBe(false)
    })

    test('should detect dangerous command even with extra text', () => {
      const result = terminalService.isCommandSafe('sudo rm -rf /home/user/test')
      expect(result.safe).toBe(false)
    })
  })
})
