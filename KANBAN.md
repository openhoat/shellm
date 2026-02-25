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
- [ ] **#dep-update [21/02/2026 10:00:00] 🟢 P3 📦 [DEPENDENCIES]** Apply patch/minor dependency updates (`@langchain/*`, `biome`, `electron`, `i18next`, etc.)

## 🚧 In Progress

### [25/02/2026 21:57:35] 🟢 P3 🔒 [SECURITY] Use Electron safeStorage for API keys and disable DevTools in production builds
- [ ] **[25/02/2026 21:57:35] ✨ [FEAT]** Create safeStorage service for encrypting/decrypting API keys
- [ ] **[25/02/2026 21:57:35] ♻️ [REFACTOR]** Migrate config IPC handlers to use safeStorage for API key fields
- [ ] **[25/02/2026 21:57:35] 🔒 [SECURITY]** Disable DevTools in production builds and restrict keyboard shortcut
- [ ] **[25/02/2026 21:57:35] ✅ [TEST]** Add unit tests for safeStorage service and DevTools configuration

## ✅ Done
