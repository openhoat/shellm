import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Resizer } from './Resizer'

describe('Resizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render with default horizontal direction', () => {
      const onResize = vi.fn()
      render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')
      expect(resizer).toBeInTheDocument()
      expect(resizer).toHaveClass('resizer')
      expect(resizer).toHaveClass('resizer-horizontal')
    })

    test('should render with vertical direction', () => {
      const onResize = vi.fn()
      render(<Resizer onResize={onResize} direction="vertical" />)

      const resizer = screen.getByTitle('Drag to resize')
      expect(resizer).toHaveClass('resizer-vertical')
      expect(resizer).not.toHaveClass('resizer-horizontal')
    })

    test('should not have active class when not dragging', () => {
      const onResize = vi.fn()
      render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')
      expect(resizer).not.toHaveClass('resizer-active')
    })

    test('should render with custom minSize prop', () => {
      const onResize = vi.fn()
      render(<Resizer onResize={onResize} minSize={200} />)

      const resizer = screen.getByTitle('Drag to resize')
      expect(resizer).toBeInTheDocument()
    })
  })

  describe('drag interactions', () => {
    test('should add active class on mouse down', async () => {
      const user = userEvent.setup()
      const onResize = vi.fn()
      render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')
      await user.pointer({ target: resizer, keys: '[MouseLeft>]' })

      expect(resizer).toHaveClass('resizer-active')
    })

    test('should remove active class on mouse up', async () => {
      const user = userEvent.setup()
      const onResize = vi.fn()
      render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')
      await user.pointer({ target: resizer, keys: '[MouseLeft>]' })
      await user.pointer({ keys: '[/MouseLeft]' })

      expect(resizer).not.toHaveClass('resizer-active')
    })

    test('should prevent default and stop propagation on mouse down', async () => {
      const onResize = vi.fn()
      render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')

      fireEvent(resizer, event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe('horizontal resize', () => {
    test('should call onResize with correct position during horizontal drag', async () => {
      const onResize = vi.fn()
      const containerRect = { left: 0, top: 0, width: 1000, height: 600 }

      render(
        <div data-testid="container">
          <Resizer onResize={onResize} direction="horizontal" minSize={100} />
        </div>
      )

      const resizer = screen.getByTitle('Drag to resize')

      // Mock the parent element's getBoundingClientRect
      const mockParent = {
        getBoundingClientRect: () => containerRect,
      }
      Object.defineProperty(resizer, 'parentElement', {
        value: mockParent,
        writable: true,
      })

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 100, clientY: 50 })

      // Move mouse
      fireEvent.mouseMove(document, { clientX: 400, clientY: 50 })

      expect(onResize).toHaveBeenCalledWith(400)

      // End drag
      fireEvent.mouseUp(document)
    })

    test('should clamp position to minSize during horizontal drag', async () => {
      const onResize = vi.fn()
      const containerRect = { left: 100, top: 0, width: 1000, height: 600 }

      render(
        <div data-testid="container">
          <Resizer onResize={onResize} direction="horizontal" minSize={200} />
        </div>
      )

      const resizer = screen.getByTitle('Drag to resize')

      const mockParent = {
        getBoundingClientRect: () => containerRect,
      }
      Object.defineProperty(resizer, 'parentElement', {
        value: mockParent,
        writable: true,
      })

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 200, clientY: 50 })

      // Move mouse to a position that would be less than minSize
      fireEvent.mouseMove(document, { clientX: 150, clientY: 50 })

      // Should be clamped to minSize (200)
      expect(onResize).toHaveBeenCalledWith(200)

      fireEvent.mouseUp(document)
    })

    test('should clamp position to max bounds during horizontal drag', async () => {
      const onResize = vi.fn()
      const containerRect = { left: 0, top: 0, width: 1000, height: 600 }

      render(
        <div data-testid="container">
          <Resizer onResize={onResize} direction="horizontal" minSize={200} />
        </div>
      )

      const resizer = screen.getByTitle('Drag to resize')

      const mockParent = {
        getBoundingClientRect: () => containerRect,
      }
      Object.defineProperty(resizer, 'parentElement', {
        value: mockParent,
        writable: true,
      })

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 500, clientY: 50 })

      // Move mouse to a position that would exceed max bounds
      // Max = width - minSize = 1000 - 200 = 800
      fireEvent.mouseMove(document, { clientX: 900, clientY: 50 })

      // Should be clamped to max (800)
      expect(onResize).toHaveBeenCalledWith(800)

      fireEvent.mouseUp(document)
    })
  })

  describe('vertical resize', () => {
    test('should call onResize with correct position during vertical drag', async () => {
      const onResize = vi.fn()
      const containerRect = { left: 0, top: 50, width: 1000, height: 600 }

      render(
        <div data-testid="container">
          <Resizer onResize={onResize} direction="vertical" minSize={100} />
        </div>
      )

      const resizer = screen.getByTitle('Drag to resize')

      const mockParent = {
        getBoundingClientRect: () => containerRect,
      }
      Object.defineProperty(resizer, 'parentElement', {
        value: mockParent,
        writable: true,
      })

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 100, clientY: 100 })

      // Move mouse (vertical uses clientY)
      fireEvent.mouseMove(document, { clientX: 100, clientY: 250 })

      // Position = clientY - containerRect.top = 250 - 50 = 200
      expect(onResize).toHaveBeenCalledWith(200)

      fireEvent.mouseUp(document)
    })

    test('should clamp position to minSize during vertical drag', async () => {
      const onResize = vi.fn()
      const containerRect = { left: 0, top: 100, width: 1000, height: 600 }

      render(
        <div data-testid="container">
          <Resizer onResize={onResize} direction="vertical" minSize={150} />
        </div>
      )

      const resizer = screen.getByTitle('Drag to resize')

      const mockParent = {
        getBoundingClientRect: () => containerRect,
      }
      Object.defineProperty(resizer, 'parentElement', {
        value: mockParent,
        writable: true,
      })

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 100, clientY: 150 })

      // Move mouse to a position less than minSize
      fireEvent.mouseMove(document, { clientX: 100, clientY: 120 })

      // Should be clamped to minSize (150)
      expect(onResize).toHaveBeenCalledWith(150)

      fireEvent.mouseUp(document)
    })
  })

  describe('edge cases', () => {
    test('should not call onResize when not dragging', async () => {
      const onResize = vi.fn()

      render(<Resizer onResize={onResize} />)

      // Move mouse without starting drag
      fireEvent.mouseMove(document, { clientX: 400, clientY: 50 })

      expect(onResize).not.toHaveBeenCalled()
    })

    test('should not call onResize when parent element is null', async () => {
      const onResize = vi.fn()

      render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')

      // Mock parentElement to be null
      Object.defineProperty(resizer, 'parentElement', {
        value: null,
        writable: true,
      })

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 100, clientY: 50 })

      // Move mouse
      fireEvent.mouseMove(document, { clientX: 400, clientY: 50 })

      // Should not call onResize because parent is null
      expect(onResize).not.toHaveBeenCalled()

      fireEvent.mouseUp(document)
    })

    test('should not call onResize when container rect is null', async () => {
      const onResize = vi.fn()

      render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')

      // Mock parentElement with getBoundingClientRect returning null
      const mockParent = {
        getBoundingClientRect: () => null,
      }
      Object.defineProperty(resizer, 'parentElement', {
        value: mockParent,
        writable: true,
      })

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 100, clientY: 50 })

      // Move mouse
      fireEvent.mouseMove(document, { clientX: 400, clientY: 50 })

      // Should not call onResize because rect is null
      expect(onResize).not.toHaveBeenCalled()

      fireEvent.mouseUp(document)
    })

    test('should cleanup event listeners on unmount', async () => {
      const onResize = vi.fn()
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = render(<Resizer onResize={onResize} />)

      const resizer = screen.getByTitle('Drag to resize')

      // Start drag
      fireEvent.mouseDown(resizer, { clientX: 100, clientY: 50 })

      // Unmount while dragging
      unmount()

      // Event listeners should be removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })
})
