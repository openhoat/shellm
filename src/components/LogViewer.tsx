import { type LogEntry, LogLevel, logManager } from '@shared/logger'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './LogViewer.css'

interface LogViewerProps {
  onClose: () => void
}

export const LogViewer = ({ onClose }: LogViewerProps) => {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<LogEntry[]>(() => logManager.getAllLogs())
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Subscribe to new logs
  useEffect(() => {
    const unsubscribe = logManager.subscribe((entry: LogEntry) => {
      setLogs(prev => [...prev, entry].slice(-500))
      // Auto-scroll when new log arrives if enabled
      if (autoScroll) {
        scrollToBottom()
      }
    })
    return unsubscribe
  }, [autoScroll, scrollToBottom])

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Filter logs by level and search query
  const filteredLogs = logs.filter(log => {
    if (selectedLevel !== 'all' && log.level !== selectedLevel) {
      return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        log.message.toLowerCase().includes(query) ||
        log.context.toLowerCase().includes(query) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(query))
      )
    }
    return true
  })

  const handleClearLogs = () => {
    if (window.confirm(t('logs.confirmClear', 'Are you sure you want to clear all logs?'))) {
      logManager.clearLogs()
      setLogs([])
    }
  }

  const handleExportLogs = () => {
    const data = logManager.exportLogs('json')
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `termaid-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleExpand = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  const getLevelName = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG'
      case LogLevel.INFO:
        return 'INFO'
      case LogLevel.WARN:
        return 'WARN'
      case LogLevel.ERROR:
        return 'ERROR'
      default:
        return 'UNKNOWN'
    }
  }

  const getLevelClass = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'log-level-debug'
      case LogLevel.INFO:
        return 'log-level-info'
      case LogLevel.WARN:
        return 'log-level-warn'
      case LogLevel.ERROR:
        return 'log-level-error'
      default:
        return ''
    }
  }

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getLogId = (log: LogEntry, index: number): string => {
    return `${log.timestamp}-${log.context}-${index}`
  }

  const levelOptions: Array<{ value: LogLevel | 'all'; label: string }> = [
    { value: 'all', label: t('logs.levels.all', 'All') },
    { value: LogLevel.ERROR, label: t('logs.levels.error', 'Error') },
    { value: LogLevel.WARN, label: t('logs.levels.warn', 'Warning') },
    { value: LogLevel.INFO, label: t('logs.levels.info', 'Info') },
    { value: LogLevel.DEBUG, label: t('logs.levels.debug', 'Debug') },
  ]

  return (
    <div className="log-viewer-overlay">
      <div ref={panelRef} className="log-viewer">
        <div className="log-viewer-header">
          <h2>{t('logs.title', 'Application Logs')}</h2>
          <button type="button" onClick={onClose} className="close-button" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="log-viewer-controls">
          <div className="log-filters">
            <div className="level-filter">
              {levelOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={selectedLevel === option.value ? 'active' : ''}
                  onClick={() => setSelectedLevel(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder={t('logs.search', 'Search logs...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="auto-scroll-container">
              <label>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={e => setAutoScroll(e.target.checked)}
                />
                {t('logs.autoScroll', 'Auto-scroll')}
              </label>
            </div>
          </div>
        </div>

        <div className="log-viewer-content">
          {filteredLogs.length === 0 ? (
            <div className="log-empty">{t('logs.empty', 'No logs to display')}</div>
          ) : (
            <div className="log-entries">
              {filteredLogs.map((log, index) => {
                const logId = getLogId(log, index)
                return (
                  <div key={logId} className={`log-entry ${getLevelClass(log.level)}`}>
                    <button
                      type="button"
                      className="log-header"
                      onClick={() => toggleExpand(logId)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleExpand(logId)
                        }
                      }}
                    >
                      <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                      <span className={`log-level ${getLevelClass(log.level)}`}>
                        {getLevelName(log.level)}
                      </span>
                      <span className="log-context">[{log.context}]</span>
                      <span className="log-message">{log.message}</span>
                      {log.data && <span className="log-data-indicator">+</span>}
                    </button>
                    {log.data && expandedLogs.has(logId) && (
                      <div className="log-data">
                        <pre>{JSON.stringify(log.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        <div className="log-viewer-footer">
          <div className="log-count">
            {t('logs.count', '{{count}} logs', { count: filteredLogs.length })}
          </div>
          <div className="log-actions">
            <button type="button" onClick={handleExportLogs} className="export-button">
              {t('logs.export', 'Export Logs')}
            </button>
            <button type="button" onClick={handleClearLogs} className="clear-button">
              {t('logs.clear', 'Clear Logs')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
