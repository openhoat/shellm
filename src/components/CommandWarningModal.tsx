import type { ValidationResult } from '@shared/commandValidation'
import { useTranslation } from 'react-i18next'
import './CommandWarningModal.css'

/**
 * Props for the CommandWarningModal component
 */
interface CommandWarningModalProps {
  /** The command being validated */
  command: string
  /** The validation result */
  validation: ValidationResult
  /** Callback when user confirms to proceed */
  onConfirm: () => void
  /** Callback when user cancels */
  onCancel: () => void
  /** Whether the modal is visible */
  isVisible: boolean
}

/**
 * Get the icon for a risk level
 */
function getRiskIcon(riskLevel: 'safe' | 'warning' | 'dangerous'): string {
  switch (riskLevel) {
    case 'safe':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'dangerous':
      return '🚫'
    default:
      return '❓'
  }
}

/**
 * Get the CSS class for a risk level
 */
function getRiskClass(riskLevel: 'safe' | 'warning' | 'dangerous'): string {
  switch (riskLevel) {
    case 'safe':
      return 'risk-safe'
    case 'warning':
      return 'risk-warning'
    case 'dangerous':
      return 'risk-dangerous'
    default:
      return ''
  }
}

/**
 * Get the category display name
 */
function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    file_deletion: 'File Deletion',
    system_modification: 'System Modification',
    network_operation: 'Network Operation',
    privilege_escalation: 'Privilege Escalation',
    disk_operation: 'Disk Operation',
    process_control: 'Process Control',
    data_destruction: 'Data Destruction',
    configuration_change: 'Configuration Change',
    unknown: 'Unknown',
  }
  return categoryNames[category] || category
}

/**
 * Modal component that displays a warning when a potentially dangerous command is detected
 */
export const CommandWarningModal = ({
  command,
  validation,
  onConfirm,
  onCancel,
  isVisible,
}: CommandWarningModalProps) => {
  const { t } = useTranslation()

  if (!isVisible) return null

  const riskIcon = getRiskIcon(validation.riskLevel)
  const riskClass = getRiskClass(validation.riskLevel)

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      onKeyDown={handleOverlayKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content command-warning-modal"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        role="document"
      >
        <div className={`modal-header ${riskClass}`}>
          <span className="risk-icon">{riskIcon}</span>
          <h2>{t('commandWarning.title', 'Command Warning')}</h2>
        </div>

        <div className="modal-body">
          <div className="command-display">
            <code className="command-code">{command}</code>
          </div>

          <div className={`risk-badge ${riskClass}`}>
            <span className="risk-level-label">
              {t(`commandWarning.riskLevel.${validation.riskLevel}`, validation.riskLevel)}
            </span>
          </div>

          <div className="warning-reason">
            <p>{validation.reason}</p>
          </div>

          {validation.categories.length > 0 && (
            <div className="warning-categories">
              <h4>{t('commandWarning.categories', 'Categories')}</h4>
              <div className="category-tags">
                {validation.categories.map(category => (
                  <span key={category} className="category-tag">
                    {getCategoryName(category)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {validation.suggestions.length > 0 && (
            <div className="warning-suggestions">
              <h4>{t('commandWarning.suggestions', 'Suggestions')}</h4>
              <ul>
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.sandboxRecommended && (
            <div className="sandbox-hint">
              <span className="sandbox-icon">🔒</span>
              <span>
                {t(
                  'commandWarning.sandboxHint',
                  'Consider using sandbox mode for safer execution.'
                )}
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            {t('commandWarning.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            className="btn btn-confirm"
            onClick={onConfirm}
            disabled={validation.blocked && validation.riskLevel === 'dangerous'}
          >
            {validation.blocked
              ? t('commandWarning.blocked', 'Blocked')
              : t('commandWarning.proceedAnyway', 'Proceed Anyway')}
          </button>
        </div>
      </div>
    </div>
  )
}
