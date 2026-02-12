import type { AICommand, ConversationMessage } from '@shared/types'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatMessageData } from '@/components/chat'
import { useToast } from '@/hooks/useToast'
import { hasInjectionPatterns, sanitizeUserInput } from '@/services/commandExecutionService'
import { useStore } from '@/store/useStore'
import Logger from '@/utils/logger'

const logger = new Logger('useChat')

// Constants
const COMMAND_OUTPUT_WAIT_TIME_MS = 3000 // 3 seconds wait for command output
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
 * Manages chat state, AI command generation, command execution, and command modification
 */
export function useChat() {
  const { i18n } = useTranslation()
  const [userInput, setUserInput] = useState('')
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number | null>(null)
  const [isInterpreting, setIsInterpreting] = useState(false)
  const [conversation, setConversation] = useState<ChatMessageData[]>([])
  const [messageCounter, setMessageCounter] = useState(0)

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
   * Auto-hide AI command when user starts typing
   */
  useEffect(() => {
    if (aiCommand?.type === 'command' && debouncedUserInput.length > 0) {
      setAiCommand(null)
    }
  }, [debouncedUserInput, aiCommand, setAiCommand])

  /**
   * Handle user input changes
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setUserInput(newValue)
  }, [])

  /**
   * Generate AI command from user prompt
   */
  const generateAICommand = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isLoading) return

      setError(null)

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
        await addMessageToConversation({ role: 'assistant', content: aiContent })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate command'
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
    ]
  )

  /**
   * Execute a command in the terminal
   */
  const executeCommand = useCallback(
    async (command: string, messageIndex?: number) => {
      logger.debug('executeCommand called with:', command)
      logger.debug('Current terminalPid:', terminalPid)

      // Wait for terminal to be ready with retry mechanism
      const maxRetries = 20 // 10 seconds total (20 * 500ms)
      let retries = 0

      while (!terminalPid && retries < maxRetries) {
        logger.debug(`Waiting for terminal... (${retries + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 500))
        retries++
      }

      if (!terminalPid) {
        logger.error('Terminal not ready after retries')
        const errorMessage = "Le terminal n'est pas prêt. Veuillez réinitialiser l'application."
        setError(errorMessage)
        addToast('error', errorMessage)
        return
      }

      logger.info('Terminal is ready, PID:', terminalPid)

      try {
        // Start capturing output
        const _captureStarted = await window.electronAPI.terminalStartCapture(terminalPid)

        // Execute command in terminal
        logger.debug('Writing command to terminal:', command)
        await window.electronAPI.terminalWrite(terminalPid, `${command}\r`)
        logger.info('Command written successfully')
        setAiCommand(null)

        // Wait for command output
        const waitTime = COMMAND_OUTPUT_WAIT_TIME_MS
        logger.debug(`Waiting ${waitTime}ms for command output...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))

        // Get captured output from backend
        const output = await window.electronAPI.terminalGetCapture(terminalPid)

        if (output.length > 0 && messageIndex !== undefined) {
          try {
            setIsInterpreting(true)
            const interpretation = await window.electronAPI.llmInterpretOutput(
              output,
              i18n.language
            )

            // Update conversation with interpretation
            setConversation(prev =>
              prev.map((msg, idx) => (idx === messageIndex ? { ...msg, interpretation } : msg))
            )
          } catch (error) {
            logger.error('Error interpreting output:', error)
            const errorMessage = `Erreur lors de l'interprétation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
            setError(errorMessage)
            addToast('error', errorMessage)
          } finally {
            setIsInterpreting(false)
          }
        } else {
          logger.warn('No output to interpret or message index undefined')
        }
      } catch (error) {
        logger.error('Error executing command:', error)
        const errorMessage = `Erreur lors de l'exécution: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        setError(errorMessage)
        addToast('error', errorMessage)
      }
    },
    [terminalPid, setAiCommand, setError, i18n.language, addToast]
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
        const warningMessage = `Attention: caractères d'injection détectés et supprimés: ${injectionCheck.patterns.join(', ')}`
        setError(warningMessage)
        addToast('warning', warningMessage)
      }

      setUserInput(sanitized)
      setAiCommand(null)
    }
  }, [aiCommand, setError, setAiCommand, addToast])

  return {
    // State
    userInput,
    conversation,
    currentCommandIndex,
    isInterpreting,

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
  }
}
