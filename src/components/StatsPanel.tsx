import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type ProviderStats, statsService, type UsageStats } from '../services/statsService'
import './StatsPanel.css'

interface StatsPanelProps {
  onClose: () => void
}

export const StatsPanel = ({ onClose }: StatsPanelProps) => {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '24h' | '7d' | '30d'>('all')

  // Load statistics
  useEffect(() => {
    const loadStats = () => {
      let loadedStats: UsageStats

      if (selectedPeriod === 'all') {
        loadedStats = statsService.getStats()
      } else {
        const now = Date.now()
        let startTime = 0

        if (selectedPeriod === '24h') {
          startTime = now - 24 * 60 * 60 * 1000
        } else if (selectedPeriod === '7d') {
          startTime = now - 7 * 24 * 60 * 60 * 1000
        } else if (selectedPeriod === '30d') {
          startTime = now - 30 * 24 * 60 * 60 * 1000
        }

        loadedStats = statsService.getStatsForPeriod(startTime, now)
      }

      setStats(loadedStats)
    }

    loadStats()
  }, [selectedPeriod])

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

  const handleClearStats = () => {
    if (confirm(t('stats.confirmClear', 'Are you sure you want to clear all statistics?'))) {
      statsService.clearStats()
      setStats(statsService.getStats())
    }
  }

  const handleExportStats = () => {
    const data = statsService.exportStats()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `termaid-stats-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${ms}ms`
    }
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    }
    return `${(ms / 60000).toFixed(1)}min`
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  if (!stats) {
    return null
  }

  return (
    <div className="stats-panel-overlay">
      <div ref={panelRef} className="stats-panel">
        <div className="stats-header">
          <h2>{t('stats.title', 'Usage Statistics')}</h2>
          <button type="button" onClick={onClose} className="close-button" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="stats-content">
          {/* Period selector */}
          <div className="period-selector">
            <button
              type="button"
              className={selectedPeriod === 'all' ? 'active' : ''}
              onClick={() => setSelectedPeriod('all')}
            >
              {t('stats.period.all', 'All Time')}
            </button>
            <button
              type="button"
              className={selectedPeriod === '24h' ? 'active' : ''}
              onClick={() => setSelectedPeriod('24h')}
            >
              {t('stats.period.24h', 'Last 24h')}
            </button>
            <button
              type="button"
              className={selectedPeriod === '7d' ? 'active' : ''}
              onClick={() => setSelectedPeriod('7d')}
            >
              {t('stats.period.7d', 'Last 7 days')}
            </button>
            <button
              type="button"
              className={selectedPeriod === '30d' ? 'active' : ''}
              onClick={() => setSelectedPeriod('30d')}
            >
              {t('stats.period.30d', 'Last 30 days')}
            </button>
          </div>

          {/* Overall statistics */}
          <div className="stats-section">
            <h3>{t('stats.overall', 'Overall Statistics')}</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">{t('stats.totalCommands', 'Total Commands')}</div>
                <div className="stat-value">{stats.totalCommands}</div>
              </div>
              <div className="stat-card success">
                <div className="stat-label">{t('stats.successful', 'Successful')}</div>
                <div className="stat-value">{stats.totalSuccess}</div>
              </div>
              <div className="stat-card failure">
                <div className="stat-label">{t('stats.failed', 'Failed')}</div>
                <div className="stat-value">{stats.totalFailures}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">{t('stats.successRate', 'Success Rate')}</div>
                <div className="stat-value">{stats.overallSuccessRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Provider statistics */}
          {Object.keys(stats.providerStats).length > 0 && (
            <div className="stats-section">
              <h3>{t('stats.byProvider', 'Statistics by Provider')}</h3>
              <div className="provider-stats">
                {Object.entries(stats.providerStats).map(([provider, providerStats]) => (
                  <ProviderStatsCard
                    key={provider}
                    provider={provider}
                    stats={providerStats}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Usage timeline */}
          {stats.firstUsage && stats.lastUsage && (
            <div className="stats-section">
              <h3>{t('stats.timeline', 'Usage Timeline')}</h3>
              <div className="timeline-info">
                <div>
                  <strong>{t('stats.firstUsage', 'First usage')}:</strong>{' '}
                  {formatDate(stats.firstUsage)}
                </div>
                <div>
                  <strong>{t('stats.lastUsage', 'Last usage')}:</strong>{' '}
                  {formatDate(stats.lastUsage)}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="stats-actions">
            <button type="button" onClick={handleExportStats} className="export-button">
              {t('stats.export', 'Export Statistics')}
            </button>
            <button type="button" onClick={handleClearStats} className="clear-button">
              {t('stats.clear', 'Clear Statistics')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProviderStatsCardProps {
  provider: string
  stats: ProviderStats
  formatDuration: (ms: number) => string
}

const ProviderStatsCard = ({ provider, stats, formatDuration }: ProviderStatsCardProps) => {
  const { t } = useTranslation()

  return (
    <div className="provider-card">
      <h4 className="provider-name">{provider}</h4>
      <div className="provider-metrics">
        <div className="metric">
          <span className="metric-label">{t('stats.commands', 'Commands')}:</span>
          <span className="metric-value">{stats.totalCommands}</span>
        </div>
        <div className="metric">
          <span className="metric-label">{t('stats.successRate', 'Success Rate')}:</span>
          <span className="metric-value">{stats.successRate.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">{t('stats.avgResponseTime', 'Avg Response')}:</span>
          <span className="metric-value">{formatDuration(stats.avgResponseTime)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">{t('stats.minResponseTime', 'Min Response')}:</span>
          <span className="metric-value">{formatDuration(stats.minResponseTime)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">{t('stats.maxResponseTime', 'Max Response')}:</span>
          <span className="metric-value">{formatDuration(stats.maxResponseTime)}</span>
        </div>
      </div>
    </div>
  )
}
