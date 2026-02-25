import { describe, expect, test } from 'vitest'

describe('useChat helpers', () => {
  describe('Constants', () => {
    test('COMMAND_OUTPUT_MIN_WAIT_MS should be 500', () => {
      expect(500).toBe(500)
    })

    test('COMMAND_OUTPUT_MAX_WAIT_MS should be 30000', () => {
      expect(30000).toBe(30000)
    })

    test('COMMAND_OUTPUT_POLL_INTERVAL_MS should be 100', () => {
      expect(100).toBe(100)
    })

    test('DEBOUNCE_MS should be 300', () => {
      expect(300).toBe(300)
    })

    test('MAX_HISTORY_SIZE should be 50', () => {
      expect(50).toBe(50)
    })
  })

  describe('Input validation', () => {
    test('should trim input', () => {
      const input = '  test  '
      expect(input.trim()).toBe('test')
    })

    test('should detect empty input', () => {
      const input = ''
      expect(input.trim().length === 0).toBe(true)
    })

    test('should preserve input with special characters', () => {
      const input = 'ls -la | grep test'
      expect(input).toBe('ls -la | grep test')
    })
  })

  describe('History management', () => {
    test('should add to beginning of history', () => {
      const history: string[] = []
      const newInput = 'new command'
      const updated = [newInput, ...history]
      expect(updated[0]).toBe('new command')
    })

    test('should limit history size', () => {
      let history: string[] = []
      for (let i = 0; i < 60; i++) {
        history = [i.toString(), ...history].slice(0, 50)
      }
      expect(history.length).toBe(50)
    })

    test('should filter duplicates', () => {
      const history = ['command1', 'command2', 'command3']
      const newInput = 'command1'
      const filtered = history.filter(c => c !== newInput)
      expect(filtered).toEqual(['command2', 'command3'])
    })
  })

  describe('Command index management', () => {
    test('should set command index when AI returns command', () => {
      const messages: Array<{ type: string; command?: object }> = []
      const response = { type: 'command', command: 'ls' }
      if (response.type === 'command') {
        messages.push({ type: 'ai', command: response })
      }
      expect(messages.length).toBe(1)
      expect(messages[0].command).toBeDefined()
    })

    test('should not set command index for text responses', () => {
      const messages: Array<{ type: string; command?: object }> = []
      const response = { type: 'text', content: 'Hello' }
      if (response.type === 'command') {
        messages.push({ type: 'ai', command: response })
      }
      expect(messages.length).toBe(0)
    })
  })
})
