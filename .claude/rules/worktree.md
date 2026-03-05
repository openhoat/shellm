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
├── termaid-<feature>/    # Feature worktrees
```

## Naming Convention

- Format: `termaid-<branch-name>` (kebab-case)
- Examples: `feat/dark-mode` → `termaid-dark-mode`

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
- Create branch and worktree

### 2. Work in Feature Worktree

```bash
cd ../termaid-my-feature
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
cd ../termaid
git pull origin main
/cleanup-worktree <name>
```

## Management Commands

```bash
git worktree list              # List all worktrees
git worktree add ../<name> <branch>  # Create worktree
git worktree remove ../<name>  # Remove worktree
git worktree prune             # Clean stale references
```

## Skills Integration

| Skill | Location | Purpose |
|-------|----------|---------|
| `/start-task` | **Main worktree only** | Start Kanban task: update KANBAN.md, create worktree |
| `/complete-task` | **Feature worktree only** | Complete work: validate, commit, push, PR |
| `/push-and-pr` | **Feature worktree only** | Push and create PR only |
| `/cleanup-worktree` | **Main worktree only** | Remove worktree after merge |

## Key Principles

1. **One worktree per feature/PR**: Each worktree = one branch = one PR
2. **Main worktree stays clean**: Only view code, never commit
3. **Always create PR**: Never commit directly to main
4. **KANBAN.md on main only**: Never modify in feature worktree
5. **No direct commits to main**: All changes must go through PR workflow

## Workflow Diagram

```
STEP 1 (main): Run /start-task → Update KANBAN.md → Commit → Create worktree
STEP 2 (feature): Implement → Validate → Run /complete-task
STEP 3 (main): Pull → Run /cleanup-worktree
```

## Deprecated Workflows

**The following approaches are deprecated:**

- `/kanban-execute` - Use `/start-task` instead
- Direct commits to main branch - Always use PR workflow
- Modifying KANBAN.md from feature worktree - Update from main only

## Enforcement

Before running any commit-related skill:
1. Check current worktree: `git branch --show-current`
2. If on `main`, abort and instruct user to use `/start-task`
3. If on feature branch, proceed normally

This enforcement is implemented in:
- `/workflow-commit` - Aborts if in main worktree
- `/complete-task` - Aborts if in main worktree
- `/kanban update` - Warns if not on main branch