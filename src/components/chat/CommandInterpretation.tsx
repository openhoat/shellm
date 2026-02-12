import type { CommandInterpretation as CommandInterpretationType } from '@shared/types'
import { memo } from 'react'

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
    return (
      <div className="command-interpretation">
        <div className="interpretation-label">Résultat :</div>
        <div className="interpretation-summary">{interpretation.summary}</div>
        {interpretation.key_findings.length > 0 && (
          <div className="interpretation-section">
            <strong>Points clés :</strong>
            <ul>
              {interpretation.key_findings.map((finding, index) => (
                <li key={`${index}-${finding}`}>{finding}</li>
              ))}
            </ul>
          </div>
        )}
        {interpretation.warnings.length > 0 && (
          <div className="interpretation-section warnings">
            <strong>⚠️ Avertissements :</strong>
            <ul>
              {interpretation.warnings.map((warning, index) => (
                <li key={`${index}-warning-${warning}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        {interpretation.errors.length > 0 && (
          <div className="interpretation-section errors">
            <strong>❌ Erreurs :</strong>
            <ul>
              {interpretation.errors.map((error, index) => (
                <li key={`${index}-error-${error}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {interpretation.recommendations.length > 0 && (
          <div className="interpretation-section">
            <strong>💡 Recommandations :</strong>
            <ul>
              {interpretation.recommendations.map((rec, index) => (
                <li key={`${index}-rec-${rec}`}>{rec}</li>
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
