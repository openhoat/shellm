import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import LanguageSelector from './LanguageSelector'
import './Header.css'

export const Header = () => {
  const { config, toggleConfigPanel } = useStore()
  const { t } = useTranslation()

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="app-title">
          <span className="app-title-icon">⚡</span>
          SheLLM
        </h1>
        <span className="app-version">v1.0.0</span>
      </div>
      <div className="header-right">
        <div className="status-indicator">
          <span className={`status-dot ${config.theme === 'dark' ? 'active' : ''}`}></span>
          <span className="status-text">
            {config.ollama.url === 'http://localhost:11434'
              ? 'Ollama: Local'
              : `Ollama: ${config.ollama.url}`}
          </span>
        </div>
        <LanguageSelector />
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
      </div>
    </header>
  )
}
