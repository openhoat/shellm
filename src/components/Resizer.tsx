import { useEffect, useRef, useState } from 'react'
import './Resizer.css'

interface ResizerProps {
  onResize: (position: number) => void
  direction?: 'horizontal' | 'vertical'
  minSize?: number
}

export const Resizer = ({ onResize, direction = 'horizontal', minSize = 300 }: ResizerProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const resizerRef = useRef<HTMLDivElement>(null)

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
      newPosition = Math.max(minSize, Math.min(newPosition, containerRect.width - minSize))

      onResize(newPosition)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, direction, minSize, onResize])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Custom resizer component that handles drag interactions
    <div
      ref={resizerRef}
      className={`resizer resizer-${direction} ${isDragging ? 'resizer-active' : ''}`}
      onMouseDown={handleMouseDown}
      title="Drag to resize"
    />
  )
}
