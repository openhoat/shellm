---
name: kanban-execute
description: Select and execute ideas from the kanban backlog interactively. Use to work on backlog items.
disable-model-invocation: false
---

# Skill: Execute Kanban Ideas

⚠️ **DEPRECATED**: This skill is deprecated. Use the worktree workflow instead:
- Use `/start-task` to start a task with proper worktree isolation
- Use `/complete-task` to complete work in a feature worktree

This skill remains available for quick fixes and emergency use only.

---

Select ideas from the backlog and execute them interactively.

## Deprecated - Use Worktree Workflow Instead

**This skill is deprecated.** For proper task isolation and PR workflow, use:

```
# From main worktree
/start-task

# Switch to worktree
cd ../termaid-<name>

# In feature worktree
/complete-task

# After merge, return to main
cd ../termaid
/cleanup-worktree <name>
```

### Why Worktrees Are Required

- **Isolation**: Each task gets its own clean environment
- **PR Workflow**: All changes go through proper review process
- **KANBAN Management**: KANBAN.md updates are tracked on main branch only
- **Clean History**: No conflicts between parallel tasks

### When to Use Each Skill

| Skill | Location | Status |
|-------|----------|--------|
| `/start-task` | Main worktree | **Recommended** - Start task with worktree |
| `/complete-task` | Feature worktree | **Recommended** - Complete work |
| `/kanban-execute` | Any worktree | **Deprecated** - Use `/start-task` instead |
| `/cleanup-worktree` | Main worktree | **Required** - Clean up after PR merge |

---

## Execution Steps (For Reference Only)

### 1. Read KANBAN.md

Read the KANBAN.md file at the project root.

### 2. List backlog ideas

Display all unchecked ideas from "## 📝 Backlog" with numbers:

```
📋 **Backlog Ideas:**

**#1** [P1] 🎨 [UX] Add keyboard shortcuts support
**#2** [P2] 🌍 [I18N] Create GitHub Pages documentation
**#3** [P3] ⚙️ [CONFIG] Build application executables

Type the number(s) of the idea(s) you want me to execute (e.g., "1" or "1,3" or "all"):
```

### 3. Get user selection

Accept:
- Single number: `1`
- Multiple numbers: `1,3,5` or `1 3 5`
- Range: `1-3`
- All: `all` or `*`

### 4. For each selected idea

#### 4a. Ask for task breakdown

Show the selected idea and ask:
```
📝 **Selected Idea #1:**
[P2] 🎨 [UX] Add keyboard shortcuts support

How would you like to break this down into tasks?
- Describe the tasks yourself
- Let me suggest tasks
- Execute as a single task
```

#### 4b. Create In Progress section

Create in "## 🚧 In Progress":
```markdown
### [DD/MM/YYYY HH:mm:ss] Priority CategoryEmoji [CATEGORY] Idea description
- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Task 1
- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Task 2
```

#### 4c. Delete idea from Backlog

Remove the idea line completely from Backlog (no checked trace).

#### 4d. Execute tasks interactively

For each task:
1. Display current task
2. Ask for confirmation: `Proceed? (yes/no/skip)`
3. Execute the task
4. Mark as completed: change `- [ ]` to `- [x]`
5. If failed: ask user whether to continue or abort

#### 4e. Move completed tasks to Done

After all tasks are completed, move them to the "## ✅ Done" section:
1. Add each completed task as `- [x]` entry at the top of the Done section
2. Delete the idea section from In Progress

#### 4f. Create Git commit

When all tasks completed and moved to Done:
1. Generate commit message
2. Stage files: `git add <files>`
3. Commit: `git commit -m "message"`

#### 4g. Clean up Done section

After a successful commit:
1. Delete all committed tasks from the "## ✅ Done" section
2. The Done section should be empty after cleanup (completed tasks are tracked in git history and CHANGELOG.md)

### 6. Regenerate CHANGELOG.md

Run: `npm run changelog`

### 7. Final report

Display summary:
```
📊 **Execution Summary:**

✅ **#1** Add keyboard shortcuts support
   - 3 tasks completed
   - Commit: abc1234

Total: N ideas completed, N tasks executed, N commits created
```

## Important Rules

- Always ask for confirmation before executing each task
- One idea = one commit
- Delete from Backlog only after In Progress section created
- Move completed tasks to Done after execution
- Delete from In Progress only after tasks are moved to Done and commit is successful
- After successful commit, delete all committed tasks from Done section (keep Done section empty)
- If task fails, ask whether to continue or abort

## Task Tags

- `✨ [FEAT]`: New feature
- `🐛 [FIX]`: Bug fix
- `♻️ [REFACTOR]`: Refactoring
- `⚡ [PERF]`: Performance
- `📝 [DOCS]`: Documentation
- `🎨 [STYLE]`: Style
- `✅ [TEST]`: Tests
- `🔧 [CHORE]`: Configuration