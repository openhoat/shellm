import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ModelSelector } from './ModelSelector'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        'models.refresh': 'Refresh models list',
        'models.loading': 'Loading models...',
        'models.emptyHint': 'Type a model name or click ⟳ to load',
      }
      if (key === 'models.available' && options?.count !== undefined) {
        return `${options.count} model${options.count > 1 ? 's' : ''} available`
      }
      return translations[key] || key
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}))

describe('ModelSelector', () => {
  const defaultProps = {
    value: 'llama2',
    onChange: vi.fn(),
    availableModels: ['llama2', 'mistral', 'codellama'],
    isLoading: false,
    onRefresh: vi.fn(),
  }

  test('should render model selector container', () => {
    render(<ModelSelector {...defaultProps} />)

    expect(screen.getByText('llama2')).toBeInTheDocument()
  })

  test('should render refresh button', () => {
    render(<ModelSelector {...defaultProps} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  test('should render available models in datalist', () => {
    render(<ModelSelector {...defaultProps} />)

    expect(screen.getByText('llama2')).toBeInTheDocument()
    expect(screen.getByText('mistral')).toBeInTheDocument()
    expect(screen.getByText('codellama')).toBeInTheDocument()
  })

  test('should show loading spinner when isLoading is true', () => {
    render(<ModelSelector {...defaultProps} isLoading />)

    const button = screen.getByRole('button')
    const spinner = button.querySelector('.spinner')

    expect(spinner).toBeInTheDocument()
  })

  test('should disable refresh button when loading', () => {
    render(<ModelSelector {...defaultProps} isLoading />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  test('should show model count when models are available', () => {
    render(<ModelSelector {...defaultProps} availableModels={['llama2', 'mistral']} />)

    expect(screen.getByText('2 models available')).toBeInTheDocument()
  })

  test('should show singular form when only one model is available', () => {
    render(<ModelSelector {...defaultProps} availableModels={['llama2']} />)

    expect(screen.getByText('1 model available')).toBeInTheDocument()
  })

  test('should show info message when no models are available', () => {
    render(<ModelSelector {...defaultProps} availableModels={[]} />)

    expect(screen.getByText(/Type a model name or click/i)).toBeInTheDocument()
  })

  test('should show loading status when isLoading is true', () => {
    render(<ModelSelector {...defaultProps} isLoading />)

    const loadingStatus = screen.getByText((_, element) => {
      return (
        element?.classList.contains('model-status') === true &&
        element.textContent === 'Loading models...'
      )
    })
    expect(loadingStatus).toBeInTheDocument()
  })

  test('should have i18n tooltip on refresh button', () => {
    render(<ModelSelector {...defaultProps} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Refresh models list')
    expect(button).toHaveAttribute('aria-label', 'Refresh models list')
  })
})
