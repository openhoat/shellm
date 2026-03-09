import { useCallback, useEffect, useState } from 'react'
import { ChatPanel } from './components/ChatPanel'
import { ConfigPanel } from './components/ConfigPanel'
import { Header } from './components/Header'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'
import { LogViewer } from './components/LogViewer'
import { Resizer } from './components/Resizer'
import { StatsPanel } from './components/StatsPanel'
import { Terminal } from './components/Terminal'
import { useUpdateCheck } from './hooks/useUpdateCheck'
import {
  useInitConfig,
  useShowConfigPanel,
  useShowLogViewer,
  useShowStatsPanel,
  useToggleLogViewer,
  useToggleStatsPanel,
} from './store/useStore'
import './App.css'

export const App = () => {
  const initConfig = useInitConfig()
  const showConfigPanel = useShowConfigPanel()
  const showStatsPanel = useShowStatsPanel()
  const toggleStatsPanel = useToggleStatsPanel()
  const showLogViewer = useShowLogViewer()
  const toggleLogViewer = useToggleLogViewer()
  const [splitPosition, setSplitPosition] = useState(600) // Initial split position in pixels
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Check for application updates at startup
  useUpdateCheck()

  const handleResize = useCallback((newPosition: number) => {
    const containerWidth = document.querySelector('.app-content')?.getBoundingClientRect().width
    if (containerWidth) {
      const clampedPosition = Math.max(300, Math.min(newPosition, containerWidth - 300))
      setSplitPosition(clampedPosition)
    }
  }, [])

  const toggleShortcutsModal = useCallback(() => {
    setShowShortcutsModal(prev => !prev)
  }, [])

  // Global Ctrl+/ and ? shortcut to open the keyboard shortcuts cheat sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        toggleShortcutsModal()
      }
      if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        // Only trigger when not typing in an input or textarea
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          toggleShortcutsModal()
        }
      }
      // Ctrl+Shift+L to toggle log viewer
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault()
        toggleLogViewer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleShortcutsModal, toggleLogViewer])

  useEffect(() => {
    void initConfig()
  }, [initConfig])

  return (
    <div className="app">
      <Header onShowShortcuts={toggleShortcutsModal} />
      <div className="app-content">
        <div
          className="terminal-wrapper"
          style={{
            width: `${splitPosition}px`,
            minWidth: '300px',
            flex: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Terminal />
        </div>
        <Resizer onResize={handleResize} direction="horizontal" minSize={300} />
        <ChatPanel style={{ flex: 1, minWidth: '300px' }} />
      </div>
      {showConfigPanel && <ConfigPanel />}
      {showStatsPanel && <StatsPanel onClose={toggleStatsPanel} />}
      {showLogViewer && <LogViewer onClose={toggleLogViewer} />}
      {showShortcutsModal && (
        <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  )
}
