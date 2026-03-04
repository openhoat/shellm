import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { LanguageSelector } from './LanguageSelector'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}))

describe('LanguageSelector', () => {
  test('should render language selector', () => {
    render(<LanguageSelector />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  test('should render all available languages', () => {
    render(<LanguageSelector />)

    // English
    expect(screen.getByText('English')).toBeInTheDocument()
    // French
    expect(screen.getByText('Français')).toBeInTheDocument()
    // Spanish
    expect(screen.getByText('Español')).toBeInTheDocument()
    // German
    expect(screen.getByText('Deutsch')).toBeInTheDocument()
    // Portuguese
    expect(screen.getByText('Português')).toBeInTheDocument()
    // Chinese
    expect(screen.getByText('中文')).toBeInTheDocument()
    // Japanese
    expect(screen.getByText('日本語')).toBeInTheDocument()
  })

  test('should have correct number of language options', () => {
    render(<LanguageSelector />)

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(7)
  })

  test('should have correct option values', () => {
    render(<LanguageSelector />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('en')

    // Check all option values
    expect(screen.getByRole('option', { name: 'English' })).toHaveValue('en')
    expect(screen.getByRole('option', { name: 'Français' })).toHaveValue('fr')
    expect(screen.getByRole('option', { name: 'Español' })).toHaveValue('es')
    expect(screen.getByRole('option', { name: 'Deutsch' })).toHaveValue('de')
    expect(screen.getByRole('option', { name: 'Português' })).toHaveValue('pt')
    expect(screen.getByRole('option', { name: '中文' })).toHaveValue('zh')
    expect(screen.getByRole('option', { name: '日本語' })).toHaveValue('ja')
  })
})
