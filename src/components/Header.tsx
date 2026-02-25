import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import logoSvg from '/logo.svg'
import { useStore } from '../store/useStore'
import './Header.css'

export const Header = () => {
  const {
    config,
    toggleConfigPanel,
    conversations,
    currentConversationId,
    loadConversation,
    deleteConversation,
    incrementChatResetKey,
  } = useStore()
  const { t } = useTranslation()
  const [showConversationList, setShowConversationList] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setTemporaryExportStatus = useCallback((status: string) => {
    if (exportTimerRef.current) {
      clearTimeout(exportTimerRef.current)
    }
    setExportStatus(status)
    exportTimerRef.current = setTimeout(() => {
      setExportStatus(null)
      exportTimerRef.current = null
    }, 3000)
  }, [])

  // Clean up export status timer on unmount
  useEffect(() => {
    return () => {
      if (exportTimerRef.current) {
        clearTimeout(exportTimerRef.current)
      }
    }
  }, [])

  const handleNewConversation = () => {
    // This will be handled by ChatPanel when the user sends a message
    setShowConversationList(false)
  }

  const handleLoadConversation = (id: string) => {
    loadConversation(id)
    setShowConversationList(false)
    incrementChatResetKey()
  }

  const handleDeleteConversation = async (id: string, e: MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(t('header.confirmDelete'))) {
      await deleteConversation(id)
      if (currentConversationId === id) {
        incrementChatResetKey()
      }
    }
  }

  const handleExportCurrent = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentConversationId) {
      setTemporaryExportStatus(t('header.noConversationToExport'))
      return
    }

    try {
      const result = await window.electronAPI.conversationExport(currentConversationId)
      if (result.success && result.filePath) {
        setTemporaryExportStatus(t('header.exportedTo', { filePath: result.filePath }))
      } else if (result.cancelled) {
        setExportStatus(null)
      } else {
        setTemporaryExportStatus(result.error || t('header.exportFailed'))
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for export errors
      console.error('[Header] Failed to export conversation:', error)
      setTemporaryExportStatus(error instanceof Error ? error.message : t('header.exportFailed'))
    }
  }

  const handleExportAll = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const result = await window.electronAPI.conversationExportAll()
      if (result.success && result.filePath) {
        setTemporaryExportStatus(t('header.exportedAll', { filePath: result.filePath }))
      } else if (result.cancelled) {
        setExportStatus(null)
      } else {
        setTemporaryExportStatus(result.error || 'Export failed')
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for export errors
      console.error('[Header] Failed to export all conversations:', error)
      setTemporaryExportStatus(error instanceof Error ? error.message : 'Export failed')
    }
  }

  // Close conversation dropdown on Escape or click outside
  useEffect(() => {
    if (!showConversationList) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowConversationList(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.querySelector('.conversation-dropdown')
      const toggleButton = document.querySelector(`button[title="${t('header.conversations')}"]`)
      if (
        dropdown &&
        !dropdown.contains(e.target as Node) &&
        !toggleButton?.contains(e.target as Node)
      ) {
        setShowConversationList(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showConversationList, t])

  const getProviderStatus = () => {
    if (config.llmProvider === 'claude') {
      return `Claude: ${config.claude.model}`
    }
    if (config.llmProvider === 'openai') {
      return `OpenAI: ${config.openai.model}`
    }
    const model = config.ollama.model ? ` ${config.ollama.model}` : ''
    return config.ollama.url === 'http://localhost:11434'
      ? `Ollama: Local${model}`
      : `Ollama: ${config.ollama.url}${model}`
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="app-title">
          <img src={logoSvg} alt="Termaid" className="app-title-icon" />
          Termaid
        </h1>
        <span className="app-version">v{__APP_VERSION__}</span>
      </div>
      <div className="header-right">
        <div className="status-indicator">
          <span className={`status-dot ${config.theme === 'dark' ? 'active' : ''}`}></span>
          <span className="status-text">{getProviderStatus()}</span>
        </div>
        <div className="conversation-controls">
          <button
            type="button"
            className="icon-button"
            onClick={handleNewConversation}
            title={t('header.newConversation')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>{t('header.newConversation')}</title>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowConversationList(!showConversationList)}
            title={t('header.conversations')}
            aria-expanded={showConversationList}
            aria-haspopup="listbox"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>{t('header.conversations')}</title>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={e => handleExportAll(e)}
            title={t('header.exportAll')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>{t('header.exportAll')}</title>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          {showConversationList && (
            <div className="conversation-dropdown">
              <div className="conversation-dropdown-header">
                <span>Conversations</span>
                <button
                  type="button"
                  onClick={() => setShowConversationList(false)}
                  title={t('header.closeConversations')}
                  aria-label={t('header.closeConversations')}
                >
                  ✕
                </button>
              </div>
              {conversations.length === 0 ? (
                <div className="conversation-dropdown-empty">No conversations yet</div>
              ) : (
                <>
                  <div className="conversation-export-buttons">
                    <button
                      type="button"
                      className="export-button"
                      onClick={e => handleExportCurrent(e)}
                      title={t('header.exportCurrent')}
                      disabled={!currentConversationId}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export Current
                    </button>
                  </div>
                  {/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: Listbox pattern requires role on container */}
                  <ul className="conversation-list" role="listbox" aria-label="Conversations">
                    {conversations.map(conv => (
                      <li key={conv.id}>
                        <button
                          type="button"
                          className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                          aria-current={conv.id === currentConversationId ? 'true' : undefined}
                          onClick={() => handleLoadConversation(conv.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleLoadConversation(conv.id)
                            }
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              const next = e.currentTarget.parentElement?.nextElementSibling
                              const btn = next?.querySelector(
                                'button.conversation-item'
                              ) as HTMLElement
                              btn?.focus()
                            }
                            if (e.key === 'ArrowUp') {
                              e.preventDefault()
                              const prev = e.currentTarget.parentElement?.previousElementSibling
                              const btn = prev?.querySelector(
                                'button.conversation-item'
                              ) as HTMLElement
                              btn?.focus()
                            }
                            if (e.key === 'Escape') {
                              setShowConversationList(false)
                            }
                          }}
                        >
                          <span className="conversation-title">{conv.title}</span>
                          <button
                            type="button"
                            className="conversation-delete"
                            onClick={e => handleDeleteConversation(conv.id, e)}
                            title={t('header.deleteConversation')}
                            aria-label={t('header.deleteConversation')}
                          >
                            ✕
                          </button>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={toggleConfigPanel}
          title={t('header.config')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <title>{t('header.config')}</title>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        {exportStatus && <div className="export-status">{exportStatus}</div>}
      </div>
    </header>
  )
}
