import type { CommandInterpretation as CommandInterpretationType } from '@shared/types'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Props for CommandInterpretation component
 */
interface CommandInterpretationProps {
  /** The interpretation data to display */
  interpretation: CommandInterpretationType
}

/**
 * Memoized component for displaying command output interpretations
 *
 * Uses custom comparison to only re-render when the interpretation
 * summary or arrays change.
 *
 * @param props - Component props
 * @returns Rendered interpretation display
 */
export const CommandInterpretation = memo(
  function CommandInterpretation({ interpretation }: CommandInterpretationProps) {
    const { t } = useTranslation()
    return (
      <div className="command-interpretation">
        <div className="interpretation-label">{t('chat.interpretation.result')}</div>
        <div className="interpretation-summary">{interpretation.summary}</div>
        {interpretation.key_findings.length > 0 && (
          <div className="interpretation-section">
            <strong>{t('chat.interpretation.keyFindings')}</strong>
            <ul>
              {interpretation.key_findings.map(finding => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </div>
        )}
        {interpretation.warnings.length > 0 && (
          <div className="interpretation-section warnings">
            <strong>⚠️ {t('chat.interpretation.warnings')}</strong>
            <ul>
              {interpretation.warnings.map(warning => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        {interpretation.errors.length > 0 && (
          <div className="interpretation-section errors">
            <strong>❌ {t('chat.interpretation.errors')}</strong>
            <ul>
              {interpretation.errors.map(error => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {interpretation.recommendations.length > 0 && (
          <div className="interpretation-section">
            <strong>💡 {t('chat.interpretation.recommendations')}</strong>
            <ul>
              {interpretation.recommendations.map(rec => (
                <li key={rec}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if summary or arrays change
    return (
      prevProps.interpretation.summary === nextProps.interpretation.summary &&
      prevProps.interpretation.successful === nextProps.interpretation.successful &&
      prevProps.interpretation.key_findings.length ===
        nextProps.interpretation.key_findings.length &&
      prevProps.interpretation.warnings.length === nextProps.interpretation.warnings.length &&
      prevProps.interpretation.errors.length === nextProps.interpretation.errors.length &&
      prevProps.interpretation.recommendations.length ===
        nextProps.interpretation.recommendations.length &&
      // Compare array contents
      prevProps.interpretation.key_findings.every(
        (finding, index) => finding === nextProps.interpretation.key_findings[index]
      ) &&
      prevProps.interpretation.warnings.every(
        (warning, index) => warning === nextProps.interpretation.warnings[index]
      ) &&
      prevProps.interpretation.errors.every(
        (error, index) => error === nextProps.interpretation.errors[index]
      ) &&
      prevProps.interpretation.recommendations.every(
        (rec, index) => rec === nextProps.interpretation.recommendations[index]
      )
    )
  }
)
