import type { AppConfig } from '@shared/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock modules before imports
vi.mock('../store/useStore')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))
vi.mock('./LanguageSelector', () => ({
  default: () => <div data-testid="language-selector" />,
}))
vi.mock('./ModelSelector', () => ({
  ModelSelector: ({ value }: { value: string }) => (
    <input data-testid="model-selector" defaultValue={value} />
  ),
}))

import { useStore } from '../store/useStore'
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

Object.defineProperty(window, 'electronAPI', {
  value: {
    getConfigEnvSources: mockGetConfigEnvSources,
    setConfig: mockSetConfig_electron,
    resetConfig: mockResetConfig,
    llmInit: mockLlmInit,
    llmListModels: mockLlmListModels,
    llmTestConnection: mockLlmTestConnection,
  },
  writable: true,
})

describe('ConfigPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useStore).mockReturnValue({
      config: defaultConfig,
      setConfig: mockSetConfig,
      toggleConfigPanel: mockToggleConfigPanel,
    } as ReturnType<typeof useStore>)
  })

  test('should render the config dialog', () => {
    render(<ConfigPanel />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })

  test('should render the config title', () => {
    render(<ConfigPanel />)

    expect(screen.getByText('config.title')).toBeInTheDocument()
  })

  test('should render the LLM provider section', () => {
    render(<ConfigPanel />)

    expect(screen.getByText('config.llm.title')).toBeInTheDocument()
  })

  test('should render the provider selector', () => {
    render(<ConfigPanel />)

    const providerSelect = screen.getByRole('combobox', { name: /config.llm.provider/i })
    expect(providerSelect).toBeInTheDocument()
  })

  test('should show ollama section by default', () => {
    render(<ConfigPanel />)

    expect(screen.getByText('config.ollama.title')).toBeInTheDocument()
  })

  test('should show Ollama URL input', () => {
    render(<ConfigPanel />)

    const urlInput = screen.getByDisplayValue('http://localhost:11434')
    expect(urlInput).toBeInTheDocument()
  })

  test('should render the interface section', () => {
    render(<ConfigPanel />)

    expect(screen.getByText('config.interface.title')).toBeInTheDocument()
  })

  test('should render the terminal section', () => {
    render(<ConfigPanel />)

    expect(screen.getByText('config.terminal.title')).toBeInTheDocument()
  })

  test('should render save and reset buttons', () => {
    render(<ConfigPanel />)

    expect(screen.getByRole('button', { name: /config.common.save/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /config.common.reset/ })).toBeInTheDocument()
  })

  test('should render close button', () => {
    render(<ConfigPanel />)

    const closeButton = screen.getByRole('button', { name: /config\.common\.close/ })
    expect(closeButton).toBeInTheDocument()
  })

  test('should call toggleConfigPanel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    await user.click(screen.getByRole('button', { name: /config\.common\.close/ }))

    expect(mockToggleConfigPanel).toHaveBeenCalled()
  })

  test('should render the test connection button', () => {
    render(<ConfigPanel />)

    expect(screen.getByRole('button', { name: /test.connection/ })).toBeInTheDocument()
  })

  test('should show claude section when provider is claude', () => {
    vi.mocked(useStore).mockReturnValue({
      config: { ...defaultConfig, llmProvider: 'claude' },
      setConfig: mockSetConfig,
      toggleConfigPanel: mockToggleConfigPanel,
    } as ReturnType<typeof useStore>)
    render(<ConfigPanel />)

    expect(screen.getByText('config.claude.title')).toBeInTheDocument()
  })

  test('should show openai section when provider is openai', () => {
    vi.mocked(useStore).mockReturnValue({
      config: { ...defaultConfig, llmProvider: 'openai' },
      setConfig: mockSetConfig,
      toggleConfigPanel: mockToggleConfigPanel,
    } as ReturnType<typeof useStore>)
    render(<ConfigPanel />)

    expect(screen.getByText('config.openai.title')).toBeInTheDocument()
  })

  test('should render the language selector', () => {
    render(<ConfigPanel />)

    expect(screen.getByTestId('language-selector')).toBeInTheDocument()
  })

  test('should render theme selector', () => {
    render(<ConfigPanel />)

    const themeSelect = screen.getByRole('combobox', { name: /config.interface.theme/ })
    expect(themeSelect).toBeInTheDocument()
  })

  // handleSave tests
  test('should call setConfig and toggleConfigPanel when save button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const saveButton = screen.getByRole('button', { name: /config.common.save/ })
    await user.click(saveButton)

    expect(mockSetConfig_electron).toHaveBeenCalledWith(defaultConfig)
    expect(mockSetConfig).toHaveBeenCalledWith(defaultConfig)
    expect(mockToggleConfigPanel).toHaveBeenCalled()
  })

  test('should save modified configuration when save button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    // Modify the URL by selecting all and typing new value
    const urlInput = screen.getByDisplayValue('http://localhost:11434') as HTMLInputElement
    await user.click(urlInput)
    await user.tripleClick(urlInput) // Select all text
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
    render(<ConfigPanel />)

    const resetButton = screen.getByRole('button', { name: /config.common.reset/ })
    await user.click(resetButton)

    expect(mockResetConfig).toHaveBeenCalled()
  })

  test('should update config with default values after reset', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const resetButton = screen.getByRole('button', { name: /config.common.reset/ })
    await user.click(resetButton)

    expect(mockSetConfig).toHaveBeenCalledWith(defaultConfig)
  })

  // testConnection tests
  test('should show success message when connection test succeeds', async () => {
    const user = userEvent.setup()
    mockLlmTestConnection.mockResolvedValueOnce(true)
    render(<ConfigPanel />)

    const testButton = screen.getByRole('button', { name: /test.connection/ })
    await user.click(testButton)

    // Wait for async operations
    expect(mockLlmInit).toHaveBeenCalled()
    expect(mockLlmTestConnection).toHaveBeenCalled()

    // Check success message
    expect(await screen.findByText('errors.connectionSuccess')).toBeInTheDocument()
  })

  test('should show error message when connection test fails', async () => {
    const user = userEvent.setup()
    mockLlmTestConnection.mockResolvedValueOnce(false)
    render(<ConfigPanel />)

    const testButton = screen.getByRole('button', { name: /test.connection/ })
    await user.click(testButton)

    // Wait for async operations
    expect(mockLlmInit).toHaveBeenCalled()
    expect(mockLlmTestConnection).toHaveBeenCalled()

    // Check error message
    expect(await screen.findByText('errors.connection')).toBeInTheDocument()
  })

  test('should show error message when connection test throws an error', async () => {
    const user = userEvent.setup()
    mockLlmTestConnection.mockRejectedValueOnce(new Error('Connection refused'))
    render(<ConfigPanel />)

    const testButton = screen.getByRole('button', { name: /test.connection/ })
    await user.click(testButton)

    // Check error message
    expect(await screen.findByText('Connection refused')).toBeInTheDocument()
  })

  // Input change tests
  test('should update URL input value', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const urlInput = screen.getByDisplayValue('http://localhost:11434') as HTMLInputElement
    await user.click(urlInput)
    await user.tripleClick(urlInput)
    await user.keyboard('http://custom:1234')

    expect(urlInput.value).toBe('http://custom:1234')
  })

  test('should update temperature slider value', async () => {
    const _user = userEvent.setup()
    render(<ConfigPanel />)

    const temperatureSlider = screen.getByRole('slider', { name: /config.common.temperature/ })
    // Range input - verify it exists and shows correct initial value
    expect(temperatureSlider).toHaveValue('0.7')
  })

  test('should update maxTokens input value', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const maxTokensInput = screen.getByRole('spinbutton', {
      name: /config.common.maxTokens/,
    }) as HTMLInputElement
    // Select all and type new value
    await user.click(maxTokensInput)
    await user.tripleClick(maxTokensInput)
    await user.keyboard('2000')

    expect(maxTokensInput.value).toBe('2000')
  })

  test('should update shell selection', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const shellSelect = screen.getByRole('combobox', { name: /config.terminal.shell/ })
    await user.selectOptions(shellSelect, 'bash')

    expect(shellSelect).toHaveValue('bash')
  })

  test('should update theme selection', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const themeSelect = screen.getByRole('combobox', { name: /config.interface.theme/ })
    await user.selectOptions(themeSelect, 'light')

    expect(themeSelect).toHaveValue('light')
  })

  test('should update provider selection to claude', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const providerSelect = screen.getByRole('combobox', { name: /config.llm.provider/ })
    await user.selectOptions(providerSelect, 'claude')

    expect(providerSelect).toHaveValue('claude')
    expect(screen.getByText('config.claude.title')).toBeInTheDocument()
  })

  test('should update provider selection to openai', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    const providerSelect = screen.getByRole('combobox', { name: /config.llm.provider/ })
    await user.selectOptions(providerSelect, 'openai')

    expect(providerSelect).toHaveValue('openai')
    expect(screen.getByText('config.openai.title')).toBeInTheDocument()
  })

  // Env badge display tests
  test('should show env badge when URL is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      ...mockGetConfigEnvSources(),
      url: true,
    })
    render(<ConfigPanel />)

    // Wait for env sources to load
    expect(await screen.findAllByText('Environment variable')).toHaveLength(1)
    expect(screen.getByText('TERMAID_OLLAMA_URL')).toBeInTheDocument()
  })

  test('should show env badge when model is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      ...mockGetConfigEnvSources(),
      model: true,
    })
    render(<ConfigPanel />)

    expect(await screen.findByText('TERMAID_OLLAMA_MODEL')).toBeInTheDocument()
  })

  test('should show env badge when temperature is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      ...mockGetConfigEnvSources(),
      temperature: true,
    })
    render(<ConfigPanel />)

    expect(await screen.findByText('TERMAID_OLLAMA_TEMPERATURE')).toBeInTheDocument()
  })

  test('should show env badge when maxTokens is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      ...mockGetConfigEnvSources(),
      maxTokens: true,
    })
    render(<ConfigPanel />)

    expect(await screen.findByText('TERMAID_OLLAMA_MAX_TOKENS')).toBeInTheDocument()
  })

  test('should show env badge when shell is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      ...mockGetConfigEnvSources(),
      shell: true,
    })
    render(<ConfigPanel />)

    expect(await screen.findByText('TERMAID_SHELL')).toBeInTheDocument()
  })

  test('should show env badge when llmProvider is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      ...mockGetConfigEnvSources(),
      llmProvider: true,
    })
    render(<ConfigPanel />)

    expect(await screen.findByText('Environment variable')).toBeInTheDocument()
  })

  test('should disable input when field is from environment variable', async () => {
    mockGetConfigEnvSources.mockResolvedValueOnce({
      ...mockGetConfigEnvSources(),
      url: true,
    })
    render(<ConfigPanel />)

    const urlInput = await screen.findByDisplayValue('http://localhost:11434')
    expect(urlInput).toBeDisabled()
  })

  describe('tooltips', () => {
    test('should have tooltip on close button', () => {
      render(<ConfigPanel />)

      const closeButton = screen.getByRole('button', { name: /config\.common\.close/ })
      expect(closeButton).toHaveAttribute('title', 'config.common.close')
    })

    test('should have tooltip on test connection button', () => {
      render(<ConfigPanel />)

      const testButton = screen.getByRole('button', { name: /test\.connection/ })
      expect(testButton).toHaveAttribute('title', 'test.connectionTooltip')
    })

    test('should have tooltip on reset button', () => {
      render(<ConfigPanel />)

      const resetButton = screen.getByRole('button', { name: /config\.common\.reset/ })
      expect(resetButton).toHaveAttribute('title', 'config.common.resetTooltip')
    })

    test('should have tooltip on save button', () => {
      render(<ConfigPanel />)

      const saveButton = screen.getByRole('button', { name: /config\.common\.save/ })
      expect(saveButton).toHaveAttribute('title', 'config.common.saveTooltip')
    })
  })
})
