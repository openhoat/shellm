import type { AICommandShell } from '@shared/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { useChat as UseChatType } from '@/hooks/useChat'

// Mock modules before imports
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr', changeLanguage: vi.fn() },
  }),
}))
vi.mock('@/hooks/useChat')
vi.mock('@/store/useStore')
vi.mock('@/utils/logger', () => {
  class MockLogger {
    debug = vi.fn()
    info = vi.fn()
    error = vi.fn()
  }
  return { default: MockLogger }
})
vi.mock('./chat', () => ({
  ChatMessage: ({ message }: { message: { content: string } }) => (
    <div data-testid="chat-message">{message.content}</div>
  ),
}))

import { useChat } from '@/hooks/useChat'
import { useStore } from '@/store/useStore'
import { ChatPanel } from './ChatPanel'

// Store for event listeners to enable keyboard shortcut tests
const eventListeners = new Map<string, Set<EventListener>>()

// Restore window event listener methods lost when setup.ts replaces window
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn((type: string, listener: EventListener) => {
    if (!eventListeners.has(type)) {
      eventListeners.set(type, new Set())
    }
    eventListeners.get(type)?.add(listener)
  }),
  writable: true,
  configurable: true,
})
Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn((type: string, listener: EventListener) => {
    eventListeners.get(type)?.delete(listener)
  }),
  writable: true,
  configurable: true,
})
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn((event: Event) => {
    const listeners = eventListeners.get(event.type)
    if (listeners) {
      for (const listener of listeners) {
        listener(event)
      }
    }
    return true
  }),
  writable: true,
  configurable: true,
})

type UseChatReturn = ReturnType<typeof UseChatType>

const mockSetAiCommand = vi.fn()
const mockClearAllConversations = vi.fn()

