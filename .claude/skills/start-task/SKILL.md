---
name: start-task
description: Start a kanban task by creating a worktree. Selects idea from backlog, updates KANBAN.md on main, creates branch and worktree. Use to begin work on a backlog item.
disable-model-invocation: false
---

# Skill: Start Task

Start a Kanban task by selecting an idea from the backlog, updating KANBAN.md on main branch, and creating a worktree for isolated work.

## Purpose

- Select task from KANBAN.md backlog
- Update KANBAN.md and commit on main
- Create git native worktree for isolated development
- Prepare for feature implementation

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

- `idea-number` (optional): The number of the idea to start from backlog

## Steps

1. **Verify context**: Check we're in main worktree with `git branch --show-current`
2. **Read KANBAN.md**: Parse backlog ideas from "## 📝 Backlog" section
3. **Display backlog**: Show numbered list if no idea-number provided
4. **Get selection**: Use idea-number argument or ask user
5. **Parse idea**: Extract category, description, and priority
6. **Generate names**: Create branch name (feat/fix/etc.) and worktree name (termaid-<name>)
7. **Update KANBAN.md**: Move idea from Backlog to In Progress with appropriate task tag
8. **Commit KANBAN**: `git commit -m "chore(kanban): start task - <description>"`
9. **Create worktree**:
   ```bash
   git checkout -b <branch-name>
   git worktree add ../termaid-<name> <branch-name>
   git checkout main
   ```
10. **Inform user**: Display success and instruct to navigate with `cd ../termaid-<name>`

## Example

```
/start-task

Backlog Ideas:
#1 [ARCHITECTURE] Refactor conversation import feature (P2)
#2 [UX] Add keyboard shortcuts (P3)

Enter number: 1

✅ Task Started
   📋 Refactor conversation import feature

📋 Kanban Updated:
   - Moved to In Progress
   - Commit: abc123

📁 Worktree Created: /home/openhoat/work/termaid-conversation-import
   Branch: feat/conversation-import

📋 Next Step:
   cd ../termaid-conversation-import
```

## Error Handling

- **Not in main**: Abort with error message
- **No backlog ideas**: Suggest `/kanban-add-idea`
- **Worktree exists**: Suggest cleanup first

## Integration

- **Next**: User navigates to worktree manually
- **To complete**: Use `/complete-task` in feature worktree
- **After PR merge**: Use `/cleanup-worktree` in main worktree

## Important Rules

- **KANBAN.md on main only**: Always commit before creating worktree
- **Git native worktrees**: Use `git worktree add ../termaid-<name>`
- **Manual navigation**: User must `cd` to worktree directory
- **One task per worktree**: Each worktree = one branch = one PR
