# Claude Code Rules

This directory contains project rules adapted for Claude Code.

## Rules

| File | Description |
|------|-------------|
| `commit_messages.md` | Git commit messages in Conventional Commits (English) |
| `language.md` | All content must be in English (except src/locales/fr.json) |
| `log_changes.md` | Log modifications in CHANGELOG.md |
| `mcp_intellij.md` | MCP IntelliJ integration for code analysis and navigation |
| `quality_check.md` | Run `npm run validate` after code modifications |
| `task_format.md` | Task format for KANBAN.md and CHANGELOG.md |

## Workflows

| File | Description |
|------|-------------|
| `workflows/kanban_workflow.md` | **PRIMARY** - Kanban task execution workflow |
| `workflows/agent_kanban_execution.md` | Use kanban-task-executor agent for batch tasks |
| `workflows/agent_quality_check.md` | Use quality-validator agent for validation |
| `workflows/agent_parallel_testing.md` | Run tests in parallel with multiple agents |
| `workflows/orchestrate_parallel_agents.md` | Coordinate multiple independent subagents |
| `workflows/agent_parallel_testing.md` | Parallel test execution |
| `workflows/kanban_add_idea.md` | Add ideas to backlog interactively |

## Workflow

When working on this project with Claude Code:

1. **Read and understand** the rules before starting work
2. **Use English** for all code, comments, documentation, and commit messages
3. **Follow Kanban workflow** (`workflows/kanban_workflow.md`) when working on tasks:
   - Move task to "In Progress" before starting
   - Check (`- [x]`) task when completed
   - Create commit after all tasks completed
   - Delete from In Progress after successful commit
4. **Run quality checks** (`npm run validate`) after each code modification
5. **Log changes** in CHANGELOG.md after successful modifications
6. **Follow Conventional Commits** for all git commits

## Differences from Cline

These rules are adapted from `.clinerules/` but have been simplified to work with Claude Code:

- **No Cline-specific commands**: Commands like `cline --subagents`, `read_file`, `replace_in_file` have been removed
- **Claude Code tools**: Rules now reference Claude Code's native tools (Task, Read, Edit, Write, Bash, etc.)
- **Unified kanban workflow**: The `workflows/kanban_workflow.md` provides a clear step-by-step process

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
1. Move task to In Progress (when starting)
2. Execute task
3. Check task (`- [x]`) when completed
4. Create commit (after all tasks done)
5. Delete from In Progress (after successful commit)
6. Update CHANGELOG.md