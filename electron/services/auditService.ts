import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { app } from 'electron'
import type { ValidationResult } from '../../shared/commandValidation'

/**
 * Audit log entry for command execution
 */
export interface AuditLogEntry {
  /** Unique identifier for this log entry */
  id: string
  /** Timestamp of the command execution */
  timestamp: string
  /** ISO timestamp for sorting */
  isoTimestamp: string
  /** The command that was executed or attempted */
  command: string
  /** The result of the command execution */
  result: 'success' | 'blocked' | 'cancelled' | 'error' | 'sandboxed'
  /** Risk level of the command */
  riskLevel: 'safe' | 'warning' | 'dangerous'
  /** Whether the command was approved by user */
  approvedByUser: boolean
  /** Categories of risks identified */
  categories: string[]
  /** User's response to warning modal (if shown) */
  userAction?: 'proceed' | 'cancel' | 'close'
  /** Error message if result is 'error' */
  errorMessage?: string
  /** Output length (if executed) */
  outputLength?: number
  /** Execution time in milliseconds */
  executionTimeMs?: number
  /** Sandbox mode used */
  sandboxMode?: 'none' | 'restricted' | 'docker' | 'system'
  /** Working directory when command was executed */
  workingDirectory?: string
}

/**
 * Query options for audit logs
 */
export interface AuditLogQuery {
  /** Filter by result */
  result?: AuditLogEntry['result']
  /** Filter by risk level */
  riskLevel?: AuditLogEntry['riskLevel']
  /** Filter by date range (from) */
  fromDate?: Date
  /** Filter by date range (to) */
  toDate?: Date
  /** Maximum number of entries to return */
  limit?: number
  /** Filter by command pattern (regex) */
  commandPattern?: string
}

/**
 * Statistics for audit logs
 */
export interface AuditStatistics {
  /** Total number of commands */
  totalCommands: number
  /** Number of successful commands */
  successfulCommands: number
  /** Number of blocked commands */
  blockedCommands: number
  /** Number of cancelled commands */
  cancelledCommands: number
  /** Number of error commands */
  errorCommands: number
  /** Commands by risk level */
  byRiskLevel: {
    safe: number
    warning: number
    dangerous: number
  }
  /** Most common commands */
  topCommands: Array<{ command: string; count: number }>
  /** Average execution time */
  averageExecutionTimeMs: number
}

const DEFAULT_MAX_LOGS = 10000
const DEFAULT_LOG_FILE = 'audit-logs.json'

/**
 * Service for managing audit logs of command execution
 */
class AuditService {
  private filePath: string
  private maxLogs: number
  private cache: AuditLogEntry[] | null = null
  private initialized = false

  /**
   * Create an AuditService instance
   * @param maxLogs Maximum number of logs to keep
   * @param logFile Log file name (used with app.getPath('userData'))
   * @param customFilePath Optional custom file path (for testing)
   */
  constructor(
    maxLogs: number = DEFAULT_MAX_LOGS,
    logFile: string = DEFAULT_LOG_FILE,
    customFilePath?: string
  ) {
    if (customFilePath) {
      this.filePath = customFilePath
    } else {
      const userDataPath = app.getPath('userData')
      this.filePath = path.join(userDataPath, logFile)
    }
    this.maxLogs = maxLogs
    this.ensureFileExistsSync()
    this.initialized = true
  }

