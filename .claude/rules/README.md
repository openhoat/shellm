# Claude Code Rules

This directory contains project rules adapted for Claude Code.

## Rules

| File | Description |
|------|-------------|
| `commit_messages.md` | Git commit messages in Conventional Commits (English) |
| `language.md` | All content must be in English (except src/locales/fr.json) |
| `log_changes.md` | Log modifications in CHANGELOG.md |
| `quality_check.md` | Run `npm run validate` after code modifications |
| `task_format.md` | Task format for KANBAN.md and CHANGELOG.md |

## Workflow

When working on this project with Claude Code:

1. **Read and understand** the rules before starting work
2. **Use English** for all code, comments, documentation, and commit messages
3. **Run quality checks** (`npm run validate`) after each code modification
4. **Log changes** in CHANGELOG.md after successful modifications
5. **Follow Conventional Commits** for all git commits

## Differences from Cline

These rules are adapted from `.clinerules/` but have been simplified to work with Claude Code:

- **No Cline-specific commands**: Commands like `cline --subagents`, `read_file`, `replace_in_file` have been removed
- **Claude Code tools**: Rules now reference Claude Code's native tools (Task, Read, Edit, Write, Bash, etc.)
- **Simplified workflows**: Workflow-specific files have been removed as they contained Cline-specific instructions

## Quick Reference

### Commit Message Format
```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### CHANGELOG Entry Format
```
**[HH:MM:SS] ✨ [FEAT]** Description
```

Tags: `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[PERF]`, `[DOCS]`, `[STYLE]`, `[TEST]`, `[CHORE]`