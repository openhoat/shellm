import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { type LogEntry, Logger, LogLevel, logManager } from './logger'

describe('LogLevel', () => {
  test('should have correct numeric values', () => {
    expect(LogLevel.DEBUG).toBe(0)
    expect(LogLevel.INFO).toBe(1)
    expect(LogLevel.WARN).toBe(2)
    expect(LogLevel.ERROR).toBe(3)
    expect(LogLevel.NONE).toBe(4)
  })
})

describe('LogManager', () => {
  beforeEach(() => {
    logManager.clearLogs()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('addEntry', () => {
    test('should add a log entry', () => {
      const entry: LogEntry = {
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test message',
      }
      logManager.addEntry(entry)
      const logs = logManager.getAllLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0]).toEqual(entry)
    })

    test('should limit logs to maxLogs entries', () => {
      for (let i = 0; i < 550; i++) {
        logManager.addEntry({
          level: LogLevel.INFO,
          timestamp: new Date().toISOString(),
          context: 'test',
          message: `message ${i}`,
        })
      }
      const logs = logManager.getAllLogs()
      expect(logs).toHaveLength(500)
      expect(logs[0].message).toBe('message 50')
    })

    test('should notify listeners when entry is added', () => {
      const listener = vi.fn()
      logManager.subscribe(listener)
      const entry: LogEntry = {
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test message',
      }
      logManager.addEntry(entry)
      expect(listener).toHaveBeenCalledWith(entry)
    })
  })

  describe('getAllLogs', () => {
    test('should return a copy of logs array', () => {
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test',
      })
      const logs1 = logManager.getAllLogs()
      const logs2 = logManager.getAllLogs()
      expect(logs1).not.toBe(logs2)
      expect(logs1).toEqual(logs2)
    })

    test('should return empty array when no logs', () => {
      expect(logManager.getAllLogs()).toEqual([])
    })
  })

  describe('clearLogs', () => {
    test('should clear all logs', () => {
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test1',
      })
      logManager.addEntry({
        level: LogLevel.WARN,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test2',
      })
      expect(logManager.getAllLogs()).toHaveLength(2)
      logManager.clearLogs()
      expect(logManager.getAllLogs()).toHaveLength(0)
    })
  })

  describe('getLogsByContext', () => {
    test('should filter logs by context', () => {
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'context1',
        message: 'test1',
      })
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'context2',
        message: 'test2',
      })
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'context1',
        message: 'test3',
      })
      const logs = logManager.getLogsByContext('context1')
      expect(logs).toHaveLength(2)
      expect(logs.every(log => log.context === 'context1')).toBe(true)
    })
  })

  describe('getLogsByLevel', () => {
    test('should filter logs by level', () => {
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test1',
      })
      logManager.addEntry({
        level: LogLevel.ERROR,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test2',
      })
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test3',
      })
      const logs = logManager.getLogsByLevel(LogLevel.INFO)
      expect(logs).toHaveLength(2)
      expect(logs.every(log => log.level === LogLevel.INFO)).toBe(true)
    })
  })

  describe('exportLogs', () => {
    test('should export logs as JSON format', () => {
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: '2024-01-01T00:00:00.000Z',
        context: 'test',
        message: 'test message',
      })
      const exported = logManager.exportLogs('json')
      const parsed = JSON.parse(exported)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].message).toBe('test message')
    })

    test('should export logs as text format', () => {
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: '2024-01-01T00:00:00.000Z',
        context: 'test',
        message: 'test message',
        data: { key: 'value' },
      })
      const exported = logManager.exportLogs('text')
      expect(exported).toContain('[INFO]')
      expect(exported).toContain('[test]')
      expect(exported).toContain('test message')
      expect(exported).toContain('"key":"value"')
    })

    test('should export logs as text format without data', () => {
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: '2024-01-01T00:00:00.000Z',
        context: 'test',
        message: 'test message',
      })
      const exported = logManager.exportLogs('text')
      expect(exported).toContain('[INFO]')
      expect(exported).toContain('[test]')
      expect(exported).toContain('test message')
      expect(exported).not.toContain('{}')
    })

    test('should return empty string for empty logs in text format', () => {
      expect(logManager.exportLogs('text')).toBe('')
    })

    test('should return empty array JSON for empty logs', () => {
      expect(logManager.exportLogs('json')).toBe('[]')
    })
  })

  describe('subscribe', () => {
    test('should add listener and return unsubscribe function', () => {
      const listener = vi.fn()
      const unsubscribe = logManager.subscribe(listener)
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test',
      })
      expect(listener).toHaveBeenCalledTimes(1)
      unsubscribe()
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test2',
      })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('should support multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      logManager.subscribe(listener1)
      logManager.subscribe(listener2)
      logManager.addEntry({
        level: LogLevel.INFO,
        timestamp: new Date().toISOString(),
        context: 'test',
        message: 'test',
      })
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })
})

