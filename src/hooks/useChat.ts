import { detectPrompt } from '@shared/promptDetection'
import type { AICommand, ConversationMessage } from '@shared/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatMessageData } from '@/components/chat'
import { useToast } from '@/hooks/useToast'
import { hasInjectionPatterns, sanitizeUserInput } from '@/services/commandExecutionService'
import { useStore } from '@/store/useStore'
import Logger from '@/utils/logger'

const logger = new Logger('useChat')

// Constants
const COMMAND_OUTPUT_MIN_WAIT_MS = 500 // Minimum wait before checking for prompt
const COMMAND_OUTPUT_MAX_WAIT_MS = 30000 // Maximum wait time (30 seconds)
const COMMAND_OUTPUT_POLL_INTERVAL_MS = 100 // Poll interval for prompt detection
const DEBOUNCE_MS = 300 // Debounce delay for user input
const INPUT_HISTORY_KEY = 'termaid-chat-input-history'
const MAX_HISTORY_SIZE = 50

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
 * Manages chat state, AI command generation, command execution, and command modification
 */
export function useChat() {
  const { i18n } = useTranslation()
  const [userInput, setUserInput] = useState('')
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number | null>(null)
  const [persistedCommandIndex, setPersistedCommandIndex] = useState<number | null>(null)
  const [isInterpreting, setIsInterpreting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [conversation, setConversation] = useState<ChatMessageData[]>([])
  const [messageCounter, setMessageCounter] = useState(0)

  // Input history for up/down arrow navigation
  const [inputHistory, setInputHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(INPUT_HISTORY_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      logger.warn('Failed to load input history from localStorage:', error)
      return []
    }
  })
  const [historyIndex, setHistoryIndex] = useState(-1) // -1 means not navigating history
  const [savedInput, setSavedInput] = useState('') // Save current input when navigating history

  const {
    aiCommand,
    setAiCommand,
    isLoading,
    setIsLoading,
    error,
    setError,
    terminalPid,
    currentConversation,
    createConversation,
    addMessageToConversation,
    updateMessageInConversation,
    loadConversations,
  } = useStore()

  const { addToast } = useToast()

  // Debounced user input for auto-hiding AI command
  const debouncedUserInput = useDebounce(userInput, DEBOUNCE_MS)

  /**
   * Load conversations on mount
   */
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  /**
   * Auto-hide AI command when user starts typing new content.
   * Only reacts to debouncedUserInput changes (not aiCommand changes)
   * to avoid clearing a freshly-set command before the debounce settles.
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
   * Persist input history to localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(inputHistory))
    } catch (error) {
      logger.warn('Failed to save input history to localStorage:', error)
    }
  }, [inputHistory])

  /**
   * Save input history to localStorage
   */
  const saveHistoryToStorage = useCallback((history: string[]) => {
    try {
      localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      logger.warn('Failed to save input history to localStorage:', error)
    }
  }, [])

  /**
   * Add input to history (called when user submits)
   */
  const addToHistory = useCallback(
    (input: string) => {
      if (!input.trim()) return

      setInputHistory(prev => {
        // Don't add duplicates of the most recent entry
        if (prev[0] === input.trim()) return prev

        // Add to beginning, limit size
        const newHistory = [input.trim(), ...prev].slice(0, MAX_HISTORY_SIZE)
        saveHistoryToStorage(newHistory)
        return newHistory
      })
      // Reset history navigation
      setHistoryIndex(-1)
    },
    [saveHistoryToStorage]
  )

  /**
   * Navigate through input history
   * direction: 'up' = older (previous), 'down' = newer (next)
   */
  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      if (inputHistory.length === 0) return

      if (direction === 'up') {
        // Going up means older entries (higher index in array)
        if (historyIndex < inputHistory.length - 1) {
          // Save current input before navigating
          if (historyIndex === -1) {
            setSavedInput(userInput)
          }
          const newIndex = historyIndex + 1
          setHistoryIndex(newIndex)
          setUserInput(inputHistory[newIndex] ?? '')
        }
      } else {
        // Going down means newer entries (lower index in array)
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setUserInput(inputHistory[newIndex] ?? '')
        } else if (historyIndex === 0) {
          // Return to the saved input
          setHistoryIndex(-1)
          setUserInput(savedInput)
        }
      }
    },
    [inputHistory, historyIndex, userInput, savedInput]
  )

  /**
   * Clear all local chat state (used by Ctrl+K)
   */
  const clearChat = useCallback(() => {
    setConversation([])
    setMessageCounter(0)
    setCurrentCommandIndex(null)
    setPersistedCommandIndex(null)
    setUserInput('')
    setError(null)
    setAiCommand(null)
  }, [setError, setAiCommand])

  /**
   * Generate AI command from user prompt
   */
  const generateAICommand = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isLoading) return

      setError(null)

      // Add to input history
      addToHistory(prompt)

      // Add user message to local conversation state with unique ID
      setConversation(prev => [
        ...prev,
        { id: `msg-${messageCounter}`, type: 'user', content: prompt },
      ])
      setMessageCounter(prev => prev + 1)

      // Create new conversation if none exists
      if (!currentConversation) {
        await createConversation(prompt)
      }

      // Build conversation history for LLM context
      const conversationHistory: ConversationMessage[] = conversation.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))

      // Add current user message to history
      conversationHistory.push({ role: 'user', content: prompt })

      // Save user message to persistent storage
      await addMessageToConversation({ role: 'user', content: prompt })

      setIsLoading(true)

      try {
        // Generate command using AI with full conversation history
        const response: AICommand = await window.electronAPI.llmGenerateCommand(
          prompt,
          conversationHistory,
          i18n.language
        )

        setAiCommand(response)

        // Build full AI response content for display and storage
        let aiContent: string
        if (response.type === 'text') {
          aiContent = response.content
        } else {
          // For command responses, include both explanation and command details
          aiContent = `${response.explanation}\n\nCommand: ${response.command}`
        }

        setConversation(prev => {
          const messageId = `msg-${messageCounter}`
          setMessageCounter(prev => prev + 1)
          const newMessage: ChatMessageData = {
            id: messageId,
            type: 'ai',
            content: aiContent,
            command: response.type === 'command' ? response : undefined,
          }
          const newConversation = [...prev, newMessage]
          // Store the index of the newly added AI message if it's a command
          if (response.type === 'command') {
            setCurrentCommandIndex(newConversation.length - 1)
          }
          return newConversation
        })

        // Save AI response to persistent storage
        // Track the index in the persisted conversation for command responses
        const persistedIndex = currentConversation ? currentConversation.messages.length : 0
        // Include command info for command-type responses
        const messageToSave: ConversationMessage = {
          role: 'assistant',
          content: aiContent,
        }
        if (response.type === 'command') {
          messageToSave.command = response.command
        }
        await addMessageToConversation(messageToSave)

        // Store the persisted message index for command responses
        // This will be used later to update the message with command output and interpretation
        if (response.type === 'command') {
          setPersistedCommandIndex(persistedIndex)
        }
      } catch (err) {
        let errorMessage: string
        if (err instanceof Error) {
          // Provide specific error messages based on error type
          if (
            err.message.includes('fetch') ||
            err.message.includes('network') ||
            err.message.includes('ECONNREFUSED')
          ) {
            errorMessage = i18n.t('errors.aiGenerationFailedOffline')
          } else if (err.message.includes('timeout')) {
            errorMessage =
              "Le service Ollama ne répond pas. Vérifiez que le serveur est en cours d'exécution et que l'URL est correcte."
          } else {
            errorMessage = `${i18n.t('errors.aiGenerationFailed')} (${err.message})`
          }
        } else {
          errorMessage = i18n.t('errors.unknownError')
        }
        setError(errorMessage)
        addToast('error', errorMessage)
        setConversation(prev => [
          ...prev,
          {
            id: `msg-${messageCounter}`,
            type: 'ai',
            content: `Error: ${errorMessage}`,
          },
        ])
        setMessageCounter(prev => prev + 1)
      } finally {
        setIsLoading(false)
      }
    },
    [
      messageCounter,
      isLoading,
      currentConversation,
      conversation,
      i18n.language,
      addMessageToConversation,
      setAiCommand,
      setIsLoading,
      createConversation,
      setError,
      addToast,
      i18n.t,
      addToHistory,
    ]
  )

  /**
   * Execute a command in the terminal
   */
  const executeCommand = useCallback(
    async (command: string, messageIndex?: number) => {
      logger.debug('executeCommand called with:', command)
      logger.debug('Current terminalPid:', terminalPid)

      setIsExecuting(true)
      setExecutionProgress(10)

      // Wait for terminal to be ready with retry mechanism
      const maxRetries = 20 // 10 seconds total (20 * 500ms)
      let retries = 0

      while (!terminalPid && retries < maxRetries) {
        logger.debug(`Waiting for terminal... (${retries + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 500))
        retries++
      }

      setExecutionProgress(30)

      if (!terminalPid) {
        logger.error('Terminal not ready after retries')
        const errorMessage = i18n.t('errors.terminalNotReady')
        setError(errorMessage)
        addToast('error', errorMessage)
        setIsExecuting(false)
        setExecutionProgress(0)
        return
      }

      logger.info('Terminal is ready, PID:', terminalPid)

      try {
        // Start capturing output
        const _captureStarted = await window.electronAPI.terminalStartCapture(terminalPid)

        setExecutionProgress(50)

        // Execute command in terminal
        logger.debug('Writing command to terminal:', command)
        await window.electronAPI.terminalWrite(terminalPid, `${command}\r`)
        logger.info('Command written successfully')
        setAiCommand(null)

        setExecutionProgress(70)

        // Smart wait for command output using prompt detection
        const startTime = Date.now()
        let output = ''
        let promptDetected = false

        // Minimum wait before checking for prompt
        await new Promise(resolve => setTimeout(resolve, COMMAND_OUTPUT_MIN_WAIT_MS))

        // Poll for prompt detection
        while (Date.now() - startTime < COMMAND_OUTPUT_MAX_WAIT_MS) {
          output = await window.electronAPI.terminalGetCapture(terminalPid)
          if (detectPrompt(output)) {
            promptDetected = true
            logger.debug('Prompt detected, command finished')
            break
          }
          await new Promise(resolve => setTimeout(resolve, COMMAND_OUTPUT_POLL_INTERVAL_MS))
        }

        if (!promptDetected) {
          logger.warn('Prompt not detected within timeout, proceeding anyway')
        }

        setExecutionProgress(90)

        // Always call interpretation, even with empty output
        // Many successful commands (mkdir, touch, cp) produce no output
        if (messageIndex !== undefined) {
          try {
            setIsInterpreting(true)
            setExecutionProgress(95)
            const interpretation = await window.electronAPI.llmInterpretOutput(
              output,
              i18n.language
            )

            // Update local conversation state with interpretation
            setConversation(prev =>
              prev.map((msg, idx) => (idx === messageIndex ? { ...msg, interpretation } : msg))
            )

            // Persist output and interpretation to storage
            if (persistedCommandIndex !== null) {
              await updateMessageInConversation(persistedCommandIndex, {
                output,
                interpretation,
              })
            }
          } catch (error) {
            logger.error('Error interpreting output:', error)
            const errorMessage = `${i18n.t('errors.outputInterpretationFailed')} ${error instanceof Error ? `(${error.message})` : ''}`
            setError(errorMessage)
            addToast('error', errorMessage)
          } finally {
            setIsInterpreting(false)
          }
        } else {
          logger.warn('Message index undefined, skipping interpretation')
        }
      } catch (error) {
        logger.error('Error executing command:', error)
        const errorMessage = `${i18n.t('errors.commandExecutionFailed')} ${error instanceof Error ? `(${error.message})` : ''}`
        setError(errorMessage)
        addToast('error', errorMessage)
      } finally {
        setIsExecuting(false)
        setExecutionProgress(0)
      }
    },
    [
      terminalPid,
      setAiCommand,
      setError,
      i18n.language,
      addToast,
      i18n.t,
      persistedCommandIndex,
      updateMessageInConversation,
    ]
  )

  /**
   * Modify the current AI command
   * Allows user to edit the command with sanitization
   */
  const modifyCommand = useCallback(() => {
    if (aiCommand && aiCommand.type === 'command') {
      const sanitized = sanitizeUserInput(aiCommand.command)
      const injectionCheck = hasInjectionPatterns(aiCommand.command)

      if (injectionCheck.hasInjection) {
        const warningMessage = i18n.t('errors.injectionWarning', {
          patterns: injectionCheck.patterns.join(', '),
        })
        setError(warningMessage)
        addToast('warning', warningMessage)
      }

      setUserInput(sanitized)
      setAiCommand(null)
    }
  }, [aiCommand, setError, setAiCommand, addToast, i18n.t])

  /**
   * Handle input change in the chat textarea
   * Updates user input state and resets history navigation
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setUserInput(e.target.value)
      // Reset history navigation when user types
      if (historyIndex !== -1) {
        setHistoryIndex(-1)
        setSavedInput('')
      }
    },
    [historyIndex]
  )

  return {
    // State
    userInput,
    conversation,
    currentCommandIndex,
    isInterpreting,
    isExecuting,
    executionProgress,

    // Global state from store
    aiCommand,
    isLoading,
    error,
    terminalPid,

    // Actions
    setUserInput,
    handleInputChange,
    generateAICommand,
    executeCommand,
    modifyCommand,
    addToHistory,
    navigateHistory,
    clearChat,
  }
}
