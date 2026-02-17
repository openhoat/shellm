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

### 🔴 P1 - High Priority


### 🟡 P2 - Medium Priority

- [ ] **[16/02/2026 23:56:00] 🟡 P2 ✅ [TEST]** Optimize e2e tests execution time - currently too long for regular validation
- [ ] **[16/02/2026 20:31:00] 🟡 P2 🌍 [I18N]** Create GitHub Pages documentation site for users and restructure README for contributors
### 🟢 P3 - Low Priority


## 🚧 In Progress

### [17/02/2026 01:04:06] 🔴 P1 🐛 [FIX] Fix language change not applying after Save - welcome content stays in original language and shows error traces
- [x] **[17/02/2026 01:04:06] ✨ [FEAT]** Add missing i18n keys for ChatPanel (welcome, progress, buttons) in en.json and fr.json
- [x] **[17/02/2026 01:04:06] 🐛 [FIX]** Replace all hardcoded French text in ChatPanel.tsx with useTranslation() calls
- [x] **[17/02/2026 01:04:06] 🔧 [CHORE]** Run validation to verify changes