import { type BrowserWindow, ipcMain } from 'electron'
import * as pty from 'node-pty'

interface TerminalInstance {
  pid: number
  pty: pty.IPty
}

const terminals = new Map<number, TerminalInstance>()

export function createTerminalHandlers(mainWindow: BrowserWindow): void {
  // Create a new terminal
  ipcMain.handle('terminal:create', async () => {
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'zsh'

    // Créer une copie de l'environnement avec le type correct pour node-pty
    const env: Record<string, string | undefined> = {}
    for (const [key, value] of Object.entries(process.env)) {
      env[key] = value
    }

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.cwd(),
      env,
    })

    const terminal: TerminalInstance = {
      pid: ptyProcess.pid,
      pty: ptyProcess,
    }

    terminals.set(ptyProcess.pid, terminal)

    // Forward terminal data to renderer
    ptyProcess.onData(data => {
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

  // Destroy terminal
  ipcMain.handle('terminal:destroy', async (_event, pid: number) => {
    const terminal = terminals.get(pid)
    if (terminal) {
      terminal.pty.kill()
      terminals.delete(pid)
    }
  })
}
