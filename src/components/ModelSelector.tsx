import { useTranslation } from 'react-i18next'

interface ModelSelectorProps {
  value: string
  onChange: (model: string) => void
  availableModels: string[]
  isLoading: boolean
  onRefresh: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export const ModelSelector = ({
  value,
  onChange,
  availableModels,
  isLoading,
  onRefresh,
  placeholder = 'ex: llama2, mistral, ...',
  disabled = false,
  className = '',
  id = 'ollama-model',
}: ModelSelectorProps) => {
  const { t } = useTranslation()

  return (
    <div className="model-selector-container">
      <div className="model-input-wrapper">
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`model-input ${className}`}
          list="available-models"
          disabled={disabled}
        />
        <datalist id="available-models">
          {availableModels.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </datalist>
        <button
          type="button"
          className={`refresh-models-button ${className}`}
          onClick={onRefresh}
          disabled={isLoading || disabled}
          title={t('models.refresh')}
          aria-label={t('models.refresh')}
        >
          {isLoading ? (
            <svg className="spinner" viewBox="0 0 24 24">
              <title>{t('models.loading')}</title>
              <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" stroke="currentColor" />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>{t('models.refresh')}</title>
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          )}
        </button>
      </div>
      <div className="model-info">
        {isLoading && <output className="model-status loading">{t('models.loading')}</output>}
        {!isLoading && availableModels.length > 0 && (
          <span className="model-status success">
            {t('models.available', { count: availableModels.length })}
          </span>
        )}
        {!isLoading && availableModels.length === 0 && (
          <span className="model-status info">{t('models.emptyHint')}</span>
        )}
      </div>
    </div>
  )
}
