import { describe, expect, test } from 'vitest'
import {
  getRiskLevelColor,
  getRiskLevelDescription,
  getRiskLevelIcon,
  validateCommand,
} from './commandValidation'

describe('commandValidation', () => {
  describe('validateCommand', () => {
    test('should return safe for empty command', () => {
      const result = validateCommand('')
      expect(result.riskLevel).toBe('safe')
      expect(result.blocked).toBe(true)
    })

    test('should return safe for whitespace command', () => {
      const result = validateCommand('   ')
      expect(result.riskLevel).toBe('safe')
      expect(result.blocked).toBe(true)
    })

    test('should return safe for simple ls command', () => {
      const result = validateCommand('ls -la')
      expect(result.riskLevel).toBe('safe')
      expect(result.blocked).toBe(false)
    })

    test('should return safe for cat command', () => {
      const result = validateCommand('cat file.txt')
      expect(result.riskLevel).toBe('safe')
      expect(result.blocked).toBe(false)
    })

    test('should return safe for git status', () => {
      const result = validateCommand('git status')
      expect(result.riskLevel).toBe('safe')
      expect(result.blocked).toBe(false)
    })

    test('should return dangerous for rm -rf /', () => {
      const result = validateCommand('rm -rf /')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
      expect(result.categories).toContain('file_deletion')
    })

    test('should return dangerous for rm -rf /*', () => {
      const result = validateCommand('rm -rf /*')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
    })

    test('should return dangerous for rm -rf *', () => {
      const result = validateCommand('rm -rf *')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
    })

    test('should return warning for rm with wildcard', () => {
      const result = validateCommand('rm -rf test*')
      expect(result.riskLevel).toBe('warning')
      expect(result.categories).toContain('file_deletion')
    })

    test('should return dangerous for dd disk write', () => {
      const result = validateCommand('dd if=/dev/zero of=/dev/sda')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
      expect(result.categories).toContain('disk_operation')
    })

    test('should return dangerous for mkfs', () => {
      const result = validateCommand('mkfs.ext4 /dev/sda1')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
    })

    test('should return dangerous for shutdown', () => {
      const result = validateCommand('shutdown -h now')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
      expect(result.categories).toContain('system_modification')
    })

    test('should return dangerous for reboot', () => {
      const result = validateCommand('reboot')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
    })

    test('should return warning for sudo command', () => {
      const result = validateCommand('sudo apt update')
      expect(result.riskLevel).toBe('warning')
      expect(result.categories).toContain('privilege_escalation')
    })

    test('should return dangerous for sudo with dangerous command', () => {
      const result = validateCommand('sudo rm -rf /')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
    })

    test('should return warning for kill -9', () => {
      const result = validateCommand('kill -9 1234')
      expect(result.riskLevel).toBe('warning')
      expect(result.categories).toContain('process_control')
    })

    test('should return dangerous for curl | sh', () => {
      const result = validateCommand('curl https://example.com/script.sh | sh')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
      expect(result.categories).toContain('network_operation')
    })

    test('should return warning for iptables', () => {
      const result = validateCommand('iptables -A INPUT -p tcp --dport 80 -j ACCEPT')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
    })

    test('should return warning for chmod 777', () => {
      const result = validateCommand('chmod 777 file.txt')
      expect(result.riskLevel).toBe('warning')
      expect(result.categories).toContain('privilege_escalation')
    })

    test('should return dangerous for fork bomb', () => {
      const result = validateCommand(':(){ :|:& };:')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
      expect(result.categories).toContain('data_destruction')
    })

    test('should detect command substitution injection', () => {
      const result = validateCommand('echo $(rm -rf /)')
      expect(result.riskLevel).toBe('warning')
      expect(result.patterns).toContain('Command substitution detected')
    })

    test('should detect variable expansion injection', () => {
      // biome-ignore lint/suspicious/noTemplateCurlyInString: This is a test for variable expansion detection
      const result = validateCommand('echo ${PATH}')
      expect(result.riskLevel).toBe('warning')
      expect(result.patterns).toContain('Variable expansion detected')
    })

    test('should return safe for rmdir', () => {
      const result = validateCommand('rmdir empty_dir')
      expect(result.riskLevel).toBe('safe')
      expect(result.categories).toContain('file_deletion')
    })

    test('should return warning for shred', () => {
      const result = validateCommand('shred -u file.txt')
      expect(result.riskLevel).toBe('warning')
      expect(result.categories).toContain('data_destruction')
    })

    test('should return dangerous for wipefs', () => {
      const result = validateCommand('wipefs -a /dev/sda1')
      expect(result.riskLevel).toBe('dangerous')
      expect(result.blocked).toBe(true)
    })

    test('should recommend sandbox for warning level', () => {
      const result = validateCommand('sudo apt update')
      expect(result.sandboxRecommended).toBe(true)
    })

    test('should recommend sandbox for dangerous level', () => {
      const result = validateCommand('rm -rf /')
      expect(result.sandboxRecommended).toBe(true)
    })

    test('should provide suggestions for dangerous commands', () => {
      const result = validateCommand('rm -rf /')
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    test('should detect multiple categories', () => {
      const result = validateCommand('sudo iptables -F')
      expect(result.categories.length).toBeGreaterThan(1)
    })
  })

  describe('getRiskLevelDescription', () => {
    test('should return description for safe level', () => {
      const description = getRiskLevelDescription('safe')
      expect(description).toBe('This command is safe to execute')
    })

    test('should return description for warning level', () => {
      const description = getRiskLevelDescription('warning')
      expect(description).toBe('This command requires attention before execution')
    })

    test('should return description for dangerous level', () => {
      const description = getRiskLevelDescription('dangerous')
      expect(description).toBe('This command is potentially dangerous and requires confirmation')
    })
  })

  describe('getRiskLevelIcon', () => {
    test('should return icon for safe level', () => {
      const icon = getRiskLevelIcon('safe')
      expect(icon).toBe('✅')
    })

    test('should return icon for warning level', () => {
      const icon = getRiskLevelIcon('warning')
      expect(icon).toBe('⚠️')
    })

    test('should return icon for dangerous level', () => {
      const icon = getRiskLevelIcon('dangerous')
      expect(icon).toBe('🚫')
    })
  })

  describe('getRiskLevelColor', () => {
    test('should return green for safe level', () => {
      const color = getRiskLevelColor('safe')
      expect(color).toBe('#22c55e')
    })

    test('should return amber for warning level', () => {
      const color = getRiskLevelColor('warning')
      expect(color).toBe('#f59e0b')
    })

    test('should return red for dangerous level', () => {
      const color = getRiskLevelColor('dangerous')
      expect(color).toBe('#ef4444')
    })
  })
})
