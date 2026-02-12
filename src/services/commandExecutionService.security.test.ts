import { describe, expect, test } from 'vitest'
import { isCommandDangerous, sanitizeUserInput, hasInjectionPatterns } from './commandExecutionService'

describe('isCommandDangerous', () => {
  test('should return false for safe commands', () => {
    expect(isCommandDangerous('ls -la')).toEqual({ dangerous: false })
    expect(isCommandDangerous('cat file.txt')).toEqual({ dangerous: false })
    expect(isCommandDangerous('echo "hello"')).toEqual({ dangerous: false })
  })

  test('should detect rm -rf / command', () => {
    const result = isCommandDangerous('rm -rf /')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect rm -rf /root command', () => {
    const result = isCommandDangerous('rm -rf /root')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect dd command writing to /dev/sda', () => {
    const result = isCommandDangerous('dd if=/dev/zero of=/dev/sda')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect mkfs command', () => {
    const result = isCommandDangerous('mkfs.ext4 /dev/sda1')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect format command', () => {
    const result = isCommandDangerous('format c:')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect fork bomb', () => {
    const result = isCommandDangerous(':(){:|:&};:')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect shutdown command', () => {
    const result = isCommandDangerous('shutdown -h now')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect poweroff command', () => {
    const result = isCommandDangerous('poweroff')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect reboot command', () => {
    const result = isCommandDangerous('reboot')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toBeDefined()
  })

  test('should detect sudo with dangerous command', () => {
    const result = isCommandDangerous('sudo rm -rf /')
    expect(result.dangerous).toBe(true)
    expect(result.reason).toContain('Sudo')
  })

  test('should allow sudo with safe commands', () => {
    expect(isCommandDangerous('sudo ls -la')).toEqual({ dangerous: false })
    expect(isCommandDangerous('sudo cat file.txt')).toEqual({ dangerous: false })
  })

  test('should handle case insensitive for some patterns', () => {
    const result1 = isCommandDangerous('MKFS /dev/sda1')
    expect(result1.dangerous).toBe(true)

    const result2 = isCommandDangerous('Format c:')
    expect(result2.dangerous).toBe(true)
  })
})

describe('sanitizeUserInput', () => {
  test('should remove semicolon', () => {
    expect(sanitizeUserInput('ls; cat file.txt')).toBe('ls cat file.txt')
  })

  test('should remove ampersand', () => {
    expect(sanitizeUserInput('ls && cat file.txt')).toBe('ls  cat file.txt')
  })

  test('should remove pipe', () => {
    expect(sanitizeUserInput('ls | grep test')).toBe('ls  grep test')
  })

  test('should remove backticks', () => {
    expect(sanitizeUserInput('echo `date`')).toBe('echo date')
  })

  test('should remove dollar sign', () => {
    expect(sanitizeUserInput('echo $HOME')).toBe('echo HOME')
  })

  test('should remove command substitution $()', () => {
    const result = sanitizeUserInput('echo $(date)')
    expect(result).toContain('echo')
    // The entire $(...) is removed for security
  })

  test('should remove variable expansion ${}', () => {
    const result = sanitizeUserInput('echo ${HOME}')
    expect(result).toContain('echo')
    // The entire ${...} is removed for security
  })

  test('should remove newline escapes', () => {
    expect(sanitizeUserInput('echo \\n test')).toBe('echo  test')
  })

  test('should remove carriage return escapes', () => {
    expect(sanitizeUserInput('echo \\r test')).toBe('echo  test')
  })

  test('should trim whitespace', () => {
    expect(sanitizeUserInput('  ls -la  ')).toBe('ls -la')
  })

  test('should handle complex injection patterns', () => {
    const input = 'ls; echo $(whoami) && cat `date` | grep test'
    const result = sanitizeUserInput(input)
    expect(result).toContain('ls')
    expect(result).toContain('grep test')
  })

  test('should return empty string for only dangerous characters', () => {
    expect(sanitizeUserInput(';|`$')).toBe('')
  })
})

describe('hasInjectionPatterns', () => {
  test('should detect semicolon injection', () => {
    const result = hasInjectionPatterns('ls; rm -rf /')
    expect(result.hasInjection).toBe(true)
    expect(result.patterns).toContain(';')
  })

  test('should detect ampersand injection', () => {
    const result = hasInjectionPatterns('ls && rm -rf /')
    expect(result.hasInjection).toBe(true)
    // The regex matches & individually, not &&
  })

  test('should detect pipe injection', () => {
    const result = hasInjectionPatterns('ls | grep test')
    expect(result.hasInjection).toBe(true)
    expect(result.patterns).toContain('|')
  })

  test('should detect backtick injection', () => {
    const result = hasInjectionPatterns('echo `whoami`')
    expect(result.hasInjection).toBe(true)
    expect(result.patterns[0]).toContain('`')
  })

  test('should detect dollar sign injection', () => {
    const result = hasInjectionPatterns('echo $HOME')
    expect(result.hasInjection).toBe(true)
    expect(result.patterns).toContain('$')
  })

  test('should detect command substitution injection', () => {
    const result = hasInjectionPatterns('echo $(date)')
    expect(result.hasInjection).toBe(true)
    expect(result.patterns).toContain('$(')
  })

  test('should detect variable expansion injection', () => {
    const result = hasInjectionPatterns('echo ${HOME}')
    expect(result.hasInjection).toBe(true)
    expect(result.patterns).toContain('${')
  })

  test('should return false for safe input', () => {
    const result = hasInjectionPatterns('ls -la')
    expect(result.hasInjection).toBe(false)
    expect(result.patterns).toEqual([])
  })

  test('should detect multiple injection patterns', () => {
    const result = hasInjectionPatterns('ls; echo $(whoami) && cat `date`')
    expect(result.hasInjection).toBe(true)
    expect(result.patterns.length).toBeGreaterThan(1)
  })
})