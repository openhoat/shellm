import { ipcMain } from 'electron'
import type { ValidationResult } from '../../shared/commandValidation'
import { getAuditService } from '../services/auditService'

type BrowserWindowGetter = () => Electron.BrowserWindow | null

/**
 * Create IPC handlers for audit logging
 */
export function createAuditHandlers(_getWindow: BrowserWindowGetter): void {
  ipcMain.handle(
    'audit:log-command',
    async (
      _event,
      params: {
        command: string
        result: 'success' | 'blocked' | 'cancelled' | 'error' | 'sandboxed'
        validation: ValidationResult
        approvedByUser?: boolean
        userAction?: 'proceed' | 'cancel' | 'close'
        errorMessage?: string
        outputLength?: number
        executionTimeMs?: number
        sandboxMode?: 'none' | 'restricted' | 'docker' | 'system'
        workingDirectory?: string
      }
    ) => {
      return await getAuditService().logCommand(params)
    }
  )

  ipcMain.handle('audit:get-logs', async (_event, query?) => {
    return await getAuditService().getLogs(query)
  })

  ipcMain.handle('audit:get-statistics', async () => {
    return await getAuditService().getStatistics()
  })

  ipcMain.handle('audit:clear-logs', async () => {
    await getAuditService().clearLogs()
    return { success: true }
  })

  ipcMain.handle('audit:export-logs', async () => {
    return await getAuditService().exportLogs()
  })

  ipcMain.handle('audit:export-logs-csv', async () => {
    return await getAuditService().exportLogsAsCsv()
  })
}
