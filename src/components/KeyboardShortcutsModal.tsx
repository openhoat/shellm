import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KEYBOARD_SHORTCUTS, type ShortcutDefinition } from '@/constants/shortcuts'
import './KeyboardShortcutsModal.css'

interface KeyboardShortcutsModalProps {
  onClose: () => void
}

const KeyBadge = ({ children }: { children: string }) => (
  <span className="shortcut-key">{children}</span>
)

const ShortcutKeys = ({ shortcut }: { shortcut: ShortcutDefinition }) => {
  const parts: string[] = []
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  parts.push(shortcut.key)

  return (
    <span className="shortcut-keys">
      {parts.map((part, index) => (
        <span key={part} className="shortcut-keys">
          {index > 0 && <span className="shortcut-separator">+</span>}
          <KeyBadge>{part}</KeyBadge>
        </span>
      ))}
      {shortcut.altKey && (
        <>
          <span className="shortcut-separator">/</span>
          <KeyBadge>{shortcut.altKey}</KeyBadge>
        </>
      )}
    </span>
  )
}

export const KeyboardShortcutsModal = ({ onClose }: KeyboardShortcutsModalProps) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Focus modal on mount
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  return (
    <div className="shortcuts-overlay" role="presentation">
      <div
        className="shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="shortcuts-header">
          <h2 id="shortcuts-modal-title">{t('shortcuts.title')}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            title={t('config.common.close')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>{t('config.common.close')}</title>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="shortcuts-content">
          {KEYBOARD_SHORTCUTS.map(group => (
            <div key={group.groupKey} className="shortcuts-group">
              <h3>{t(group.groupKey)}</h3>
              <div className="shortcuts-list">
                {group.shortcuts.map(shortcut => (
                  <div key={shortcut.labelKey} className="shortcut-row">
                    <span className="shortcut-label">{t(shortcut.labelKey)}</span>
                    <ShortcutKeys shortcut={shortcut} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <button type="button" className="btn-close" onClick={onClose}>
            {t('config.common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
