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

- [ ] **#perf-zustand [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Add Zustand selectors with `useShallow` to prevent unnecessary re-renders across all components
- [ ] **#perf-bundle [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Add Vite code splitting (`manualChunks`) and lazy-load ConfigPanel with `React.lazy`
- [ ] **#perf-terminal [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Batch terminal output processing and throttle Resizer with `requestAnimationFrame`
- [ ] **#perf-convo [21/02/2026 10:00:00] 🟡 P2 🚀 [PERFORMANCE]** Add in-memory cache for ConversationService and switch to async file I/O
- [ ] **#i18n-strings [21/02/2026 10:00:00] 🟡 P2 🌍 [I18N]** Replace hardcoded French/English strings with i18n keys in services and Header component
- [ ] **#dep-xterm [21/02/2026 10:00:00] 🟡 P2 📦 [DEPENDENCIES]** Migrate deprecated `xterm` to `@xterm/xterm` and run `npm audit fix` for fixable vulnerabilities
- [ ] **#test-cov [21/02/2026 10:00:00] 🟡 P2 ✅ [TEST]** Add unit tests for `useChat.ts` (525 lines, 0%), `base-provider.ts` (402 lines), and `conversationService.ts` (233 lines)
- [ ] **#sec-mock [21/02/2026 10:00:00] 🟡 P2 🔒 [SECURITY]** Strip E2E mock code from production builds (gate behind `NODE_ENV === 'test'`)
- [ ] **#sec-keys [21/02/2026 10:00:00] 🟢 P3 🔒 [SECURITY]** Use Electron `safeStorage` for API keys and disable DevTools in production builds
- [ ] **#dep-update [21/02/2026 10:00:00] 🟢 P3 📦 [DEPENDENCIES]** Apply patch/minor dependency updates (`@langchain/*`, `biome`, `electron`, `i18next`, etc.)

## 🚧 In Progress

## ✅ Done

- [x] **[25/02/2026 10:04:00] 🐛 [FIX]** Fix setTimeout cleanup leaks in Header.tsx
- [x] **[25/02/2026 10:03:00] ♻️ [REFACTOR]** Standardize export consistency (convert default exports to named exports)
- [x] **[25/02/2026 10:02:00] 🐛 [FIX]** Add error handling to store async actions in useStore.ts
- [x] **[25/02/2026 10:01:00] 🐛 [FIX]** Fix Terminal cleanup memory leaks for electronAPI listeners in Terminal.tsx
- [x] **[25/02/2026 10:00:00] ♻️ [REFACTOR]** Fix unsafe type assertions (`as unknown as`) in ChatPanel.tsx