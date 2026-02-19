import { describe, expect, test } from 'vitest'
import { stripAnsiCodes, stripOscSequences } from './ansi'

describe('ansi', () => {
  describe('stripAnsiCodes', () => {
    test('should return unchanged string when no ANSI codes', () => {
      expect(stripAnsiCodes('hello world')).toBe('hello world')
    })

    test('should strip basic ANSI color codes', () => {
      // Red text: \x1B[31m
      expect(stripAnsiCodes('\x1B[31mhello\x1B[0m')).toBe('hello')
    })

    test('should strip ANSI codes with multiple parameters', () => {
      // Bold and red: \x1B[1;31m
      expect(stripAnsiCodes('\x1B[1;31mtext\x1B[0m')).toBe('text')
    })

    test('should strip cursor movement codes', () => {
      // Move cursor home: \x1B[H
      expect(stripAnsiCodes('\x1B[Hcleared')).toBe('cleared')
    })

    test('should handle multiple ANSI codes in string', () => {
      const input = '\x1B[32msuccess\x1B[0m and \x1B[31merror\x1B[0m'
      expect(stripAnsiCodes(input)).toBe('success and error')
    })

    test('should strip K code (erase in line)', () => {
      expect(stripAnsiCodes('\x1B[Ktext')).toBe('text')
    })

    test('should strip G code (cursor horizontal absolute)', () => {
      expect(stripAnsiCodes('\x1B[10Gtext')).toBe('text')
    })

    test('should handle empty string', () => {
      expect(stripAnsiCodes('')).toBe('')
    })

    test('should preserve newlines', () => {
      expect(stripAnsiCodes('line1\n\x1B[32mline2\x1B[0m\nline3')).toBe('line1\nline2\nline3')
    })
  })

  describe('stripOscSequences', () => {
    test('should return unchanged string when no OSC sequences', () => {
      expect(stripOscSequences('hello world')).toBe('hello world')
    })

    test('should strip OSC sequence terminated with BEL', () => {
      // OSC sequence: \x1B]...BEL (\x07)
      expect(stripOscSequences('\x1B]0;title\x07text')).toBe('text')
    })

    test('should strip OSC sequence terminated with ST', () => {
      // OSC sequence: \x1B]...ST (\x1B\\)
      expect(stripOscSequences('\x1B]0;title\x1B\\text')).toBe('text')
    })

    test('should handle multiple OSC sequences', () => {
      const input = '\x1B]0;title1\x07\x1B]1;title2\x07text'
      expect(stripOscSequences(input)).toBe('text')
    })

    test('should handle empty string', () => {
      expect(stripOscSequences('')).toBe('')
    })

    test('should preserve newlines', () => {
      expect(stripOscSequences('line1\n\x1B]0;title\x07\nline2')).toBe('line1\n\nline2')
    })

    test('should strip OSC hyperlink sequences', () => {
      // OSC 8 hyperlink: \x1B]8;;url\x07text\x1B]8;;\x07
      const input = '\x1B]8;;https://example.com\x07click\x1B]8;;\x07'
      expect(stripOscSequences(input)).toBe('click')
    })
  })
})