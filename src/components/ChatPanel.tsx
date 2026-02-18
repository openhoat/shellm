import type { CSSProperties } from 'react'
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChat } from '@/hooks/useChat'
import { useStore } from '@/store/useStore'
import Logger from '@/utils/logger'
import { ChatMessage } from './chat'
import './ChatPanel.css'

const logger = new Logger('ChatPanel')

export const ChatPanel = ({ style }: { style?: CSSProperties }) => {
  const { t } = useTranslation()

  // Ref for the chat input element
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // Ref for the messages container for auto-scroll
  const messagesRef = useRef<HTMLDivElement>(null)
  // Track if user is at the bottom of the chat
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Use the custom chat hook for chat logic
  const chat = useChat()

  // Use setAiCommand from store directly for the cancel button
  const { setAiCommand, clearAllConversations } = useStore()

  // Check if user is at the bottom of the chat
  const checkIsAtBottom = useCallback(() => {
    const container = messagesRef.current
    if (!container) return true

    const threshold = 50 // Allow 50px tolerance
    const isBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    setIsAtBottom(isBottom)
    return isBottom
  }, [])

  // Scroll to bottom of messages
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = messagesRef.current
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      })
      setIsAtBottom(true)
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive (only if user is at bottom)
  // We use conversation.length as a trigger to detect new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: conversation.length triggers scroll on new messages
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('instant')
    }
  }, [chat.conversation.length, isAtBottom, scrollToBottom])

  // Handle scroll events to track user position
  useEffect(() => {
    const container = messagesRef.current
    if (!container) return

    const handleScroll = () => {
      checkIsAtBottom()
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [checkIsAtBottom])

  // Auto-focus chat input field on mount and when loading completes
  useEffect(() => {
    if (!chat.isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chat.isLoading])

  const handleExecuteCommand = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      logger.debug('Execute button clicked!')
      logger.debug('Button terminalPid check:', chat.terminalPid)
      logger.debug('Using currentCommandIndex:', chat.currentCommandIndex)
      if (chat.aiCommand?.type === 'command') {
        await chat.executeCommand(chat.aiCommand.command, chat.currentCommandIndex ?? undefined)
      }
    },
    [chat.aiCommand, chat.terminalPid, chat.currentCommandIndex, chat.executeCommand]
  )

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter: Execute command
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        if (chat.aiCommand?.type === 'command') {
          handleExecuteCommand(e as unknown as React.MouseEvent)
        }
      }

      // Ctrl+K: Clear conversation
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        clearAllConversations()
      }

      // Esc: Cancel current action
      if (e.key === 'Escape') {
        e.preventDefault()
        if (chat.aiCommand) {
          setAiCommand(null)
        }
        if (chat.error) {
          chat.setUserInput('')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [chat.aiCommand, chat.error, setAiCommand, clearAllConversations, chat, handleExecuteCommand])

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter alone = submit (unless Shift is pressed)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
    // Shift+Enter = new line (default textarea behavior)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!chat.userInput.trim() || chat.isLoading) return

    const prompt = chat.userInput.trim()
    chat.setUserInput('')

    // Use the generateAICommand function from the hook
    await chat.generateAICommand(prompt)
  }

  return (
    <div className="chat-panel" style={style}>
      <div className="chat-header">
        <h2>AI Assistant</h2>
      </div>

      <div
        className="chat-messages"
        aria-live="polite"
        aria-label="Chat messages"
        role="log"
        ref={messagesRef}
      >
        {chat.conversation.length === 0 && (
          <div className="chat-welcome">
            <h3>{t('chat.welcome.title')}</h3>
            <p>{t('chat.welcome.description')}</p>
            <p className="chat-examples">{t('chat.welcome.examples')}</p>
            <ul>
              <li>{t('chat.welcome.example1')}</li>
              <li>{t('chat.welcome.example2')}</li>
              <li>{t('chat.welcome.example3')}</li>
            </ul>
          </div>
        )}

        {chat.conversation.map(msg => (
          <ChatMessage key={msg.id} id={msg.id} message={msg} />
        ))}

        {!isAtBottom && (
          <button
            type="button"
            className="scroll-to-bottom-btn"
            onClick={() => scrollToBottom()}
            title={t('chat.scrollToBottom')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>{t('chat.scrollToBottom')}</title>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>
        )}

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
              <p>{t('chat.progress.interpreting')}</p>
            </div>
          </div>
        )}

        {chat.isExecuting && (
          <div className="chat-message ai">
            <div className="message-content">
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${chat.executionProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {chat.executionProgress < 30 && t('chat.progress.initializing')}
                  {chat.executionProgress >= 30 &&
                    chat.executionProgress < 70 &&
                    t('chat.progress.executing')}
                  {chat.executionProgress >= 70 &&
                    chat.executionProgress < 90 &&
                    t('chat.progress.retrieving')}
                  {chat.executionProgress >= 90 && t('chat.progress.finalizing')}
                </p>
              </div>
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
            title={
              !chat.terminalPid
                ? t('chat.actions.terminalNotReady')
                : t('chat.actions.executeCommand')
            }
          >
            {!chat.terminalPid ? t('chat.actions.preparing') : t('chat.actions.execute')}
          </button>
          <button type="button" className="btn btn-modify" onClick={chat.modifyCommand}>
            {t('chat.actions.modify')}
          </button>
          <button type="button" className="btn btn-cancel" onClick={() => setAiCommand(null)}>
            {t('chat.actions.cancel')}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input">
        <textarea
          value={chat.userInput}
          onChange={chat.handleInputChange}
          onKeyDown={handleTextareaKeyDown}
          placeholder={t('chat.placeholder')}
          disabled={chat.isLoading}
          // biome-ignore lint/a11y/noAutofocus: Intentional auto-focus for chat input UX
          autoFocus
          ref={inputRef}
          rows={1}
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
            <title>{t('chat.send')}</title>
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  )
}
