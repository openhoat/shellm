import type { CSSProperties } from 'react'
import { type FormEvent, useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { useStore } from '@/store/useStore'
import Logger from '@/utils/logger'
import { ChatMessage } from './chat'
import './ChatPanel.css'

const logger = new Logger('ChatPanel')

export const ChatPanel = ({ style }: { style?: CSSProperties }) => {
  // Ref for the chat input element
  const inputRef = useRef<HTMLInputElement>(null)

  // Use the custom chat hook for chat logic
  const chat = useChat()

  // Use setAiCommand from store directly for the cancel button
  const { setAiCommand } = useStore()

  // Auto-focus chat input field on mount and when loading completes
  useEffect(() => {
    if (!chat.isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chat.isLoading])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!chat.userInput.trim() || chat.isLoading) return

    const prompt = chat.userInput.trim()
    chat.setUserInput('')

    // Use the generateAICommand function from the hook
    await chat.generateAICommand(prompt)
  }

  const handleExecuteCommand = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    logger.debug('Execute button clicked!')
    logger.debug('Button terminalPid check:', chat.terminalPid)
    logger.debug('Using currentCommandIndex:', chat.currentCommandIndex)
    if (chat.aiCommand?.type === 'command') {
      await chat.executeCommand(chat.aiCommand.command, chat.currentCommandIndex ?? undefined)
    }
  }

  return (
    <div className="chat-panel" style={style}>
      <div className="chat-header">
        <h2>AI Assistant</h2>
      </div>

      <div className="chat-messages">
        {chat.conversation.length === 0 && (
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

        {chat.conversation.map(msg => (
          <ChatMessage key={msg.id} id={msg.id} message={msg} />
        ))}

        {chat.isLoading && (
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

        {chat.isInterpreting && (
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

        {chat.error && (
          <div className="chat-message ai error">
            <div className="message-content">{chat.error}</div>
          </div>
        )}
      </div>

      {chat.aiCommand && chat.aiCommand.type === 'command' && (
        <div className="command-actions">
          <button
            type="button"
            className="btn btn-execute"
            disabled={!chat.terminalPid}
            onClick={handleExecuteCommand}
            title={!chat.terminalPid ? "Le terminal n'est pas encore prêt" : 'Exécuter la commande'}
          >
            {!chat.terminalPid ? 'Préparation...' : 'Exécuter'}
          </button>
          <button type="button" className="btn btn-modify" onClick={chat.modifyCommand}>
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
          value={chat.userInput}
          onChange={chat.handleInputChange}
          placeholder="Décrivez ce que vous voulez faire..."
          disabled={chat.isLoading}
          // biome-ignore lint/a11y/noAutofocus: Intentional auto-focus for chat input UX
          autoFocus
          ref={inputRef}
        />
        <button
          type="submit"
          disabled={chat.isLoading || !chat.userInput.trim() || chat.aiCommand?.type === 'command'}
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
