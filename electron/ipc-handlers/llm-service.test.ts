/**
 * Tests for LLM service IPC handlers
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock BrowserWindow and ipcMain
const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
}

const mockMainWindow = {
  webContents: {
    send: vi.fn(),
  },
}

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  ipcMain: mockIpcMain,
}))

const { createLLMHandlers } = await import('./llm-service.ts')

describe('LLM Service IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Handler Registration', () => {
    test('should register all LLM service IPC handlers', () => {
      createLLMHandlers(mockMainWindow as any)

      // Get all handler registrations
      const handlerNames = mockIpcMain.handle.mock.calls.map(call => call[0])

      // Verify LLM service handlers are registered
      expect(handlerNames).toContain('llm:generate-command')
      expect(handlerNames).toContain('llm:interpret-output')
    })
  })

  describe('llm:generate-command', () => {
    test('should have generate-command handler registered', () => {
      createLLMHandlers(mockMainWindow as any)

      const generateHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'llm:generate-command'
      )?.[1]

      expect(typeof generateHandler).toBe('function')
    })
  })

  describe('llm:interpret-output', () => {
    test('should have interpret-output handler registered', () => {
      createLLMHandlers(mockMainWindow as any)

      const interpretHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'llm:interpret-output'
      )?.[1]

      expect(typeof interpretHandler).toBe('function')
    })
  })
})