describe('Logger', () => {
  let logger: Logger
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logManager.clearLogs()
    vi.clearAllMocks()
    logger = new Logger('test-context', LogLevel.DEBUG)
    consoleDebugSpy = vi.spyOn(console, 'debug').mockReturnValue(undefined)
    consoleInfoSpy = vi.spyOn(console, 'info').mockReturnValue(undefined)
    consoleWarnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined)
    consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    test('should create logger with context and level', () => {
      const testLogger = new Logger('my-context', LogLevel.WARN)
      expect(testLogger.getLevel()).toBe(LogLevel.WARN)
    })

    test('should use DEBUG level when no level provided in non-production', () => {
      vi.stubEnv('MODE', 'development')
      const testLogger = new Logger('my-context')
      expect(testLogger.getLevel()).toBe(LogLevel.DEBUG)
      vi.unstubAllEnvs()
    })

    test('should use ERROR level when no level provided in production', () => {
      vi.stubEnv('MODE', 'production')
      const testLogger = new Logger('my-context')
      expect(testLogger.getLevel()).toBe(LogLevel.ERROR)
      vi.unstubAllEnvs()
    })

    test('should use DEBUG level when MODE is undefined', () => {
      const originalEnv = import.meta.env.MODE
      // @ts-expect-error - Testing undefined MODE
      import.meta.env.MODE = undefined
      const testLogger = new Logger('my-context')
      expect(testLogger.getLevel()).toBe(LogLevel.DEBUG)
      // @ts-expect-error - Restoring MODE
      import.meta.env.MODE = originalEnv
    })

    test('should use DEBUG level when MODE is undefined', () => {
      const originalMode = import.meta.env.MODE
      // @ts-expect-error - testing undefined MODE
      import.meta.env.MODE = undefined
      const testLogger = new Logger('my-context')
      expect(testLogger.getLevel()).toBe(LogLevel.DEBUG)
      import.meta.env.MODE = originalMode
    })
  })

  describe('debug', () => {
    test('should log debug message when level is DEBUG', () => {
      logger.debug('test message')
      expect(consoleDebugSpy).toHaveBeenCalled()
      const logs = logger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].level).toBe(LogLevel.DEBUG)
      expect(logs[0].message).toBe('test message')
    })

    test('should log debug message with data', () => {
      logger.debug('test message', { key: 'value' })
      expect(consoleDebugSpy).toHaveBeenCalled()
      const logs = logger.getLogs()
      expect(logs[0].data).toEqual({ key: 'value' })
    })

    test('should not log debug when level is higher', () => {
      logger.setLevel(LogLevel.INFO)
      logger.debug('test message')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(logger.getLogs()).toHaveLength(0)
    })
  })

  describe('info', () => {
    test('should log info message when level is INFO or lower', () => {
      logger.info('test message')
      expect(consoleInfoSpy).toHaveBeenCalled()
      const logs = logger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].level).toBe(LogLevel.INFO)
    })

    test('should log info message with data', () => {
      logger.info('test message', { key: 'value' })
      const logs = logger.getLogs()
      expect(logs[0].data).toEqual({ key: 'value' })
    })

    test('should not log info when level is higher', () => {
      logger.setLevel(LogLevel.WARN)
      logger.info('test message')
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(logger.getLogs()).toHaveLength(0)
    })
  })

  describe('warn', () => {
    test('should log warn message when level is WARN or lower', () => {
      logger.warn('test message')
      expect(consoleWarnSpy).toHaveBeenCalled()
      const logs = logger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].level).toBe(LogLevel.WARN)
    })

    test('should log warn message with data', () => {
      logger.warn('test message', { key: 'value' })
      const logs = logger.getLogs()
      expect(logs[0].data).toEqual({ key: 'value' })
    })

    test('should not log warn when level is higher', () => {
      logger.setLevel(LogLevel.ERROR)
      logger.warn('test message')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(logger.getLogs()).toHaveLength(0)
    })
  })

  describe('error', () => {
    test('should log error message when level is ERROR or lower', () => {
      logger.error('test message')
      expect(consoleErrorSpy).toHaveBeenCalled()
      const logs = logger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].level).toBe(LogLevel.ERROR)
    })

    test('should log error with Error object', () => {
      const error = new Error('test error')
      error.stack = 'test stack'
      logger.error('test message', error)
      const logs = logger.getLogs()
      expect(logs[0].data).toEqual({
        message: 'test error',
        stack: 'test stack',
      })
    })

    test('should log error with non-Error data', () => {
      logger.error('test message', { custom: 'data' })
      const logs = logger.getLogs()
      expect(logs[0].data).toEqual({ custom: 'data' })
    })

    test('should not log error when level is NONE', () => {
      logger.setLevel(LogLevel.NONE)
      logger.error('test message')
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(logger.getLogs()).toHaveLength(0)
    })
  })

  describe('getLogs', () => {
    test('should return a copy of logs array', () => {
      logger.info('test1')
      logger.info('test2')
      const logs1 = logger.getLogs()
      const logs2 = logger.getLogs()
      expect(logs1).not.toBe(logs2)
      expect(logs1).toEqual(logs2)
    })

    test('should return empty array when no logs', () => {
      expect(logger.getLogs()).toEqual([])
    })
  })

  describe('clearLogs', () => {
    test('should clear logs from logger instance', () => {
      logger.info('test1')
      logger.info('test2')
      expect(logger.getLogs()).toHaveLength(2)
      logger.clearLogs()
      expect(logger.getLogs()).toHaveLength(0)
    })

    test('should not clear logs from logManager', () => {
      logger.info('test1')
      expect(logManager.getAllLogs()).toHaveLength(1)
      logger.clearLogs()
      expect(logManager.getAllLogs()).toHaveLength(1)
    })
  })

  describe('exportLogs', () => {
    test('should export logs as formatted string', () => {
      logger.info('test message')
      const exported = logger.exportLogs()
      expect(exported).toContain('[INFO]')
      expect(exported).toContain('[test-context]')
      expect(exported).toContain('test message')
    })

    test('should include data in exported logs', () => {
      logger.info('test message', { key: 'value' })
      const exported = logger.exportLogs()
      expect(exported).toContain('"key":"value"')
    })

    test('should return empty string for empty logs', () => {
      expect(logger.exportLogs()).toBe('')
    })
  })

  describe('setLevel', () => {
    test('should change the log level', () => {
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
      logger.setLevel(LogLevel.WARN)
      expect(logger.getLevel()).toBe(LogLevel.WARN)
    })

    test('should affect which messages are logged', () => {
      logger.setLevel(LogLevel.ERROR)
      logger.debug('debug message')
      logger.info('info message')
      logger.warn('warn message')
      expect(logger.getLogs()).toHaveLength(0)
      logger.error('error message')
      expect(logger.getLogs()).toHaveLength(1)
    })
  })

  describe('getLevel', () => {
    test('should return current log level', () => {
      expect(logger.getLevel()).toBe(LogLevel.DEBUG)
      logger.setLevel(LogLevel.INFO)
      expect(logger.getLevel()).toBe(LogLevel.INFO)
      logger.setLevel(LogLevel.WARN)
      expect(logger.getLevel()).toBe(LogLevel.WARN)
      logger.setLevel(LogLevel.ERROR)
      expect(logger.getLevel()).toBe(LogLevel.ERROR)
      logger.setLevel(LogLevel.NONE)
      expect(logger.getLevel()).toBe(LogLevel.NONE)
    })
  })

  describe('maxLogs limit', () => {
    test('should limit logger instance logs to maxLogs entries', () => {
      for (let i = 0; i < 150; i++) {
        logger.info(`message ${i}`)
      }
      const logs = logger.getLogs()
      expect(logs).toHaveLength(100)
      expect(logs[0].message).toBe('message 50')
    })
  })

  describe('logManager integration', () => {
    test('should add entries to logManager', () => {
      logger.info('test message')
      const managerLogs = logManager.getAllLogs()
      expect(managerLogs).toHaveLength(1)
      expect(managerLogs[0].context).toBe('test-context')
      expect(managerLogs[0].message).toBe('test message')
    })

    test('should have correct timestamp format', () => {
      logger.info('test message')
      const logs = logger.getLogs()
      expect(logs[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })
})
