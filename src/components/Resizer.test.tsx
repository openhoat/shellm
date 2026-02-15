import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Resizer } from './Resizer'

describe('Resizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  test('should render with custom minSize prop', () => {
    const onResize = vi.fn()
    render(<Resizer onResize={onResize} minSize={200} />)

    const resizer = screen.getByTitle('Drag to resize')
    expect(resizer).toBeInTheDocument()
  })
})
