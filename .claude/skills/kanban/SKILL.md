---
name: kanban
description: Manage KANBAN.md - read to extract tasks/ideas, update to modify statuses or add/remove tasks.
disable-model-invocation: false
---

# Skill: Kanban

## Description

Unified skill to read and update KANBAN.md file.

## Usage

```
/kanban <action>
```

Actions:
- `read` - Parse KANBAN.md and display structured summary
- `update` - Modify task statuses, add/remove tasks

## Action: read

Read and parse KANBAN.md to extract tasks, ideas, and their status.

### Execution

1. Read KANBAN.md file
2. Parse sections: 📝 Backlog, 🚧 In Progress, ✅ Done
3. Generate structured summary

### Output

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

Update KANBAN.md by modifying task statuses, adding, or removing tasks.

### Important: Worktree Context

**KANBAN.md must only be modified on the main branch.**

Before updating KANBAN.md, verify you are on main branch:
```bash
git branch --show-current
```

If NOT on main branch:
```
⚠️ Warning: KANBAN.md should only be modified on main branch
   Current branch: feat/my-feature

   To update KANBAN.md:
   1. Switch to main worktree: cd ../termaid
   2. Run /kanban update
   3. Commit KANBAN.md changes on main
   4. Return to feature worktree to continue work
```

If on main branch:
```
✅ Running from main branch - safe to update KANBAN.md
```

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

### Important Rules

- One idea = all tasks committed together
- Only delete after successful git commit
- After commit, delete all tasks from Done section (keep it empty)
- Use proper formatting: `- [ ] **[DATE] Emoji [TAG]** Description`

## Format Reference

See `.claude/rules/task_format.md` for complete format definitions.

Common tags: `✨ [FEAT]`, `🐛 [FIX]`, `♻️ [REFACTOR]`, `⚡ [PERF]`, `📝 [DOCS]`, `🎨 [STYLE]`, `✅ [TEST]`, `🔧 [CHORE]`

## Notes

- KANBAN.md is at project root
- Use `read` to understand current state
- Use `update` after task execution
- **Only modify KANBAN.md from main branch**