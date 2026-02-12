import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { ChatPanel } from './components/ChatPanel'
import { Header } from './components/Header'
import { Resizer } from './components/Resizer'
import { Terminal } from './components/Terminal'
import { useStore } from './store/useStore'
import './App.css'

const ConfigPanel = lazy(() => import('./components/ConfigPanel'))

const App = () => {
  const { initConfig, showConfigPanel } = useStore()
  const [splitPosition, setSplitPosition] = useState(600) // Initial split position in pixels

  const handleResize = useCallback((newPosition: number) => {
    const containerWidth = document.querySelector('.app-content')?.getBoundingClientRect().width
    if (containerWidth) {
      const clampedPosition = Math.max(300, Math.min(newPosition, containerWidth - 300))
      setSplitPosition(clampedPosition)
    }
  }, [])

  useEffect(() => {
    // Initialize config on app load
    void initConfig()

    // Terminal is created and managed by Terminal component
    // Listen for terminal exit
    window.electronAPI.onTerminalExit(_data => {
      // Terminal PID is cleared in Terminal component
    })
  }, [initConfig])

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <div
          className="terminal-wrapper"
          style={{ width: `${splitPosition}px`, minWidth: '300px', flex: 'none' }}
        >
          <Terminal />
        </div>
        <Resizer onResize={handleResize} direction="horizontal" minSize={300} />
        <ChatPanel style={{ flex: 1, minWidth: '300px' }} />
      </div>
      {showConfigPanel && (
        <Suspense fallback={<div>Loading...</div>}>
          <ConfigPanel />
        </Suspense>
      )}
    </div>
  )
}

export default App
