import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { ToastProvider, useToast } from './useToast'

// Test component that uses the toast hook
const TestComponent = () => {
  const { toasts, addToast, removeToast, clearToasts } = useToast()

  return (
    <div>
      <span data-testid="toast-count">{toasts.length}</span>
      <ul>
        {toasts.map(toast => (
          <li key={toast.id} data-testid={`toast-${toast.id}`}>
            {toast.type}: {toast.message}
            <button onClick={() => removeToast(toast.id)} type="button">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => addToast('success', 'Success message')}
        data-testid="add-success"
        type="button"
      >
        Add Success
      </button>
      <button
        onClick={() => addToast('error', 'Error message')}
        data-testid="add-error"
        type="button"
      >
        Add Error
      </button>
      <button
        onClick={() => addToast('warning', 'Warning message', 5000)}
        data-testid="add-warning"
        type="button"
      >
        Add Warning
      </button>
      <button onClick={() => addToast('info', 'Info message')} data-testid="add-info" type="button">
        Add Info
      </button>
      <button onClick={clearToasts} data-testid="clear-all" type="button">
        Clear All
      </button>
    </div>
  )
}

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ToastProvider', () => {
    test('should render children', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    test('should provide empty toasts array initially', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      expect(screen.getByTestId('toast-count').textContent).toBe('0')
    })
  })

  describe('addToast', () => {
    test('should add a success toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-success').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('1')
      expect(screen.getByText('success: Success message')).toBeInTheDocument()
    })

    test('should add an error toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-error').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('1')
      expect(screen.getByText('error: Error message')).toBeInTheDocument()
    })

    test('should add a warning toast with custom duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-warning').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('1')
      expect(screen.getByText('warning: Warning message')).toBeInTheDocument()
    })

    test('should add an info toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-info').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('1')
      expect(screen.getByText('info: Info message')).toBeInTheDocument()
    })

    test('should add multiple toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-success').click()
        screen.getByTestId('add-error').click()
        screen.getByTestId('add-info').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('3')
    })
  })

  describe('removeToast', () => {
    test('should remove a specific toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-success').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('1')

      await act(async () => {
        screen.getByText('Remove').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('0')
    })

    test('should only remove the specified toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-success').click()
        screen.getByTestId('add-error').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('2')

      // Remove the first toast
      const removeButtons = screen.getAllByText('Remove')
      await act(async () => {
        removeButtons[0].click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('1')
    })
  })

  describe('clearToasts', () => {
    test('should clear all toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await act(async () => {
        screen.getByTestId('add-success').click()
        screen.getByTestId('add-error').click()
        screen.getByTestId('add-warning').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('3')

      await act(async () => {
        screen.getByTestId('clear-all').click()
      })

      expect(screen.getByTestId('toast-count').textContent).toBe('0')
    })
  })

  describe('useToast hook', () => {
    test('should throw error when used outside ToastProvider', () => {
      // Prevent console.error from showing in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Suppress console.error output during test
      })

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useToast must be used within a ToastProvider')

      consoleSpy.mockRestore()
    })
  })
})
