import type { CommandInterpretation } from '@shared/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock window.electronAPI
const mockOllamaInterpretOutput = vi.fn()

Object.defineProperty(window, 'electronAPI', {
  value: {
    ollamaInterpretOutput: mockOllamaInterpretOutput,
  },
  writable: true,
})

describe('Interpret Output Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should successfully interpret command output', async () => {
    const mockOutput =
      'total 24\ndrwxr-xr-x  2 user group 4096 Jan 15 10:30 .\ndrwxr-xr-x  3 user group 4096 Jan 15 10:30 ..\n-rw-r--r--  1 user group  123 Jan 15 10:30 file1.txt\n-rw-r--r--  1 user group  456 Jan 15 10:30 file2.txt\n-rw-r--r--  1 user group  789 Jan 15 10:30 file3.txt\n-rwxr-xr-x  1 user group  987 Jan 15 10:30 script.sh'

    const mockInterpretation: CommandInterpretation = {
      summary: 'The command successfully listed 5 items in the current directory',
      key_findings: [
        'Found 3 text files and 1 executable script',
        'Total disk usage: 2.3KB',
        'Files owned by user:group',
      ],
      warnings: [],
      errors: [],
      recommendations: [],
      successful: true,
    }

    mockOllamaInterpretOutput.mockResolvedValue(mockInterpretation)

    const result = await window.electronAPI.ollamaInterpretOutput(mockOutput)

    expect(mockOllamaInterpretOutput).toHaveBeenCalledWith(mockOutput)
    expect(result).toEqual(mockInterpretation)
    expect(result.successful).toBe(true)
    expect(result.summary).toBeTruthy()
    expect(result.key_findings).toHaveLength(3)
  })

  it('should interpret failed command output with errors', async () => {
    const mockOutput =
      'ls: cannot access nonexistent.txt: No such file or directory\nls: cannot access missing.txt: No such file or directory'

    const mockInterpretation: CommandInterpretation = {
      summary: 'The command failed to find the specified files',
      key_findings: [],
      warnings: [],
      errors: [
        'No such file or directory: nonexistent.txt',
        'No such file or directory: missing.txt',
      ],
      recommendations: [
        'Check if the files exist in the current directory',
        'Verify the file names are spelled correctly',
      ],
      successful: false,
    }

    mockOllamaInterpretOutput.mockResolvedValue(mockInterpretation)

    const result = await window.electronAPI.ollamaInterpretOutput(mockOutput)

    expect(mockOllamaInterpretOutput).toHaveBeenCalledWith(mockOutput)
    expect(result).toEqual(mockInterpretation)
    expect(result.successful).toBe(false)
    expect(result.errors).toHaveLength(2)
    expect(result.recommendations).toHaveLength(2)
  })

  it('should interpret command output with warnings', async () => {
    const mockOutput =
      'WARNING: This is a deprecated option\nWARNING: Another warning\nCommand completed with warnings'

    const mockInterpretation: CommandInterpretation = {
      summary: 'The command completed but with warnings',
      key_findings: ['Command execution finished successfully'],
      warnings: ['Deprecated option detected', 'Additional warning present'],
      errors: [],
      recommendations: [
        'Consider updating the command to use supported options',
        'Review the warnings for potential issues',
      ],
      successful: true,
    }

    mockOllamaInterpretOutput.mockResolvedValue(mockInterpretation)

    const result = await window.electronAPI.ollamaInterpretOutput(mockOutput)

    expect(mockOllamaInterpretOutput).toHaveBeenCalledWith(mockOutput)
    expect(result).toEqual(mockInterpretation)
    expect(result.successful).toBe(true)
    expect(result.warnings).toHaveLength(2)
  })

  it('should handle empty output', async () => {
    const mockOutput = ''

    const mockInterpretation: CommandInterpretation = {
      summary: 'No output produced by the command',
      key_findings: [],
      warnings: [],
      errors: [],
      recommendations: [],
      successful: true,
    }

    mockOllamaInterpretOutput.mockResolvedValue(mockInterpretation)

    const result = await window.electronAPI.ollamaInterpretOutput(mockOutput)

    expect(mockOllamaInterpretOutput).toHaveBeenCalledWith(mockOutput)
    expect(result).toEqual(mockInterpretation)
  })

  it('should handle interpretation service errors', async () => {
    const mockOutput = 'some output'

    mockOllamaInterpretOutput.mockRejectedValue(new Error('Service unavailable'))

    await expect(window.electronAPI.ollamaInterpretOutput(mockOutput)).rejects.toThrow(
      'Service unavailable'
    )
  })

  it('should provide recommendations for successful commands', async () => {
    const mockOutput = 'Disk usage: 85% used\nWarning: Low disk space'

    const mockInterpretation: CommandInterpretation = {
      summary: 'The command shows disk usage at 85% capacity',
      key_findings: ['Disk usage is critically high at 85%'],
      warnings: ['Low disk space warning detected'],
      errors: [],
      recommendations: [
        'Consider cleaning up unnecessary files',
        'Archive old data to free up space',
        'Consider increasing disk capacity',
      ],
      successful: true,
    }

    mockOllamaInterpretOutput.mockResolvedValue(mockInterpretation)

    const result = await window.electronAPI.ollamaInterpretOutput(mockOutput)

    expect(mockOllamaInterpretOutput).toHaveBeenCalledWith(mockOutput)
    expect(result.recommendations).toHaveLength(3)
    expect(result.recommendations[0]).toContain('cleaning up')
  })
})
