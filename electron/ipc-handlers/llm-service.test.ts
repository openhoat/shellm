/**
 * Tests for LLM service IPC handlers
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock BrowserWindow and ipcMain
const { ipcMain, mainWindow } = vi.hoisted(() => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
  mainWindow: {
    webContents: {
      send: vi.fn(),
    },
  },
}))

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  ipcMain,
}))

import { createLLMHandlers } from './llm-service'

describe('LLM Service IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Handler Registration', () => {
    test('should register all LLM service IPC handlers', () => {
      createLLMHandlers(mainWindow as any)

      // Get all handler registrations
      const handlerNames = ipcMain.handle.mock.calls.map((call: unknown[]) => call[0])

      // Verify LLM service handlers are registered
      expect(handlerNames).toContain('llm:generate-command')
      expect(handlerNames).toContain('llm:interpret-output')
    })
  })

  describe('llm:generate-command', () => {
    test('should have generate-command handler registered', () => {
      createLLMHandlers(mainWindow as any)

      const generateHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'llm:generate-command'
      )?.[1]

      expect(typeof generateHandler).toBe('function')
    })
  })

  describe('llm:interpret-output', () => {
    test('should have interpret-output handler registered', () => {
      createLLMHandlers(mainWindow as any)

      const interpretHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'llm:interpret-output'
      )?.[1]

      expect(typeof interpretHandler).toBe('function')
    })
  })
})
