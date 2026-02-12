import type { AICommand, CommandInterpretation } from '@shared/types'
import { memo } from 'react'
import { AICommand as AICommandComponent } from './AICommand'
import { CommandInterpretation as CommandInterpretationComponent } from './CommandInterpretation'

/**
 * Message data structure
 */
export interface ChatMessageData {
  /** Unique identifier for the message */
  id: string
  /** Message type: user or ai */
  type: 'user' | 'ai'
  /** Message content */
  content: string
  /** Optional AI command (for ai messages) */
  command?: AICommand
  /** Optional command interpretation (for ai messages) */
  interpretation?: CommandInterpretation
}

/**
 * Props for ChatMessage component
 */
interface ChatMessageProps {
  /** Unique identifier for the message */
  id: string
  /** Message data to display */
  message: ChatMessageData
}

/**
 * Memoized component for displaying individual chat messages
 *
 * Uses custom comparison to only re-render when the message content,
 * command, or interpretation actually changes.
 *
 * @param props - Component props
 * @returns Rendered message
 */
export const ChatMessage = memo(
  function ChatMessage({ message }: ChatMessageProps) {
    return (
      <div className={`chat-message ${message.type}`}>
        {message.type === 'user' ? (
          <div className="message-content">{message.content}</div>
        ) : (
          <div className="message-content">
            <p>{message.content}</p>
            {message.command && message.command.type === 'command' && (
              <AICommandComponent command={message.command} />
            )}
            {message.interpretation && (
              <CommandInterpretationComponent interpretation={message.interpretation} />
            )}
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if message content, command, or interpretation changes
    // The id prop should be stable and is used as the key, so we don't need to compare it
    const prevMsg = prevProps.message
    const nextMsg = nextProps.message

    if (prevMsg.content !== nextMsg.content || prevMsg.type !== nextMsg.type) {
      return false
    }

    // Compare command if present
    const prevCommand = prevMsg.command?.type === 'command' ? prevMsg.command : null
    const nextCommand = nextMsg.command?.type === 'command' ? nextMsg.command : null

    if (prevCommand !== nextCommand) {
      return false
    }

    if (prevCommand && nextCommand) {
      if (
        prevCommand.command !== nextCommand.command ||
        prevCommand.explanation !== nextCommand.explanation ||
        prevCommand.confidence !== nextCommand.confidence
      ) {
        return false
      }
    }

    // Compare interpretation if present
    if (prevMsg.interpretation !== nextMsg.interpretation) {
      return false
    }

    if (prevMsg.interpretation && nextMsg.interpretation) {
      const prevInt = prevMsg.interpretation
      const nextInt = nextMsg.interpretation

      if (
        prevInt.summary !== nextInt.summary ||
        prevInt.successful !== nextInt.successful ||
        prevInt.key_findings.length !== nextInt.key_findings.length ||
        prevInt.warnings.length !== nextInt.warnings.length ||
        prevInt.errors.length !== nextInt.errors.length ||
        prevInt.recommendations.length !== nextInt.recommendations.length
      ) {
        return false
      }

      // Compare array contents
      if (!prevInt.key_findings.every((item, index) => item === nextInt.key_findings[index])) {
        return false
      }
      if (!prevInt.warnings.every((item, index) => item === nextInt.warnings[index])) {
        return false
      }
      if (!prevInt.errors.every((item, index) => item === nextInt.errors[index])) {
        return false
      }
      if (
        !prevInt.recommendations.every((item, index) => item === nextInt.recommendations[index])
      ) {
        return false
      }
    }

    return true
  }
)
