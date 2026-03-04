import { describe, expect, test } from 'vitest'
import i18n from './i18n'

describe('i18n Configuration', () => {
  test('should have English language registered', () => {
    expect(i18n.options.resources).toHaveProperty('en')
    expect(i18n.options.resources?.en).toHaveProperty('translation')
  })

  test('should have French language registered', () => {
    expect(i18n.options.resources).toHaveProperty('fr')
    expect(i18n.options.resources?.fr).toHaveProperty('translation')
  })

  test('should have Spanish language registered', () => {
    expect(i18n.options.resources).toHaveProperty('es')
    expect(i18n.options.resources?.es).toHaveProperty('translation')
  })

  test('should have German language registered', () => {
    expect(i18n.options.resources).toHaveProperty('de')
    expect(i18n.options.resources?.de).toHaveProperty('translation')
  })

  test('should have Portuguese language registered', () => {
    expect(i18n.options.resources).toHaveProperty('pt')
    expect(i18n.options.resources?.pt).toHaveProperty('translation')
  })

  test('should have Chinese language registered', () => {
    expect(i18n.options.resources).toHaveProperty('zh')
    expect(i18n.options.resources?.zh).toHaveProperty('translation')
  })

  test('should have Japanese language registered', () => {
    expect(i18n.options.resources).toHaveProperty('ja')
    expect(i18n.options.resources?.ja).toHaveProperty('translation')
  })

  test('should have fallback language set to English', () => {
    // i18next normalizes fallbackLng to an array
    expect(i18n.options.fallbackLng).toEqual(['en'])
  })

  test('should have language detection configured', () => {
    expect(i18n.options.detection).toBeDefined()
    expect(i18n.options.detection?.order).toContain('localStorage')
    expect(i18n.options.detection?.order).toContain('navigator')
    expect(i18n.options.detection?.caches).toContain('localStorage')
  })

  test('should have all required translation keys for each language', () => {
    const languages = ['en', 'fr', 'es', 'de', 'pt', 'zh', 'ja']
    const requiredKeys = [
      'app.title',
      'app.subtitle',
      'header.models',
      'header.config',
      'chat.title',
      'chat.placeholder',
      'config.title',
      'config.language.title',
      'config.chatLanguage.title',
      'errors.connection',
      'shortcuts.title',
    ]

    for (const lang of languages) {
      const translation = i18n.options.resources?.[lang]?.translation
      expect(translation).toBeDefined()

      for (const key of requiredKeys) {
        const keys = key.split('.')
        let value = translation
        for (const k of keys) {
          value = value?.[k]
        }
        expect(value).toBeDefined()
      }
    }
  })

  test('should have chatLanguage options for all languages', () => {
    const languages = ['en', 'fr', 'es', 'de', 'pt', 'zh', 'ja']
    const chatLanguageKeys = ['auto', 'en', 'fr', 'es', 'de', 'pt', 'zh', 'ja']

    for (const lang of languages) {
      const chatLanguage = i18n.options.resources?.[lang]?.translation?.config?.chatLanguage
      expect(chatLanguage).toBeDefined()

      for (const key of chatLanguageKeys) {
        expect(chatLanguage[key]).toBeDefined()
      }
    }
  })
})
