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
- 📝 **[DOCS]**: Documentation improvements (guides, references, diagrams)

## 📝 Backlog

- [ ] **#arch-import [04/03/2026 17:55:00] 🟡 P2 🏗️ [ARCHITECTURE]** Implement conversation import feature: parse exported JSON, validate schema, restore conversations with messages, handle version compatibility
- [ ] **#ux-conversations [04/03/2026 10:20:00] 🟡 P2 🎨 [UX]** Improve conversations panel UI - ensure delete button ('x') remains visible when conversation titles are long
- [ ] **#doc-features [04/03/2026 10:15:00] 🟡 P2 📝 [DOCS]** Update documentation to include latest features:
    - [ ] Security section in usage.md: add command validation (risk levels), sandbox modes, audit logging
    - [ ] Keyboard shortcuts in usage.md: add Ctrl+/ for cheat sheet
    - [ ] New page for Internationalization: 7 languages, dual settings (UI/AI), auto-detection
    - [ ] Architecture page: add sandbox service, audit service, provider registry
- [ ] **#arch-shell [25/02/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers)
- [ ] **#perf-stats [26/02/2026 14:00:00] 🟢 P3 🚀 [PERFORMANCE]** Add usage statistics dashboard: commands executed, success/failure rate, response time per provider
- [ ] **#arch-export [26/02/2026 14:00:00] 🟢 P3 🏗️ [ARCHITECTURE]** Multi-format export: Markdown, PDF, HTML with syntax highlighting
- [ ] **#ux-context [26/02/2026 14:00:00] 🟢 P3 🎨 [UX]** Contextual AI suggestions based on current directory, project type detection, and recent commands
- [ ] **#devops-autoupdate [26/02/2026 14:00:00] 🟢 P3 🔧 [DEVOPS]** Implement auto-update: version check at startup, background download, changelog notification, rollback support

## 🚧 In Progress

## ✅ Done

- [x] **#doc-diagram [04/03/2026 18:30:00] 📝 [DOCS]** Improve architecture diagram rendering - replace ASCII diagrams with Mermaid for better readability
- [x] **#doc-readme-update [04/03/2026 17:15:00] 📝 [DOCS]** Update README.md to document latest features (simplified to avoid duplication with docs)