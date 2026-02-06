import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { useStore } from '../store/useStore'
import './Terminal.css'

export const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const terminalCreatedRef = useRef(false)
  const terminalPidRef = useRef<number | null>(null)
  const { terminalPid, setTerminalPid } = useStore()

  // Keep terminalPidRef in sync with terminalPid
  useEffect(() => {
    terminalPidRef.current = terminalPid
  }, [terminalPid])

  // Listen for terminal exit
  useEffect(() => {
    const handleTerminalExit = (data: { pid: number; code: number }) => {
      if (data.pid === terminalPidRef.current) {
        setTerminalPid(null)
        terminalPidRef.current = null
      }
    }

    window.electronAPI.onTerminalExit(handleTerminalExit)

    return () => {
      // Cleanup is handled by the event system
    }
  }, [setTerminalPid])

  // Create terminal PTY and initialize xterm
  useEffect(() => {
    if (terminalCreatedRef.current || !terminalRef.current || xtermRef.current) return

    const initializeTerminal = async () => {
      console.log('[Terminal] Creating terminal...')

      // Create xterm instance first
      const xterm = new XTerm({
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#d4d4d4',
          cursorAccent: '#1e1e1e',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#ffffff',
        },
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
      })

      // Create fit addon
      const fitAddon = new FitAddon()
      xterm.loadAddon(fitAddon)

      // Mount to DOM
      xterm.open(terminalRef.current)
      fitAddon.fit()

      xtermRef.current = xterm
      fitAddonRef.current = fitAddon

      console.log('[Terminal] xterm initialized')

      // Handle terminal data from main process
      const handleTerminalData = (data: { pid: number; data: string }) => {
        console.log(
          '[Terminal] Received data for PID:',
          data.pid,
          'Current PID:',
          terminalPidRef.current
        )
        if (terminalPidRef.current === null) {
          // Terminal not created yet, ignore data
          console.log('[Terminal] Ignoring data - terminal not created yet')
          return
        }
        if (data.pid === terminalPidRef.current) {
          console.log('[Terminal] Writing data to xterm:', data.data)
          xterm.write(data.data)
        } else {
          console.log('[Terminal] Ignoring data - PID mismatch')
        }
      }

      window.electronAPI.onTerminalData(handleTerminalData)

      // Handle user input
      xterm.onData(data => {
        console.log('[Terminal] User input:', data, 'Current PID:', terminalPidRef.current)
        if (terminalPidRef.current) {
          window.electronAPI.terminalWrite(terminalPidRef.current, data)
        } else {
          console.log('[Terminal] Cannot write - no terminal PID')
        }
      })

      // Handle resize
      const handleResize = () => {
        fitAddon.fit()
        if (terminalPidRef.current) {
          window.electronAPI.terminalResize(terminalPidRef.current, xterm.cols, xterm.rows)
        }
      }

      window.addEventListener('resize', handleResize)

      console.log('[Terminal] Event handlers attached')

      // Now create the PTY
      try {
        const pid = await window.electronAPI.terminalCreate()
        console.log('[Terminal] Terminal PTY created with PID:', pid)
        terminalPidRef.current = pid
        setTerminalPid(pid)
        terminalCreatedRef.current = true
      } catch (error) {
        console.error('[Terminal] Failed to create terminal:', error)
      }

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize)
        xterm.dispose()
        // Event listener cleanup is handled by the event system
        if (terminalPidRef.current) {
          window.electronAPI.terminalDestroy(terminalPidRef.current)
        }
      }
    }

    initializeTerminal()
  }, [setTerminalPid])

  useEffect(() => {
    // Fit terminal when terminalPid changes
    if (fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit()
      }, 100)
    }
  }, [])

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
      </div>
      <div ref={terminalRef} className="terminal-content" />
    </div>
  )
}
