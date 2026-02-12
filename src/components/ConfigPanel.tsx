import type { AppConfig } from '@shared/types'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import LanguageSelector from './LanguageSelector'
import { ModelSelector } from './ModelSelector'
import './ConfigPanel.css'

export const ConfigPanel = () => {
  const { config, setConfig, toggleConfigPanel } = useStore()
  const { t } = useTranslation()
  const [localConfig, setLocalConfig] = useState<AppConfig>(config)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [envSources, setEnvSources] = useState<{
    url: boolean
    apiKey: boolean
    model: boolean
    temperature: boolean
    maxTokens: boolean
    shell: boolean
  }>({
    url: false,
    apiKey: false,
    model: false,
    temperature: false,
    maxTokens: false,
    shell: false,
  })

  const loadEnvSources = useCallback(async () => {
    try {
      const sources = await window.electronAPI.getConfigEnvSources()
      setEnvSources(sources)
    } catch (_error) {
      // Silently fail
    }
  }, [])

  const loadModels = useCallback(async () => {
    setIsLoadingModels(true)
    try {
      // Initialize LLM service with current config
      await window.electronAPI.llmInit(localConfig.ollama)
      const models = await window.electronAPI.llmListModels()
      setAvailableModels(models)
    } catch (_error) {
      // Silently fail, user can still type model name
    } finally {
      setIsLoadingModels(false)
    }
  }, [localConfig.ollama])

  useEffect(() => {
    setLocalConfig(config)
    loadEnvSources()
    // Auto-load models if URL is configured
    if (config.ollama.url) {
      loadModels()
    }
  }, [config, loadEnvSources, loadModels])

  const handleSave = async () => {
    await window.electronAPI.setConfig(localConfig)
    setConfig(localConfig)
    toggleConfigPanel()
  }

  const handleReset = async () => {
    const defaultConfig = await window.electronAPI.resetConfig()
    setConfig(defaultConfig)
    setLocalConfig(defaultConfig)
  }

  const testConnection = async () => {
    setTestResult(null)
    try {
      // Initialize LLM service with current config
      await window.electronAPI.llmInit(localConfig.ollama)

      const success = await window.electronAPI.llmTestConnection()
      setTestResult({
        success,
        message: success ? t('errors.connectionSuccess') : t('errors.connection'),
      })

      if (success) {
        loadModels()
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur de connexion',
      })
    }
  }

  return (
    <div className="config-overlay">
      <div className="config-panel">
        <div className="config-header">
          <h2>{t('config.title')}</h2>
          <button type="button" className="close-button" onClick={toggleConfigPanel}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>Fermer</title>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="config-content">
          <div className="config-section">
            <h3>{t('config.ollama.title')}</h3>

            <div className="config-field">
              <label htmlFor="ollama-url">
                {t('config.ollama.url')}
                {envSources.url && <span className="env-badge">Variable d'environnement</span>}
              </label>
              <input
                id="ollama-url"
                type="text"
                value={localConfig.ollama.url}
                onChange={e =>
                  setLocalConfig({
                    ...localConfig,
                    ollama: { ...localConfig.ollama, url: e.target.value },
                  })
                }
                placeholder="http://localhost:11434"
                disabled={envSources.url}
                className={envSources.url ? 'env-readonly' : ''}
              />
              {envSources.url && (
                <div className="env-hint">
                  Valeur définie par la variable d'environnement <code>SHELLM_OLLAMA_URL</code>
                </div>
              )}
            </div>

            <div className="config-field">
              <label htmlFor="ollama-api-key">
                API Key (optional)
                {envSources.apiKey && <span className="env-badge">Variable d'environnement</span>}
              </label>
              <input
                id="ollama-api-key"
                type="password"
                value={localConfig.ollama.apiKey || ''}
                onChange={e =>
                  setLocalConfig({
                    ...localConfig,
                    ollama: { ...localConfig.ollama, apiKey: e.target.value },
                  })
                }
                placeholder="Votre clé API"
                disabled={envSources.apiKey}
                className={envSources.apiKey ? 'env-readonly' : ''}
              />
              {envSources.apiKey && (
                <div className="env-hint">
                  Valeur définie par la variable d'environnement <code>SHELLM_OLLAMA_API_KEY</code>
                </div>
              )}
            </div>

            <div className="config-field">
              <label htmlFor="ollama-model">
                {t('config.ollama.model')}
                {envSources.model && <span className="env-badge">Variable d'environnement</span>}
              </label>
              <ModelSelector
                value={localConfig.ollama.model}
                onChange={model =>
                  setLocalConfig({
                    ...localConfig,
                    ollama: { ...localConfig.ollama, model },
                  })
                }
                availableModels={availableModels}
                isLoading={isLoadingModels}
                onRefresh={loadModels}
                placeholder="ex: llama2, mistral, ..."
                disabled={envSources.model}
                className={envSources.model ? 'env-readonly' : ''}
              />
              {envSources.model && (
                <div className="env-hint">
                  Valeur définie par la variable d'environnement <code>SHELLM_OLLAMA_MODEL</code>
                </div>
              )}
            </div>

            <div className="config-field">
              <label htmlFor="ollama-temperature">
                Temperature: {localConfig.ollama.temperature}
                {envSources.temperature && (
                  <span className="env-badge">Variable d'environnement</span>
                )}
              </label>
              <input
                id="ollama-temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localConfig.ollama.temperature || 0.7}
                onChange={e =>
                  setLocalConfig({
                    ...localConfig,
                    ollama: { ...localConfig.ollama, temperature: parseFloat(e.target.value) },
                  })
                }
                disabled={envSources.temperature}
                className={envSources.temperature ? 'env-readonly' : ''}
              />
              {envSources.temperature && (
                <div className="env-hint">
                  Valeur définie par la variable d'environnement{' '}
                  <code>SHELLM_OLLAMA_TEMPERATURE</code>
                </div>
              )}
            </div>

            <div className="config-field">
              <label htmlFor="ollama-max-tokens">
                Max Tokens
                {envSources.maxTokens && (
                  <span className="env-badge">Variable d'environnement</span>
                )}
              </label>
              <input
                id="ollama-max-tokens"
                type="number"
                min="100"
                max="4000"
                value={localConfig.ollama.maxTokens || 1000}
                onChange={e =>
                  setLocalConfig({
                    ...localConfig,
                    ollama: { ...localConfig.ollama, maxTokens: parseInt(e.target.value, 10) },
                  })
                }
                disabled={envSources.maxTokens}
                className={envSources.maxTokens ? 'env-readonly' : ''}
              />
              {envSources.maxTokens && (
                <div className="env-hint">
                  Valeur définie par la variable d'environnement{' '}
                  <code>SHELLM_OLLAMA_MAX_TOKENS</code>
                </div>
              )}
            </div>

            <div className="config-actions">
              <button type="button" className="btn btn-test" onClick={testConnection}>
                {t('test.connection')}
              </button>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                {testResult.message}
              </div>
            )}
          </div>

          <div className="config-section">
            <h3>Interface</h3>

            <div className="config-field">
              <label htmlFor="theme">Thème</label>
              <select
                id="theme"
                value={localConfig.theme}
                onChange={e => {
                  const value = e.target.value
                  if (value === 'dark' || value === 'light') {
                    setLocalConfig({
                      ...localConfig,
                      theme: value,
                    })
                  }
                }}
              >
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
              </select>
            </div>

            <div className="config-field">
              <label htmlFor="language-selector">Langue</label>
              <LanguageSelector />
            </div>

            <div className="config-field">
              <label htmlFor="font-size">Taille de police: {localConfig.fontSize}px</label>
              <input
                id="font-size"
                type="range"
                min="10"
                max="20"
                step="1"
                value={localConfig.fontSize}
                onChange={e =>
                  setLocalConfig({
                    ...localConfig,
                    fontSize: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
          </div>

          <div className="config-section">
            <h3>Terminal</h3>

            <div className="config-field">
              <label htmlFor="shell-select">
                Shell
                {envSources.shell && <span className="env-badge">Variable d'environnement</span>}
              </label>
              <select
                id="shell-select"
                value={localConfig.shell}
                onChange={e =>
                  setLocalConfig({
                    ...localConfig,
                    shell: e.target.value,
                  })
                }
                disabled={envSources.shell}
                className={envSources.shell ? 'env-readonly' : ''}
              >
                <option value="auto">Auto (système)</option>
                <option value="bash">Bash</option>
                <option value="zsh">Zsh</option>
                <option value="fish">Fish</option>
                <option value="sh">Sh</option>
                <option value="powershell.exe">PowerShell</option>
                <option value="cmd.exe">Cmd</option>
              </select>
              {envSources.shell && (
                <div className="env-hint">
                  Valeur définie par la variable d'environnement <code>SHELLM_SHELL</code>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="config-footer">
          <button type="button" className="btn btn-reset" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="btn btn-save" onClick={handleSave}>
            {t('config.ollama.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
