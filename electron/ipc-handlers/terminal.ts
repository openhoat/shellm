import { type BrowserWindow, ipcMain } from 'electron'
import * as pty from 'node-pty'

interface TerminalInstance {
  pid: number
  pty: pty.IPty
  outputBuffer: string[]
  isCapturing: boolean
}

const terminals = new Map<number, TerminalInstance>()

/**
 * Detect the default shell based on the operating system
 */
function detectDefaultShell(): string {
  if (process.platform === 'win32') {
    // Try PowerShell first, then cmd.exe
    return 'powershell.exe'
  }
  // On Unix-like systems, try to use the user's default shell
  const userShell = process.env.SHELL
  if (userShell) {
    // Extract just the shell name (e.g., /bin/bash -> bash)
    return userShell.split('/').pop() || 'bash'
  }
  // Fallback to bash
  return 'bash'
}

/**
 * Get the appropriate arguments for the shell
 * We don't use rc-skipping flags to allow the shell to use its normal configuration
 */
function getShellArgs(shell: string): string[] {
  const shellName = shell.split('/').pop() || shell

  // Windows shells
  if (shellName === 'powershell.exe' || shellName === 'pwsh') {
    return ['-NoLogo', '-NoProfile']
  }
  if (shellName === 'cmd.exe') {
    return []
  }

  // Unix-like shells - use login shell for proper environment
  // Don't skip rc files to allow user configuration
  return ['-l']
}

export function createTerminalHandlers(mainWindow: BrowserWindow): void {
  // Create a new terminal
  ipcMain.handle('terminal:create', async () => {
    // Load config to get the shell preference
    const config = require('../../electron/ipc-handlers/config').getConfig?.() || {}
    const shellPreference = config.shell || 'auto'

    // Determine which shell to use
    let shell: string
    if (shellPreference === 'auto') {
      shell = detectDefaultShell()
    } else {
      shell = shellPreference
    }

    // Create a copy of the environment with the correct type for node-pty
    const env: Record<string, string | undefined> = {}
    for (const [key, value] of Object.entries(process.env)) {
      env[key] = value
    }

    // Enable color support for ls, grep, and other commands (Unix only)
    if (process.platform !== 'win32') {
      env.LS_COLORS =
        'di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40:31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32'
      env.GREP_COLORS = 'ms=01;31:mc=01;31:sl=:cx=:fn=:ln=:bn=:se='
      env.GREP_OPTIONS = '--color=auto'
    }

    // Get appropriate arguments for the shell
    const shellArgs = getShellArgs(shell)

    // Launch the shell with appropriate arguments
    // This ensures that the configured PS1 prompt is used and not overridden
    const ptyProcess = pty.spawn(shell, shellArgs, {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.cwd(),
      env,
    })

    const terminal: TerminalInstance = {
      pid: ptyProcess.pid,
      pty: ptyProcess,
      outputBuffer: [],
      isCapturing: false,
    }

    terminals.set(ptyProcess.pid, terminal)

    // Forward terminal data to renderer
    ptyProcess.onData(data => {
      // Capture output if we're in capturing mode
      if (terminal.isCapturing && data.length > 0) {
        terminal.outputBuffer.push(data)
      }

      mainWindow?.webContents.send('terminal:data', {
        pid: ptyProcess.pid,
        data: data,
      })
    })

    // Handle terminal exit
    ptyProcess.onExit(({ exitCode }) => {
      mainWindow?.webContents.send('terminal:exit', {
        pid: ptyProcess.pid,
        code: exitCode,
      })
      terminals.delete(ptyProcess.pid)
    })

    return ptyProcess.pid
  })

  // Write data to terminal
  ipcMain.handle('terminal:write', async (_event, pid: number, data: string) => {
    const terminal = terminals.get(pid)
    if (terminal) {
      terminal.pty.write(data)
    }
  })

  // Resize terminal
  ipcMain.handle('terminal:resize', async (_event, pid: number, cols: number, rows: number) => {
    const terminal = terminals.get(pid)
    if (terminal) {
      terminal.pty.resize(cols, rows)
    }
  })

  // Start capturing output
  ipcMain.handle('terminal:startCapture', async (_event, pid: number) => {
    const terminal = terminals.get(pid)
    if (terminal) {
      terminal.outputBuffer = []
      terminal.isCapturing = true
      return true
    }
    return false
  })

  // Stop capturing and get output
  ipcMain.handle('terminal:getCapture', async (_event, pid: number) => {
    const terminal = terminals.get(pid)
    if (terminal) {
      terminal.isCapturing = false
      const output = terminal.outputBuffer.join('')
      terminal.outputBuffer = []
      return output
    }
    return ''
  })

  // Destroy terminal
  ipcMain.handle('terminal:destroy', async (_event, pid: number) => {
    const terminal = terminals.get(pid)
    if (terminal) {
      terminal.pty.kill()
      terminals.delete(pid)
    }
  })
}
