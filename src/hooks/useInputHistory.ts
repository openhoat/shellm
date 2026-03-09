import { useCallback, useEffect, useState } from 'react'
import { Logger } from '@/utils/logger'

const logger = new Logger('useInputHistory')
const INPUT_HISTORY_KEY = 'termaid-chat-input-history'
const MAX_HISTORY_SIZE = 50

export interface UseInputHistoryResult {
  // State
  inputHistory: string[]
  historyIndex: number
  savedInput: string

  // Actions
  addToHistory: (input: string) => void
  navigateHistory: (direction: 'up' | 'down', currentInput: string) => string
  resetNavigation: () => void
}

/**
 * Custom hook for managing input history with keyboard navigation
 * Handles localStorage persistence and arrow key navigation (↑/↓)
 */
export function useInputHistory(): UseInputHistoryResult {
  const [inputHistory, setInputHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(INPUT_HISTORY_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      logger.warn('Failed to load input history from localStorage:', error)
      return []
    }
  })

  const [historyIndex, setHistoryIndex] = useState(-1) // -1 means not navigating history
  const [savedInput, setSavedInput] = useState('') // Save current input when navigating history

  // Persist to localStorage when history changes
  useEffect(() => {
    try {
      localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(inputHistory))
    } catch (error) {
      logger.warn('Failed to save input history to localStorage:', error)
    }
  }, [inputHistory])

  /**
   * Add a new entry to the history
   * Removes duplicates and limits size to MAX_HISTORY_SIZE
   */
  const addToHistory = useCallback((input: string) => {
    if (!input.trim()) return

    setInputHistory(prev => {
      // Remove duplicate if exists, and add to the beginning
      const newHistory = [input, ...prev.filter(item => item !== input)]
      return newHistory.slice(0, MAX_HISTORY_SIZE)
    })
  }, [])

  /**
   * Navigate through history with arrow keys
   * @param direction - 'up' for previous commands, 'down' for next commands
   * @param currentInput - The current input value to save if starting navigation
   * @returns The history entry to display
   */
  const navigateHistory = useCallback(
    (direction: 'up' | 'down', currentInput: string): string => {
      if (inputHistory.length === 0) return currentInput

      if (direction === 'up') {
        const newIndex = historyIndex + 1
        if (newIndex < inputHistory.length) {
          // Save current input when starting to navigate
          if (historyIndex === -1) {
            setSavedInput(currentInput)
          }
          setHistoryIndex(newIndex)
          return inputHistory[newIndex]
        }
      } else {
        // direction === 'down'
        const newIndex = historyIndex - 1
        if (newIndex >= 0) {
          setHistoryIndex(newIndex)
          return inputHistory[newIndex]
        }
        if (newIndex === -1) {
          // Return to saved input
          setHistoryIndex(-1)
          return savedInput
        }
      }

      return currentInput
    },
    [inputHistory, historyIndex, savedInput]
  )

  /**
   * Reset navigation state (e.g., after submitting a command)
   */
  const resetNavigation = useCallback(() => {
    setHistoryIndex(-1)
    setSavedInput('')
  }, [])

  return {
    inputHistory,
    historyIndex,
    savedInput,
    addToHistory,
    navigateHistory,
    resetNavigation,
  }
}
