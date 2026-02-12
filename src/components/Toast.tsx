import { type CSSProperties, useEffect, useState } from 'react'
import type { Toast as ToastType, ToastType as ToastTypeEnum } from '@/types/toast'
import './Toast.css'

/**
 * Props for the Toast component
 */
interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

/**
 * Toast colors mapping
 */
const TOAST_COLORS: Record<ToastTypeEnum, { icon: string; className: string }> = {
  success: { icon: '✓', className: 'toast-success' },
  error: { icon: '✕', className: 'toast-error' },
  warning: { icon: '⚠', className: 'toast-warning' },
  info: { icon: 'ℹ', className: 'toast-info' },
}

/**
 * Single Toast component that displays a notification
 * Supports auto-dismissal and smooth enter/exit animations
 */
export const Toast = ({ toast, onDismiss }: ToastProps) => {
  const [isLeaving, setIsLeaving] = useState(false)
  const { icon, className } = TOAST_COLORS[toast.type]
  const duration = toast.duration ?? 3000

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true)
      // Wait for exit animation to complete before dismissing
      setTimeout(() => onDismiss(toast.id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, duration, onDismiss])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  return (
    <div
      className={`toast ${className} ${isLeaving ? 'toast-leaving' : ''}`}
      style={{ '--duration': `${duration}ms` } as CSSProperties}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}

/**
 * Props for the ToastContainer component
 */
interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

/**
 * ToastContainer component that stacks multiple toasts vertically
 */
export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
