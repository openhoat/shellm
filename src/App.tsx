import { useEffect } from 'react'
import { ChatPanel } from './components/ChatPanel'
import { ConfigPanel } from './components/ConfigPanel'
import { Header } from './components/Header'
import { Terminal } from './components/Terminal'
import { useStore } from './store/useStore'
import './App.css'

function App() {
  const { initConfig, showConfigPanel } = useStore()

  useEffect(() => {
    // Initialize config on app load
    initConfig()

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
        <Terminal />
        <ChatPanel />
      </div>
      {showConfigPanel && <ConfigPanel />}
    </div>
  )
}

export default App
