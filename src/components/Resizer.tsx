import { useCallback, useEffect, useRef, useState } from 'react'
import './Resizer.css'

interface ResizerProps {
  onResize: (position: number) => void
  direction?: 'horizontal' | 'vertical'
  minSize?: number
}

export const Resizer = ({ onResize, direction = 'horizontal', minSize = 300 }: ResizerProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [positionPercent, setPositionPercent] = useState(50)
  const resizerRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const pendingPositionRef = useRef<number | null>(null)

  // Throttled resize handler using requestAnimationFrame
  const throttledResize = useCallback(
    (position: number) => {
      pendingPositionRef.current = position

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingPositionRef.current !== null) {
            onResize(pendingPositionRef.current)
            pendingPositionRef.current = null
          }
          rafIdRef.current = null
        })
      }
    },
    [onResize]
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !resizerRef.current) return

      e.preventDefault()

      const containerRect = resizerRef.current.parentElement?.getBoundingClientRect()
      if (!containerRect) return

      let newPosition: number

      if (direction === 'horizontal') {
        // Calculate new position from the left edge of the container
        newPosition = e.clientX - containerRect.left
      } else {
        // Calculate new position from the top edge of the container
        newPosition = e.clientY - containerRect.top
      }

      // Clamp position within min and max bounds
      const maxBound = containerRect.width - minSize
      newPosition = Math.max(minSize, Math.min(newPosition, maxBound))

      const range = maxBound - minSize
      setPositionPercent(range > 0 ? Math.round(((newPosition - minSize) / range) * 100) : 50)
      throttledResize(newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      // Cancel any pending RAF
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      // Execute final resize if pending
      if (pendingPositionRef.current !== null) {
        onResize(pendingPositionRef.current)
        pendingPositionRef.current = null
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, direction, minSize, onResize, throttledResize])

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const KEYBOARD_STEP = 20

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!resizerRef.current) return
    const containerRect = resizerRef.current.parentElement?.getBoundingClientRect()
    if (!containerRect) return

    const resizerRect = resizerRef.current.getBoundingClientRect()
    let currentPos =
      direction === 'horizontal'
        ? resizerRect.left - containerRect.left
        : resizerRect.top - containerRect.top

    const relevantKeys =
      direction === 'horizontal' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown']
    if (!relevantKeys.includes(e.key)) return

    e.preventDefault()
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      currentPos += KEYBOARD_STEP
    } else {
      currentPos -= KEYBOARD_STEP
    }

    const maxSize = direction === 'horizontal' ? containerRect.width : containerRect.height
    const maxBound = maxSize - minSize
    const clampedPos = Math.max(minSize, Math.min(currentPos, maxBound))
    const range = maxBound - minSize
    setPositionPercent(range > 0 ? Math.round(((clampedPos - minSize) / range) * 100) : 50)
    onResize(clampedPos)
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: custom resizer needs div with separator role
    <div
      ref={resizerRef}
      role="separator"
      aria-orientation={direction}
      aria-valuenow={positionPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Resize panels"
      tabIndex={0}
      className={`resizer resizer-${direction} ${isDragging ? 'resizer-active' : ''}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
    />
  )
}
