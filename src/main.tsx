import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/Toast'
import { ToastProvider, useToast } from './hooks/useToast'
import './i18n'

/**
 * Inner component that renders the app with the toast container
 */
const AppWithToasts = () => {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <App />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AppWithToasts />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
