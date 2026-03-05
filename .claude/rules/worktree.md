# Native Worktree Workflow

## Objective

Defines the workflow for using git native worktrees to work on multiple branches simultaneously.

**This workflow is MANDATORY for all task-based work.** Direct commits to main branch are not permitted.

## When to Use Worktrees

**ALWAYS use worktrees for task-based work:**
- Starting a new feature/fix that will require a Pull Request
- Needing to switch between branches without losing local changes
- Working on isolated changes for separate review

## Directory Structure

```
/home/openhoat/work/
├── termaid/              # Main worktree (main branch)
├── termaid-<feature>/    # Feature worktrees (e.g., termaid-conversation-import)
```

**Important**: Worktrees are created at `/home/openhoat/work/termaid-<feature>`, NOT in `.claude/worktrees/`.

## Naming Convention

- Format: `termaid-<branch-name>` (kebab-case)
- Branch prefix: `feat/` for features, `fix/` for bugfixes
- Examples:
  - Branch `feat/dark-mode` → Worktree `termaid-dark-mode`
  - Branch `fix/login-bug` → Worktree `termaid-login-bug`

## Mandatory Workflow

### 1. Start New Task (main worktree)

**ALWAYS use `/start-task` from main worktree:**

```bash
# From main worktree
/start-task
```

This will:
- Select idea from backlog
- Update KANBAN.md on main
- Commit KANBAN.md on main
- Create branch (e.g., `feat/conversation-import`)
- Create worktree at `../termaid-<name>`
- Return to main branch

**Then manually switch to the worktree:**
```bash
cd ../termaid-<name>
```

### 2. Work in Feature Worktree

After switching to the feature worktree:

```bash
# Already in the worktree
# Implement, validate, commit
npm run validate
```

### 3. Complete Task (feature worktree)

**ALWAYS use `/complete-task` from feature worktree:**

```bash
# From feature worktree
/complete-task
```

This will:
- Validate code
- Commit changes
- Push to origin
- Create Pull Request

### 4. Cleanup After Merge (main worktree)

```bash
cd /home/openhoat/work/termaid
git pull origin main
/cleanup-worktree <name>
```

## Management Commands

```bash
git worktree list                              # List all worktrees
git worktree add ../termaid-<name> <branch>    # Create worktree
git worktree remove ../termaid-<name>           # Remove worktree
git worktree prune                              # Clean stale references
```

## Skills Integration

| Skill | Location | Purpose |
|-------|----------|---------|
| `/start-task` | **Main worktree only** | Start Kanban task: update KANBAN.md, create branch and worktree, stay on main |
| `/complete-task` | **Feature worktree only** | Complete work: validate, commit, push, PR |
| `/push-and-pr` | **Feature worktree only** | Push and create PR only |
| `/cleanup-worktree` | **Main worktree only** | Remove worktree after merge |

## Key Principles

1. **One worktree per feature/PR**: Each worktree = one branch = one PR
2. **Main worktree stays clean**: Only view code, never commit
3. **Always create PR**: Never commit directly to main
4. **KANBAN.md on main only**: Never modify in feature worktree
5. **No direct commits to main**: All changes must go through PR workflow
6. **Manual worktree switch**: After `/start-task`, manually switch with `cd`

## Workflow Diagram

```
STEP 1 (main): Run /start-task → Update KANBAN.md → Commit → Create branch → Create worktree → Return to main
STEP 2 (main): Manually switch: cd ../termaid-<name>
STEP 3 (feature): Implement → Validate → Run /complete-task
STEP 4 (main): Pull → Run /cleanup-worktree
```

## Prohibited Actions

- **Direct commits to main branch**: Always use PR workflow
- **Modifying KANBAN.md from feature worktree**: Update from main only
- **Using EnterWorktree tool**: Creates worktrees in wrong location, use `git worktree add` instead

## Enforcement

Before running any commit-related skill:
1. Check current worktree: `git branch --show-current`
2. If on `main`, abort and instruct user to use `/start-task`
3. If on feature branch, proceed normally

This enforcement is implemented in:
- `/workflow-commit` - Aborts if in main worktree
- `/complete-task` - Aborts if in main worktree
- `/kanban update` - Warns if not on main branch

## Creating Worktrees Manually

If you need to create a worktree manually (without `/start-task`):

```bash
# 1. Create the branch
git checkout -b feat/<feature-name>

# 2. Create the worktree
git worktree add ../termaid-<feature-name> feat/<feature-name>

# 3. Return to main
git checkout main

# 4. Switch to worktree
cd ../termaid-<feature-name>
```

## Removing Worktrees Manually

```bash
# 1. Switch to main worktree
cd /home/openhoat/work/termaid

# 2. Remove the worktree
git worktree remove ../termaid-<name>

# 3. Delete the branch (optional, if merged)
git branch -d <branch-name>

# 4. Clean up stale references
git worktree prune
```