import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  } = useStore()
  const { t } = useTranslation()
  const [showConversationList, setShowConversationList] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  const handleNewConversation = () => {
    // This will be handled by ChatPanel when the user sends a message
    setShowConversationList(false)
  }

  const handleLoadConversation = (id: string) => {
    loadConversation(id)
    setShowConversationList(false)
    // Reload page to reset ChatPanel state
    window.location.reload()
  }

  const handleDeleteConversation = async (id: string, e: MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(id)
      if (currentConversationId === id) {
        window.location.reload()
      }
    }
  }

  const handleExportCurrent = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentConversationId) {
      setExportStatus('No active conversation to export')
      setTimeout(() => setExportStatus(null), 3000)
      return
    }

    try {
      const result = await window.electronAPI.conversationExport(currentConversationId)
      if (result.success && result.filePath) {
        setExportStatus(`Exported to ${result.filePath}`)
        setTimeout(() => setExportStatus(null), 3000)
      } else if (result.cancelled) {
        setExportStatus(null)
      } else {
        setExportStatus(result.error || 'Export failed')
        setTimeout(() => setExportStatus(null), 3000)
      }
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : 'Export failed')
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

  const handleExportAll = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const result = await window.electronAPI.conversationExportAll()
      if (result.success && result.filePath) {
        setExportStatus(`Exported all conversations to ${result.filePath}`)
        setTimeout(() => setExportStatus(null), 3000)
      } else if (result.cancelled) {
        setExportStatus(null)
      } else {
        setExportStatus(result.error || 'Export failed')
        setTimeout(() => setExportStatus(null), 3000)
      }
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : 'Export failed')
      setTimeout(() => setExportStatus(null), 3000)
    }
  }

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
          <img src="/logo.svg" alt="Termaid" className="app-title-icon" />
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
            title="New conversation"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>New conversation</title>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowConversationList(!showConversationList)}
            title="Conversations"
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
              <title>Conversations</title>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={e => handleExportAll(e)}
            title="Export all conversations"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>Export conversations</title>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          {showConversationList && (
            <div className="conversation-dropdown">
              <div className="conversation-dropdown-header">
                <span>Conversations</span>
                <button type="button" onClick={() => setShowConversationList(false)}>
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
                      title="Export current conversation"
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
                  <ul className="conversation-list">
                    {conversations.map(conv => (
                      <button
                        type="button"
                        key={conv.id}
                        className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                        onClick={() => handleLoadConversation(conv.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleLoadConversation(conv.id)
                          }
                        }}
                      >
                        <span className="conversation-title">{conv.title}</span>
                        <button
                          type="button"
                          className="conversation-delete"
                          onClick={e => handleDeleteConversation(conv.id, e)}
                          title="Delete conversation"
                        >
                          ✕
                        </button>
                      </button>
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
            <title>Configuration</title>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        {exportStatus && <div className="export-status">{exportStatus}</div>}
      </div>
    </header>
  )
}
