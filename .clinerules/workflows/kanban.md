# Workflow: Kanban

Manage KANBAN.md - read to extract tasks/ideas, update to modify statuses.

## Purpose

Unified workflow to read and update KANBAN.md file.

## Usage

```
kanban read   - Parse and display KANBAN.md summary
kanban update - Modify task statuses, add/remove tasks
```

## Action: read

### Execution

1. Read KANBAN.md file
2. Parse sections: 📝 Backlog, 🚧 In Progress, ✅ Done
3. Generate structured summary

### Output Format

```
KANBAN Summary
==============

Backlog (N ideas):
- [DATE] Priority CategoryEmoji [CATEGORY] Description

In Progress (N ideas, M isolated tasks):
### [DATE] 💡 [IDEA] Description
  - [x] Completed task
  - [ ] Pending task

Done (N tasks):
- [x] [DATE] Emoji [TAG] Description
```

## Action: update

### Operations

**Mark task completed:**
```markdown
Before: - [ ] **[DATE] Emoji [TAG]** Description
After:  - [x] **[DATE] Emoji [TAG]** Description
```

**Delete completed section:**
Remove entire idea section (header + all tasks) after successful commit.

**Add new task:**
Insert in appropriate section with proper formatting.

## Important Rules

- One idea = all tasks committed together
- Only delete after successful git commit
- After commit, delete all tasks from Done section (keep it empty)
- Use `replace_in_file` for all modifications

## Format Reference

See `.clinerules/task_format.md` for complete format definitions.

Common tags: `✨ [FEAT]`, `🐛 [FIX]`, `♻️ [REFACTOR]`, `⚡ [PERF]`, `📝 [DOCS]`, `🎨 [STYLE]`, `✅ [TEST]`, `🔧 [CHORE]`
