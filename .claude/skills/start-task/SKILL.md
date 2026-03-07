---
name: start-task
description: Start and complete a kanban task end-to-end. Selects idea from backlog, updates KANBAN.md, creates worktree, implements the feature, validates, commits, pushes, and creates PR. Complete automation from backlog to PR.
disable-model-invocation: false
---

# Skill: Start Task

Start and complete a Kanban task from backlog to Pull Request with full automation.

## Purpose

- Select task from KANBAN.md backlog
- Update KANBAN.md and commit on main
- Create git native worktree for isolated development
- **Implement the complete feature/fix**
- **Validate code quality**
- **Commit, push, and create Pull Request**

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
10. **Implement the feature**: Analyze the task description and implement the complete functionality in the worktree directory (using absolute paths like `/home/openhoat/work/termaid-<name>/...`)
11. **Validate**: Run `npm run validate` in the worktree to ensure code quality
12. **Complete task**: Run `/complete-task` to commit, push, and create PR

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

🔨 Implementing feature...
   - Reading codebase structure
   - Planning implementation
   - Creating/modifying files
   - Running validation

✅ Task Completed
   📋 Refactor conversation import feature

📋 Summary:
   - Files: src/services/importService.ts, src/components/ImportDialog.tsx
   - Validation: ✅ Passed
   - Commit: def456
   - PR: https://github.com/user/termaid/pull/42

🎉 Ready for review!
```

## Error Handling

- **Not in main**: Abort with error message
- **No backlog ideas**: Suggest `/kanban-add-idea`
- **Worktree exists**: Suggest cleanup first

## Integration

- **This skill**: Handles complete automation from backlog to PR
- **After PR merge**: Use `/cleanup-worktree` in main worktree to cleanup and update CHANGELOG
- **Manual mode**: If preferred, can stop after worktree creation and implement manually

## Important Rules

- **KANBAN.md on main only**: Always commit before creating worktree
- **Git native worktrees**: Use `git worktree add ../termaid-<name>`
- **Manual navigation**: User must `cd` to worktree directory
- **One task per worktree**: Each worktree = one branch = one PR
