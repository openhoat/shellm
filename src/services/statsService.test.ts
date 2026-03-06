import type { AppConfig } from '@shared/types'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { CommandTimer, StatsService } from './statsService'

describe('StatsService', () => {
  let statsService: StatsService
  const _mockConfig: AppConfig = {
    llmProvider: 'ollama',
    ollama: {
      url: 'http://localhost:11434',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 1000,
    },
    claude: {
      apiKey: '',
      model: 'claude-haiku-4-5-20251001',
      temperature: 0.7,
      maxTokens: 1000,
    },
    openai: {
      apiKey: '',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000,
    },
    theme: 'dark',
    fontSize: 14,
    shell: 'auto',
    chatLanguage: 'auto',
  }

  beforeEach(() => {
    statsService = new StatsService()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('should start with empty statistics', () => {
    const stats = statsService.getStats()

    expect(stats.totalCommands).toBe(0)
    expect(stats.totalSuccess).toBe(0)
    expect(stats.totalFailures).toBe(0)
    expect(stats.overallSuccessRate).toBe(0)
    expect(Object.keys(stats.providerStats)).toHaveLength(0)
  })

  test('should record a successful command execution', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'ls -la',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    const stats = statsService.getStats()

    expect(stats.totalCommands).toBe(1)
    expect(stats.totalSuccess).toBe(1)
    expect(stats.totalFailures).toBe(0)
    expect(stats.overallSuccessRate).toBe(100)
  })

  test('should record a failed command execution', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'invalid-command',
      success: false,
      provider: 'ollama',
      responseTime: 500,
      error: 'Connection failed',
    })

    const stats = statsService.getStats()

    expect(stats.totalCommands).toBe(1)
    expect(stats.totalSuccess).toBe(0)
    expect(stats.totalFailures).toBe(1)
    expect(stats.overallSuccessRate).toBe(0)
  })

  test('should calculate per-provider statistics', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'ls',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'pwd',
      success: true,
      provider: 'claude',
      responseTime: 500,
    })

    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'whoami',
      success: false,
      provider: 'ollama',
      responseTime: 800,
      error: 'Timeout',
    })

    const stats = statsService.getStats()

    expect(stats.providerStats.ollama.totalCommands).toBe(2)
    expect(stats.providerStats.ollama.successCount).toBe(1)
    expect(stats.providerStats.ollama.failureCount).toBe(1)
    expect(stats.providerStats.ollama.successRate).toBe(50)

    expect(stats.providerStats.claude.totalCommands).toBe(1)
    expect(stats.providerStats.claude.successCount).toBe(1)
    expect(stats.providerStats.claude.successRate).toBe(100)
  })

  test('should calculate average response time', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'ls',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'pwd',
      success: true,
      provider: 'ollama',
      responseTime: 2000,
    })

    const stats = statsService.getStats()

    expect(stats.providerStats.ollama.avgResponseTime).toBe(1500)
    expect(stats.providerStats.ollama.minResponseTime).toBe(1000)
    expect(stats.providerStats.ollama.maxResponseTime).toBe(2000)
  })

  test('should clear all statistics', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'ls',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    let stats = statsService.getStats()
    expect(stats.totalCommands).toBe(1)

    statsService.clearStats()

    stats = statsService.getStats()
    expect(stats.totalCommands).toBe(0)
    expect(Object.keys(stats.providerStats)).toHaveLength(0)
  })

  test('should persist statistics to localStorage', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'ls',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    // Create a new instance to load from localStorage
    const newStatsService = new StatsService()
    const stats = newStatsService.getStats()

    expect(stats.totalCommands).toBe(1)
  })

  test('should get statistics for a specific provider', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'ls',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    const providerStats = statsService.getProviderStats('ollama')

    expect(providerStats).not.toBeNull()
    expect(providerStats?.totalCommands).toBe(1)
  })

  test('should return null for non-existent provider', () => {
    const providerStats = statsService.getProviderStats('nonexistent')

    expect(providerStats).toBeNull()
  })

  test('should filter statistics by time period', () => {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000

    statsService.recordExecution({
      timestamp: twoDaysAgo,
      command: 'old-command',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    statsService.recordExecution({
      timestamp: now,
      command: 'recent-command',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    const stats = statsService.getStatsForPeriod(oneDayAgo, now)

    expect(stats.totalCommands).toBe(1)
  })

  test('should export statistics as JSON', () => {
    statsService.recordExecution({
      timestamp: Date.now(),
      command: 'ls',
      success: true,
      provider: 'ollama',
      responseTime: 1000,
    })

    const exported = statsService.exportStats()
    const parsed = JSON.parse(exported)

    expect(parsed.stats.totalCommands).toBe(1)
    expect(parsed.executions).toHaveLength(1)
  })
})

describe('CommandTimer', () => {
  test('should record execution time', async () => {
    // Import the singleton statsService
    const { statsService: singletonStatsService } = await import('./statsService')

    // Clear stats before test
    singletonStatsService.clearStats()

    const timer = new CommandTimer()

    // Wait a bit to ensure some time passes
    await new Promise(resolve => setTimeout(resolve, 100))

    const mockConfig: AppConfig = {
      llmProvider: 'ollama',
      ollama: {
        url: 'http://localhost:11434',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 1000,
      },
      claude: {
        apiKey: '',
        model: 'claude-haiku-4-5-20251001',
        temperature: 0.7,
        maxTokens: 1000,
      },
      openai: {
        apiKey: '',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1000,
      },
      theme: 'dark',
      fontSize: 14,
      shell: 'auto',
      chatLanguage: 'auto',
    }

    timer.record(mockConfig, 'ls -la', true)

    const stats = singletonStatsService.getStats()
    expect(stats.totalCommands).toBeGreaterThan(0)
  })
})
