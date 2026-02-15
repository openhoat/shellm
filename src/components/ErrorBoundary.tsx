import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Global React Error Boundary that catches unhandled render errors
 * and displays a fallback UI instead of crashing the entire application.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // biome-ignore lint/suspicious/noConsole: Error boundary must log unhandled errors for debugging
    console.error('[ErrorBoundary] Caught unhandled error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            background: '#1a1a2e',
            color: '#e0e0e0',
            fontFamily: 'monospace',
          }}
        >
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ marginBottom: '1rem', color: '#aaa' }}>
            An unexpected error occurred in the application.
          </p>
          {this.state.error && (
            <pre
              style={{
                background: '#2a2a3e',
                padding: '1rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                color: '#ff9999',
                maxWidth: '60ch',
                overflowX: 'auto',
                marginBottom: '1.5rem',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#4a9eff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Reload application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
