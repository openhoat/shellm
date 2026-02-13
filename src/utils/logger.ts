/**
 * Logger utility for consistent logging across the application
 * Supports different log levels and can be disabled in production
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  level: LogLevel
  timestamp: string
  context: string
  message: string
  data?: unknown
}

/**
 * Global log manager to collect logs from all contexts
 */
class LogManager {
  #logs: LogEntry[] = []
  #maxLogs = 500
  #listeners: Set<(entry: LogEntry) => void> = new Set()

  addEntry(entry: LogEntry): void {
    this.#logs.push(entry)

    // Keep only the last maxLogs entries
    if (this.#logs.length > this.#maxLogs) {
      this.#logs.shift()
    }

    // Notify listeners
    this.#listeners.forEach(listener => listener(entry))
  }

  getAllLogs(): LogEntry[] {
    return [...this.#logs]
  }

  clearLogs(): void {
    this.#logs = []
  }

  getLogsByContext(context: string): LogEntry[] {
    return this.#logs.filter(log => log.context === context)
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.#logs.filter(log => log.level === level)
  }

  exportLogs(format: 'json' | 'text' = 'text'): string {
    if (format === 'json') {
      return JSON.stringify(this.#logs, null, 2)
    }
    return this.#logs
      .map(log => {
        const levelName = LogLevel[log.level]
        const dataStr = log.data ? ` ${JSON.stringify(log.data)}` : ''
        return `[${log.timestamp}] [${levelName}] [${log.context}] ${log.message}${dataStr}`
      })
      .join('\n')
  }

  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }
}

export const logManager = new LogManager()

class Logger {
  #currentLevel: LogLevel
  #context: string
  #logs: LogEntry[] = []
  #maxLogs = 100

  constructor(context: string, level?: LogLevel) {
    this.#context = context
    this.#currentLevel = level ?? this.#getLogLevelFromEnv()
  }

  #getLogLevelFromEnv(): LogLevel {
    const env = import.meta.env.MODE ?? 'development'
    if (env === 'production') {
      return LogLevel.ERROR
    }
    return LogLevel.DEBUG
  }

  #shouldLog(level: LogLevel): boolean {
    return level >= this.#currentLevel
  }

  #formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] [${this.#context}] ${message}${dataStr}`
  }

  #consoleLog(level: LogLevel, formattedMessage: string): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
    }
  }

  #addEntry(level: LogLevel, message: string, data?: unknown): void {
    const levelName = LogLevel[level]
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      context: this.#context,
      message,
      data,
    }

    this.#logs.push(entry)
    logManager.addEntry(entry)

    // Keep only the last maxLogs entries
    if (this.#logs.length > this.#maxLogs) {
      this.#logs.shift()
    }

    // Output to console
    const formattedMessage = this.#formatMessage(levelName, message, data)
    this.#consoleLog(level, formattedMessage)
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: unknown): void {
    if (!this.#shouldLog(LogLevel.DEBUG)) {
      return
    }
    this.#addEntry(LogLevel.DEBUG, message, data)
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown): void {
    if (!this.#shouldLog(LogLevel.INFO)) {
      return
    }
    this.#addEntry(LogLevel.INFO, message, data)
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown): void {
    if (!this.#shouldLog(LogLevel.WARN)) {
      return
    }
    this.#addEntry(LogLevel.WARN, message, data)
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown): void {
    if (!this.#shouldLog(LogLevel.ERROR)) {
      return
    }
    const errorData =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : error
    this.#addEntry(LogLevel.ERROR, message, errorData)
  }

  /**
   * Get all logs from this logger instance
   */
  getLogs(): LogEntry[] {
    return [...this.#logs]
  }

  /**
   * Clear all logs from this logger instance
   */
  clearLogs(): void {
    this.#logs = []
  }

  /**
   * Export logs as a formatted string
   */
  exportLogs(): string {
    return this.#logs
      .map(log => {
        const levelName = LogLevel[log.level]
        return this.#formatMessage(levelName, log.message, log.data)
      })
      .join('\n')
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.#currentLevel = level
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.#currentLevel
  }
}

export default Logger
