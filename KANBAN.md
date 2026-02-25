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

- [ ] **#perf-terminal [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Batch terminal output processing and throttle Resizer with `requestAnimationFrame`
- [ ] **#i18n-strings [21/02/2026 10:00:00] 🟡 P2 🌍 [I18N]** Replace hardcoded French/English strings with i18n keys in services and Header component
- [ ] **#dep-xterm [21/02/2026 10:00:00] 🟡 P2 📦 [DEPENDENCIES]** Migrate deprecated `xterm` to `@xterm/xterm` and run `npm audit fix` for fixable vulnerabilities
- [ ] **#test-cov [21/02/2026 10:00:00] 🟡 P2 ✅ [TEST]** Add unit tests for `useChat.ts` (525 lines, 0%), `base-provider.ts` (402 lines), and `conversationService.ts` (233 lines)
- [ ] **#arch-shell [25/02/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers)
- [ ] **#sec-keys [21/02/2026 10:00:00] 🟢 P3 🔒 [SECURITY]** Use Electron `safeStorage` for API keys and disable DevTools in production builds
- [ ] **#dep-update [21/02/2026 10:00:00] 🟢 P3 📦 [DEPENDENCIES]** Apply patch/minor dependency updates (`@langchain/*`, `biome`, `electron`, `i18next`, etc.)

## 🚧 In Progress

## ✅ Done
- [x] **[25/02/2026 18:30:00] ⚡ [PERF]** Add in-memory cache for ConversationService with TTL-based expiration
- [x] **[25/02/2026 18:30:00] ♻️ [REFACTOR]** Switch ConversationService to async file I/O with fs/promises
- [x] **[25/02/2026 10:00:00] 🔧 [CHORE]** Add Zustand optimized selectors with useShallow in useStore.ts (available for future use)
- [x] **[25/02/2026 10:00:00] 🔧 [CHORE]** Add Vite code splitting with manualChunks for vendor bundles
