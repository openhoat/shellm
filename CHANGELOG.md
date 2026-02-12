# Changelog

Ce fichier est généré automatiquement depuis l'historique Git.

Pour visualiser l'historique complet, utilisez : `git log`

## Modification History


### 2026

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
