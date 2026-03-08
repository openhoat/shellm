import type { ReactNode } from 'react'

interface ProviderConfigFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'password'
  placeholder?: string
  disabled?: boolean
  envBadge?: boolean
  envHint?: string
  children?: ReactNode
}

/**
 * Reusable configuration field for provider settings
 * Handles environment variable badges, hints, and disabled state
 */
export const ProviderConfigField = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  envBadge = false,
  envHint,
  children,
}: ProviderConfigFieldProps) => {
  return (
    <div className="config-field">
      <label htmlFor={id}>
        {label}
        {envBadge && <span className="env-badge">Environment variable</span>}
      </label>
      {children || (
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={disabled ? 'env-readonly' : ''}
        />
      )}
      {envBadge && envHint && <div className="env-hint">{envHint}</div>}
    </div>
  )
}
