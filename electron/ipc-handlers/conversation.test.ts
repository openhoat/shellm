/**
 * Tests for conversation IPC handlers
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock BrowserWindow and ipcMain
const mockApp = {
  getPath: vi.fn(() => '/tmp/test'),
}

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
  app: mockApp,
}))

import { createConversationHandlers } from './conversation'

describe('Conversation IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Handler Registration', () => {
    test('should register all conversation IPC handlers', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      // Get all handler registrations
      const handlerNames = mockIpcMain.handle.mock.calls.map(call => call[0])

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
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const getAllHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:get-all'
      )?.[1]

      expect(typeof getAllHandler).toBe('function')
    })
  })

  describe('conversation:get', () => {
    test('should have get handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const getHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:get'
      )?.[1]

      expect(typeof getHandler).toBe('function')
    })
  })

  describe('conversation:create', () => {
    test('should have create handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const createHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:create'
      )?.[1]

      expect(typeof createHandler).toBe('function')
    })
  })

  describe('conversation:add-message', () => {
    test('should have add-message handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const addMessageHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:add-message'
      )?.[1]

      expect(typeof addMessageHandler).toBe('function')
    })
  })

  describe('conversation:update', () => {
    test('should have update handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const updateHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:update'
      )?.[1]

      expect(typeof updateHandler).toBe('function')
    })
  })

  describe('conversation:delete', () => {
    test('should have delete handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const deleteHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:delete'
      )?.[1]

      expect(typeof deleteHandler).toBe('function')
    })
  })

  describe('conversation:clear-all', () => {
    test('should have clear-all handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const clearAllHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:clear-all'
      )?.[1]

      expect(typeof clearAllHandler).toBe('function')
    })
  })

  describe('conversation:export', () => {
    test('should have export handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const exportHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:export'
      )?.[1]

      expect(typeof exportHandler).toBe('function')
    })
  })

  describe('conversation:export-all', () => {
    test('should have export-all handler registered', () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock object for testing
      createConversationHandlers(mockMainWindow as any)

      const exportAllHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'conversation:export-all'
      )?.[1]

      expect(typeof exportAllHandler).toBe('function')
    })
  })
})
