# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## 📝 Backlog

- [ ] **#arch-import [04/03/2026 17:55:00] 🟡 P2 🏗️ [ARCHITECTURE]** Implement conversation import feature: parse exported JSON, validate schema, restore conversations with messages, handle version compatibility
- [ ] **#arch-shell [25/02/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Create `termaidsh` meta-shell: interactive shell wrapper with AI command suggestion, pre-filled validation, and output interpretation (reusing shared LLM providers)
- [ ] **#perf-stats [26/02/2026 14:00:00] 🟢 P3 🚀 [PERFORMANCE]** Add usage statistics dashboard: commands executed, success/failure rate, response time per provider
- [ ] **#arch-export [26/02/2026 14:00:00] 🟢 P3 🏗️ [ARCHITECTURE]** Multi-format export: Markdown, PDF, HTML with syntax highlighting
- [ ] **#ux-context [26/02/2026 14:00:00] 🟢 P3 🎨 [UX]** Contextual AI suggestions based on current directory, project type detection, and recent commands
- [ ] **#devops-autoupdate [26/02/2026 14:00:00] 🟢 P3 🔧 [DEVOPS]** Implement auto-update: version check at startup, background download, changelog notification, rollback support

## 🚧 In Progress

## ✅ Done

- [x] **[05/03/2026 10:15:00] 🎨 [STYLE]** Analyze and verify the current CSS flexbox behavior for conversation items
- [x] **[05/03/2026 10:15:00] ✨ [FEAT]** Fix the `.conversation-item` and `.conversation-title` styles to ensure delete button always remains visible and clickable with fixed width
- [x] **[05/03/2026 10:15:00] ✅ [TEST]** Add test cases for conversation dropdown with long titles
- [x] **[05/03/2026 10:15:00] 🔧 [CHORE]** Run validation (npm run validate) and verify UI behavior manually