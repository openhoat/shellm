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
  /** Optional link to display in the toast */
  link?: {
    url: string
    label: string
  }
}
