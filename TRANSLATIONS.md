# Translations

This document explains how to contribute translations to Termaid.

## Supported Languages

Termaid currently supports the following languages:

| Code | Language | Status |
|------|----------|--------|
| `en` | English | ✅ Complete |
| `fr` | French | ✅ Complete |
| `es` | Spanish | ✅ Complete |
| `de` | German | ✅ Complete |
| `pt` | Portuguese | ✅ Complete |
| `zh` | Chinese (Simplified) | ✅ Complete |
| `ja` | Japanese | ✅ Complete |

## How to Add a New Language

### 1. Create the Translation File

Copy the English translation file as a template:

```bash
cp src/locales/en.json src/locales/<language-code>.json
```

Replace `<language-code>` with the ISO 639-1 code for your language (e.g., `it` for Italian, `ko` for Korean, `ru` for Russian).

### 2. Translate the Content

Open the new file and translate all the values (not the keys) to your language.

**Example:**

```json
{
  "translation": {
    "app": {
      "title": "Termaid",
      "subtitle": "Your translation here"
    },
    ...
  }
}
```

**Important guidelines:**
- Keep the JSON structure intact
- Don't modify the keys (e.g., `app.title`, `chat.placeholder`)
- Only translate the values
- Preserve placeholders like `{{filePath}}` or `{{count}}` - they are replaced dynamically
- Keep technical terms unchanged (e.g., "Ctrl+/", "Ollama", "GPT-4o")

### 3. Register the Language

Edit `src/i18n.ts` to add your language:

```typescript
import <lang> from './locales/<language-code>.json'

// Add to resources:
resources: {
  en: { translation: en.translation },
  fr: { translation: fr.translation },
  // ... other languages
  <lang>: { translation: <lang>.translation },
},
```

### 4. Add Language Name to Existing Translations

Update all locale files to include your language name:

In `src/locales/en.json`:
```json
"chatLanguage": {
  ...
  "<lang>": "<Language Name in English>"
}
```

In `src/locales/<language-code>.json`:
```json
"chatLanguage": {
  ...
  "<lang>": "<Language Name in Native Language>"
}
```

### 5. Update the Language Selector

Edit `src/components/LanguageSelector.tsx`:

```typescript
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  // ... other languages
  { code: '<lang>', name: '<Native Name>' },
] as const
```

### 6. Update the Config Panel

Edit `src/components/ConfigPanel.tsx` to add your language option in the chat language selector:

```tsx
<option value="<lang>">{t('config.chatLanguage.<lang>')}</option>
```

## Translation Guidelines

### General Rules

1. **Consistency**: Use consistent terminology throughout the translation
2. **Tone**: Use a friendly, professional tone appropriate for a developer tool
3. **Conciseness**: Keep translations concise while maintaining meaning
4. **Technical Terms**: Keep technical terms (API, LLM, etc.) in English when appropriate

### Placeholders

Some strings contain placeholders that are replaced dynamically:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{filePath}}` | File path | `"Exported to {{filePath}}"` |
| `{{count}}` | Count (pluralization) | `"{{count}} files available"` |
| `{{patterns}}` | Security patterns | `"Warning: {{patterns}} detected"` |

**Keep these placeholders unchanged in your translation.**

### Pluralization

i18next handles pluralization automatically. Use `_one` and `_other` suffixes:

```json
{
  "available_one": "{{count}} model available",
  "available_other": "{{count}} models available"
}
```

## Testing Your Translation

### 1. Build the Project

```bash
npm run build
```

### 2. Run the Application

```bash
npm run dev
```

### 3. Switch Languages

- Open Settings (gear icon)
- Use the Language dropdown to select your language
- Verify all UI elements are translated correctly

### 4. Check All Screens

Navigate through all screens to ensure translations work everywhere:

- Main chat interface
- Configuration panel
- Model selection
- Keyboard shortcuts modal
- Error messages
- Command warnings

## Submitting Your Contribution

### Prerequisites

- Fork the repository
- Create a feature branch: `git checkout -b feat/i18n-<language-code>`

### Submit a Pull Request

1. Commit your changes:
   ```bash
   git add src/locales/<language-code>.json src/i18n.ts src/components/LanguageSelector.tsx src/components/ConfigPanel.tsx src/locales/*.json
   git commit -m "feat(i18n): add <language-name> translation"
   ```

2. Push to your fork:
   ```bash
   git push origin feat/i18n-<language-code>
   ```

3. Create a Pull Request with:
   - Title: `feat(i18n): Add <language-name> translation`
   - Description: Brief description of the translation
   - Screenshots showing the UI in your language (optional but appreciated)

## Translation Quality Checklist

Before submitting, verify:

- [ ] All keys from `en.json` are present in your translation
- [ ] No keys were accidentally modified
- [ ] Placeholders (`{{...}}`) are preserved
- [ ] Technical terms are handled appropriately
- [ ] The application builds successfully
- [ ] All UI elements display correctly in your language
- [ ] No text overflow or layout issues

## Getting Help

If you have questions about translations:

1. Open an issue with the `i18n` label
2. Join our community discussions
3. Reference existing translations for patterns

## Translation File Structure

```
src/
├── locales/
│   ├── en.json        # English (base)
│   ├── fr.json        # French
│   ├── es.json        # Spanish
│   ├── de.json        # German
│   ├── pt.json        # Portuguese
│   ├── zh.json        # Chinese (Simplified)
│   └── ja.json        # Japanese
├── i18n.ts            # i18next configuration
└── components/
    ├── LanguageSelector.tsx    # UI language selector
    └── ConfigPanel.tsx         # Chat language selector
```

## Thank You!

Thank you for contributing to Termaid's internationalization. Your translation helps make the tool accessible to developers worldwide! 🌍