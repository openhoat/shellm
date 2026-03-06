import type { AppConfig } from '@shared/types'

/**
 * Statistics for a single command execution
 */
export interface CommandExecution {
  /** Timestamp of execution */
  timestamp: number
  /** Command that was executed */
  command: string
  /** Whether the command was successfully executed */
  success: boolean
  /** LLM provider used */
  provider: string
  /** Response time in milliseconds (time from prompt to command generation) */
  responseTime: number
  /** Error message if execution failed */
  error?: string
}

/**
 * Aggregated statistics for a provider
 */
export interface ProviderStats {
  /** Total commands generated */
  totalCommands: number
  /** Number of successful executions */
  successCount: number
  /** Number of failed executions */
  failureCount: number
  /** Average response time in milliseconds */
  avgResponseTime: number
  /** Minimum response time */
  minResponseTime: number
  /** Maximum response time */
  maxResponseTime: number
  /** Success rate as percentage (0-100) */
  successRate: number
}

/**
 * Overall usage statistics
 */
export interface UsageStats {
  /** Total number of commands executed across all providers */
  totalCommands: number
  /** Total successful executions */
  totalSuccess: number
  /** Total failed executions */
  totalFailures: number
  /** Overall success rate */
  overallSuccessRate: number
  /** Statistics per provider */
  providerStats: Record<string, ProviderStats>
  /** Recent command executions (last 100) */
  recentExecutions: CommandExecution[]
  /** First usage timestamp */
  firstUsage?: number
  /** Last usage timestamp */
  lastUsage?: number
}

/**
 * Service for tracking and managing usage statistics
 */
export class StatsService {
  private executions: CommandExecution[] = []
  private readonly maxExecutions = 1000 // Keep last 1000 executions
  private readonly storageKey = 'termaid-usage-stats'

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Record a command execution
   */
  recordExecution(execution: CommandExecution): void {
    this.executions.push(execution)

    // Keep only the last maxExecutions
    if (this.executions.length > this.maxExecutions) {
      this.executions = this.executions.slice(-this.maxExecutions)
    }

    this.saveToStorage()
  }

  /**
   * Get aggregated statistics
   */
  getStats(): UsageStats {
    if (this.executions.length === 0) {
      return {
        totalCommands: 0,
        totalSuccess: 0,
        totalFailures: 0,
        overallSuccessRate: 0,
        providerStats: {},
        recentExecutions: [],
      }
    }

    const totalCommands = this.executions.length
    const totalSuccess = this.executions.filter(e => e.success).length
    const totalFailures = totalCommands - totalSuccess
    const overallSuccessRate = (totalSuccess / totalCommands) * 100

    // Calculate per-provider stats
    const providerStats: Record<string, ProviderStats> = {}
    const providerGroups = this.groupByProvider()

    for (const [provider, executions] of Object.entries(providerGroups)) {
      const successCount = executions.filter(e => e.success).length
      const failureCount = executions.length - successCount
      const responseTimes = executions.map(e => e.responseTime)
      const avgResponseTime =
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length

      providerStats[provider] = {
        totalCommands: executions.length,
        successCount,
        failureCount,
        avgResponseTime: Math.round(avgResponseTime),
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
        successRate: (successCount / executions.length) * 100,
      }
    }

    return {
      totalCommands,
      totalSuccess,
      totalFailures,
      overallSuccessRate,
      providerStats,
      recentExecutions: this.executions.slice(-100),
      firstUsage: this.executions[0]?.timestamp,
      lastUsage: this.executions[this.executions.length - 1]?.timestamp,
    }
  }

  /**
   * Group executions by provider
   */
  private groupByProvider(): Record<string, CommandExecution[]> {
    const groups: Record<string, CommandExecution[]> = {}

    for (const execution of this.executions) {
      if (!groups[execution.provider]) {
        groups[execution.provider] = []
      }
      groups[execution.provider].push(execution)
    }

    return groups
  }

  /**
   * Clear all statistics
   */
  clearStats(): void {
    this.executions = []
    this.saveToStorage()
  }

  /**
   * Get statistics for a specific provider
   */
  getProviderStats(provider: string): ProviderStats | null {
    const stats = this.getStats()
    return stats.providerStats[provider] || null
  }

  /**
   * Get statistics for a specific time range
   */
  getStatsForPeriod(startTime: number, endTime: number): UsageStats {
    const filteredExecutions = this.executions.filter(
      e => e.timestamp >= startTime && e.timestamp <= endTime
    )

    // Temporarily swap executions to calculate stats for the period
    const originalExecutions = this.executions
    this.executions = filteredExecutions
    const stats = this.getStats()
    this.executions = originalExecutions

    return stats
  }

  /**
   * Export statistics as JSON
   */
  exportStats(): string {
    return JSON.stringify(
      {
        stats: this.getStats(),
        executions: this.executions,
      },
      null,
      2
    )
  }

  /**
   * Load statistics from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.executions = parsed.executions || []
      }
    } catch (_error) {
      // Silently ignore localStorage errors (e.g., quota exceeded, parsing errors)
    }
  }

  /**
   * Save statistics to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        executions: this.executions,
        savedAt: Date.now(),
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (_error) {
      // Silently ignore localStorage errors (e.g., quota exceeded)
    }
  }
}

/**
 * Singleton instance
 */
export const statsService = new StatsService()

/**
 * Helper to track command execution timing
 */
export class CommandTimer {
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Record the execution result
   */
  record(config: AppConfig, command: string, success: boolean, error?: string): void {
    const responseTime = Date.now() - this.startTime

    statsService.recordExecution({
      timestamp: this.startTime,
      command,
      success,
      provider: config.llmProvider,
      responseTime,
      error,
    })
  }
}
