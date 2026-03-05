---
name: start-task
description: Start a kanban task by creating a worktree. Selects idea from backlog, updates KANBAN.md on main, creates branch and worktree. Use to begin work on a backlog item.
disable-model-invocation: false
---

# Skill: Start Task

Start a Kanban task by selecting an idea from the backlog, updating KANBAN.md on main branch, and creating a worktree for isolated work.

## Purpose

This skill integrates the Kanban workflow with git worktrees to provide:
- Systematic task selection from backlog
- KANBAN.md updates committed on main branch
- Isolated worktrees for each feature/fix
- Clean separation between task tracking and implementation

## Prerequisites

- Must be in the main worktree (branch: main)
- KANBAN.md must exist at project root
- Backlog must have at least one idea

## Usage

```
/start-task
/start-task <idea-number>
```

## Arguments

- `idea-number` (optional): The number of the idea to start. If not provided, shows the backlog for selection.

## Execution Steps

### 1. Verify worktree context

Check that we are in the main worktree:
```bash
git worktree list
```

If not in main worktree, display error:
```
❌ Error: Must be in main worktree to start a task
   Current location: /path/to/termaid-<feature>
   Please switch to main worktree: cd /path/to/termaid
```

### 2. Read KANBAN.md

Read the KANBAN.md file at project root and parse ideas from "## 📝 Backlog" section.

### 3. Display backlog ideas

If no idea number provided, display numbered list:

```
📋 **Backlog Ideas:**

**#1** 🔴 P1 🏗️ [ARCHITECTURE] Refactor conversation import feature
**#2** 🟡 P2 🎨 [UX] Add keyboard shortcuts for quick actions
**#3** 🟢 P3 ✅ [TEST] Add unit tests for chat service

Enter the number of the idea to start (or 'cancel' to abort):
```

### 4. Get idea selection

If idea number provided as argument, use it directly.
Otherwise, use AskUserQuestion to get the selection.

### 5. Parse selected idea

Extract from the idea line:
- Priority (P1/P2/P3)
- Category (ARCHITECTURE, UX, TEST, etc.)
- Description
- Task ID (hash like `#arch-import`)

### 6. Generate branch name

Convert idea description to kebab-case branch name:
- Remove task ID and priority
- Extract key words from description
- Format: `feat/<description>` or `fix/<description>` based on category
- Examples:
  - "Add keyboard shortcuts" → `feat/keyboard-shortcuts`
  - "Fix login bug" → `fix/login-bug`
  - "Refactor conversation import" → `refactor/conversation-import`

Category to prefix mapping:
- `[ARCHITECTURE]` → `refactor/`
- `[UX]` → `feat/`
- `[TEST]` → `test/`
- `[SECURITY]` → `fix/`
- `[PERFORMANCE]` → `perf/`
- `[DEVOPS]` → `chore/`
- `[I18N]` → `feat/`
- `[DEPENDENCIES]` → `chore/`
- `[CONFIG]` → `chore/`

### 7. Update KANBAN.md

Move idea from Backlog to In Progress:

**Before (in Backlog):**
```markdown
## 📝 Backlog

- [ ] **#arch-import [05/03/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Refactor conversation import feature
```

**After (in In Progress):**
```markdown
## 🚧 In Progress

### [05/03/2026 10:30:00] 💡 [IDEA] #arch-import Refactor conversation import feature
- [ ] **[05/03/2026 10:30:00] ♻️ [REFACTOR]** Refactor conversation import feature
```

Use Edit tool to:
1. Remove the idea line from "## 📝 Backlog" section
2. Add the idea as a section under "## 🚧 In Progress"

### 8. Commit KANBAN.md on main

```bash
git add KANBAN.md
git commit -m "chore(kanban): start task #arch-import - Refactor conversation import feature"
```

### 9. Create branch and worktree

```bash
git branch <branch-name> main
git worktree add ../termaid-<worktree-name> <branch-name>
```

Worktree naming:
- Remove prefix (feat/, fix/, etc.) for worktree name
- `feat/keyboard-shortcuts` → `termaid-keyboard-shortcuts`
- `fix/login-bug` → `termaid-login-bug`

### 10. Display success message

```
✅ Task Started: #arch-import
   📋 Refactor conversation import feature

📋 Kanban Updated:
   - Moved idea from Backlog to In Progress
   - Commit: abc123

🌿 Branch Created: refactor/conversation-import
📁 Worktree Created: ../termaid-conversation-import

➡️ Next Steps:
   cd ../termaid-conversation-import
   # Then start Claude Code in this directory to continue work
```

## Error Handling

- **Not in main worktree**: Abort and instruct user to switch to main
- **No ideas in backlog**: Inform user and suggest `/kanban-add-idea`
- **Branch already exists**: Suggest different name or `/cleanup-worktree`
- **Worktree directory exists**: Abort and suggest cleanup

## Integration with Other Skills

- **After this**: User should work in the new worktree
- **To complete**: Use `/complete-task` in the feature worktree
- **To push and create PR**: Use `/push-and-pr` in the feature worktree
- **After PR merge**: Use `/cleanup-worktree` in the main worktree

## Flow Diagram

```
┌─────────────────────────────────────┐
│  START: In main worktree            │
│  Run /start-task                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Select idea from backlog           │
│  (or use argument)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Update KANBAN.md                   │
│  - Move idea to In Progress         │
│  - Commit on main                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Create branch & worktree           │
│  git branch <name> main             │
│  git worktree add ...                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  END: Display instructions          │
│  User switches to worktree          │
└─────────────────────────────────────┘
```

## Example

```
User: /start-task

📋 **Backlog Ideas:**

**#1** 🔴 P1 🏗️ [ARCHITECTURE] Refactor conversation import feature
**#2** 🟡 P2 🎨 [UX] Add keyboard shortcuts for quick actions
**#3** 🟢 P3 ✅ [TEST] Add unit tests for chat service

Enter the number of the idea to start: 1

✅ Task Started: #arch-import
   📋 Refactor conversation import feature

📋 Kanban Updated:
   - Moved idea from Backlog to In Progress
   - Commit: abc123

🌿 Branch Created: refactor/conversation-import
📁 Worktree Created: ../termaid-conversation-import

➡️ Next Steps:
   cd ../termaid-conversation-import
   # Then start Claude Code in this directory to continue work
```

## Important Rules

- **Always on main**: KANBAN.md modifications must be committed on main branch
- **One idea per worktree**: Each worktree corresponds to one task/PR
- **Clean branch names**: Use kebab-case, no special characters
- **Commit before worktree**: Always commit KANBAN.md before creating worktree