import type { AICommand, ConversationMessage, StreamingProgress } from '@shared/types'
import { useCallback, useRef, useState } from 'react'
import { Logger } from '@/utils/logger'

const logger = new Logger('useStreamingCommand')

/**
 * Generate a unique request ID for streaming
 */
function generateRequestId(): string {
  return `stream-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export interface UseStreamingCommandOptions {
  onStreamComplete?: (command: AICommand) => void
  onStreamError?: (error: Error) => void
}

export interface UseStreamingCommandResult {
  // State
  isStreaming: boolean
  streamingContent: string
  streamingProgress: StreamingProgress | null

  // Actions
  startStreaming: (
    prompt: string,
    conversationHistory?: ConversationMessage[]
  ) => Promise<AICommand | null>
  cancelStreaming: () => void
}

/**
 * Custom hook for managing AI command streaming
 * Handles streaming state, progress tracking, and cancellation
 */
export function useStreamingCommand(
  options: UseStreamingCommandOptions = {}
): UseStreamingCommandResult {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingProgress, setStreamingProgress] = useState<StreamingProgress | null>(null)
  const currentRequestIdRef = useRef<string | null>(null)

  /**
   * Cancel the current streaming operation
   */
  const cancelStreaming = useCallback(() => {
    if (currentRequestIdRef.current) {
      window.electron.llm.cancelStreaming(currentRequestIdRef.current)
      currentRequestIdRef.current = null
      setIsStreaming(false)
      setStreamingContent('')
      setStreamingProgress(null)
      logger.debug('Streaming cancelled by user')
    }
  }, [])

  /**
   * Start streaming a command from the AI
   * @param prompt - The user's prompt
   * @param conversationHistory - Optional conversation history for context
   * @returns The generated command or null if cancelled
   */
  const startStreaming = useCallback(
    async (
      prompt: string,
      conversationHistory?: ConversationMessage[]
    ): Promise<AICommand | null> => {
      const requestId = generateRequestId()
      currentRequestIdRef.current = requestId

      setIsStreaming(true)
      setStreamingContent('')
      setStreamingProgress({ status: 'connecting', requestId })

      logger.debug('Starting streaming request', { requestId, prompt: prompt.substring(0, 50) })

      try {
        const result = await window.electron.llm.generateCommandStreaming(
          prompt,
          (content, progress) => {
            // Only update if this is still the current request (not cancelled)
            if (currentRequestIdRef.current === requestId) {
              setStreamingContent(content)
              setStreamingProgress(progress)
            }
          },
          conversationHistory
        )

        // Check if request was not cancelled
        if (currentRequestIdRef.current === requestId) {
          setIsStreaming(false)
          setStreamingContent('')
          setStreamingProgress(null)
          currentRequestIdRef.current = null

          logger.debug('Streaming completed successfully', { requestId })
          options.onStreamComplete?.(result)
          return result
        }

        logger.debug('Streaming was cancelled', { requestId })
        return null
      } catch (error) {
        // Only process error if this request wasn't cancelled
        if (currentRequestIdRef.current === requestId) {
          setIsStreaming(false)
          setStreamingContent('')
          setStreamingProgress(null)
          currentRequestIdRef.current = null

          const err = error instanceof Error ? error : new Error(String(error))
          logger.error('Streaming error:', err)
          options.onStreamError?.(err)
          throw err
        }

        return null
      }
    },
    [options]
  )

  return {
    isStreaming,
    streamingContent,
    streamingProgress,
    startStreaming,
    cancelStreaming,
  }
}
