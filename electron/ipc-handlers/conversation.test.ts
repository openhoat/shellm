/**
 * Tests for conversation IPC handlers
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock BrowserWindow and ipcMain
const { ipcMain, mainWindow, mockApp } = vi.hoisted(() => ({
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
  mockApp: {
    getPath: vi.fn(() => '/tmp/test'),
  },
}))

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  ipcMain,
  app: mockApp,
}))

import { createConversationHandlers } from './conversation'

describe('Conversation IPC Handlers', () => {
  // Window getter that returns the mock window
  const getWindow = () => mainWindow

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Handler Registration', () => {
    test('should register all conversation IPC handlers', () => {
      createConversationHandlers(getWindow as any)

      // Get all handler registrations
      const handlerNames = ipcMain.handle.mock.calls.map((call: unknown[]) => call[0])

      // Verify core conversation handlers are registered
      expect(handlerNames).toContain('conversation:get-all')
      expect(handlerNames).toContain('conversation:get')
      expect(handlerNames).toContain('conversation:create')
      expect(handlerNames).toContain('conversation:add-message')
      expect(handlerNames).toContain('conversation:update')
      expect(handlerNames).toContain('conversation:delete')
      expect(handlerNames).toContain('conversation:clear-all')
      expect(handlerNames).toContain('conversation:export')
      expect(handlerNames).toContain('conversation:export-all')
    })
  })

  describe('conversation:get-all', () => {
    test('should have get-all handler registered', () => {
      createConversationHandlers(getWindow as any)

      const getAllHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:get-all'
      )?.[1]

      expect(typeof getAllHandler).toBe('function')
    })
  })

  describe('conversation:get', () => {
    test('should have get handler registered', () => {
      createConversationHandlers(getWindow as any)

      const getHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:get'
      )?.[1]

      expect(typeof getHandler).toBe('function')
    })
  })

  describe('conversation:create', () => {
    test('should have create handler registered', () => {
      createConversationHandlers(getWindow as any)

      const createHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:create'
      )?.[1]

      expect(typeof createHandler).toBe('function')
    })
  })

  describe('conversation:add-message', () => {
    test('should have add-message handler registered', () => {
      createConversationHandlers(getWindow as any)

      const addMessageHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:add-message'
      )?.[1]

      expect(typeof addMessageHandler).toBe('function')
    })
  })

  describe('conversation:update', () => {
    test('should have update handler registered', () => {
      createConversationHandlers(getWindow as any)

      const updateHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:update'
      )?.[1]

      expect(typeof updateHandler).toBe('function')
    })
  })

  describe('conversation:delete', () => {
    test('should have delete handler registered', () => {
      createConversationHandlers(getWindow as any)

      const deleteHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:delete'
      )?.[1]

      expect(typeof deleteHandler).toBe('function')
    })
  })

  describe('conversation:clear-all', () => {
    test('should have clear-all handler registered', () => {
      createConversationHandlers(getWindow as any)

      const clearAllHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:clear-all'
      )?.[1]

      expect(typeof clearAllHandler).toBe('function')
    })
  })

  describe('conversation:export', () => {
    test('should have export handler registered', () => {
      createConversationHandlers(getWindow as any)

      const exportHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:export'
      )?.[1]

      expect(typeof exportHandler).toBe('function')
    })
  })

  describe('conversation:export-all', () => {
    test('should have export-all handler registered', () => {
      createConversationHandlers(getWindow as any)

      const exportAllHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'conversation:export-all'
      )?.[1]

      expect(typeof exportAllHandler).toBe('function')
    })
  })
})
