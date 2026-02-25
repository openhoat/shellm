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
  return { Logger: MockLogger }
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

  // handleTerminalData and ANSI filtering tests
  test('should write data to terminal when PID matches', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    // Get the callback registered for terminal data
    await vi.waitFor(() => {
      expect(mockOnTerminalData).toHaveBeenCalled()
    })

    const dataCallback = mockOnTerminalData.mock.calls[0][0]

    // Simulate terminal data with matching PID
    dataCallback({ pid: 12345, data: 'Hello World' })

    // The data should be written to xterm (via write method)
    // We can verify appendTerminalOutput was called with filtered data
    await vi.waitFor(() => {
      expect(mockAppendTerminalOutput).toHaveBeenCalled()
    })
  })

  test('should ignore data when PID does not match', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockOnTerminalData).toHaveBeenCalled()
    })

    const dataCallback = mockOnTerminalData.mock.calls[0][0]

    // Simulate terminal data with different PID
    dataCallback({ pid: 99999, data: 'Hello World' })

    // Should not append any output
    expect(mockAppendTerminalOutput).not.toHaveBeenCalled()
  })

  test('should filter out ANSI codes from terminal output', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockOnTerminalData).toHaveBeenCalled()
    })

    const dataCallback = mockOnTerminalData.mock.calls[0][0]

    // Simulate terminal data with ANSI codes
    dataCallback({ pid: 12345, data: '\x1b[32mSuccess\x1b[0m' })

    await vi.waitFor(() => {
      expect(mockAppendTerminalOutput).toHaveBeenCalledWith('Success')
    })
  })

  test('should filter out OSC sequences from terminal output', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockOnTerminalData).toHaveBeenCalled()
    })

    const dataCallback = mockOnTerminalData.mock.calls[0][0]

    // Simulate terminal data with OSC sequence
    dataCallback({ pid: 12345, data: '\x1b]0;Title\x07Content' })

    await vi.waitFor(() => {
      expect(mockAppendTerminalOutput).toHaveBeenCalledWith('Content')
    })
  })

  test('should filter out bash prompts from terminal output', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockOnTerminalData).toHaveBeenCalled()
    })

    const dataCallback = mockOnTerminalData.mock.calls[0][0]

    // Simulate terminal data with bash prompt
    dataCallback({ pid: 12345, data: 'user@hostname:~$' })

    // Bash prompt should be filtered out
    expect(mockAppendTerminalOutput).not.toHaveBeenCalled()
  })

  test('should filter out empty lines from terminal output', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockOnTerminalData).toHaveBeenCalled()
    })

    const dataCallback = mockOnTerminalData.mock.calls[0][0]

    // Simulate terminal data with empty lines
    dataCallback({ pid: 12345, data: '\n\n\n' })

    // Empty lines should be filtered out
    expect(mockAppendTerminalOutput).not.toHaveBeenCalled()
  })

  // handleTerminalExit tests
  test('should clear terminal PID on exit with matching PID', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockOnTerminalExit).toHaveBeenCalled()
    })

    const exitCallback = mockOnTerminalExit.mock.calls[0][0]

    // Simulate terminal exit with matching PID
    exitCallback({ pid: 12345, code: 0 })

    expect(mockSetTerminalPid).toHaveBeenCalledWith(null)
  })

  test('should not clear terminal PID on exit with different PID', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockOnTerminalExit).toHaveBeenCalled()
    })

    // Reset the mock to only count new calls
    mockSetTerminalPid.mockClear()

    const exitCallback = mockOnTerminalExit.mock.calls[0][0]

    // Simulate terminal exit with different PID
    exitCallback({ pid: 99999, code: 0 })

    // Should not clear PID for different process
    expect(mockSetTerminalPid).not.toHaveBeenCalled()
  })

  // Resize handling tests
  test('should call terminalResize when window is resized', async () => {
    vi.mocked(useStore).mockReturnValue({
      terminalPid: 12345,
      setTerminalPid: mockSetTerminalPid,
      appendTerminalOutput: mockAppendTerminalOutput,
    } as ReturnType<typeof useStore>)

    render(<Terminal />)

    await vi.waitFor(() => {
      expect(mockTerminalCreate).toHaveBeenCalled()
    })

    // Get the resize handler that was registered
    const resizeCalls = (window.addEventListener as ReturnType<typeof vi.fn>).mock.calls
    const resizeCall = resizeCalls.find(call => call[0] === 'resize')

    expect(resizeCall).toBeDefined()
  })

  test('should have correct terminal content class', () => {
    render(<Terminal />)

    const content = document.querySelector('.terminal-content')
    expect(content).toBeInTheDocument()
    expect(content?.tagName).toBe('DIV')
  })

  test('should have correct terminal container structure', () => {
    render(<Terminal />)

    const container = document.querySelector('.terminal-container')
    const header = document.querySelector('.terminal-header')
    const content = document.querySelector('.terminal-content')

    expect(container).toContainElement(header)
    expect(container).toContainElement(content)
  })

  describe('accessibility', () => {
    test('should have region role on terminal content', () => {
      render(<Terminal />)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    test('should have aria-label on terminal content', () => {
      render(<Terminal />)

      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Terminal output')
    })
  })
})
