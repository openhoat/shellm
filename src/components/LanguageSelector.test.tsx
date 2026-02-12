import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import LanguageSelector from './LanguageSelector'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'fr',
      changeLanguage: vi.fn(),
    },
  }),
}))

describe('LanguageSelector', () => {
  test('should render language selector', () => {
    render(<LanguageSelector />)

    expect(screen.getByText('Français')).toBeInTheDocument()
  })

  test('should render English option', () => {
    render(<LanguageSelector />)

    expect(screen.getByText('English')).toBeInTheDocument()
  })

  test('should have French option', () => {
    render(<LanguageSelector />)

    expect(screen.getByText('Français')).toBeInTheDocument()
  })
})