  /**
   * Ensure the audit log file exists (sync version for constructor)
   */
  private ensureFileExistsSync(): void {
    const dir = path.dirname(this.filePath)
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true })
    }
    if (!fsSync.existsSync(this.filePath)) {
      fsSync.writeFileSync(this.filePath, JSON.stringify({ logs: [] }), 'utf-8')
    }
  }

  /**
   * Generate a unique ID for a log entry
   */
  private generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Load all logs from disk
   */
  private async loadLogs(): Promise<AuditLogEntry[]> {
    if (this.cache) {
      return this.cache
    }

    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      const parsed = JSON.parse(data)
      const logs = Array.isArray(parsed.logs) ? parsed.logs : []
      this.cache = logs
      return logs
    } catch {
      this.cache = []
      return []
    }
  }

  /**
   * Save logs to disk
   */
  private async saveLogs(logs: AuditLogEntry[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify({ logs }, null, 2), 'utf-8')
    this.cache = logs
  }

  /**
   * Log a command execution
   */
  async logCommand(params: {
    command: string
    result: AuditLogEntry['result']
    validation: ValidationResult
    approvedByUser?: boolean
    userAction?: AuditLogEntry['userAction']
    errorMessage?: string
    outputLength?: number
    executionTimeMs?: number
    sandboxMode?: AuditLogEntry['sandboxMode']
    workingDirectory?: string
  }): Promise<AuditLogEntry> {
    const logs = await this.loadLogs()

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toLocaleString(),
      isoTimestamp: new Date().toISOString(),
      command: params.command,
      result: params.result,
      riskLevel: params.validation.riskLevel,
      approvedByUser: params.approvedByUser ?? false,
      categories: params.validation.categories,
      userAction: params.userAction,
      errorMessage: params.errorMessage,
      outputLength: params.outputLength,
      executionTimeMs: params.executionTimeMs,
      sandboxMode: params.sandboxMode,
      workingDirectory: params.workingDirectory,
    }

    logs.unshift(entry) // Add to beginning for chronological order

    // Trim logs if exceeded max
    if (logs.length > this.maxLogs) {
      logs.splice(this.maxLogs)
    }

    await this.saveLogs(logs)
    return entry
  }

  /**
   * Get all logs matching query criteria
   */
  async getLogs(query?: AuditLogQuery): Promise<AuditLogEntry[]> {
    let logs = await this.loadLogs()

    if (!query) {
      return logs
    }

    // Filter by result
    if (query.result) {
      logs = logs.filter(log => log.result === query.result)
    }

    // Filter by risk level
    if (query.riskLevel) {
      logs = logs.filter(log => log.riskLevel === query.riskLevel)
    }

    // Filter by date range
    if (query.fromDate) {
      const fromTime = query.fromDate.getTime()
      logs = logs.filter(log => new Date(log.isoTimestamp).getTime() >= fromTime)
    }

    if (query.toDate) {
      const toTime = query.toDate.getTime()
      logs = logs.filter(log => new Date(log.isoTimestamp).getTime() <= toTime)
    }

    // Filter by command pattern
    if (query.commandPattern) {
      try {
        const regex = new RegExp(query.commandPattern, 'i')
        logs = logs.filter(log => regex.test(log.command))
      } catch {
        // Invalid regex, skip pattern filter
      }
    }

    // Apply limit
    if (query.limit && query.limit > 0) {
      logs = logs.slice(0, query.limit)
    }

    return logs
  }

  /**
   * Get statistics for audit logs
   */
  async getStatistics(): Promise<AuditStatistics> {
    const logs = await this.loadLogs()

    const stats: AuditStatistics = {
      totalCommands: logs.length,
      successfulCommands: logs.filter(l => l.result === 'success').length,
      blockedCommands: logs.filter(l => l.result === 'blocked').length,
      cancelledCommands: logs.filter(l => l.result === 'cancelled').length,
      errorCommands: logs.filter(l => l.result === 'error').length,
      byRiskLevel: {
        safe: logs.filter(l => l.riskLevel === 'safe').length,
        warning: logs.filter(l => l.riskLevel === 'warning').length,
        dangerous: logs.filter(l => l.riskLevel === 'dangerous').length,
      },
      topCommands: [],
      averageExecutionTimeMs: 0,
    }

    // Calculate top commands
    const commandCounts: Map<string, number> = new Map()
    for (const log of logs) {
      // Get base command (first word)
      const baseCommand = log.command.split(/\s+/)[0] || ''
      const count = commandCounts.get(baseCommand) || 0
      commandCounts.set(baseCommand, count + 1)
    }

    stats.topCommands = Array.from(commandCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([command, count]) => ({ command, count }))

    // Calculate average execution time
    const executionTimes = logs.filter(l => l.executionTimeMs).map(l => l.executionTimeMs as number)
    if (executionTimes.length > 0) {
      stats.averageExecutionTimeMs =
        executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
    }

    return stats
  }

  /**
   * Clear all audit logs
   */
  async clearLogs(): Promise<void> {
    await this.saveLogs([])
  }

  /**
   * Export logs to JSON string
   */
  async exportLogs(): Promise<string> {
    const logs = await this.loadLogs()
    return JSON.stringify(logs, null, 2)
  }

  /**
   * Export logs to CSV format
   */
  async exportLogsAsCsv(): Promise<string> {
    const logs = await this.loadLogs()

    const headers = [
      'ID',
      'Timestamp',
      'Command',
      'Result',
      'Risk Level',
      'Approved',
      'User Action',
      'Error Message',
      'Execution Time (ms)',
      'Sandbox Mode',
      'Working Directory',
    ]

    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      `"${log.command.replace(/"/g, '""')}"`,
      log.result,
      log.riskLevel,
      log.approvedByUser.toString(),
      log.userAction || '',
      log.errorMessage ? `"${log.errorMessage.replace(/"/g, '""')}"` : '',
      log.executionTimeMs?.toString() || '',
      log.sandboxMode || '',
      log.workingDirectory || '',
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  /**
   * Check if audit service is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}

// Lazy singleton instance - only created when needed
let _auditService: AuditService | null = null

/**
 * Get the singleton instance of AuditService
 * Creates the instance lazily to avoid issues in test environments
 */
export function getAuditService(): AuditService {
  if (!_auditService) {
    _auditService = new AuditService()
  }
  return _auditService
}

// Export the class for testing
export { AuditService }
