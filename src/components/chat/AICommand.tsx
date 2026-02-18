import type { AICommandShell } from '@shared/types'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Props for AICommand component
 */
interface AICommandProps {
  /** The AI command to display */
  command: AICommandShell
}

/**
 * Memoized component for displaying AI-generated shell commands
 *
 * Uses custom comparison to only re-render when the command string,
 * explanation, or confidence changes.
 *
 * @param props - Component props
 * @returns Rendered command display
 */
export const AICommand = memo(
  function AICommand({ command }: AICommandProps) {
    const { t } = useTranslation()
    return (
      <div className="ai-command">
        <div className="command-label">{t('chat.command.proposed')}</div>
        <code className="command-code">{command.command}</code>
        <div className="command-meta">
          <span>
            {t('chat.command.confidence')} {(command.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if command content, explanation, or confidence changes
    return (
      prevProps.command.command === nextProps.command.command &&
      prevProps.command.explanation === nextProps.command.explanation &&
      prevProps.command.confidence === nextProps.command.confidence
    )
  }
)
