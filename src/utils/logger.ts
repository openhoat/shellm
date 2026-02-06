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

class Logger {
  private currentLevel: LogLevel
  private context: string
  private logs: LogEntry[] = []
  private maxLogs = 100

  constructor(context: string, level?: LogLevel) {
    this.context = context
    this.currentLevel = level ?? this.getLogLevelFromEnv()
  }

  private getLogLevelFromEnv(): LogLevel {
    const env = import.meta.env.MODE ?? 'development'
    if (env === 'production') {
      return LogLevel.ERROR
    }
    return LogLevel.DEBUG
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel
  }

  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] [${this.context}] ${message}${dataStr}`
  }

  private addEntry(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      context: this.context,
      message,
      data,
    }

    this.logs.push(entry)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) {
      return
    }
    this.addEntry(LogLevel.DEBUG, message, data)
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) {
      return
    }
    this.addEntry(LogLevel.INFO, message, data)
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) {
      return
    }
    this.addEntry(LogLevel.WARN, message, data)
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return
    }
    const errorData =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : error
    this.addEntry(LogLevel.ERROR, message, errorData)
  }

  /**
   * Get all logs from this logger instance
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Clear all logs from this logger instance
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Export logs as a formatted string
   */
  exportLogs(): string {
    return this.logs
      .map(log => {
        const levelName = LogLevel[log.level]
        return this.formatMessage(levelName, log.message, log.data)
      })
      .join('\n')
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.currentLevel
  }
}

export default Logger
