# Changelog

Ce fichier est généré automatiquement depuis l'historique Git.

Pour visualiser l'historique complet, utilisez : `git log`

## Modification History


### 2026

### 13/02

**[00:50:00] 🔧 [CHORE]** Add French language preference rule in .claude/rules for automatic French responses
**[00:40:00] ✅ [TEST]** Add Electron IPC Layer tests with mocks (config, conversation, llm-service, terminal)

### 12/02

**[23:35:00] 🏗️ [ARCHITECTURE]** Refactor ChatPanel.tsx - extract useChat custom hook for better separation of concerns
**[23:35:00] 🏗️ [ARCHITECTURE]** Implement centralized error handling with toast notifications system
**[23:35:00] 🚀 [PERFORMANCE]** Implement React.memo and virtualization for ChatPanel messages to optimize rendering
**[23:35:00] 🔧 [DEVOPS]** Create CI/CD pipeline (GitHub Actions or GitLab CI) for tests, lint, and build
**[23:35:00] ⚙️ [CONFIG]** Use WireIt to optimize NPM scripts with caching and dependency management
**[23:05:00] 🔧 [CHORE]** Create GitHub Actions CI/CD pipeline with linting, tests, and build steps
**[17:51:56] 🔧 [CHORE]** Add Co-authored-by prohibition rule in commit messages for both Cline and Claude Code
**[16:09:45] 📝 [DOCS]** Add idea to backlog: Fix the test:ui NPM script by installing @vitest/ui package

#### 12/02

**[11:57:40] ✨ [FEAT]** Implement subagent management system with Claude including skills, agents, rules and workflows for quality validation, testing, and kanban execution
**[11:55:30] 🐛 [FIX]** Fix irrelevant AI responses by improving system prompt with package management examples and using LangChain's withStructuredOutput for better parsing
**[10:32:50] ✨ [FEAT]** Create interactive workflow for adding ideas to Kanban backlog

#### 11/02

**[18:50:00] 🐛 [FIX]** Enhance output interpretation with intelligent analysis of common commands (free, df, ls, ps, ping) to extract meaningful data instead of generic messages
**[18:30:00] 🐛 [FIX]** Improve output interpretation fallback to extract meaningful information like memory/disk stats, warnings, and errors from command output
**[18:10:00] 🐛 [FIX]** Fix conversation export to include full AI responses with command details - previously only explanations were saved
**[17:54:00] 🎨 [STYLE]** Add direct export button in header for better UX - now you can export all conversations without opening the dropdown menu
**[17:14:00] 🐛 [FIX]** Fix output interpretation error by using proper template placeholders to handle special characters in command output
**[17:10:00] 🐛 [FIX]** Fix terminal prompt by using login shell mode to allow normal shell configuration
**[16:53:00] 🐛 [FIX]** Fix shell arguments to use correct flags for different shells (zsh, fish, bash, etc.)
**[16:12:00] ✨ [FEAT]** Add shell selection feature in terminal configuration with auto-detection support
**[16:12:00] ✨ [FEAT]** Implement conversation export functionality to JSON format with schema validation
**[16:12:00] 📝 [DOCS]** Add JSON schema for conversation export format in schemas/conversation-export.schema.json
**[15:12:00] 📝 [DOCS]** Add comprehensive .clauderules configuration generated from existing Cline rules, including commit messages, language enforcement, change logging, quality checks, task formatting, and subagents rules
**[12:47:38] 📝 [DOCS]** Add subagents rule to guide parallel task execution with cline --subagents command
**[12:38:15] ✨ [FEAT]** Implement conversation context maintenance for LLM chat
**[12:38:15] 🐛 [FIX]** Fix missing context in chat conversations