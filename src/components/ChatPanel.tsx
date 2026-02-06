import type { AICommand } from '@shared/types'
import { type FormEvent, useState } from 'react'
import { useStore } from '@/store/useStore'
import Logger from '@/utils/logger'
import './ChatPanel.css'

const logger = new Logger('ChatPanel')

export const ChatPanel = () => {
  const [userInput, setUserInput] = useState('')
  const [conversation, setConversation] = useState<
    Array<{
      type: 'user' | 'ai'
      content: string
      command?: AICommand
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
  } = useStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isLoading) return

    const prompt = userInput.trim()
    setUserInput('')
    setError(null)

    // Add user message to conversation
    setConversation(prev => [...prev, { type: 'user', content: prompt }])

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

      // Get recent commands for context
      const recentCommands = conversation
        .filter(
          (
            msg
          ): msg is {
            type: 'ai'
            content: string
            command: {
              type: 'command'
              command: string
              intent: string
              explanation: string
              confidence: number
            }
          } => msg.type === 'ai' && isCommandShell(msg.command)
        )
        .map(msg => msg.command.command)
        .slice(-5)

      // Generate command using AI
      const response: AICommand = await window.electronAPI.ollamaGenerateCommand(
        prompt,
        recentCommands
      )

      setAiCommand(response)

      // Add AI response to conversation
      const content = response.type === 'text' ? response.content : response.explanation
      setConversation(prev => [
        ...prev,
        { type: 'ai', content, command: response.type === 'command' ? response : undefined },
      ])
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

  const executeCommand = async (command: string) => {
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

      // Execute command in terminal
      logger.debug('Writing command to terminal:', command)
      logger.debug('electronAPI available:', typeof window.electronAPI)
      logger.debug('terminalWrite available:', typeof window.electronAPI?.terminalWrite)

      await window.electronAPI.terminalWrite(terminalPid, `${command}\r`)
      logger.info('Command written successfully')
      setAiCommand(null)
    } catch (error) {
      logger.error('Error writing command:', error)
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
    <div className="chat-panel">
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
              executeCommand(aiCommand.command)
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
          onChange={e => setUserInput(e.target.value)}
          placeholder="Décrivez ce que vous voulez faire..."
          disabled={isLoading || aiCommand?.type === 'command'}
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
