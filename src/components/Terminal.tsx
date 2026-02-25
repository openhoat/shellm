import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { stripAnsiCodes, stripOscSequences } from '@shared/ansi'
import { useStore } from '../store/useStore'
import { Logger } from '../utils/logger'
import './Terminal.css'

const logger = new Logger('Terminal')

export const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const terminalCreatedRef = useRef(false)
  const terminalPidRef = useRef<number | null>(null)
  const { terminalPid, setTerminalPid, appendTerminalOutput } = useStore()

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

    const unsubscribe = window.electronAPI.onTerminalExit(handleTerminalExit)

    return unsubscribe
  }, [setTerminalPid])

  // Create terminal PTY and initialize xterm
  useEffect(() => {
    if (terminalCreatedRef.current || !terminalRef.current || xtermRef.current) return

    let unsubscribeData: (() => void) | undefined
    let handleResize: (() => void) | undefined

    const initializeTerminal = async () => {
      logger.debug('Creating terminal...')

      // Create xterm instance first with Terminator-like theme
      const xterm = new XTerm({
        theme: {
          // Terminator-like dark theme
          background: '#2d2d2d',
          foreground: '#e0e0e0',
          selectionBackground: '#b4d5fe',
          selectionInactiveBackground: '#5a5a5a',
          cursor: '#16b614',
          cursorAccent: '#2d2d2d',
          // ANSI colors - more vibrant and closer to Terminator
          black: '#000000',
          red: '#c91b00',
          green: '#00c800',
          yellow: '#c7c400',
          blue: '#0225c7',
          magenta: '#c930c7',
          cyan: '#00c5c7',
          white: '#c7c7c7',
          // Bright ANSI colors
          brightBlack: '#676767',
          brightRed: '#ff6e67',
          brightGreen: '#5ffa68',
          brightYellow: '#fef02a',
          brightBlue: '#6a76fb',
          brightMagenta: '#ff77ff',
          brightCyan: '#5ffdff',
          brightWhite: '#ffffff',
        },
        fontSize: 13,
        fontFamily: '"Ubuntu Mono", "DejaVu Sans Mono", "Consolas", "Courier New", monospace',
        cursorBlink: true,
        cursorStyle: 'block',
        cursorWidth: 2,
        allowProposedApi: true,
      })

      // Create fit addon
      const fitAddon = new FitAddon()
      xterm.loadAddon(fitAddon)

      // Mount to DOM
      xterm.open(terminalRef.current)
      fitAddon.fit()

      xtermRef.current = xterm
      fitAddonRef.current = fitAddon

      logger.debug('xterm initialized')

      // Handle terminal data from main process
      const handleTerminalData = (data: { pid: number; data: string }) => {
        logger.debug(`Received data for PID: ${data.pid}, Current PID: ${terminalPidRef.current}`)

        if (terminalPidRef.current === null) {
          logger.debug('Ignoring data - terminal not created yet')
          return
        }

        if (data.pid === terminalPidRef.current) {
          logger.debug(`Writing data to xterm: ${data.data}`)
          xterm.write(data.data)

          // Capture terminal output for interpretation
          const allLines = data.data.split('\n')

          const filteredLines = allLines
            .map(line => {
              const cleanedOsc = stripOscSequences(line)
              const cleanedAnsi = stripAnsiCodes(cleanedOsc)
              const cleanedCr = cleanedAnsi.replace(/\r/g, '')
              return cleanedCr.trim()
            })
            .filter(line => {
              if (line.length === 0) {
                return false
              }

              const isBashPrompt = /^[\w-]+@[\w-]+:[~\w-/]*\$$/.test(line)

              if (isBashPrompt) {
                logger.debug(`Filtering out bash prompt: "${line}"`)
                return false
              }

              return true
            })

          logger.debug(`Total lines: ${allLines.length}, Filtered: ${filteredLines.length}`)

          if (filteredLines.length > 0) {
            for (const line of filteredLines) {
              appendTerminalOutput(line)
            }
            logger.debug(`Appended ${filteredLines.length} lines to terminalOutput`)
          }
        } else {
          logger.debug('Ignoring data - PID mismatch')
        }
      }

      unsubscribeData = window.electronAPI.onTerminalData(handleTerminalData)

      // Handle user input
      xterm.onData(data => {
        logger.debug(`User input: ${data}, Current PID: ${terminalPidRef.current}`)
        if (terminalPidRef.current) {
          window.electronAPI.terminalWrite(terminalPidRef.current, data)
        } else {
          logger.debug('Cannot write - no terminal PID')
        }
      })

      // Handle resize
      handleResize = () => {
        fitAddon.fit()
        if (terminalPidRef.current) {
          window.electronAPI.terminalResize(terminalPidRef.current, xterm.cols, xterm.rows)
        }
      }

      window.addEventListener('resize', handleResize)

      logger.debug('Event handlers attached')

      // Now create the PTY
      try {
        const pid = await window.electronAPI.terminalCreate()
        logger.info(`Terminal PTY created with PID: ${pid}`)
        terminalPidRef.current = pid
        setTerminalPid(pid)
        terminalCreatedRef.current = true
      } catch (error) {
        logger.error('Failed to create terminal', error)
      }
    }

    initializeTerminal()

    return () => {
      unsubscribeData?.()
      if (handleResize) {
        window.removeEventListener('resize', handleResize)
      }
      if (xtermRef.current) {
        xtermRef.current.dispose()
      }
      if (terminalPidRef.current) {
        window.electronAPI.terminalDestroy(terminalPidRef.current)
      }
    }
  }, [setTerminalPid, appendTerminalOutput])

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
      {/* biome-ignore lint/a11y/useSemanticElements: terminal content managed by xterm.js, section not suitable */}
      <div
        ref={terminalRef}
        className="terminal-content"
        role="region"
        aria-label="Terminal output"
      />
    </div>
  )
}
