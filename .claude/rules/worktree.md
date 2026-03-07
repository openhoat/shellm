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

### 1. Unified Task Lifecycle (Fully Automated)

The entire task lifecycle from backlog to Pull Request is now **fully automated** with `/start-task`.

#### Phase 1: Start & Implement (on `main`)
**Run `/start-task` from main worktree:**
1. Select idea from backlog.
2. Update `KANBAN.md` (move to "In Progress").
3. **Commit `KANBAN.md` on `main`** (`chore(kanban): start task - ...`).
4. Create branch and worktree with `git worktree add ../termaid-<name> <branch>`.
5. **Automatically implement the feature** based on task description.
6. **Validate code** with `npm run validate`.
7. **Commit code** (`feat: ...` / `fix: ...`).
8. **Push and create PR** automatically.
9. **DO NOT generate local CHANGELOG.md** in the feature branch.

**Note**: The skill now handles everything automatically. Manual implementation is optional if preferred.

#### Phase 2: Completion & Cleanup (on `main`)
**Run `/cleanup-worktree <name>` from main worktree after PR merge:**
1. Switch back to `main`.
2. **Pull remote changes**: `git pull origin main`.
3. **Post-merge Maintenance**:
   - Update `KANBAN.md` (move to "Done", then cleanup).
   - **Generate global `CHANGELOG.md`** using `npm run changelog`.
   - **Commit and Push to `main`** (`chore(release): update kanban and changelog`).
4. Remove the worktree and branch.

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
| `/start-task` | **Main worktree only** | **Full automation**: Update/Commit Kanban, Create worktree, Implement feature, Validate, Commit, Push, Create PR |
| `/complete-task` | **Feature worktree only** | *(Optional)* Complete implementation: Validate, Commit Code, Push, PR (if implementing manually) |
| `/push-and-pr` | **Feature worktree only** | *(Optional)* Push branch and create PR only |
| `/cleanup-worktree` | **Main worktree only** | Post-merge: Pull, **Update Kanban & Changelog**, Commit/Push Main, Cleanup |

## Key Principles

1. **One worktree per feature/PR**: Each worktree = one branch = one PR
2. **Main worktree stays clean**: Only view code, never commit
3. **Always create PR**: Never commit directly to main
4. **KANBAN.md on main only**: Never modify in feature worktree
5. **No direct commits to main**: All changes must go through PR workflow
6. **Full automation**: `/start-task` now implements the complete feature from backlog to PR

## Workflow Diagram

```
PHASE 1 (main): /start-task → Update KANBAN.md → Commit → Create worktree & branch → Auto-implement → Validate → Commit → Push → Create PR
PHASE 2 (main): Pull → /cleanup-worktree (Update Kanban/Changelog, Commit/Push Main)
```

## Prohibited Actions

- **Direct commits to main branch**: Always use PR workflow
- **Modifying KANBAN.md from feature worktree**: Update from main only
- **Using EnterWorktree tool**: NEVER use EnterWorktree - always use native `git worktree add` commands
- **Creating worktrees in .claude/worktrees/**: Worktrees must be created at `/home/openhoat/work/termaid-<name>`

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