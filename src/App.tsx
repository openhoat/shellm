import { useCallback, useEffect, useState } from 'react'
import { ChatPanel } from './components/ChatPanel'
import { ConfigPanel } from './components/ConfigPanel'
import { Header } from './components/Header'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'
import { Resizer } from './components/Resizer'
import { StatsPanel } from './components/StatsPanel'
import { Terminal } from './components/Terminal'
import {
  useInitConfig,
  useShowConfigPanel,
  useShowStatsPanel,
  useToggleStatsPanel,
} from './store/useStore'
import './App.css'

export const App = () => {
  const initConfig = useInitConfig()
  const showConfigPanel = useShowConfigPanel()
  const showStatsPanel = useShowStatsPanel()
  const toggleStatsPanel = useToggleStatsPanel()
  const [splitPosition, setSplitPosition] = useState(600) // Initial split position in pixels
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

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
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleShortcutsModal])

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
      {showShortcutsModal && (
        <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  )
}
