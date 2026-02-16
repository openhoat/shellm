# Claude Code Rules

This directory contains project rules adapted for Claude Code.

## Rules

| File | Description |
|------|-------------|
| `commit_messages.md` | Git commit messages in Conventional Commits (English) |
| `language.md` | All content must be in English (except src/locales/fr.json) |
| `language_preference.md` | Respond in French to user unless specified otherwise |
| `log_changes.md` | Log modifications in CHANGELOG.md |
| `markdown_formatting.md` | Standard markdown formatting (no consecutive blank lines) |
| `mcp_intellij.md` | MCP IntelliJ integration for code analysis and navigation |
| `quality_check.md` | Run `npm run validate` after code modifications |
| `subagents.md` | When and how to use Claude Code subagents |
| `task_format.md` | Task format for KANBAN.md and CHANGELOG.md |
| `testing.md` | Testing standards (use `test` instead of `it`) |

## Skills (Slash Commands)

Skills are located in `.claude/skills/` and can be invoked with `/skill-name`.

| Command | Description |
|---------|-------------|
| `/run-validation` | Run project validation (Biome QA, build, tests) |
| `/run-tests` | Execute unit tests with Vitest |
| `/run-build` | Build the project (Vite + Electron) |
| `/generate-changelog` | Regenerate CHANGELOG.md from Git history |
| `/generate-coverage-report` | Generate code coverage report |
| `/analyze-quality-report` | Analyze Biome linting issues |
| `/analyze-test-report` | Analyze test failures and coverage |
| `/create-git-commit` | Create commit with Conventional Commits format |
| `/read-kanban` | Read and parse KANBAN.md |
| `/update-kanban` | Update KANBAN.md task statuses |
| `/kanban-add-idea` | Add idea to backlog interactively |
| `/kanban-execute` | Select and execute backlog ideas |
| `/quality-check` | Run quality validation on project |
| `/parallel-test` | Run tests in parallel using subagents |

## Workflow

When working on this project with Claude Code:

1. **Read and understand** the rules before starting work
2. **Use English** for all code, comments, documentation, and commit messages
3. **Follow Kanban workflow** when working on tasks:
   - Use `/kanban-execute` to select and execute backlog ideas
   - Use `/kanban-add-idea` to add new ideas to backlog
   - Use `/read-kanban` to check current state
4. **Run quality checks** (`/run-validation` or `npm run validate`) after each code modification
5. **Log changes** in CHANGELOG.md after successful modifications
6. **Follow Conventional Commits** for all git commits

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

### Kanban Workflow Summary
1. `/kanban-add-idea` - Add ideas to backlog
2. `/kanban-execute` - Select and execute ideas
3. Complete tasks and mark as done
4. Create commit after all tasks done
5. `/generate-changelog` - Update changelog