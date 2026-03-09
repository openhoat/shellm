import type { AppConfig } from '@shared/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock modules before imports
vi.mock('../store/useStore', () => ({
  useConfig: vi.fn(),
  useSetConfig: vi.fn(),
  useToggleConfigPanel: vi.fn(),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))
vi.mock('./LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector" />,
}))
vi.mock('./ModelSelector', () => ({
  ModelSelector: ({ value }: { value: string }) => (
    <input data-testid="model-selector" defaultValue={value} />
  ),
}))

import { useConfig, useSetConfig, useToggleConfigPanel } from '../store/useStore'
import { ConfigPanel } from './ConfigPanel'

const defaultConfig: AppConfig = {
  llmProvider: 'ollama',
  ollama: {
    url: 'http://localhost:11434',
    model: 'llama2',
    temperature: 0.7,
    maxTokens: 1000,
  },
  claude: {
    apiKey: '',
    model: 'claude-haiku-4-5-20251001',
    temperature: 0.7,
    maxTokens: 1000,
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 1000,
  },
  theme: 'dark',
  fontSize: 14,
  shell: 'auto',
}

const mockToggleConfigPanel = vi.fn()
const mockSetConfig = vi.fn()

const mockGetConfigEnvSources = vi.fn().mockResolvedValue({
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
const mockSetConfig_electron = vi.fn().mockResolvedValue(undefined)
const mockResetConfig = vi.fn().mockResolvedValue(defaultConfig)
const mockLlmInit = vi.fn().mockResolvedValue(undefined)
const mockLlmListModels = vi.fn().mockResolvedValue(['llama2', 'mistral'])
const mockLlmTestConnection = vi.fn().mockResolvedValue(true)
const mockLlmListProviders = vi.fn().mockResolvedValue([
  { name: 'ollama', displayName: 'Ollama', requiresApiKey: false, supportsStreaming: true },
  { name: 'claude', displayName: 'Claude', requiresApiKey: true, supportsStreaming: true },
  { name: 'openai', displayName: 'OpenAI', requiresApiKey: true, supportsStreaming: true },
])

Object.defineProperty(window, 'electronAPI', {
  value: {
    getConfigEnvSources: mockGetConfigEnvSources,
    setConfig: mockSetConfig_electron,
    resetConfig: mockResetConfig,
    llmInit: mockLlmInit,
    llmListModels: mockLlmListModels,
    llmTestConnection: mockLlmTestConnection,
    llmListProviders: mockLlmListProviders,
  },
  writable: true,
})

describe('ConfigPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-setup mocks after clearing
    mockGetConfigEnvSources.mockResolvedValue({
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
    mockLlmListProviders.mockResolvedValue([
      { name: 'ollama', displayName: 'Ollama', requiresApiKey: false, supportsStreaming: true },
      { name: 'claude', displayName: 'Claude', requiresApiKey: true, supportsStreaming: true },
      { name: 'openai', displayName: 'OpenAI', requiresApiKey: true, supportsStreaming: true },
    ])
    vi.mocked(useConfig).mockReturnValue(defaultConfig)
    vi.mocked(useSetConfig).mockReturnValue(mockSetConfig)
    vi.mocked(useToggleConfigPanel).mockReturnValue(mockToggleConfigPanel)
  })

  // Helper to render and wait for async effects
  const renderAndWait = async () => {
    render(<ConfigPanel />)
    // Use findBy to wait for async effects to complete and state to update
    // findBy queries wait for elements to appear and wrap them in act()
    await screen.findByRole('dialog')
  }

  test('should render the config dialog', async () => {
    await renderAndWait()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })

  test('should render the config title', async () => {
    await renderAndWait()
    expect(screen.getByText('config.title')).toBeInTheDocument()
  })

  test('should render the LLM provider section', async () => {
    await renderAndWait()
    expect(screen.getByText('config.llm.title')).toBeInTheDocument()
  })

  test('should render the provider selector', async () => {
    await renderAndWait()
    const providerSelect = screen.getByRole('combobox', { name: /config.llm.provider/i })
    expect(providerSelect).toBeInTheDocument()
  })

  test('should show ollama section by default', async () => {
    await renderAndWait()
    expect(screen.getByText('config.ollama.title')).toBeInTheDocument()
  })

  test('should show Ollama URL input', async () => {
    await renderAndWait()
    const urlInput = screen.getByDisplayValue('http://localhost:11434')
    expect(urlInput).toBeInTheDocument()
  })

  test('should render the interface section', async () => {
    await renderAndWait()
    expect(screen.getByText('config.interface.title')).toBeInTheDocument()
  })

  test('should render the terminal section', async () => {
    await renderAndWait()
    expect(screen.getByText('config.terminal.title')).toBeInTheDocument()
  })

  test('should render save and reset buttons', async () => {
    await renderAndWait()
    expect(screen.getByRole('button', { name: /config.common.save/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /config.common.reset/ })).toBeInTheDocument()
  })

  test('should render close button', async () => {
    await renderAndWait()
    const closeButton = screen.getByRole('button', { name: /config\.common\.close/ })
    expect(closeButton).toBeInTheDocument()
  })

  test('should call toggleConfigPanel when close button is clicked', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    await user.click(screen.getByRole('button', { name: /config\.common\.close/ }))
    expect(mockToggleConfigPanel).toHaveBeenCalled()
  })

  test('should render the test connection button', async () => {
    await renderAndWait()
    expect(screen.getByRole('button', { name: /test.connection/ })).toBeInTheDocument()
  })

  test('should show claude section when provider is claude', async () => {
    vi.mocked(useConfig).mockReturnValue({ ...defaultConfig, llmProvider: 'claude' })
    vi.mocked(useSetConfig).mockReturnValue(mockSetConfig)
    vi.mocked(useToggleConfigPanel).mockReturnValue(mockToggleConfigPanel)
    await renderAndWait()
    expect(screen.getByText('config.claude.title')).toBeInTheDocument()
  })

  test('should show openai section when provider is openai', async () => {
    vi.mocked(useConfig).mockReturnValue({ ...defaultConfig, llmProvider: 'openai' })
    vi.mocked(useSetConfig).mockReturnValue(mockSetConfig)
    vi.mocked(useToggleConfigPanel).mockReturnValue(mockToggleConfigPanel)
    await renderAndWait()
    expect(screen.getByText('config.openai.title')).toBeInTheDocument()
  })

  test('should render the language selector', async () => {
    await renderAndWait()
    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
  })

  test('should render theme selector', async () => {
    await renderAndWait()
    const themeSelect = screen.getByRole('combobox', { name: /config.interface.theme/ })
    expect(themeSelect).toBeInTheDocument()
  })

  // handleSave tests
  test('should call setConfig and toggleConfigPanel when save button is clicked', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const saveButton = screen.getByRole('button', { name: /config.common.save/ })
    await user.click(saveButton)
    expect(mockSetConfig_electron).toHaveBeenCalledWith(defaultConfig)
    expect(mockSetConfig).toHaveBeenCalledWith(defaultConfig)
    expect(mockToggleConfigPanel).toHaveBeenCalled()
  })

  test('should save modified configuration when save button is clicked', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const urlInput = screen.getByDisplayValue('http://localhost:11434') as HTMLInputElement
    await user.click(urlInput)
    await user.tripleClick(urlInput)
    await user.keyboard('http://custom:11434')

    const saveButton = screen.getByRole('button', { name: /config.common.save/ })
    await user.click(saveButton)

    expect(mockSetConfig_electron).toHaveBeenCalledWith(
      expect.objectContaining({
        ollama: expect.objectContaining({
          url: 'http://custom:11434',
        }),
      })
    )
  })

  // handleReset tests
  test('should call resetConfig when reset button is clicked', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const resetButton = screen.getByRole('button', { name: /config.common.reset/ })
    await user.click(resetButton)
    expect(mockResetConfig).toHaveBeenCalled()
  })

  test('should update config with default values after reset', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const resetButton = screen.getByRole('button', { name: /config.common.reset/ })
    await user.click(resetButton)
    expect(mockSetConfig).toHaveBeenCalledWith(defaultConfig)
  })

  // testConnection tests
  test('should show success message when connection test succeeds', async () => {
    const user = userEvent.setup()
    mockLlmTestConnection.mockResolvedValueOnce(true)
    await renderAndWait()
    const testButton = screen.getByRole('button', { name: /test.connection/ })
    await user.click(testButton)
    expect(mockLlmInit).toHaveBeenCalled()
    expect(mockLlmTestConnection).toHaveBeenCalled()
    expect(await screen.findByText('errors.connectionSuccess')).toBeInTheDocument()
  })

  test('should show error message when connection test fails', async () => {
    const user = userEvent.setup()
    mockLlmTestConnection.mockResolvedValueOnce(false)
    await renderAndWait()
    const testButton = screen.getByRole('button', { name: /test.connection/ })
    await user.click(testButton)
    expect(mockLlmInit).toHaveBeenCalled()
    expect(mockLlmTestConnection).toHaveBeenCalled()
    expect(await screen.findByText('errors.connection')).toBeInTheDocument()
  })

  test('should show error message when connection test throws an error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()
    mockLlmTestConnection.mockRejectedValueOnce(new Error('Connection refused'))
    await renderAndWait()
    const testButton = screen.getByRole('button', { name: /test.connection/ })
    await user.click(testButton)
    expect(await screen.findByText('Connection refused')).toBeInTheDocument()
    consoleErrorSpy.mockRestore()
  })

  // Input change tests
  test('should update URL input value', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const urlInput = screen.getByDisplayValue('http://localhost:11434') as HTMLInputElement
    await user.click(urlInput)
    await user.tripleClick(urlInput)
    await user.keyboard('http://custom:1234')
    expect(urlInput.value).toBe('http://custom:1234')
  })

  test('should update temperature slider value', async () => {
    await renderAndWait()
    const temperatureSlider = screen.getByRole('slider', { name: /config.common.temperature/ })
    expect(temperatureSlider).toHaveValue('0.7')
  })

  test('should update maxTokens input value', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const maxTokensInput = screen.getByRole('spinbutton', {
      name: /config.common.maxTokens/,
    }) as HTMLInputElement
    await user.click(maxTokensInput)
    await user.tripleClick(maxTokensInput)
    await user.keyboard('2000')
    expect(maxTokensInput.value).toBe('2000')
  })

  test('should update shell selection', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const shellSelect = screen.getByRole('combobox', { name: /config.terminal.shell/ })
    await user.selectOptions(shellSelect, 'bash')
    expect(shellSelect).toHaveValue('bash')
  })

  test('should update theme selection', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const themeSelect = screen.getByRole('combobox', { name: /config.interface.theme/ })
    await user.selectOptions(themeSelect, 'light')
    expect(themeSelect).toHaveValue('light')
  })

  test('should update provider selection to claude', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const providerSelect = screen.getByRole('combobox', { name: /config.llm.provider/ })
    await user.selectOptions(providerSelect, 'claude')
    expect(providerSelect).toHaveValue('claude')
    expect(screen.getByText('config.claude.title')).toBeInTheDocument()
  })

  test('should update provider selection to openai', async () => {
    const user = userEvent.setup()
    await renderAndWait()
    const providerSelect = screen.getByRole('combobox', { name: /config.llm.provider/ })
    await user.selectOptions(providerSelect, 'openai')
    expect(providerSelect).toHaveValue('openai')
    expect(screen.getByText('config.openai.title')).toBeInTheDocument()
  })

  // Env badge display tests
  test('should show env badge when URL is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      url: true,
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
    render(<ConfigPanel />)
    expect(await screen.findAllByText('Environment variable')).toHaveLength(1)
    expect(screen.getByText('TERMAID_OLLAMA_URL')).toBeInTheDocument()
  })

  test('should show env badge when model is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      url: false,
      apiKey: false,
      model: true,
      temperature: false,
      maxTokens: false,
      shell: false,
      llmProvider: false,
      claudeApiKey: false,
      claudeModel: false,
      openaiApiKey: false,
      openaiModel: false,
    })
    render(<ConfigPanel />)
    expect(await screen.findByText('TERMAID_OLLAMA_MODEL')).toBeInTheDocument()
  })

  test('should show env badge when temperature is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      url: false,
      apiKey: false,
      model: false,
      temperature: true,
      maxTokens: false,
      shell: false,
      llmProvider: false,
      claudeApiKey: false,
      claudeModel: false,
      openaiApiKey: false,
      openaiModel: false,
    })
    render(<ConfigPanel />)
    expect(await screen.findByText('TERMAID_OLLAMA_TEMPERATURE')).toBeInTheDocument()
  })

  test('should show env badge when maxTokens is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      url: false,
      apiKey: false,
      model: false,
      temperature: false,
      maxTokens: true,
      shell: false,
      llmProvider: false,
      claudeApiKey: false,
      claudeModel: false,
      openaiApiKey: false,
      openaiModel: false,
    })
    render(<ConfigPanel />)
    expect(await screen.findByText('TERMAID_OLLAMA_MAX_TOKENS')).toBeInTheDocument()
  })

  test('should show env badge when shell is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      url: false,
      apiKey: false,
      model: false,
      temperature: false,
      maxTokens: false,
      shell: true,
      llmProvider: false,
      claudeApiKey: false,
      claudeModel: false,
      openaiApiKey: false,
      openaiModel: false,
    })
    render(<ConfigPanel />)
    expect(await screen.findByText('TERMAID_SHELL')).toBeInTheDocument()
  })

  test('should show env badge when llmProvider is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      url: false,
      apiKey: false,
      model: false,
      temperature: false,
      maxTokens: false,
      shell: false,
      llmProvider: true,
      claudeApiKey: false,
      claudeModel: false,
      openaiApiKey: false,
      openaiModel: false,
    })
    render(<ConfigPanel />)
    expect(await screen.findByText('Environment variable')).toBeInTheDocument()
  })

  test('should disable input when field is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      url: true,
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
    render(<ConfigPanel />)
    const urlInput = await screen.findByDisplayValue('http://localhost:11434')
    expect(urlInput).toBeDisabled()
  })

  describe('tooltips', () => {
    test('should have tooltip on close button', async () => {
      await renderAndWait()
      const closeButton = screen.getByRole('button', { name: /config\.common\.close/ })
      expect(closeButton).toHaveAttribute('title', 'config.common.close')
    })

    test('should have tooltip on test connection button', async () => {
      await renderAndWait()
      const testButton = screen.getByRole('button', { name: /test\.connection/ })
      expect(testButton).toHaveAttribute('title', 'test.connectionTooltip')
    })

    test('should have tooltip on reset button', async () => {
      await renderAndWait()
      const resetButton = screen.getByRole('button', { name: /config\.common\.reset/ })
      expect(resetButton).toHaveAttribute('title', 'config.common.resetTooltip')
    })

    test('should have tooltip on save button', async () => {
      await renderAndWait()
      const saveButton = screen.getByRole('button', { name: /config\.common\.save/ })
      expect(saveButton).toHaveAttribute('title', 'config.common.saveTooltip')
    })
  })
})
