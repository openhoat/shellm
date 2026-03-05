# Native Worktree Workflow

## Objective

Defines the workflow for using git native worktrees to work on multiple branches simultaneously.

## When to Use Worktrees

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

## Workflow

### 1. Start New Task (main worktree)

```bash
# Update KANBAN.md first, then:
git branch feat/my-feature main
git worktree add ../termaid-my-feature feat/my-feature
```

### 2. Work in Feature Worktree

```bash
cd ../termaid-my-feature
# Implement, validate, commit
npm run validate
/workflow-commit
```

### 3. Create Pull Request

```bash
git push -u origin feat/my-feature
gh pr create --title "feat: description" --body "..."
```

### 4. Cleanup After Merge (main worktree)

```bash
git pull origin main
git worktree remove ../termaid-my-feature
git branch -d feat/my-feature
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
| `/start-task` | Main worktree | Update KANBAN.md, create worktree |
| `/complete-task` | Feature worktree | Validate, commit, push, create PR |
| `/push-and-pr` | Feature worktree | Push and create PR only |
| `/cleanup-worktree` | Main worktree | Remove worktree after merge |

## Key Principles

1. **One worktree per feature/PR**: Each worktree = one branch = one PR
2. **Main worktree stays clean**: Only view code, never commit
3. **Always create PR**: Never commit directly to main
4. **KANBAN.md on main only**: Never modify in feature worktree

## Workflow Diagram

```
STEP 1 (main): Update KANBAN.md → Commit KANBAN.md
STEP 2 (main): Create branch → Create worktree
STEP 3 (feature): Implement → Validate → Commit
STEP 4 (feature): Push → Create PR
STEP 5 (main): Pull → Remove worktree → Delete branch
```
