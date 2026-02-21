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

- [x] **#test-resizer [20/02/2026 14:32:00] 🟡 P2 ✅ [TEST]** Improve test coverage for `src/components/Resizer.tsx` (62% → 80% target)
- [x] **#test-e2e [20/02/2026 14:32:00] 🟡 P2 🏗️ [ARCHITECTURE]** Add E2E tests for main user flows
- [x] **#ux-tooltips [20/02/2026 14:32:00] 🟢 P3 🎨 [UX]** Add tooltips on action buttons for better usability
- [ ] **#docs-arch [20/02/2026 14:32:00] 🟢 P3 📝 [DOCS]** Add "Architecture" section in documentation

## 🚧 In Progress

### [21/02/2026 08:00:00] 🟢 P3 🎨 [UX] Add tooltips on action buttons for better usability
- [x] **[21/02/2026 08:00:00] 🐛 [FIX]** Fix French tooltip in ModelSelector (translate to English with i18n)
- [x] **[21/02/2026 08:00:00] ✨ [FEAT]** Add missing tooltips with i18n to 6 buttons (Modify, Cancel, Test Connection, Reset, Save, Close dropdown)
- [x] **[21/02/2026 08:00:00] ✅ [TEST]** Add tests for tooltip presence on all action buttons

### [21/02/2026 08:00:00] 🟡 P2 🏗️ [ARCHITECTURE] Add E2E tests for main user flows
- [ ] **[21/02/2026 08:00:00] ✅ [TEST]** Add conversation lifecycle E2E test (create, switch, delete, export)
- [ ] **[21/02/2026 08:00:00] ✅ [TEST]** Add keyboard shortcuts E2E test
- [ ] **[21/02/2026 08:00:00] ✅ [TEST]** Add configuration persistence E2E test
- [ ] **[21/02/2026 08:00:00] ✅ [TEST]** Add error handling E2E test

## ✅ Done

- [x] **#test-resizer [20/02/2026 15:30:00] ✅ [TEST]** Improve test coverage for `src/components/Resizer.tsx` (62% → 96.55%)
- [x] **#test-header [20/02/2026 15:26:00] ✅ [TEST]** Improve test coverage for `src/components/Header.tsx` (58% → 80%)
- [x] **#test-logger [20/02/2026 14:38:00] ✅ [TEST]** Improve test coverage for `src/utils/logger.ts` (46% → 96.96%)