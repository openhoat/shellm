import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { KEYBOARD_SHORTCUTS } from '@/constants/shortcuts'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}))

import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'

describe('KeyboardShortcutsModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render the modal with title', () => {
    render(<KeyboardShortcutsModal onClose={mockOnClose} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('shortcuts.title')).toBeInTheDocument()
  })

  test('should render all shortcut groups', () => {
    render(<KeyboardShortcutsModal onClose={mockOnClose} />)

    for (const group of KEYBOARD_SHORTCUTS) {
      expect(screen.getByText(group.groupKey)).toBeInTheDocument()
    }
  })

  test('should render all shortcut action labels', () => {
    render(<KeyboardShortcutsModal onClose={mockOnClose} />)

    for (const group of KEYBOARD_SHORTCUTS) {
      for (const shortcut of group.shortcuts) {
        expect(screen.getByText(shortcut.labelKey)).toBeInTheDocument()
      }
    }
  })

  test('should call onClose when header close button is clicked', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsModal onClose={mockOnClose} />)

    const closeButtons = screen.getAllByRole('button', { name: 'config.common.close' })
    await user.click(closeButtons[0])

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  test('should call onClose when footer close button is clicked', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsModal onClose={mockOnClose} />)

    const closeButtons = screen.getAllByRole('button', { name: 'config.common.close' })
    await user.click(closeButtons[closeButtons.length - 1])

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  test('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    render(<KeyboardShortcutsModal onClose={mockOnClose} />)

    await user.keyboard('{Escape}')

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  test('should have proper accessibility attributes', () => {
    render(<KeyboardShortcutsModal onClose={mockOnClose} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-modal-title')
  })
})
