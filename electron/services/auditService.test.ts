import { describe, expect, test, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { ValidationResult } from '../../shared/commandValidation'
import { AuditService } from './auditService'

// Mock ValidationResult for testing
const createMockValidation = (
  riskLevel: 'safe' | 'warning' | 'dangerous',
  blocked = false
): ValidationResult => ({
  riskLevel,
  categories: riskLevel === 'dangerous' ? ['file_deletion'] : [],
  reason: riskLevel === 'dangerous' ? 'Dangerous command' : 'Safe command',
  patterns: [],
  suggestions: [],
  blocked,
  sandboxRecommended: riskLevel === 'dangerous',
})

describe('AuditService', () => {
  let auditService: AuditService
  let testDir: string
  let testFilePath: string

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-test-'))
    testFilePath = path.join(testDir, 'test-audit.json')
    // Pass custom file path to avoid electron app dependency
    auditService = new AuditService(100, 'test-audit.json', testFilePath)
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      fs.rmSync(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('logCommand', () => {
    test('should log a successful command', async () => {
      const validation = createMockValidation('safe')
      const entry = await auditService.logCommand({
        command: 'ls -la',
        result: 'success',
        validation,
        outputLength: 1024,
        executionTimeMs: 150,
      })

      expect(entry.id).toBeDefined()
      expect(entry.command).toBe('ls -la')
      expect(entry.result).toBe('success')
      expect(entry.riskLevel).toBe('safe')
      expect(entry.timestamp).toBeDefined()
      expect(entry.outputLength).toBe(1024)
      expect(entry.executionTimeMs).toBe(150)
    })

    test('should log a blocked command', async () => {
      const validation = createMockValidation('dangerous', true)
      const entry = await auditService.logCommand({
        command: 'rm -rf /',
        result: 'blocked',
        validation,
        approvedByUser: false,
      })

      expect(entry.result).toBe('blocked')
      expect(entry.riskLevel).toBe('dangerous')
      expect(entry.approvedByUser).toBe(false)
      expect(entry.categories).toContain('file_deletion')
    })

    test('should log a cancelled command', async () => {
      const validation = createMockValidation('warning')
      const entry = await auditService.logCommand({
        command: 'sudo apt update',
        result: 'cancelled',
        validation,
        userAction: 'cancel',
      })

      expect(entry.result).toBe('cancelled')
      expect(entry.userAction).toBe('cancel')
      expect(entry.riskLevel).toBe('warning')
    })

    test('should log an error command', async () => {
      const validation = createMockValidation('safe')
      const entry = await auditService.logCommand({
        command: 'ls /nonexistent',
        result: 'error',
        validation,
        errorMessage: 'No such file or directory',
      })

      expect(entry.result).toBe('error')
      expect(entry.errorMessage).toBe('No such file or directory')
    })

    test('should log sandboxed command', async () => {
      const validation = createMockValidation('dangerous')
      const entry = await auditService.logCommand({
        command: 'cat /etc/passwd',
        result: 'sandboxed',
        validation,
        approvedByUser: true,
        sandboxMode: 'docker',
        workingDirectory: '/home/user',
      })

      expect(entry.result).toBe('sandboxed')
      expect(entry.sandboxMode).toBe('docker')
      expect(entry.workingDirectory).toBe('/home/user')
    })
  })

  describe('getLogs', () => {
    test('should get all logs', async () => {
      const validation = createMockValidation('safe')
      await auditService.logCommand({ command: 'ls', result: 'success', validation })
      await auditService.logCommand({ command: 'pwd', result: 'success', validation })

      const logs = await auditService.getLogs()
      expect(logs.length).toBe(2)
    })

    test('should filter logs by result', async () => {
      const safeValidation = createMockValidation('safe')
      const dangerousValidation = createMockValidation('dangerous')

      await auditService.logCommand({ command: 'ls', result: 'success', validation: safeValidation })
      await auditService.logCommand({
        command: 'rm -rf /',
        result: 'blocked',
        validation: dangerousValidation,
      })

      const successLogs = await auditService.getLogs({ result: 'success' })
      expect(successLogs.length).toBe(1)
      expect(successLogs[0].result).toBe('success')

      const blockedLogs = await auditService.getLogs({ result: 'blocked' })
      expect(blockedLogs.length).toBe(1)
      expect(blockedLogs[0].result).toBe('blocked')
    })

    test('should filter logs by risk level', async () => {
      const safeValidation = createMockValidation('safe')
      const warningValidation = createMockValidation('warning')
      const dangerousValidation = createMockValidation('dangerous')

      await auditService.logCommand({
        command: 'ls',
        result: 'success',
        validation: safeValidation,
      })
      await auditService.logCommand({
        command: 'sudo ls',
        result: 'success',
        validation: warningValidation,
      })
      await auditService.logCommand({
        command: 'rm -rf /',
        result: 'blocked',
        validation: dangerousValidation,
      })

      const safeLogs = await auditService.getLogs({ riskLevel: 'safe' })
      expect(safeLogs.length).toBe(1)

      const dangerousLogs = await auditService.getLogs({ riskLevel: 'dangerous' })
      expect(dangerousLogs.length).toBe(1)
    })

    test('should filter logs by date range', async () => {
      const validation = createMockValidation('safe')
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      await auditService.logCommand({ command: 'ls', result: 'success', validation })

      const logsFromYesterday = await auditService.getLogs({ fromDate: yesterday })
      expect(logsFromYesterday.length).toBe(1)

      const logsFromTomorrow = await auditService.getLogs({ fromDate: tomorrow })
      expect(logsFromTomorrow.length).toBe(0)
    })

    test('should filter logs by command pattern', async () => {
      const validation = createMockValidation('safe')
      await auditService.logCommand({ command: 'ls -la', result: 'success', validation })
      await auditService.logCommand({ command: 'pwd', result: 'success', validation })
      await auditService.logCommand({ command: 'cat file.txt', result: 'success', validation })

      const logs = await auditService.getLogs({ commandPattern: '^ls' })
      expect(logs.length).toBe(1)
      expect(logs[0].command).toBe('ls -la')
    })

    test('should limit results', async () => {
      const validation = createMockValidation('safe')
      await auditService.logCommand({ command: 'cmd1', result: 'success', validation })
      await auditService.logCommand({ command: 'cmd2', result: 'success', validation })
      await auditService.logCommand({ command: 'cmd3', result: 'success', validation })

      const logs = await auditService.getLogs({ limit: 2 })
      expect(logs.length).toBe(2)
    })
  })

  describe('getStatistics', () => {
    test('should calculate statistics correctly', async () => {
      const safeValidation = createMockValidation('safe')
      const warningValidation = createMockValidation('warning')
      const dangerousValidation = createMockValidation('dangerous')

      await auditService.logCommand({
        command: 'ls',
        result: 'success',
        validation: safeValidation,
        executionTimeMs: 100,
      })
      await auditService.logCommand({
        command: 'sudo ls',
        result: 'success',
        validation: warningValidation,
        executionTimeMs: 200,
      })
      await auditService.logCommand({
        command: 'rm -rf /',
        result: 'blocked',
        validation: dangerousValidation,
      })
      await auditService.logCommand({
        command: 'cat /etc/passwd',
        result: 'cancelled',
        validation: dangerousValidation,
      })

      const stats = await auditService.getStatistics()

      expect(stats.totalCommands).toBe(4)
      expect(stats.successfulCommands).toBe(2)
      expect(stats.blockedCommands).toBe(1)
      expect(stats.cancelledCommands).toBe(1)
      expect(stats.byRiskLevel.safe).toBe(1)
      expect(stats.byRiskLevel.warning).toBe(1)
      expect(stats.byRiskLevel.dangerous).toBe(2)
      expect(stats.averageExecutionTimeMs).toBe(150) // (100 + 200) / 2
    })

    test('should calculate top commands', async () => {
      const validation = createMockValidation('safe')
      await auditService.logCommand({ command: 'ls', result: 'success', validation })
      await auditService.logCommand({ command: 'ls -la', result: 'success', validation })
      await auditService.logCommand({ command: 'ls -la /home', result: 'success', validation })
      await auditService.logCommand({ command: 'pwd', result: 'success', validation })

      const stats = await auditService.getStatistics()

      expect(stats.topCommands.length).toBeGreaterThan(0)
      expect(stats.topCommands[0].command).toBe('ls')
      expect(stats.topCommands[0].count).toBe(3)
    })
  })

  describe('clearLogs', () => {
    test('should clear all logs', async () => {
      const validation = createMockValidation('safe')
      await auditService.logCommand({ command: 'ls', result: 'success', validation })

      await auditService.clearLogs()

      const logs = await auditService.getLogs()
      expect(logs.length).toBe(0)
    })
  })

  describe('exportLogs', () => {
    test('should export logs as JSON', async () => {
      const validation = createMockValidation('safe')
      await auditService.logCommand({ command: 'ls', result: 'success', validation })

      const exported = await auditService.exportLogs()
      const parsed = JSON.parse(exported)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed.length).toBe(1)
    })
  })

  describe('exportLogsAsCsv', () => {
    test('should export logs as CSV', async () => {
      const validation = createMockValidation('safe')
      await auditService.logCommand({ command: 'ls -la', result: 'success', validation })

      const csv = await auditService.exportLogsAsCsv()
      const lines = csv.split('\n')

      expect(lines[0]).toContain('ID,Timestamp,Command,Result,Risk Level')
      expect(lines[1]).toContain('ls -la')
      expect(lines[1]).toContain('success')
    })
  })

  describe('maxLogs limit', () => {
    test('should trim logs when exceeding max', async () => {
      const limitedTestDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-limit-'))
      const limitedTestFilePath = path.join(limitedTestDir, 'test-audit.json')
      const limitedAudit = new AuditService(5, 'test-audit.json', limitedTestFilePath)
      const validation = createMockValidation('safe')

      // Add 10 logs
      for (let i = 0; i < 10; i++) {
        await limitedAudit.logCommand({
          command: `cmd${i}`,
          result: 'success',
          validation,
        })
      }

      const logs = await limitedAudit.getLogs()
      expect(logs.length).toBe(5)

      // Most recent should be first
      expect(logs[0].command).toBe('cmd9')
      expect(logs[4].command).toBe('cmd5')

      // Cleanup
      fs.rmSync(limitedTestDir, { recursive: true, force: true })
    })
  })
})