import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock xterm and xterm-addon-fit before other imports
vi.mock('xterm', () => {
  class MockTerminal {
    loadAddon = vi.fn()
    open = vi.fn()
    onData = vi.fn()
    dispose = vi.fn()
    write = vi.fn()
    cols = 80
    rows = 24
  }
  return { Terminal: MockTerminal }
})

vi.mock('xterm-addon-fit', () => {
  class MockFitAddon {
    fit = vi.fn()
  }
  return { FitAddon: MockFitAddon }
})

vi.mock('xterm/css/xterm.css', () => ({}))

vi.mock('../store/useStore')

vi.mock('../utils/logger', () => {
  class MockLogger {
    debug = vi.fn()
    info = vi.fn()
    error = vi.fn()
    warn = vi.fn()
  }
  return { default: MockLogger }
})

import { useStore } from '../store/useStore'
import { Terminal } from './Terminal'

// Restore window event listener methods lost when setup.ts replaces window
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
  configurable: true,
})
Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
  configurable: true,
})

const mockSetTerminalPid = vi.fn()
const mockAppendTerminalOutput = vi.fn()

// Mock electronAPI for Terminal
const mockTerminalCreate = vi.fn().mockResolvedValue(12345)
const mockTerminalWrite = vi.fn()
const mockTerminalResize = vi.fn()
const mockTerminalDestroy = vi.fn()
const mockOnTerminalData = vi.fn()
const mockOnTerminalExit = vi.fn()
const mockTerminalStartCapture = vi.fn().mockResolvedValue(undefined)
const mockTerminalGetCapture = vi.fn().mockResolvedValue('')

Object.defineProperty(window, 'electronAPI', {
  value: {
    terminalCreate: mockTerminalCreate,
    terminalWrite: mockTerminalWrite,
    terminalResize: mockTerminalResize,
    terminalDestroy: mockTerminalDestroy,
    onTerminalData: mockOnTerminalData,
    onTerminalExit: mockOnTerminalExit,
    terminalStartCapture: mockTerminalStartCapture,
    terminalGetCapture: mockTerminalGetCapture,
  },
  writable: true,
})

describe('Terminal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useStore).mockReturnValue({
      terminalPid: null,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)
  })

  test('should render the terminal container', () => {
    render(<Terminal />)

    const container = document.querySelector('.terminal-container')
    expect(container).toBeInTheDocument()
  })

  test('should render the terminal header', () => {
    render(<Terminal />)

    const header = document.querySelector('.terminal-header')
    expect(header).toBeInTheDocument()
  })

  test('should display Terminal title', () => {
    render(<Terminal />)

    expect(screen.getByText('Terminal')).toBeInTheDocument()
  })

  test('should render the terminal content area', () => {
    render(<Terminal />)

    const content = document.querySelector('.terminal-content')
    expect(content).toBeInTheDocument()
  })

  test('should call electronAPI.terminalCreate on mount', async () => {
    render(<Terminal />)

    // Wait for the async initialization
    await vi.waitFor(() => {
      expect(mockTerminalCreate).toHaveBeenCalled()
    })
  })

  test('should register terminal data handler', () => {
    render(<Terminal />)

    expect(mockOnTerminalData).toHaveBeenCalled()
  })

  test('should register terminal exit handler', () => {
    render(<Terminal />)

    expect(mockOnTerminalExit).toHaveBeenCalled()
  })

  test('should set terminal PID after successful creation', async () => {
    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockSetTerminalPid).toHaveBeenCalledWith(12345)
    })
  })
})
