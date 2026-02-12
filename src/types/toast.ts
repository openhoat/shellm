/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast notification interface
 */
export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}
