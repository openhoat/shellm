import fs from 'node:fs'
import path from 'node:path'
import { type BrowserWindow, desktopCapturer, dialog, ipcMain } from 'electron'

type WindowGetter = () => BrowserWindow | null

/**
 * Create IPC handlers for video recording
 */
export function createVideoHandlers(getWindow: WindowGetter): void {
  /**
   * Get the source ID for the app window (for desktop capture)
   */
  ipcMain.handle('video:get-source-id', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
      })

      // Find the Termaid window
      const termaidSource = sources.find(
        source =>
          source.name.includes('Termaid') ||
          source.name.includes('termaid') ||
          source.name === 'Electron'
      )

      const source = termaidSource || sources[0]

      if (!source) {
        return { error: 'No video source found' }
      }

      return {
        id: source.id,
        name: source.name,
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for video source errors
      console.error('[Video] Failed to get video sources:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  /**
   * Save video data to a file
   */
  ipcMain.handle(
    'video:save',
    async (_event, { base64Data, defaultName }: { base64Data: string; defaultName: string }) => {
      const window = getWindow()
      if (!window) {
        return { error: 'No window available' }
      }

      try {
        // Show save dialog
        const result = await dialog.showSaveDialog(window, {
          title: 'Save Video',
          defaultPath: defaultName,
          filters: [{ name: 'WebM Video', extensions: ['webm'] }],
        })

        if (result.canceled || !result.filePath) {
          return { cancelled: true }
        }

        // Decode base64 and save
        const buffer = Buffer.from(base64Data, 'base64')
        fs.writeFileSync(result.filePath, buffer)

        return { success: true, filePath: result.filePath }
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Debug logging for video save errors
        console.error('[Video] Failed to save video:', error)
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }
  )

  /**
   * Save video data to a specific path (no dialog)
   */
  ipcMain.handle(
    'video:save-to-path',
    async (_event, { base64Data, filePath }: { base64Data: string; filePath: string }) => {
      try {
        // Ensure directory exists
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        // Decode base64 and save
        const buffer = Buffer.from(base64Data, 'base64')
        fs.writeFileSync(filePath, buffer)

        return { success: true, filePath }
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Debug logging for video save errors
        console.error('[Video] Failed to save video to path:', error)
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }
  )
}
