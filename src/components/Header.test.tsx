import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Header } from './Header'

// Mock window.electronAPI
const mockConversationExport = vi.fn()
const mockConversationExportAll = vi.fn()
const mockLoadConversation = vi.fn()
const mockDeleteConversation = vi.fn()
const mockToggleConfigPanel = vi.fn()

Object.defineProperty(window, 'electronAPI', {
  value: {
    conversationExport: mockConversationExport,
    conversationExportAll: mockConversationExportAll,
  },
  writable: true,
})

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

// Mock useStore
vi.mock('../store/useStore', () => ({
  useStore: vi.fn(() => ({
    config: {
      ollama: { url: 'http://localhost:11434', apiKey: '', model: 'llama2' },
      theme: 'dark',
      fontSize: 14,
      shell: 'auto',
    },
    toggleConfigPanel: mockToggleConfigPanel,
    conversations: [
      { id: '1', title: 'First conversation' },
      { id: '2', title: 'Second conversation' },
    ],
    currentConversationId: '1',
    loadConversation: mockLoadConversation,
    deleteConversation: mockDeleteConversation,
  })),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render app title and version', () => {
    render(<Header />)

    expect(screen.getByText('SheLLM')).toBeInTheDocument()
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  test('should render status indicator with provider and model', () => {
    render(<Header />)

    expect(screen.getByText('Ollama: Local llama2')).toBeInTheDocument()
  })

  test('should render buttons', () => {
    render(<Header />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