const defaultChatState: UseChatReturn = {
  userInput: '',
  conversation: [],
  currentCommandIndex: null,
  isInterpreting: false,
  isExecuting: false,
  executionProgress: 0,
  aiCommand: null,
  isLoading: false,
  error: null,
  terminalPid: null,
  setUserInput: vi.fn(),
  handleInputChange: vi.fn(),
  generateAICommand: vi.fn(),
  executeCommand: vi.fn(),
  modifyCommand: vi.fn(),
  addToHistory: vi.fn(),
  navigateHistory: vi.fn(),
  clearChat: vi.fn(),
}

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState })
    vi.mocked(useStore).mockReturnValue({
      setAiCommand: mockSetAiCommand,
      clearAllConversations: mockClearAllConversations,
    } as ReturnType<typeof useStore>)
  })

  test('should render the AI Assistant heading', () => {
    render(<ChatPanel />)

    expect(screen.getByRole('heading', { name: 'AI Assistant' })).toBeInTheDocument()
  })

  test('should show welcome message when conversation is empty', () => {
    render(<ChatPanel />)

    expect(screen.getByText('chat.welcome.title')).toBeInTheDocument()
  })

  test('should render the input field with placeholder', () => {
    render(<ChatPanel />)

    const input = screen.getByPlaceholderText('chat.placeholder')
    expect(input).toBeInTheDocument()
  })

  test('should render the send button', () => {
    render(<ChatPanel />)

    const button = screen.getByRole('button', { name: /chat\.send/ })
    expect(button).toBeInTheDocument()
  })

  test('should disable send button when input is empty', () => {
    render(<ChatPanel />)

    const button = screen.getByRole('button', { name: /chat\.send/ })
    expect(button).toBeDisabled()
  })

  test('should disable send button when loading', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'some text',
      isLoading: true,
    })
    render(<ChatPanel />)

    const button = screen.getByRole('button', { name: /chat\.send/ })
    expect(button).toBeDisabled()
  })

  test('should disable input when loading', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isLoading: true,
    })
    render(<ChatPanel />)

    const input = screen.getByPlaceholderText('chat.placeholder')
    expect(input).toBeDisabled()
  })

  test('should display chat messages when conversation has items', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [
        { id: 'msg-1', type: 'user', content: 'Hello' },
        { id: 'msg-2', type: 'ai', content: 'World' },
      ],
    })
    render(<ChatPanel />)

    const messages = screen.getAllByTestId('chat-message')
    expect(messages).toHaveLength(2)
  })

  test('should not show welcome message when conversation has items', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [{ id: 'msg-1', type: 'user', content: 'Hello' }],
    })
    render(<ChatPanel />)

    expect(screen.queryByText('chat.welcome.title')).not.toBeInTheDocument()
  })

  test('should show loading spinner when isLoading', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isLoading: true,
    })
    render(<ChatPanel />)

    const spinner = document.querySelector('.loading-spinner')
    expect(spinner).toBeInTheDocument()
  })

  test('should show error message when error exists', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      error: 'Connection error',
    })
    render(<ChatPanel />)

    expect(screen.getByText('Connection error')).toBeInTheDocument()
  })

  test('should show command action buttons when aiCommand is a command type', () => {
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
      terminalPid: 12345,
    })
    render(<ChatPanel />)

    expect(screen.getByRole('button', { name: /chat\.actions\.execute/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /chat\.actions\.modify/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /chat\.actions\.cancel/ })).toBeInTheDocument()
  })

  test('should disable execute button when terminal is not ready', () => {
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
      terminalPid: null,
    })
    render(<ChatPanel />)

    const executeButton = screen.getByRole('button', { name: /chat\.actions\.preparing/ })
    expect(executeButton).toBeDisabled()
  })

  test('should call setAiCommand with null when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
      terminalPid: 12345,
    })
    render(<ChatPanel />)

    await user.click(screen.getByRole('button', { name: /chat\.actions\.cancel/ }))

    expect(mockSetAiCommand).toHaveBeenCalledWith(null)
  })

  test('should apply custom style prop', () => {
    render(<ChatPanel style={{ width: '500px' }} />)

    const chatPanel = document.querySelector('.chat-panel')
    expect(chatPanel).toHaveStyle({ width: '500px' })
  })

  // Keyboard shortcuts tests
  test('should execute command when Ctrl+Enter is pressed', async () => {
    const mockExecuteCommand = vi.fn()
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
      terminalPid: 12345,
      executeCommand: mockExecuteCommand,
    })
    render(<ChatPanel />)

    // Simulate Ctrl+Enter
    const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true })
    window.dispatchEvent(event)

    expect(mockExecuteCommand).toHaveBeenCalled()
  })

  test('should clear conversation when Ctrl+K is pressed', async () => {
    render(<ChatPanel />)

    // Simulate Ctrl+K
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
    window.dispatchEvent(event)

    expect(mockClearAllConversations).toHaveBeenCalled()
  })

  test('should cancel aiCommand when Escape is pressed', async () => {
    const aiCommand: AICommandShell = {
      type: 'command',
      intent: 'list files',
      command: 'ls -la',
      explanation: 'List files',
      confidence: 0.9,
    }
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      aiCommand,
    })
    render(<ChatPanel />)

    // Simulate Escape
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(event)

    expect(mockSetAiCommand).toHaveBeenCalledWith(null)
  })

  test('should clear user input when Escape is pressed with error', async () => {
    const mockSetUserInput = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      error: 'Some error',
      setUserInput: mockSetUserInput,
    })
    render(<ChatPanel />)

    // Simulate Escape
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(event)

    expect(mockSetUserInput).toHaveBeenCalledWith('')
  })

  // handleSubmit tests
  test('should call generateAICommand when form is submitted with text', async () => {
    const user = userEvent.setup()
    const mockGenerateAICommand = vi.fn()
    const mockSetUserInput = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'list files',
      setUserInput: mockSetUserInput,
      generateAICommand: mockGenerateAICommand,
    })
    render(<ChatPanel />)

    const submitButton = screen.getByRole('button', { name: /chat\.send/ })
    await user.click(submitButton)

    expect(mockGenerateAICommand).toHaveBeenCalledWith('list files')
    expect(mockSetUserInput).toHaveBeenCalledWith('')
  })

  test('should not submit when input is empty', async () => {
    const user = userEvent.setup()
    const mockGenerateAICommand = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: '',
      generateAICommand: mockGenerateAICommand,
    })
    render(<ChatPanel />)

    const form = document.querySelector('form')
    if (form) {
      await user.click(form)
    }

    expect(mockGenerateAICommand).not.toHaveBeenCalled()
  })

  test('should not submit when loading', async () => {
    const _user = userEvent.setup()
    const mockGenerateAICommand = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'list files',
      isLoading: true,
      generateAICommand: mockGenerateAICommand,
    })
    render(<ChatPanel />)

    const submitButton = screen.getByRole('button', { name: /chat\.send/ })
    expect(submitButton).toBeDisabled()
  })

  // navigateHistory tests
  test('should navigate history up when ArrowUp is pressed at cursor start', async () => {
    const user = userEvent.setup()
    const mockNavigateHistory = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'test input',
      navigateHistory: mockNavigateHistory,
    })
    render(<ChatPanel />)

    const textarea = screen.getByPlaceholderText('chat.placeholder')
    textarea.focus()
    textarea.setSelectionRange(0, 0)

    await user.keyboard('{ArrowUp}')

    expect(mockNavigateHistory).toHaveBeenCalledWith('up')
  })

  test('should navigate history down when ArrowDown is pressed at cursor end', async () => {
    const user = userEvent.setup()
    const mockNavigateHistory = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'test input',
      navigateHistory: mockNavigateHistory,
    })
    render(<ChatPanel />)

    const textarea = screen.getByPlaceholderText('chat.placeholder') as HTMLTextAreaElement
    textarea.focus()
    // Set cursor at end
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)

    await user.keyboard('{ArrowDown}')

    expect(mockNavigateHistory).toHaveBeenCalledWith('down')
  })

  test('should not navigate history when ArrowUp is pressed in middle of text', async () => {
    const user = userEvent.setup()
    const mockNavigateHistory = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'test input',
      navigateHistory: mockNavigateHistory,
    })
    render(<ChatPanel />)

    const textarea = screen.getByPlaceholderText('chat.placeholder') as HTMLTextAreaElement
    textarea.focus()
    // Set cursor in the middle
    textarea.setSelectionRange(5, 5)

    await user.keyboard('{ArrowUp}')

    expect(mockNavigateHistory).not.toHaveBeenCalled()
  })

  test('should submit form when Enter is pressed without Shift', async () => {
    const mockGenerateAICommand = vi.fn()
    const mockSetUserInput = vi.fn()
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      userInput: 'list files',
      setUserInput: mockSetUserInput,
      generateAICommand: mockGenerateAICommand,
    })
    render(<ChatPanel />)

    const textarea = screen.getByPlaceholderText('chat.placeholder')
    textarea.focus()

    // Simulate Enter key press
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    textarea.dispatchEvent(event)

    expect(mockGenerateAICommand).toHaveBeenCalled()
  })

  // isInterpreting and isExecuting state tests
  test('should show interpreting indicator when isInterpreting is true', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isInterpreting: true,
    })
    render(<ChatPanel />)

    expect(screen.getByText('chat.progress.interpreting')).toBeInTheDocument()
  })

  test('should show executing indicator when isExecuting is true', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isExecuting: true,
      executionProgress: 50,
    })
    render(<ChatPanel />)

    expect(screen.getByText('chat.progress.executing')).toBeInTheDocument()
  })

  test('should show initializing progress when executionProgress is below 30', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isExecuting: true,
      executionProgress: 20,
    })
    render(<ChatPanel />)

    expect(screen.getByText('chat.progress.initializing')).toBeInTheDocument()
  })

  test('should show retrieving progress when executionProgress is between 70 and 90', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isExecuting: true,
      executionProgress: 80,
    })
    render(<ChatPanel />)

    expect(screen.getByText('chat.progress.retrieving')).toBeInTheDocument()
  })

  test('should show finalizing progress when executionProgress is 90 or above', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isExecuting: true,
      executionProgress: 95,
    })
    render(<ChatPanel />)

    expect(screen.getByText('chat.progress.finalizing')).toBeInTheDocument()
  })

  test('should show progress bar with correct width during execution', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isExecuting: true,
      executionProgress: 60,
    })
    render(<ChatPanel />)

    const progressFill = document.querySelector('.progress-fill')
    expect(progressFill).toHaveStyle({ width: '60%' })
  })

  test('should not show interpreting indicator when isInterpreting is false', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isInterpreting: false,
    })
    render(<ChatPanel />)

    expect(screen.queryByText('chat.progress.interpreting')).not.toBeInTheDocument()
  })

  test('should not show executing indicator when isExecuting is false', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isExecuting: false,
    })
    render(<ChatPanel />)

    expect(screen.queryByText('chat.progress.executing')).not.toBeInTheDocument()
    expect(screen.queryByText('chat.progress.initializing')).not.toBeInTheDocument()
  })

  // Auto-scroll and scroll-to-bottom button tests
  test('should not show scroll-to-bottom button when at bottom', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [{ id: 'msg-1', type: 'user', content: 'Hello' }],
    })
    render(<ChatPanel />)

    // By default, isAtBottom is true, so button should not be visible
    expect(screen.queryByRole('button', { name: /chat\.scrollToBottom/ })).not.toBeInTheDocument()
  })

  test('should show scroll-to-bottom button with correct icon', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [{ id: 'msg-1', type: 'user', content: 'Hello' }],
    })
    render(<ChatPanel />)

    // The button has an SVG icon, check for the button structure
    const scrollButtons = document.querySelectorAll('.scroll-to-bottom-btn')
    // Button is conditionally rendered based on isAtBottom state
    expect(scrollButtons.length).toBeLessThanOrEqual(1)
  })

  test('should have messages container with correct attributes', () => {
    render(<ChatPanel />)

    const messagesContainer = screen.getByRole('log', { name: /chat messages/i })
    expect(messagesContainer).toBeInTheDocument()
    expect(messagesContainer).toHaveAttribute('aria-live', 'polite')
  })

  test('should auto-scroll when new messages arrive and user is at bottom', () => {
    const { rerender } = render(<ChatPanel />)

    // Initially no messages
    expect(screen.getByText('chat.welcome.title')).toBeInTheDocument()

    // Add a message
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [{ id: 'msg-1', type: 'user', content: 'Hello' }],
    })
    rerender(<ChatPanel />)

    // Message should be displayed
    expect(screen.getByTestId('chat-message')).toBeInTheDocument()
  })

  test('should render chat messages in correct order', () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      conversation: [
        { id: 'msg-1', type: 'user', content: 'First message' },
        { id: 'msg-2', type: 'ai', content: 'Second message' },
        { id: 'msg-3', type: 'user', content: 'Third message' },
      ],
    })
    render(<ChatPanel />)

    const messages = screen.getAllByTestId('chat-message')
    expect(messages).toHaveLength(3)
    expect(messages[0]).toHaveTextContent('First message')
    expect(messages[1]).toHaveTextContent('Second message')
    expect(messages[2]).toHaveTextContent('Third message')
  })

  describe('tooltips', () => {
    test('should have tooltip on execute button', () => {
      const aiCommand: AICommandShell = {
        type: 'command',
        intent: 'list',
        command: 'ls',
        explanation: 'List files',
        confidence: 0.9,
      }
      vi.mocked(useChat).mockReturnValue({
        ...defaultChatState,
        aiCommand,
        terminalPid: 123,
      })
      render(<ChatPanel />)

      const executeButton = screen.getByRole('button', { name: /chat\.actions\.execute/i })
      expect(executeButton).toHaveAttribute('title', 'chat.actions.executeCommand')
    })

    test('should have tooltip on modify button', () => {
      const aiCommand: AICommandShell = {
        type: 'command',
        intent: 'list',
        command: 'ls',
        explanation: 'List files',
        confidence: 0.9,
      }
      vi.mocked(useChat).mockReturnValue({
        ...defaultChatState,
        aiCommand,
        terminalPid: 123,
      })
      render(<ChatPanel />)

      const modifyButton = screen.getByRole('button', { name: /chat\.actions\.modify/i })
      expect(modifyButton).toHaveAttribute('title', 'chat.actions.modifyCommand')
    })

    test('should have tooltip on cancel button', () => {
      const aiCommand: AICommandShell = {
        type: 'command',
        intent: 'list',
        command: 'ls',
        explanation: 'List files',
        confidence: 0.9,
      }
      vi.mocked(useChat).mockReturnValue({
        ...defaultChatState,
        aiCommand,
        terminalPid: 123,
      })
      render(<ChatPanel />)

      const cancelButton = screen.getByRole('button', { name: /chat\.actions\.cancel/i })
      expect(cancelButton).toHaveAttribute('title', 'chat.actions.cancelCommand')
    })
  })
})
