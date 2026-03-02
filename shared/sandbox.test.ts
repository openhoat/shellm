import { describe, expect, test } from 'vitest'
import {
  generateSandboxId,
  isCommandAllowedInSandbox,
  prepareSandbox,
  type SandboxConfig,
  wrapCommandForSandbox,
} from './sandbox'

describe('sandbox', () => {
  describe('generateSandboxId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateSandboxId()
      const id2 = generateSandboxId()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^sandbox-\d+-[a-z0-9]+$/)
    })
  })

  describe('isCommandAllowedInSandbox', () => {
    test('should allow all commands when no restrictions', () => {
      expect(isCommandAllowedInSandbox('ls -la').allowed).toBe(true)
      expect(isCommandAllowedInSandbox('rm -rf /').allowed).toBe(true)
    })

    test('should block commands in blacklist', () => {
      const result = isCommandAllowedInSandbox('rm -rf /home', undefined, ['rm*'])
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('blocked in sandbox mode')
    })

    test('should allow commands not in blacklist', () => {
      const result = isCommandAllowedInSandbox('ls -la', undefined, ['rm*'])
      expect(result.allowed).toBe(true)
    })

    test('should only allow whitelisted commands', () => {
      const result = isCommandAllowedInSandbox('rm -rf /', ['ls', 'cat'], undefined)
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('not in the allowed list')
    })

    test('should allow whitelisted commands', () => {
      const result = isCommandAllowedInSandbox('ls -la', ['ls', 'cat'], undefined)
      expect(result.allowed).toBe(true)
    })

    test('should support wildcard patterns in whitelist', () => {
      const result = isCommandAllowedInSandbox('lsblk', ['ls*'], undefined)
      expect(result.allowed).toBe(true)
    })

    test('should support wildcard patterns in blacklist', () => {
      const result = isCommandAllowedInSandbox('mkfs.ext4', undefined, ['mkfs*'])
      expect(result.allowed).toBe(false)
    })

    test('should block dd command', () => {
      const result = isCommandAllowedInSandbox('dd if=/dev/zero of=/dev/sda', undefined, ['dd'])
      expect(result.allowed).toBe(false)
    })
  })

  describe('prepareSandbox', () => {
    test('should prepare none mode', () => {
      const result = prepareSandbox({ mode: 'none' })
      expect(result.success).toBe(true)
      expect(result.sandboxId).toBeDefined()
      expect(result.commandPrefix).toBe('')
      expect(result.commandSuffix).toBe('')
    })

    test('should prepare restricted mode', () => {
      const result = prepareSandbox({ mode: 'restricted', timeout: 30000 })
      expect(result.success).toBe(true)
      expect(result.sandboxId).toBeDefined()
    })

    test('should prepare docker mode', () => {
      const result = prepareSandbox({ mode: 'docker', dockerImage: 'alpine:latest' })
      expect(result.success).toBe(true)
      expect(result.sandboxId).toBeDefined()
      expect(result.commandPrefix).toContain('docker run')
      expect(result.commandSuffix).toBe('"')
    })

    test('should prepare docker mode with read-only mount', () => {
      const result = prepareSandbox({
        mode: 'docker',
        dockerImage: 'alpine:latest',
        readOnlyMount: true,
        workDir: '/home/user/project',
      })
      expect(result.success).toBe(true)
      expect(result.commandPrefix).toContain(':ro')
      expect(result.commandPrefix).toContain('/home/user/project')
    })

    test('should fail system mode on non-Linux', () => {
      // This test depends on the platform
      const result = prepareSandbox({ mode: 'system' })
      if (process.platform !== 'linux') {
        expect(result.success).toBe(false)
        expect(result.error).toContain('only available on Linux')
      }
    })
  })

  describe('wrapCommandForSandbox', () => {
    test('should return error for blocked command', () => {
      const config: SandboxConfig = {
        mode: 'restricted',
        blockedCommands: ['rm*'],
      }
      const result = wrapCommandForSandbox('rm -rf /', config)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('blocked in sandbox mode')
    })

    test('should wrap command in none mode', () => {
      const config: SandboxConfig = { mode: 'none' }
      const result = wrapCommandForSandbox('ls -la', config)
      expect(result.wrappedCommand).toBe('ls -la')
      expect(result.sandboxId).toBeDefined()
    })

    test('should wrap command in docker mode', () => {
      const config: SandboxConfig = {
        mode: 'docker',
        dockerImage: 'alpine:latest',
      }
      const result = wrapCommandForSandbox('ls -la', config)
      expect(result.wrappedCommand).toContain('docker run')
      expect(result.wrappedCommand).toContain('ls -la')
      expect(result.sandboxId).toBeDefined()
    })

    test('should preserve command arguments', () => {
      const config: SandboxConfig = { mode: 'none' }
      const result = wrapCommandForSandbox('find . -name "*.ts" -type f', config)
      expect(result.wrappedCommand).toBe('find . -name "*.ts" -type f')
    })
  })
})
