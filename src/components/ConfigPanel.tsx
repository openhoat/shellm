import { CLAUDE_MODELS, OPENAI_MODELS } from '@shared/models'
import type { AppConfig, LLMProviderMetadata } from '@shared/types'
import { getActiveProvider } from '@shared/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/useStore'
import { LanguageSelector } from './LanguageSelector'
import { ModelSelector } from './ModelSelector'
import './ConfigPanel.css'

export const ConfigPanel = () => {
  const { config, setConfig, toggleConfigPanel } = useStore()
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const [localConfig, setLocalConfig] = useState<AppConfig>(config)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [providers, setProviders] = useState<LLMProviderMetadata[]>([])
  const [envSources, setEnvSources] = useState<{
    url: boolean
    apiKey: boolean
    model: boolean
    temperature: boolean
    maxTokens: boolean
    shell: boolean
    llmProvider: boolean
    claudeApiKey: boolean
    claudeModel: boolean
    openaiApiKey: boolean
    openaiModel: boolean
  }>({
    url: false,
    apiKey: false,
    model: false,
    temperature: false,
    maxTokens: false,
    shell: false,
    llmProvider: false,
    claudeApiKey: false,
    claudeModel: false,
    openaiApiKey: false,
    openaiModel: false,
  })

  const loadEnvSources = useCallback(async () => {
    try {
      const sources = await window.electronAPI.getConfigEnvSources()
      setEnvSources(sources)
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for config loading errors
      console.warn('[ConfigPanel] Failed to load env sources:', error)
    }
  }, [])

  const loadProviders = useCallback(async () => {
    try {
      const providerList = await window.electronAPI.llmListProviders()
      setProviders(providerList)
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for provider loading errors
      console.warn('[ConfigPanel] Failed to load providers:', error)
      // Fall back to default providers
      setProviders([
        { name: 'ollama', displayName: 'Ollama', requiresApiKey: false, supportsStreaming: true },
        { name: 'claude', displayName: 'Claude', requiresApiKey: true, supportsStreaming: true },
        { name: 'openai', displayName: 'OpenAI', requiresApiKey: true, supportsStreaming: true },
      ])
    }
  }, [])

  const loadModels = useCallback(async () => {
    setIsLoadingModels(true)
    try {
      await window.electronAPI.llmInit(localConfig)
      const models = await window.electronAPI.llmListModels()
      setAvailableModels(models)
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for model loading errors
      console.warn('[ConfigPanel] Failed to load models:', error)
    } finally {
      setIsLoadingModels(false)
    }
  }, [localConfig])

  // Sync local form state from the store config
  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  // Load env sources once on mount
  useEffect(() => {
    loadEnvSources()
    loadProviders()
  }, [loadEnvSources, loadProviders])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        toggleConfigPanel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [toggleConfigPanel])

  // Focus trap: keep focus inside the dialog and focus it on mount
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const focusableElements = panel.querySelectorAll<HTMLElement>(focusableSelectors)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    panel.addEventListener('keydown', handleKeyDown)
    return () => {
      panel.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Initialize model list when store config changes (uses config, not localConfig)
  useEffect(() => {
    const activeProvider = getActiveProvider(config)
    if (activeProvider === 'ollama' && config.ollama.url) {
      setIsLoadingModels(true)
      window.electronAPI
        .llmInit(config)
        .then(() => window.electronAPI.llmListModels())
        .then(models => setAvailableModels(models))
        .catch(error => {
          // biome-ignore lint/suspicious/noConsole: Debug logging for model initialization errors
          console.warn('[ConfigPanel] Failed to initialize or load models:', error)
        })
        .finally(() => setIsLoadingModels(false))
    } else if (activeProvider === 'claude') {
      setAvailableModels(CLAUDE_MODELS)
    } else if (activeProvider === 'openai') {
      setAvailableModels(OPENAI_MODELS)
    }
  }, [config])

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
      await window.electronAPI.llmInit(localConfig)

      const success = await window.electronAPI.llmTestConnection()
      setTestResult({
        success,
        message: success ? t('errors.connectionSuccess') : t('errors.connection'),
      })

      if (success) {
        loadModels()
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for connection test errors
      console.error('[ConfigPanel] Connection test failed:', error)
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : t('errors.connection'),
      })
    }
  }

  return (
    <div className="config-overlay" role="presentation">
      <div
        className="config-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-panel-title"
        ref={panelRef}
      >
        <div className="config-header">
          <h2 id="config-panel-title">{t('config.title')}</h2>
          <button
            type="button"
            className="close-button"
            onClick={toggleConfigPanel}
            title={t('config.common.close')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>{t('config.common.close')}</title>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="config-content">
          <div className="config-section">
            <h3>{t('config.llm.title')}</h3>

            <div className="config-field">
              <label htmlFor="llm-provider">
                {t('config.llm.provider')}
                {envSources.llmProvider && <span className="env-badge">Environment variable</span>}
              </label>
              <select
                id="llm-provider"
                value={getActiveProvider(localConfig)}
                onChange={e => {
                  const value = e.target.value
                  // Use activeProvider to be consistent with getActiveProvider
                  const updatedConfig = {
                    ...localConfig,
                    activeProvider: value,
                  }
                  setLocalConfig(updatedConfig)
                  if (value === 'claude') {
                    setAvailableModels(CLAUDE_MODELS)
                  } else if (value === 'openai') {
                    setAvailableModels(OPENAI_MODELS)
                  }
                }}
                disabled={envSources.llmProvider}
                className={envSources.llmProvider ? 'env-readonly' : ''}
              >
                {providers.map(provider => (
                  <option key={provider.name} value={provider.name}>
                    {provider.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {getActiveProvider(localConfig) === 'ollama' && (
            <div className="config-section">
              <h3>{t('config.ollama.title')}</h3>

              <div className="config-field">
                <label htmlFor="ollama-url">
                  {t('config.ollama.url')}
                  {envSources.url && <span className="env-badge">Environment variable</span>}
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
                    Value set by environment variable <code>TERMAID_OLLAMA_URL</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="ollama-api-key">
                  {t('config.common.apiKeyOptional')}
                  {envSources.apiKey && <span className="env-badge">Environment variable</span>}
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
                  placeholder="Your API key"
                  disabled={envSources.apiKey}
                  className={envSources.apiKey ? 'env-readonly' : ''}
                />
                {envSources.apiKey && (
                  <div className="env-hint">
                    Value set by environment variable <code>TERMAID_OLLAMA_API_KEY</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="ollama-model">
                  {t('config.ollama.model')}
                  {envSources.model && <span className="env-badge">Environment variable</span>}
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
                    Value set by environment variable <code>TERMAID_OLLAMA_MODEL</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="ollama-temperature">
                  {t('config.common.temperature')}: {localConfig.ollama.temperature}
                  {envSources.temperature && (
                    <span className="env-badge">Environment variable</span>
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
                    Value set by environment variable <code>TERMAID_OLLAMA_TEMPERATURE</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="ollama-max-tokens">
                  {t('config.common.maxTokens')}
                  {envSources.maxTokens && <span className="env-badge">Environment variable</span>}
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
                    Value set by environment variable <code>TERMAID_OLLAMA_MAX_TOKENS</code>
                  </div>
                )}
              </div>
            </div>
          )}

          {getActiveProvider(localConfig) === 'claude' && (
            <div className="config-section">
              <h3>{t('config.claude.title')}</h3>

              <div className="config-field">
                <label htmlFor="claude-api-key">
                  {t('config.claude.apiKey')}
                  {envSources.claudeApiKey && (
                    <span className="env-badge">Environment variable</span>
                  )}
                </label>
                <input
                  id="claude-api-key"
                  type="password"
                  value={localConfig.claude.apiKey || ''}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      claude: { ...localConfig.claude, apiKey: e.target.value },
                    })
                  }
                  placeholder="sk-ant-..."
                  disabled={envSources.claudeApiKey}
                  className={envSources.claudeApiKey ? 'env-readonly' : ''}
                />
                {envSources.claudeApiKey && (
                  <div className="env-hint">
                    Value set by environment variable <code>TERMAID_CLAUDE_API_KEY</code> or{' '}
                    <code>ANTHROPIC_API_KEY</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="claude-model">
                  {t('config.claude.model')}
                  {envSources.claudeModel && (
                    <span className="env-badge">Environment variable</span>
                  )}
                </label>
                <ModelSelector
                  value={localConfig.claude.model}
                  onChange={model =>
                    setLocalConfig({
                      ...localConfig,
                      claude: { ...localConfig.claude, model },
                    })
                  }
                  availableModels={CLAUDE_MODELS}
                  isLoading={false}
                  onRefresh={() => Promise.resolve()}
                  placeholder="claude-haiku-4-5-20251001"
                  disabled={envSources.claudeModel}
                  className={envSources.claudeModel ? 'env-readonly' : ''}
                />
                {envSources.claudeModel && (
                  <div className="env-hint">
                    Value set by environment variable <code>TERMAID_CLAUDE_MODEL</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="claude-temperature">
                  {t('config.common.temperature')}: {localConfig.claude.temperature}
                </label>
                <input
                  id="claude-temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localConfig.claude.temperature || 0.7}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      claude: { ...localConfig.claude, temperature: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="config-field">
                <label htmlFor="claude-max-tokens">{t('config.common.maxTokens')}</label>
                <input
                  id="claude-max-tokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={localConfig.claude.maxTokens || 1000}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      claude: { ...localConfig.claude, maxTokens: parseInt(e.target.value, 10) },
                    })
                  }
                />
              </div>
            </div>
          )}

          {getActiveProvider(localConfig) === 'openai' && (
            <div className="config-section">
              <h3>{t('config.openai.title')}</h3>

              <div className="config-field">
                <label htmlFor="openai-api-key">
                  {t('config.openai.apiKey')}
                  {envSources.openaiApiKey && (
                    <span className="env-badge">Environment variable</span>
                  )}
                </label>
                <input
                  id="openai-api-key"
                  type="password"
                  value={localConfig.openai.apiKey || ''}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      openai: { ...localConfig.openai, apiKey: e.target.value },
                    })
                  }
                  placeholder="sk-..."
                  disabled={envSources.openaiApiKey}
                  className={envSources.openaiApiKey ? 'env-readonly' : ''}
                />
                {envSources.openaiApiKey && (
                  <div className="env-hint">
                    Value set by environment variable <code>TERMAID_OPENAI_API_KEY</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="openai-model">
                  {t('config.openai.model')}
                  {envSources.openaiModel && (
                    <span className="env-badge">Environment variable</span>
                  )}
                </label>
                <ModelSelector
                  value={localConfig.openai.model}
                  onChange={model =>
                    setLocalConfig({
                      ...localConfig,
                      openai: { ...localConfig.openai, model },
                    })
                  }
                  availableModels={OPENAI_MODELS}
                  isLoading={false}
                  onRefresh={() => Promise.resolve()}
                  placeholder="gpt-4o"
                  disabled={envSources.openaiModel}
                  className={envSources.openaiModel ? 'env-readonly' : ''}
                />
                {envSources.openaiModel && (
                  <div className="env-hint">
                    Value set by environment variable <code>TERMAID_OPENAI_MODEL</code>
                  </div>
                )}
              </div>

              <div className="config-field">
                <label htmlFor="openai-temperature">
                  {t('config.common.temperature')}: {localConfig.openai.temperature}
                </label>
                <input
                  id="openai-temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localConfig.openai.temperature || 0.7}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      openai: { ...localConfig.openai, temperature: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="config-field">
                <label htmlFor="openai-max-tokens">{t('config.common.maxTokens')}</label>
                <input
                  id="openai-max-tokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={localConfig.openai.maxTokens || 1000}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      openai: { ...localConfig.openai, maxTokens: parseInt(e.target.value, 10) },
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="config-section">
            <div className="config-actions">
              <button
                type="button"
                className="btn btn-test"
                onClick={testConnection}
                title={t('test.connectionTooltip')}
              >
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
            <h3>{t('config.interface.title')}</h3>

            <div className="config-field">
              <label htmlFor="theme">{t('config.interface.theme')}</label>
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
                <option value="dark">{t('config.interface.themeDark')}</option>
                <option value="light">{t('config.interface.themeLight')}</option>
              </select>
            </div>

            <div className="config-field">
              <label htmlFor="language-selector">{t('config.language.title')}</label>
              <LanguageSelector />
            </div>

            <div className="config-field">
              <label htmlFor="chat-language">{t('config.chatLanguage.title')}</label>
              <select
                id="chat-language"
                value={localConfig.chatLanguage || 'auto'}
                onChange={e =>
                  setLocalConfig({
                    ...localConfig,
                    chatLanguage: e.target.value,
                  })
                }
              >
                <option value="auto">{t('config.chatLanguage.auto')}</option>
                <option value="en">{t('config.chatLanguage.en')}</option>
                <option value="fr">{t('config.chatLanguage.fr')}</option>
                <option value="es">{t('config.chatLanguage.es')}</option>
                <option value="de">{t('config.chatLanguage.de')}</option>
                <option value="pt">{t('config.chatLanguage.pt')}</option>
                <option value="zh">{t('config.chatLanguage.zh')}</option>
                <option value="ja">{t('config.chatLanguage.ja')}</option>
              </select>
            </div>

            <div className="config-field">
              <label htmlFor="font-size">
                {t('config.interface.fontSize')}: {localConfig.fontSize}px
              </label>
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
            <h3>{t('config.terminal.title')}</h3>

            <div className="config-field">
              <label htmlFor="shell-select">
                {t('config.terminal.shell')}
                {envSources.shell && <span className="env-badge">Environment variable</span>}
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
                <option value="auto">Auto (system)</option>
                <option value="bash">Bash</option>
                <option value="zsh">Zsh</option>
                <option value="fish">Fish</option>
                <option value="sh">Sh</option>
                <option value="powershell.exe">PowerShell</option>
                <option value="cmd.exe">Cmd</option>
              </select>
              {envSources.shell && (
                <div className="env-hint">
                  Value set by environment variable <code>TERMAID_SHELL</code>
                </div>
              )}
            </div>
          </div>

          <div className="config-section">
            <h3>{t('config.sandbox.title')}</h3>

            <div className="config-field">
              <label htmlFor="sandbox-enabled">
                <input
                  id="sandbox-enabled"
                  type="checkbox"
                  checked={localConfig.sandbox?.enabled ?? false}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      sandbox: {
                        ...localConfig.sandbox,
                        enabled: e.target.checked,
                        mode: localConfig.sandbox?.mode ?? 'restricted',
                        timeout: localConfig.sandbox?.timeout ?? 30000,
                      },
                    })
                  }
                />
                {t('config.sandbox.enabled')}
              </label>
              <p className="config-hint">{t('config.sandbox.enabledHint')}</p>
            </div>

            {(localConfig.sandbox?.enabled ?? false) && (
              <>
                <div className="config-field">
                  <label htmlFor="sandbox-mode">{t('config.sandbox.mode')}</label>
                  <select
                    id="sandbox-mode"
                    value={localConfig.sandbox?.mode ?? 'restricted'}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        sandbox: {
                          ...localConfig.sandbox,
                          enabled: true,
                          mode: e.target.value as 'none' | 'restricted' | 'docker' | 'system',
                        },
                      })
                    }
                  >
                    <option value="none">{t('config.sandbox.modeNone')}</option>
                    <option value="restricted">{t('config.sandbox.modeRestricted')}</option>
                    <option value="docker">{t('config.sandbox.modeDocker')}</option>
                    <option value="system">{t('config.sandbox.modeSystem')}</option>
                  </select>
                </div>

                <div className="config-field">
                  <label htmlFor="sandbox-timeout">
                    {t('config.sandbox.timeout')}:{' '}
                    {((localConfig.sandbox?.timeout ?? 30000) / 1000).toFixed(0)}s
                  </label>
                  <input
                    id="sandbox-timeout"
                    type="range"
                    min="5000"
                    max="120000"
                    step="5000"
                    value={localConfig.sandbox?.timeout ?? 30000}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        sandbox: {
                          ...localConfig.sandbox,
                          enabled: true,
                          timeout: parseInt(e.target.value, 10),
                        },
                      })
                    }
                  />
                </div>

                {localConfig.sandbox?.mode === 'docker' && (
                  <div className="config-field">
                    <label htmlFor="sandbox-docker-image">{t('config.sandbox.dockerImage')}</label>
                    <input
                      id="sandbox-docker-image"
                      type="text"
                      value={localConfig.sandbox?.dockerImage ?? 'alpine:latest'}
                      onChange={e =>
                        setLocalConfig({
                          ...localConfig,
                          sandbox: {
                            ...localConfig.sandbox,
                            enabled: true,
                            dockerImage: e.target.value,
                          },
                        })
                      }
                      placeholder="alpine:latest"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="config-footer">
          <button
            type="button"
            className="btn btn-reset"
            onClick={handleReset}
            title={t('config.common.resetTooltip')}
          >
            {t('config.common.reset')}
          </button>
          <button
            type="button"
            className="btn btn-save"
            onClick={handleSave}
            title={t('config.common.saveTooltip')}
          >
            {t('config.common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
