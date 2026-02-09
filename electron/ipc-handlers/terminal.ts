import { type BrowserWindow, ipcMain } from 'electron'
import * as pty from 'node-pty'

interface TerminalInstance {
  pid: number
  pty: pty.IPty
  outputBuffer: string[]
  isCapturing: boolean
}

const terminals = new Map<number, TerminalInstance>()

export function createTerminalHandlers(mainWindow: BrowserWindow): void {
  // Create a new terminal
  ipcMain.handle('terminal:create', async () => {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash'

    // Crer une copie de l'environnement avec le type correct pour node-pty
    const env: Record<string, string | undefined> = {}
    for (const [key, value] of Object.entries(process.env)) {
      env[key] = value
    }

    // Configurer un prompt bash simple et prévisible
    // Format: user@hostname:~$
    env.PS1 = '\\u@\\h:\\w\\$ '

    // Lancer bash avec --norc pour ignorer .bashrc et autres fichiers de configuration
    // Cela garantit que le prompt PS1 configuré est utilisé et non surchargé
    const ptyProcess = pty.spawn(shell, ['--norc'], {
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
