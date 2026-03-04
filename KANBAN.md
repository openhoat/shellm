# Kanban Board

**Priority Legend:**
- 🔴 **P1** = High Priority (critical, security, blocking issues)
- 🟡 **P2** = Medium Priority (important improvements)
- 🟢 **P3** = Low Priority (nice to have, enhancements)

**Category Icons (for Ideas):**
- 🔒 **[SECURITY]**: Security improvements (validation, sanitization, etc.)
- ✅ **[TEST]**: Testing improvements (unit tests, integration tests, coverage)
- 🚀 **[PERFORMANCE]**: Performance optimizations (caching, memoization, etc.)
- 🏗️ **[ARCHITECTURE]**: Code architecture improvements (refactoring, patterns)
- 🎨 **[UX]**: User experience improvements (shortcuts, tooltips, feedback)
- 🔧 **[DEVOPS]**: DevOps improvements (CI/CD, scripts, workflows)
- 🌍 **[I18N]**: Internationalization improvements (translations, locales)
- 📦 **[DEPENDENCIES]**: Dependency updates (package updates, upgrades)
- ⚙️ **[CONFIG]**: Configuration improvements (build tools, setup)

## 📝 Backlog

- [ ] **#arch-shell [25/02/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers)
- [ ] **#perf-stats [26/02/2026 14:00:00] 🟢 P3 🚀 [PERFORMANCE]** Add usage statistics dashboard: commands executed, success/failure rate, response time per provider
- [ ] **#arch-export [26/02/2026 14:00:00] 🟢 P3 🏗️ [ARCHITECTURE]** Multi-format export: Markdown, PDF, HTML with syntax highlighting
- [ ] **#ux-context [26/02/2026 14:00:00] 🟢 P3 🎨 [UX]** Contextual AI suggestions based on current directory, project type detection, and recent commands
- [ ] **#devops-autoupdate [26/02/2026 14:00:00] 🟢 P3 🔧 [DEVOPS]** Implement auto-update: version check at startup, background download, changelog notification, rollback support

## 🚧 In Progress

## ✅ Done

- [x] **#i18n-languages [04/03/2026 12:15:00] 🟢 P3 🌍 [I18N]** Add more translations: Spanish, German, Portuguese, Chinese, Japanese with community contribution support
- [x] **[04/03/2026 09:00:00] ✨ [FEAT]** Create translation files for Spanish (es.json), German (de.json), Portuguese (pt.json), Chinese (zh.json), Japanese (ja.json)
- [x] **[04/03/2026 09:00:00] ✨ [FEAT]** Update i18n.ts configuration to register the 5 new languages
- [x] **[04/03/2026 09:00:00] ✨ [FEAT]** Add language names in config.chatLanguage for all new languages
- [x] **[04/03/2026 09:00:00] ✨ [FEAT]** Create LanguageSwitcher component for UI language selection
- [x] **[04/03/2026 09:00:00] 📝 [DOCS]** Create TRANSLATIONS.md documentation for community contribution support
- [x] **[04/03/2026 09:00:00] ✅ [TEST]** Add unit tests for i18n configuration and language switching
- [x] **#test-e2e-chain [03/03/2026 10:30:00] ✅ [TEST]** Add e2e test with chained requests verifying conversation history is passed to LLM
- [x] **[03/03/2026 10:00:00] ✨ [FEAT]** Create centralized keyboard shortcuts configuration (`src/constants/shortcuts.ts`)
- [x] **[03/03/2026 10:00:00] ✨ [FEAT]** Create `KeyboardShortcutsModal` component — cheat sheet modal accessible via Ctrl+/ or ?
- [x] **[03/03/2026 10:00:00] ✨ [FEAT]** Add shortcut badge display to main UI buttons (Header + ChatPanel)
- [x] **[03/03/2026 10:00:00] ✨ [FEAT]** Add i18n translations for shortcuts feature in en.json and fr.json
- [x] **[03/03/2026 10:00:00] ✨ [FEAT]** Integrate modal in App.tsx and wire up global Ctrl+/ keyboard handler
- [x] **[03/03/2026 10:00:00] ✅ [TEST]** Add unit tests for the KeyboardShortcutsModal component


### [02/03/2026 09:15:00] 🔴 P1 🔒 [SECURITY] Add proactive command validation
**All tasks completed!** Command validation service with:
- Risk level detection (safe, warning, dangerous)
- Warning modal for destructive commands
- Sandbox mode for safe execution
- Audit logging for all command executions