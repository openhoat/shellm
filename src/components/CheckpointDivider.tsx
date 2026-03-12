import type { CheckpointMetadata } from '@shared/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './CheckpointDivider.css'

interface CheckpointDividerProps {
  checkpoint?: CheckpointMetadata
  onRestore?: (checkpointId: string) => void
  isLoading?: boolean
}

/**
 * CheckpointDivider - Displays a visual divider between messages with restore capability
 * Similar to Cline's approach: automatic checkpoints after each user message
 */
export function CheckpointDivider({
  checkpoint,
  onRestore,
  isLoading = false,
}: CheckpointDividerProps) {
  const { t } = useTranslation()
  const [isRestoring, setIsRestoring] = useState(false)

  if (!checkpoint) {
    // Render a simple divider (no checkpoint yet, e.g., first message)
    return <div className="checkpoint-divider" />
  }

  const handleRestore = async () => {
    if (isRestoring || !onRestore) return

    setIsRestoring(true)
    try {
      await onRestore(checkpoint.id)
    } finally {
      setIsRestoring(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="checkpoint-divider-container">
      <div className="checkpoint-divider-line" />
      <div className="checkpoint-actions">
        <button
          type="button"
          className="checkpoint-restore-btn"
          onClick={handleRestore}
          disabled={isRestoring || isLoading}
          title={t('checkpoint.restore', 'Restore to this point')}
          aria-label={t('checkpoint.restore', 'Restore checkpoint')}
        >
          {isRestoring ? (
            <span className="checkpoint-loading" aria-hidden="true">
              ⟳
            </span>
          ) : (
            <>
              <span className="checkpoint-icon" aria-hidden="true">
                ↩
              </span>
              <span className="checkpoint-label">{t('checkpoint.restore', 'Restore')}</span>
              <span className="checkpoint-time">{formatTime(checkpoint.createdAt)}</span>
            </>
          )}
        </button>
      </div>
      {checkpoint.preview && (
        <div className="checkpoint-preview" title={checkpoint.preview}>
          {checkpoint.preview}
        </div>
      )}
    </div>
  )
}
