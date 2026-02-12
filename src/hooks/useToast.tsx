import { createContext, type ReactNode, useContext, useState } from 'react'
import type { Toast, ToastType as ToastTypeEnum } from '@/types/toast'

/**
 * Interface for the Toast context
 */
interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastTypeEnum, message: string, duration?: number) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

/**
 * Toast context for managing notifications across the application
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * Props for the ToastProvider component
 */
interface ToastProviderProps {
  children: ReactNode
}

/**
 * Generates a unique ID for each toast
 */
function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * ToastProvider component that wraps the application
 * Manages the state of all toast notifications
 */
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: ToastTypeEnum, message: string, duration?: number) => {
    const newToast: Toast = {
      id: generateToastId(),
      type,
      message,
      duration,
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearToasts,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

/**
 * Custom hook to access the toast context
 * Throws an error if used outside of ToastProvider
 */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
