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
- **Automatic continuation in the worktree**

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

### 6. Generate worktree name

Convert idea description to kebab-case worktree name:
- Remove task ID and priority
- Extract key words from description
- Prefix with `termaid-`
- Examples:
  - "Add keyboard shortcuts" → `termaid-keyboard-shortcuts`
  - "Fix login bug" → `termaid-login-bug`
  - "Implement conversation import" → `termaid-conversation-import`

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
- [ ] **[05/03/2026 10:30:00] ✨ [FEAT]** Refactor conversation import feature
```

Use Edit tool to:
1. Remove the idea line from "## 📝 Backlog" section
2. Add the idea as a section under "## 🚧 In Progress"

### 8. Commit KANBAN.md on main

```bash
git add KANBAN.md
git commit -m "chore(kanban): start task #<task-id> - <description>"
```

### 9. Enter worktree automatically

Use the `EnterWorktree` tool to create branch and worktree in one step:

```
EnterWorktree with name: termaid-<worktree-name>
```

This will:
- Create the worktree directory at `.claude/worktrees/<name>`
- Create a new branch automatically
- Switch the current session into the new worktree
- Continue working directly in the isolated environment

**Note**: Do NOT create the branch manually before EnterWorktree. The tool creates its own branch.

### 10. Continue implementation

Continue working immediately in the feature worktree to implement the selected idea.

### 11. Display success message

```
✅ Task Started: #arch-import
   📋 Implement conversation import feature

📋 Kanban Updated:
   - Moved idea from Backlog to In Progress
   - Commit: abc123

📁 Worktree Entered: .claude/worktrees/termaid-conversation-import

✅ Ready to work! You are now in the feature worktree.
```

## Error Handling

- **Not in main worktree**: Abort and instruct user to switch to main
- **No ideas in backlog**: Inform user and suggest `/kanban-add-idea`
- **Worktree directory exists**: Abort and suggest cleanup

## Integration with Other Skills

- **After this**: Continue working directly in the worktree (automatic switch)
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
│  EnterWorktree                      │
│  - Create worktree                  │
│  - Create branch automatically      │
│  - Switch session to worktree       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  END: Ready to work in worktree     │
│  Continue implementation            │
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
   📋 Implement conversation import feature

📋 Kanban Updated:
   - Moved idea from Backlog to In Progress
   - Commit: abc123

📁 Worktree Entered: .claude/worktrees/termaid-conversation-import

✅ Ready to work! You are now in the feature worktree.
```

## Important Rules

- **Always on main**: KANBAN.md modifications must be committed on main branch
- **One idea per worktree**: Each worktree corresponds to one task/PR
- **No manual branch creation**: EnterWorktree creates the branch automatically
- **Commit before worktree**: Always commit KANBAN.md before calling EnterWorktree
- **Automatic continuation**: After worktree creation, continue working immediately in the new worktree