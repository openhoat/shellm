import { renderHook } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import {
  useConfig,
  useTerminalPid,
  useIsLoading,
  useError,
  useConversations,
  useAiCommand,
  useStore,
} from './useStore'

describe('useStore performance - selector isolation', () => {
  test('useConfig should not re-render when terminalPid changes', () => {
    let configRenders = 0

    const { rerender } = renderHook(() => {
      useConfig()
      configRenders++
    })

    const initialRenders = configRenders

    // Change terminalPid (unrelated state)
    useStore.getState().setTerminalPid(12345)
    rerender()

    // useConfig should NOT have re-rendered
    expect(configRenders).toBe(initialRenders)
  })

  test('useTerminalPid should not re-render when config changes', () => {
    let pidRenders = 0

    const { rerender } = renderHook(() => {
      useTerminalPid()
      pidRenders++
    })

    const initialRenders = pidRenders

    // Change config (unrelated state)
    const newConfig = { ...useStore.getState().config, theme: 'light' as const }
    useStore.getState().setConfig(newConfig)
    rerender()

    // useTerminalPid should NOT have re-rendered
    expect(pidRenders).toBe(initialRenders)
  })

  test('useIsLoading should not re-render when error changes', () => {
    let loadingRenders = 0

    const { rerender } = renderHook(() => {
      useIsLoading()
      loadingRenders++
    })

    const initialRenders = loadingRenders

    // Change error (unrelated state)
    useStore.getState().setError('Some error')
    rerender()

    // useIsLoading should NOT have re-rendered
    expect(loadingRenders).toBe(initialRenders)
  })

  test('useError should not re-render when isLoading changes', () => {
    let errorRenders = 0

    const { rerender } = renderHook(() => {
      useError()
      errorRenders++
    })

    const initialRenders = errorRenders

    // Change isLoading (unrelated state)
    useStore.getState().setIsLoading(true)
    rerender()

    // useError should NOT have re-rendered
    expect(errorRenders).toBe(initialRenders)
  })

  test('useConversations should not re-render when terminalPid changes', () => {
    let conversationsRenders = 0

    const { rerender } = renderHook(() => {
      useConversations()
      conversationsRenders++
    })

    const initialRenders = conversationsRenders

    // Change terminalPid (unrelated state)
    useStore.getState().setTerminalPid(99999)
    rerender()

    // useConversations should NOT have re-rendered
    expect(conversationsRenders).toBe(initialRenders)
  })

  test('useAiCommand should not re-render when config changes', () => {
    let commandRenders = 0

    const { rerender } = renderHook(() => {
      useAiCommand()
      commandRenders++
    })

    const initialRenders = commandRenders

    // Change config (unrelated state)
    const newConfig = { ...useStore.getState().config, fontSize: 16 }
    useStore.getState().setConfig(newConfig)
    rerender()

    // useAiCommand should NOT have re-rendered
    expect(commandRenders).toBe(initialRenders)
  })
})

describe('useStore performance - destructured useStore() re-renders', () => {
  test('useStore() destructured should re-render on ANY state change', () => {
    let storeRenders = 0

    const { rerender } = renderHook(() => {
      useStore() // Destructured - subscribes to ALL state
      storeRenders++
    })

    const initialRenders = storeRenders

    // Change ANY state
    useStore.getState().setTerminalPid(54321)
    rerender()

    // useStore() WILL re-render (this is the problem we're fixing)
    expect(storeRenders).toBeGreaterThan(initialRenders)
  })

  test('multiple state changes with useStore() cause multiple re-renders', () => {
    let storeRenders = 0

    const { rerender } = renderHook(() => {
      useStore() // Subscribes to everything
      storeRenders++
    })

    const initialRenders = storeRenders

    // Change multiple unrelated states
    useStore.getState().setTerminalPid(111)
    rerender()
    useStore.getState().setIsLoading(true)
    rerender()
    useStore.getState().setError('Error')
    rerender()

    // Each change triggers a re-render with useStore()
    expect(storeRenders).toBe(initialRenders + 3)
  })
})

describe('useStore performance - selector granularity', () => {
  test('selector only re-renders when its specific state changes', () => {
    let terminalPidRenders = 0

    const { rerender } = renderHook(() => {
      useTerminalPid()
      terminalPidRenders++
    })

    const initialRenders = terminalPidRenders

    // Change terminalPid - SHOULD trigger re-render
    useStore.getState().setTerminalPid(777)
    rerender()

    expect(terminalPidRenders).toBe(initialRenders + 1)

    // Change unrelated states - should NOT trigger re-render
    useStore.getState().setIsLoading(true)
    rerender()
    useStore.getState().setError('Error')
    rerender()

    expect(terminalPidRenders).toBe(initialRenders + 1) // Still only 1 re-render
  })
})
