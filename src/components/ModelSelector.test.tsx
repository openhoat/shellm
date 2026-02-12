import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ModelSelector } from './ModelSelector'

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

    expect(screen.getByText('2 modèles disponibles')).toBeInTheDocument()
  })

  test('should show singular form when only one model is available', () => {
    render(<ModelSelector {...defaultProps} availableModels={['llama2']} />)

    expect(screen.getByText('1 modèle disponible')).toBeInTheDocument()
  })

  test('should show info message when no models are available', () => {
    render(<ModelSelector {...defaultProps} availableModels={[]} />)

    expect(screen.getByText(/Tapez un nom de modèle ou cliquez/i)).toBeInTheDocument()
  })

  test('should show loading status when isLoading is true', () => {
    render(<ModelSelector {...defaultProps} isLoading />)

    expect(screen.getByText(/Chargement des modèles/i)).toBeInTheDocument()
  })
})
