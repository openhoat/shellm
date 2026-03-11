import type { CheckpointMetadata } from '@shared/types'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentConversationId, useLoadConversation } from '../store/useStore'
import { Logger } from '../utils/logger'
import './CheckpointPanel.css'

const logger = new Logger('CheckpointPanel')

interface CheckpointPanelProps {
  onClose: () => void
}

export const CheckpointPanel = ({ onClose }: CheckpointPanelProps) => {
  const { t } = useTranslation()
  const currentConversationId = useCurrentConversationId()
  const loadConversation = useLoadConversation()

  const [checkpoints, setCheckpoints] = useState<CheckpointMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkpointName, setCheckpointName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const loadCheckpoints = useCallback(async () => {
    if (!currentConversationId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await window.electronAPI.conversationGetCheckpoints(currentConversationId)
      if (result.success) {
        setCheckpoints(result.checkpoints)
      } else {
        setError(t('checkpoints.loadError'))
      }
    } catch (err) {
      logger.error('Failed to load checkpoints', err)
      setError(t('checkpoints.loadError'))
    } finally {
      setIsLoading(false)
    }
  }, [currentConversationId, t])

  useEffect(() => {
    loadCheckpoints()
  }, [loadCheckpoints])

  const handleCreateCheckpoint = async () => {
    if (!currentConversationId || !checkpointName.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      const result = await window.electronAPI.conversationCreateCheckpoint(
        currentConversationId,
        checkpointName.trim()
      )
      if (result.success) {
        setCheckpointName('')
        await loadCheckpoints()
      } else {
        setError(result.error || t('checkpoints.createError'))
      }
    } catch (err) {
      logger.error('Failed to create checkpoint', err)
      setError(t('checkpoints.createError'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleRestoreCheckpoint = async (checkpointId: string) => {
    if (!currentConversationId) return

    setError(null)

    try {
      const result = await window.electronAPI.conversationRestoreCheckpoint(
        currentConversationId,
        checkpointId
      )
      if (result.success && result.conversation) {
        // Reload the conversation to reflect the restored state
        await loadConversation(currentConversationId)
        onClose()
      } else {
        setError(result.error || t('checkpoints.restoreError'))
      }
    } catch (err) {
      logger.error('Failed to restore checkpoint', err)
      setError(t('checkpoints.restoreError'))
    }
  }

  const handleDeleteCheckpoint = async (checkpointId: string) => {
    if (!currentConversationId) return

    setError(null)

    try {
      await window.electronAPI.conversationDeleteCheckpoint(currentConversationId, checkpointId)
      await loadCheckpoints()
    } catch (err) {
      logger.error('Failed to delete checkpoint', err)
      setError(t('checkpoints.deleteError'))
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (!currentConversationId) {
    return (
      <div className="checkpoint-panel">
        <div className="checkpoint-header">
          <h3>{t('checkpoints.title')}</h3>
          <button type="button" className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="checkpoint-empty">{t('checkpoints.noConversation')}</div>
      </div>
    )
  }

  return (
    <div className="checkpoint-panel">
      <div className="checkpoint-header">
        <h3>{t('checkpoints.title')}</h3>
        <button type="button" className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="checkpoint-create">
        <input
          type="text"
          value={checkpointName}
          onChange={e => setCheckpointName(e.target.value)}
          placeholder={t('checkpoints.namePlaceholder')}
          disabled={isCreating}
          onKeyDown={e => {
            if (e.key === 'Enter' && checkpointName.trim()) {
              handleCreateCheckpoint()
            }
          }}
        />
        <button
          type="button"
          className="btn btn-create"
          onClick={handleCreateCheckpoint}
          disabled={!checkpointName.trim() || isCreating}
        >
          {isCreating ? t('checkpoints.creating') : t('checkpoints.create')}
        </button>
      </div>

      {error && <div className="checkpoint-error">{error}</div>}

      <div className="checkpoint-list">
        {isLoading ? (
          <div className="checkpoint-loading">{t('checkpoints.loading')}</div>
        ) : checkpoints.length === 0 ? (
          <div className="checkpoint-empty">{t('checkpoints.none')}</div>
        ) : (
          checkpoints.map(checkpoint => (
            <div key={checkpoint.id} className="checkpoint-item">
              <div className="checkpoint-info">
                <span className="checkpoint-name">{checkpoint.name}</span>
                <span className="checkpoint-date">{formatDate(checkpoint.createdAt)}</span>
                <span className="checkpoint-count">
                  {t('checkpoints.messageCount', { count: checkpoint.messageCount })}
                </span>
              </div>
              <div className="checkpoint-actions">
                <button
                  type="button"
                  className="btn btn-restore"
                  onClick={() => handleRestoreCheckpoint(checkpoint.id)}
                  title={t('checkpoints.restore')}
                >
                  {t('checkpoints.restore')}
                </button>
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={() => handleDeleteCheckpoint(checkpoint.id)}
                  title={t('checkpoints.delete')}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="checkpoint-help">{t('checkpoints.help')}</div>
    </div>
  )
}
