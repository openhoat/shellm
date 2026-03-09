import type { ConversationMessage } from '@shared/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCommandExecution } from '@/hooks/useCommandExecution'
import { useConversationState } from '@/hooks/useConversationState'
import { useInputHistory } from '@/hooks/useInputHistory'
import { useStreamingCommand } from '@/hooks/useStreamingCommand'
import { useToast } from '@/hooks/useToast'
import { hasInjectionPatterns, sanitizeUserInput } from '@/services/commandExecutionService'
import {
  useAddMessageToConversation,
  useAiCommand,
  useConfig,
  useCreateConversation,
  useCurrentConversation,
  useError,
  useIsLoading,
  useLoadConversations,
  useSetAiCommand,
  useSetError,
  useSetIsLoading,
  useTerminalPid,
  useUpdateMessageInConversation,
} from '@/store/useStore'
import { Logger } from '@/utils/logger'

const logger = new Logger('useChat')

// Constants
const DEBOUNCE_MS = 300 // Debounce delay for user input

/**
 * Simple debounce hook
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for managing chat logic
 * Orchestrates specialized hooks for input history, streaming, execution, and conversation state
 */
export function useChat() {
  const { i18n } = useTranslation()
  const [userInput, setUserInput] = useState('')

  // Global store state (using individual selector hooks)
  const _config = useConfig()
  const aiCommand = useAiCommand()
  const setAiCommand = useSetAiCommand()
  const isLoading = useIsLoading()
  const setIsLoading = useSetIsLoading()
  const error = useError()
  const setError = useSetError()
  const terminalPid = useTerminalPid()
  const currentConversation = useCurrentConversation()
  const createConversation = useCreateConversation()
  const addMessageToConversation = useAddMessageToConversation()
  const updateMessageInConversation = useUpdateMessageInConversation()
  const loadConversations = useLoadConversations()

  const { addToast } = useToast()

  // Debounced user input for auto-hiding AI command
  const debouncedUserInput = useDebounce(userInput, DEBOUNCE_MS)

  // Specialized hooks
  const inputHistory = useInputHistory()
  const conversationState = useConversationState()

  const streaming = useStreamingCommand({
    onStreamComplete: command => {
      setAiCommand(command)
      setIsLoading(false)
      logger.info('AI command generated:', command.command)
    },
    onStreamError: err => {
      setError(err.message)
      setIsLoading(false)
      addToast('error', err.message)
    },
  })

  const execution = useCommandExecution({
    onExecutionComplete: (_command, _output) => {
      logger.info('Command executed successfully')
    },
    onExecutionError: err => {
      addToast('error', err.message)
    },
  })

  /**
   * Load conversations on mount
   */
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  /**
   * Auto-hide AI command when user starts typing new content
   */
  const prevDebouncedInputRef = useRef<string>('')

  useEffect(() => {
    const changed = debouncedUserInput !== prevDebouncedInputRef.current
    prevDebouncedInputRef.current = debouncedUserInput

    if (changed && aiCommand?.type === 'command' && debouncedUserInput.length > 0) {
      setAiCommand(null)
    }
  }, [debouncedUserInput, aiCommand, setAiCommand])

  /**
   * Handle user input changes
   */
  const handleInputChange = useCallback((value: string) => {
    setUserInput(value)
  }, [])

  /**
   * Generate AI command from user prompt (streaming)
   */
  const streamAICommand = useCallback(
    async (prompt: string) => {
      logger.debug('streamAICommand called with:', prompt)

      // Sanitize input
      const sanitized = sanitizeUserInput(prompt)
      if (hasInjectionPatterns(sanitized)) {
        const errorMsg = i18n.t('errors.dangerousInput')
        setError(errorMsg)
        addToast('error', errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Create conversation if needed
        if (!currentConversation) {
          await createConversation(sanitized)
        } else {
          await addMessageToConversation({
            role: 'user',
            content: sanitized,
            timestamp: new Date(),
          })
        }

        // Add user message to local conversation
        conversationState.addMessage({
          type: 'user',
          content: sanitized,
        })

        // Build conversation history for context
        const conversationHistory: ConversationMessage[] =
          currentConversation?.messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })) || []

        // Stream AI command
        const command = await streaming.startStreaming(sanitized, conversationHistory)

        if (command) {
          // Add AI command to local conversation
          conversationState.addMessage({
            type: 'ai-command',
            command: command.command,
            explanation: command.explanation,
            confidence: command.confidence,
          })

          // Add to input history
          inputHistory.addToHistory(sanitized)
          inputHistory.resetNavigation()

          // Clear user input
          setUserInput('')
        }
      } catch (err) {
        logger.error('Failed to generate AI command:', err)
        // Error already handled by streaming.onStreamError
      }
    },
    [
      i18n,
      setIsLoading,
      setError,
      currentConversation,
      createConversation,
      addMessageToConversation,
      conversationState,
      streaming,
      inputHistory,
      addToast,
    ]
  )

  /**
   * Generate AI command from user prompt (non-streaming, legacy)
   */
  const generateAICommand = useCallback(
    async (prompt: string) => {
      logger.debug('generateAICommand called (non-streaming):', prompt)

      // Sanitize input
      const sanitized = sanitizeUserInput(prompt)
      if (hasInjectionPatterns(sanitized)) {
        const errorMsg = i18n.t('errors.dangerousInput')
        setError(errorMsg)
        addToast('error', errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Create conversation if needed
        if (!currentConversation) {
          await createConversation(sanitized)
        } else {
          await addMessageToConversation({
            role: 'user',
            content: sanitized,
            timestamp: new Date(),
          })
        }

        // Build conversation history for context
        const conversationHistory: ConversationMessage[] =
          currentConversation?.messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })) || []

        // Generate command (non-streaming)
        const command = await window.electron.llm.generateCommand(
          sanitized,
          conversationHistory,
          i18n.language
        )

        setAiCommand(command)
        setIsLoading(false)

        // Add to input history
        inputHistory.addToHistory(sanitized)
        inputHistory.resetNavigation()

        // Clear user input
        setUserInput('')

        logger.info('AI command generated:', command.command)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error.message)
        setIsLoading(false)
        addToast('error', error.message)
        logger.error('Failed to generate AI command:', error)
      }
    },
    [
      i18n,
      setIsLoading,
      setError,
      setAiCommand,
      currentConversation,
      createConversation,
      addMessageToConversation,
      inputHistory,
      addToast,
    ]
  )

  /**
   * Execute a command in the terminal
   */
  const executeCommand = useCallback(
    async (command: string, messageIndex?: number) => {
      try {
        if (messageIndex !== undefined && conversationState.persistedCommandIndex !== null) {
          // Execute with interpretation
          await execution.executeWithInterpretation(
            command,
            messageIndex,
            conversationState.persistedCommandIndex,
            (output, interpretation) => {
              // Update local conversation
              conversationState.updateMessage(messageIndex, { output, interpretation })

              // Persist to storage
              if (conversationState.persistedCommandIndex !== null) {
                updateMessageInConversation(conversationState.persistedCommandIndex, {
                  output,
                  interpretation,
                })
              }
            }
          )
        } else {
          // Execute without interpretation
          await execution.executeCommand(command)
        }

        setAiCommand(null)
      } catch (err) {
        logger.error('Command execution failed:', err)
        // Error already handled by execution.onExecutionError
      }
    },
    [execution, conversationState, setAiCommand, updateMessageInConversation]
  )

  /**
   * Modify an existing AI-generated command
   */
  const modifyCommand = useCallback(
    (newCommand: string) => {
      if (!aiCommand) return

      setAiCommand({
        ...aiCommand,
        command: newCommand,
      })
    },
    [aiCommand, setAiCommand]
  )

  /**
   * Navigate through input history (arrow keys)
   */
  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      const newInput = inputHistory.navigateHistory(direction, userInput)
      setUserInput(newInput)
    },
    [inputHistory, userInput]
  )

  /**
   * Clear conversation and reset state
   */
  const clearChat = useCallback(() => {
    conversationState.clearConversation()
    setAiCommand(null)
    setError(null)
    setUserInput('')
    inputHistory.resetNavigation()
  }, [conversationState, setAiCommand, setError, inputHistory])

  return {
    // State
    userInput,
    conversation: conversationState.conversation,
    currentCommandIndex: conversationState.currentCommandIndex,
    isInterpreting: false, // Managed internally by execution hook
    isExecuting: execution.isExecuting,
    executionProgress: execution.executionProgress,

    // Streaming state
    isStreaming: streaming.isStreaming,
    streamingContent: streaming.streamingContent,
    streamingProgress: streaming.streamingProgress,

    // Global state from store
    aiCommand,
    isLoading: isLoading || streaming.isStreaming,
    error,
    terminalPid,

    // Actions
    setUserInput,
    handleInputChange,
    generateAICommand,
    streamAICommand,
    cancelStreaming: streaming.cancelStreaming,
    executeCommand,
    modifyCommand,
    addToHistory: inputHistory.addToHistory,
    navigateHistory,
    clearChat,
  }
}
