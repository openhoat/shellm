import type { AICommand, CommandInterpretation, ConversationMessage } from '@shared/types'
import { type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/store/useStore'
import Logger from '@/utils/logger'
import './ChatPanel.css'

const logger = new Logger('ChatPanel')

export const ChatPanel = ({ style }: { style?: React.CSSProperties }) => {
  const { i18n } = useTranslation()
  const [userInput, setUserInput] = useState('')
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number | null>(null)
  const [isInterpreting, setIsInterpreting] = useState(false)
  const [previousUserInput, setPreviousUserInput] = useState('') // Track previous input to detect typing
  const [conversation, setConversation] = useState<
    Array<{
      type: 'user' | 'ai'
      content: string
      command?: AICommand
      interpretation?: CommandInterpretation
    }>
  >([])

  const {
    aiCommand,
    setAiCommand,
    isLoading,
    setIsLoading,
    error,
    setError,
    terminalPid,
    addToHistory,
    currentConversation,
    createConversation,
    addMessageToConversation,
    loadConversations,
  } = useStore()

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Auto-hide AI command when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // If user types something and there was an AI command, hide it
    if (newValue.length > previousUserInput.length && aiCommand?.type === 'command') {
      setAiCommand(null)
    }
    setPreviousUserInput(newValue)
    setUserInput(newValue)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isLoading) return

    const prompt = userInput.trim()
    setUserInput('')
    setError(null)

    // Add user message to local conversation state
    setConversation(prev => [...prev, { type: 'user', content: prompt }])

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
      // Type guard to check if AICommand is a shell command
      const isCommandShell = (
        command?: AICommand
      ): command is {
        type: 'command'
        command: string
        intent: string
        explanation: string
        confidence: number
      } => {
        return command?.type === 'command'
      }

      // Generate command using AI with full conversation history
      const response: AICommand = await window.electronAPI.ollamaGenerateCommand(
        prompt,
        conversationHistory,
        i18n.language
      )

      setAiCommand(response)

      // Add AI response to conversation and store the index
      const content = response.type === 'text' ? response.content : response.explanation
      setConversation(prev => {
        const newConversation = [
          ...prev,
          { type: 'ai', content, command: response.type === 'command' ? response : undefined },
        ]
        // Store the index of the newly added AI message if it's a command
        if (response.type === 'command') {
          setCurrentCommandIndex(newConversation.length - 1)
        }
        return newConversation
      })

      // Save AI response to persistent storage
      await addMessageToConversation({ role: 'assistant', content })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate command')
      setConversation(prev => [
        ...prev,
        { type: 'ai', content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const executeCommand = async (command: string, messageIndex?: number) => {
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
      setError("Le terminal n'est pas prêt. Veuillez réinitialiser l'application.")
      return
    }

    logger.info('Terminal is ready, PID:', terminalPid)

    try {
      // Add to history
      const lastEntry = conversation[conversation.length - 1]
      if (lastEntry?.command) {
        addToHistory({
          id: Date.now().toString(),
          timestamp: Date.now(),
          userMessage: conversation[conversation.length - 2]?.content || '',
          aiResponse: lastEntry.command,
          executed: true,
        })
      }

      // Start capturing output
      const _captureStarted = await window.electronAPI.terminalStartCapture(terminalPid)

      // Execute command in terminal
      logger.debug('Writing command to terminal:', command)
      await window.electronAPI.terminalWrite(terminalPid, `${command}\r`)
      logger.info('Command written successfully')
      setAiCommand(null)

      // Wait for command output
      const waitTime = 3000 // 3 seconds total wait
      logger.debug(`Waiting ${waitTime}ms for command output...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))

      // Get captured output from backend
      const output = await window.electronAPI.terminalGetCapture(terminalPid)

      if (output.length > 0 && messageIndex !== undefined) {
        try {
          setIsInterpreting(true)
          const interpretation = await window.electronAPI.ollamaInterpretOutput(
            output,
            i18n.language
          )

          // Update conversation with interpretation
          setConversation(prev =>
            prev.map((msg, idx) => (idx === messageIndex ? { ...msg, interpretation } : msg))
          )
        } catch (error) {
          logger.error('Error interpreting output:', error)
          setError(
            `Erreur lors de l'interprétation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          )
        } finally {
          setIsInterpreting(false)
        }
      } else {
        logger.warn('No output to interpret or message index undefined')
      }
    } catch (error) {
      logger.error('Error executing command:', error)
      setError(
        `Erreur lors de l'exécution: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      )
    }
  }

  const modifyCommand = () => {
    // Allow user to modify the command
    if (aiCommand && aiCommand.type === 'command') {
      setUserInput(aiCommand.command)
      setAiCommand(null)
    }
  }

  return (
    <div className="chat-panel" style={style}>
      <div className="chat-header">
        <h2>AI Assistant</h2>
      </div>

      <div className="chat-messages">
        {conversation.length === 0 && (
          <div className="chat-welcome">
            <h3>Bienvenue dans SheLLM !</h3>
            <p>
              Décrivez ce que vous voulez faire en langage naturel et l'IA vous proposera la
              commande appropriée.
            </p>
            <p className="chat-examples">Exemples :</p>
            <ul>
              <li>"Liste tous les fichiers de plus de 10MB"</li>
              <li>"Trouve tous les fichiers Python dans le dossier courant"</li>
              <li>"Affiche l'utilisation du disque"</li>
            </ul>
          </div>
        )}

        {conversation.map((msg, index) => (
          <div key={`${index}-${msg.type}`} className={`chat-message ${msg.type}`}>
            {msg.type === 'user' ? (
              <div className="message-content">{msg.content}</div>
            ) : (
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.command && msg.command.type === 'command' && (
                  <div className="ai-command">
                    <div className="command-label">Commande proposée :</div>
                    <code className="command-code">{msg.command.command}</code>
                    <div className="command-meta">
                      <span>Confiance : {(msg.command.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
                {msg.interpretation && (
                  <div className="command-interpretation">
                    <div className="interpretation-label">Résultat :</div>
                    <div className="interpretation-summary">{msg.interpretation.summary}</div>
                    {msg.interpretation.key_findings.length > 0 && (
                      <div className="interpretation-section">
                        <strong>Points clés :</strong>
                        <ul>
                          {msg.interpretation.key_findings.map(finding => (
                            <li key={finding}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.interpretation.warnings.length > 0 && (
                      <div className="interpretation-section warnings">
                        <strong>⚠️ Avertissements :</strong>
                        <ul>
                          {msg.interpretation.warnings.map(warning => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.interpretation.errors.length > 0 && (
                      <div className="interpretation-section errors">
                        <strong>❌ Erreurs :</strong>
                        <ul>
                          {msg.interpretation.errors.map(error => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.interpretation.recommendations.length > 0 && (
                      <div className="interpretation-section">
                        <strong>💡 Recommandations :</strong>
                        <ul>
                          {msg.interpretation.recommendations.map(rec => (
                            <li key={rec}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-message ai">
            <div className="message-content">
              <div className="loading-spinner">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {isInterpreting && (
          <div className="chat-message ai">
            <div className="message-content">
              <div className="loading-spinner">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Analyse des résultats en cours...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-message ai error">
            <div className="message-content">{error}</div>
          </div>
        )}
      </div>

      {aiCommand && aiCommand.type === 'command' && (
        <div className="command-actions">
          <button
            type="button"
            className="btn btn-execute"
            disabled={!terminalPid}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              logger.debug('Execute button clicked!')
              logger.debug('Button terminalPid check:', terminalPid)
              logger.debug('Using currentCommandIndex:', currentCommandIndex)
              executeCommand(aiCommand.command, currentCommandIndex ?? undefined)
            }}
            title={!terminalPid ? "Le terminal n'est pas encore prêt" : 'Exécuter la commande'}
          >
            {!terminalPid ? 'Préparation...' : 'Exécuter'}
          </button>
          <button type="button" className="btn btn-modify" onClick={modifyCommand}>
            Modifier
          </button>
          <button type="button" className="btn btn-cancel" onClick={() => setAiCommand(null)}>
            Annuler
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Décrivez ce que vous voulez faire..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim() || aiCommand?.type === 'command'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <title>Envoyer</title>
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  )
}
