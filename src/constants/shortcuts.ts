export interface ShortcutDefinition {
  /** i18n key for the action description */
  labelKey: string
  /** Main key (e.g. 'Enter', 'k', '/') */
  key: string
  /** Whether Ctrl modifier is required */
  ctrl?: boolean
  /** Whether Shift modifier is required */
  shift?: boolean
  /** Whether Alt modifier is required */
  alt?: boolean
  /** Optional second key variant (e.g. '?') */
  altKey?: string
}

export interface ShortcutGroup {
  /** i18n key for the group label */
  groupKey: string
  shortcuts: ShortcutDefinition[]
}

export const KEYBOARD_SHORTCUTS: ShortcutGroup[] = [
  {
    groupKey: 'shortcuts.groups.chat',
    shortcuts: [
      {
        labelKey: 'shortcuts.actions.sendMessage',
        key: 'Enter',
      },
      {
        labelKey: 'shortcuts.actions.newLine',
        key: 'Enter',
        shift: true,
      },
      {
        labelKey: 'shortcuts.actions.executeCommand',
        key: 'Enter',
        ctrl: true,
      },
      {
        labelKey: 'shortcuts.actions.clearChat',
        key: 'K',
        ctrl: true,
      },
      {
        labelKey: 'shortcuts.actions.cancelAction',
        key: 'Escape',
      },
    ],
  },
  {
    groupKey: 'shortcuts.groups.navigation',
    shortcuts: [
      {
        labelKey: 'shortcuts.actions.historyPrevious',
        key: '↑',
      },
      {
        labelKey: 'shortcuts.actions.historyNext',
        key: '↓',
      },
      {
        labelKey: 'shortcuts.actions.navigateConversations',
        key: '↑ / ↓',
      },
    ],
  },
  {
    groupKey: 'shortcuts.groups.panels',
    shortcuts: [
      {
        labelKey: 'shortcuts.actions.resizePanel',
        key: '← / →',
      },
    ],
  },
  {
    groupKey: 'shortcuts.groups.help',
    shortcuts: [
      {
        labelKey: 'shortcuts.actions.showShortcuts',
        key: '/',
        ctrl: true,
        altKey: '?',
      },
    ],
  },
]
