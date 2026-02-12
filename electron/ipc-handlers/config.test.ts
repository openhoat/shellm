/**
 * Tests for config IPC handlers
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

import { createConfigHandlers } from './config'

describe('Config IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Handler Registration', () => {
    test('should register all config IPC handlers', () => {
      const mockStore = {
        get: vi.fn(),
        set: vi.fn(),
      }

      createConfigHandlers(mockMainWindow as any, mockStore)

      expect(mockIpcMain.handle).toHaveBeenCalledWith('config:get', expect.any(Function))
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'config:get-env-sources',
        expect.any(Function)
      )
      expect(mockIpcMain.handle).toHaveBeenCalledWith('config:set', expect.any(Function))
      expect(mockIpcMain.handle).toHaveBeenCalledWith('config:reset', expect.any(Function))
    })
  })

  describe('config:get', () => {
    test('should return merged config when stored config is valid', async () => {
      const mockStore = {
        get: vi.fn(() => ({
          ollama: {
            url: 'http://localhost:11434',
            model: 'llama2',
            temperature: 0.7,
            maxTokens: 1000,
          },
          theme: 'dark',
          fontSize: 14,
          shell: 'bash',
        })),
        set: vi.fn(),
      }

      createConfigHandlers(mockMainWindow as any, mockStore)

      const getHandler = mockIpcMain.handle.mock.calls.find(call => call[0] === 'config:get')?.[1]

      if (getHandler) {
        const result = await getHandler()
        expect(result).toHaveProperty('ollama')
        expect(result.ollama).toHaveProperty('url')
      }
    })

    test('should return default config when stored config is invalid', async () => {
      const mockStore = {
        get: vi.fn(() => ({})),
        set: vi.fn(),
      }

      createConfigHandlers(mockMainWindow as any, mockStore)

      const getHandler = mockIpcMain.handle.mock.calls.find(call => call[0] === 'config:get')?.[1]

      if (getHandler) {
        const result = await getHandler()
        expect(result).toBeDefined()
      }
    })
  })

  describe('config:set', () => {
    test('should store config and notify renderer', async () => {
      const mockStore = {
        get: vi.fn(),
        set: vi.fn(),
      }

      const newConfig = {
        ollama: {
          url: 'http://localhost:8080',
          model: 'mistral',
          temperature: 0.5,
          maxTokens: 2000,
        },
        theme: 'light',
        fontSize: 16,
        shell: 'zsh',
      }

      createConfigHandlers(mockMainWindow as any, mockStore)

      const setHandler = mockIpcMain.handle.mock.calls.find(call => call[0] === 'config:set')?.[1]

      if (setHandler) {
        const result = await setHandler({}, newConfig as any)

        expect(mockStore.set).toHaveBeenCalledWith('config', newConfig)
        expect(mockMainWindow.webContents.send).toHaveBeenCalledWith('config:changed', newConfig)
        expect(result).toBe(newConfig)
      }
    })
  })

  describe('config:reset', () => {
    test('should reset to default config and notify renderer', async () => {
      const mockStore = {
        get: vi.fn(),
        set: vi.fn(),
      }

      createConfigHandlers(mockMainWindow as any, mockStore)

      const resetHandler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'config:reset'
      )?.[1]

      if (resetHandler) {
        const result = await resetHandler()

        expect(mockStore.set).toHaveBeenCalledWith('config', expect.any(Object))
        expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
          'config:changed',
          expect.any(Object)
        )
        expect(result).toBeDefined()
      }
    })
  })
})
