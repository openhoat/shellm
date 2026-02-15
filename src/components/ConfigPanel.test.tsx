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

    expect(screen.getByRole('button', { name: /config.ollama.save/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /config.common.reset/ })).toBeInTheDocument()
  })

  test('should render close button', () => {
    render(<ConfigPanel />)

    const closeButton = screen.getByRole('button', { name: /Close/ })
    expect(closeButton).toBeInTheDocument()
  })

  test('should call toggleConfigPanel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfigPanel />)

    await user.click(screen.getByRole('button', { name: /Close/ }))

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
})
