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
const { ipcMain } = vi.hoisted(() => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
}))

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  ipcMain,
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
    ipcMain.handle.mockClear()
  })

  // Window getter that returns the mock window
  const getWindow = () => mockMainWindow

  describe('Handler Registration', () => {
    test('should register all terminal IPC handlers', () => {
      createTerminalHandlers(getWindow as any)

      // Verify all handlers are registered
      expect(ipcMain.handle).toHaveBeenCalledWith('terminal:create', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('terminal:write', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('terminal:resize', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('terminal:startCapture', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('terminal:getCapture', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('terminal:destroy', expect.any(Function))
    })
  })

  describe('terminal:write', () => {
    test('should have write handler registered', () => {
      createTerminalHandlers(getWindow as any)

      const writeHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'terminal:write'
      )?.[1]

      expect(typeof writeHandler).toBe('function')
    })
  })

  describe('terminal:resize', () => {
    test('should have resize handler registered', () => {
      createTerminalHandlers(getWindow as any)

      const resizeHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'terminal:resize'
      )?.[1]

      expect(typeof resizeHandler).toBe('function')
    })
  })

  describe('terminal:startCapture', () => {
    test('should have startCapture handler registered', () => {
      createTerminalHandlers(getWindow as any)

      const startCaptureHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'terminal:startCapture'
      )?.[1]

      expect(typeof startCaptureHandler).toBe('function')
    })
  })

  describe('terminal:getCapture', () => {
    test('should have getCapture handler registered', () => {
      createTerminalHandlers(getWindow as any)

      const getCaptureHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'terminal:getCapture'
      )?.[1]

      expect(typeof getCaptureHandler).toBe('function')
    })
  })

  describe('terminal:destroy', () => {
    test('should have destroy handler registered', () => {
      createTerminalHandlers(getWindow as any)

      const destroyHandler = ipcMain.handle.mock.calls.find(
        (call: unknown[]) => call[0] === 'terminal:destroy'
      )?.[1]

      expect(typeof destroyHandler).toBe('function')
    })
  })
})
