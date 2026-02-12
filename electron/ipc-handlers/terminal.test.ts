/**
 * Tests for terminal IPC handlers
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock node-pty
vi.mock('node-pty', () => ({
  spawn: vi.fn(),
}))

// Mock config handler
vi.mock('./config', () => ({
  getConfig: vi.fn(() => ({ shell: 'bash' })),
}))

// Mock BrowserWindow and ipcMain
const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
}

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  ipcMain: mockIpcMain,
}))

import { createTerminalHandlers } from './terminal'

describe('Terminal IPC Handlers', () => {
  let mockMainWindow: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockMainWindow = {
      webContents: {
        send: vi.fn(),
      },
    }

    // Clear terminal handlers registry
    mockIpcMain.handle.mockClear()
  })

  describe('Handler Registration', () => {
    test('should register all terminal IPC handlers', () => {
      createTerminalHandlers(mockMainWindow as any)

      // Verify all handlers are registered
      expect(mockIpcMain.handle).toHaveBeenCalledWith('terminal:create', expect.any(Function))
      expect(mockIpcMain.handle).toHaveBeenCalledWith('terminal:write', expect.any(Function))
      expect(mockIpcMain.handle).toHaveBeenCalledWith('terminal:resize', expect.any(Function))
      expect(mockIpcMain.handle).toHaveBeenCalledWith('terminal:startCapture', expect.any(Function))
      expect(mockIpcMain.handle).toHaveBeenCalledWith('terminal:getCapture', expect.any(Function))
      expect(mockIpcMain.handle).toHaveBeenCalledWith('terminal:destroy', expect.any(Function))
    })
  })

  describe('terminal:write', () => {
    test('should have write handler registered', () => {
      createTerminalHandlers(mockMainWindow as any)

      const writeHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'terminal:write'
      )?.[1]

      expect(typeof writeHandler).toBe('function')
    })
  })

  describe('terminal:resize', () => {
    test('should have resize handler registered', () => {
      createTerminalHandlers(mockMainWindow as any)

      const resizeHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'terminal:resize'
      )?.[1]

      expect(typeof resizeHandler).toBe('function')
    })
  })

  describe('terminal:startCapture', () => {
    test('should have startCapture handler registered', () => {
      createTerminalHandlers(mockMainWindow as any)

      const startCaptureHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'terminal:startCapture'
      )?.[1]

      expect(typeof startCaptureHandler).toBe('function')
    })
  })

  describe('terminal:getCapture', () => {
    test('should have getCapture handler registered', () => {
      createTerminalHandlers(mockMainWindow as any)

      const getCaptureHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'terminal:getCapture'
      )?.[1]

      expect(typeof getCaptureHandler).toBe('function')
    })
  })

  describe('terminal:destroy', () => {
    test('should have destroy handler registered', () => {
      createTerminalHandlers(mockMainWindow as any)

      const destroyHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'terminal:destroy'
      )?.[1]

      expect(typeof destroyHandler).toBe('function')
    })
  })
})
