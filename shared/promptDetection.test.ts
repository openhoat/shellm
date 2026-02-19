import { describe, expect, test, vi } from 'vitest'
import {
  cleanTerminalOutput,
  createPromptPattern,
  detectPrompt,
  extractPrompt,
  waitForPrompt,
  DEFAULT_PROMPT_DETECTION_CONFIG,
} from './promptDetection'

describe('promptDetection', () => {
  describe('DEFAULT_PROMPT_DETECTION_CONFIG', () => {
    test('should have correct default values', () => {
      expect(DEFAULT_PROMPT_DETECTION_CONFIG.maxWaitTimeMs).toBe(30000)
      expect(DEFAULT_PROMPT_DETECTION_CONFIG.checkIntervalMs).toBe(100)
      expect(DEFAULT_PROMPT_DETECTION_CONFIG.minWaitTimeMs).toBe(200)
    })
  })

  describe('cleanTerminalOutput', () => {
    test('should remove ANSI codes', () => {
      const input = '\x1B[32mtext\x1B[0m'
      expect(cleanTerminalOutput(input)).toBe('text')
    })

    test('should remove OSC sequences', () => {
      const input = '\x1B]0;title\x07text'
      expect(cleanTerminalOutput(input)).toBe('text')
    })

    test('should normalize CRLF to LF', () => {
      expect(cleanTerminalOutput('line1\r\nline2')).toBe('line1\nline2')
    })

    test('should normalize CR to LF', () => {
      expect(cleanTerminalOutput('line1\rline2')).toBe('line1\nline2')
    })

    test('should remove control characters except newline', () => {
      // Tab (0x09) and other control chars should be removed
      const input = 'text\x09\x00\x1F'
      expect(cleanTerminalOutput(input)).toBe('text')
    })

    test('should preserve newlines', () => {
      expect(cleanTerminalOutput('line1\nline2\nline3')).toBe('line1\nline2\nline3')
    })

    test('should handle empty string', () => {
      expect(cleanTerminalOutput('')).toBe('')
    })

    test('should handle complex terminal output', () => {
      const input = '\x1B[32m$\x1B[0m \x1B]0;user@host\x07prompt$ '
      const result = cleanTerminalOutput(input)
      expect(result).toContain('prompt$ ')
    })
  })

  describe('detectPrompt', () => {
    test('should detect bash $ prompt', () => {
      expect(detectPrompt('user@host:~$ ')).toBe(true)
    })

    test('should detect root # prompt', () => {
      expect(detectPrompt('root@host:~# ')).toBe(true)
    })

    test('should detect zsh % prompt', () => {
      expect(detectPrompt('user@host ~ % ')).toBe(true)
    })

    test('should detect fish > prompt', () => {
      expect(detectPrompt('user@host ~> ')).toBe(true)
    })

    test('should detect Powerline prompt', () => {
      expect(detectPrompt('❯ ')).toBe(true)
    })

    test('should detect user@host:directory format', () => {
      expect(detectPrompt('user@host:/home/user$ ')).toBe(true)
    })

    test('should not detect prompt in middle of output', () => {
      expect(detectPrompt('running command...\noutput$ value')).toBe(false)
    })

    test('should work with ANSI codes in output', () => {
      expect(detectPrompt('\x1B[32m$\x1B[0m ')).toBe(true)
    })

    test('should return false for output without prompt', () => {
      expect(detectPrompt('just some output')).toBe(false)
    })

    test('should handle empty string', () => {
      expect(detectPrompt('')).toBe(false)
    })

    test('should use custom patterns', () => {
      expect(detectPrompt('CUSTOM> ', ['CUSTOM> $'])).toBe(true)
    })

    test('should handle invalid custom patterns gracefully', () => {
      // Invalid regex pattern should be ignored
      expect(detectPrompt('output$ ', ['[invalid', '$ '])).toBe(true)
    })

    test('should detect prompt at end of multi-line output', () => {
      const output = 'command output\nline 2\nline 3\nuser@host:~$ '
      expect(detectPrompt(output)).toBe(true)
    })

    test('should detect ~/directory$ prompt', () => {
      expect(detectPrompt('~/projects$ ')).toBe(true)
    })

    test('should detect /path/directory$ prompt', () => {
      expect(detectPrompt('/home/user/projects$ ')).toBe(true)
    })
  })

  describe('extractPrompt', () => {
    test('should extract $ prompt', () => {
      expect(extractPrompt('output\nuser@host:~$ ')).toBe('user@host:~$')
    })

    test('should extract # prompt', () => {
      expect(extractPrompt('output\nroot@host:~# ')).toBe('root@host:~#')
    })

    test('should extract % prompt', () => {
      expect(extractPrompt('output\nuser % ')).toBe('user %')
    })

    test('should extract > prompt', () => {
      expect(extractPrompt('output\nuser> ')).toBe('user>')
    })

    test('should extract Powerline prompt', () => {
      expect(extractPrompt('output\n❯ ')).toBe('❯')
    })

    test('should return null when no prompt found', () => {
      expect(extractPrompt('just output without prompt')).toBeNull()
    })

    test('should handle empty string', () => {
      expect(extractPrompt('')).toBeNull()
    })

    test('should strip ANSI codes before extraction', () => {
      expect(extractPrompt('\x1B[32m$\x1B[0m ')).toBe('$')
    })
  })

  describe('createPromptPattern', () => {
    test('should escape special regex characters', () => {
      const pattern = createPromptPattern('user.host$')
      expect(pattern).toContain('\\.')
    })

    test('should add $ anchor if not ending with $ or #', () => {
      const pattern = createPromptPattern('custom>')
      expect(pattern).toMatch(/\$$/)
    })

    test('should not add extra $ for prompt ending with $', () => {
      const pattern = createPromptPattern('user@host:~\\$')
      expect(pattern).toMatch(/\$$/)
    })

    test('should escape dots and other regex chars', () => {
      const pattern = createPromptPattern('user.host$')
      expect(pattern).toContain('\\.')
    })

    test('should escape brackets and parentheses', () => {
      const pattern = createPromptPattern('user[test]$')
      expect(pattern).toContain('\\[')
      expect(pattern).toContain('\\]')
    })
  })

  describe('waitForPrompt', () => {
    test('should detect prompt immediately if present', async () => {
      const getOutput = vi.fn(() => 'user@host:~$ ')
      const result = await waitForPrompt(getOutput, { minWaitTimeMs: 0, checkIntervalMs: 10 })

      expect(result.detected).toBe(true)
      expect(result.timedOut).toBe(false)
    })

    test('should return timedOut after maxWaitTimeMs', async () => {
      const getOutput = vi.fn(() => 'no prompt here')
      const result = await waitForPrompt(getOutput, {
        minWaitTimeMs: 0,
        checkIntervalMs: 10,
        maxWaitTimeMs: 50,
      })

      expect(result.detected).toBe(false)
      expect(result.timedOut).toBe(true)
    })

    test('should return detected when output stabilizes', async () => {
      let callCount = 0
      const getOutput = vi.fn(() => {
        callCount++
        return 'stable output'
      })

      const result = await waitForPrompt(getOutput, {
        minWaitTimeMs: 0,
        checkIntervalMs: 10,
        maxWaitTimeMs: 1000,
      })

      // Should return true after output stabilizes (5 checks with same length)
      expect(result.detected).toBe(true)
      expect(result.timedOut).toBe(false)
    })

    test('should wait minimum time before checking', async () => {
      const getOutput = vi.fn(() => '$ ')
      const startTime = Date.now()

      await waitForPrompt(getOutput, { minWaitTimeMs: 50, checkIntervalMs: 10 })

      const elapsed = Date.now() - startTime
      expect(elapsed).toBeGreaterThanOrEqual(40) // Allow some tolerance
    })

    test('should use custom patterns', async () => {
      const getOutput = vi.fn(() => 'CUSTOM> ')
      const result = await waitForPrompt(getOutput, {
        minWaitTimeMs: 0,
        checkIntervalMs: 10,
        customPatterns: ['CUSTOM> $'],
      })

      expect(result.detected).toBe(true)
    })

    test('should return current output on timeout', async () => {
      const getOutput = vi.fn(() => 'some output')
      const result = await waitForPrompt(getOutput, {
        minWaitTimeMs: 0,
        checkIntervalMs: 10,
        maxWaitTimeMs: 50,
      })

      expect(result.output).toBe('some output')
    })
  })
})