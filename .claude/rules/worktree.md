# Native Worktree Workflow

## Objective

This rule defines the workflow for using git native worktrees to work on multiple branches simultaneously across different Claude Code sessions.

## When to Use Worktrees

Use native worktrees when:
- Starting a new feature or task that will require a Pull Request
- Needing to switch between multiple branches without losing local changes
- Working on isolated changes that should be reviewed separately

## Worktree Directory Structure

```
/home/openhoat/work/
├── termaid/              # Main worktree (main branch)
├── termaid-<feature>/    # Feature worktrees
```

## Worktree Naming Convention

- Format: `termaid-<branch-name>`
- Branch names should be kebab-case
- Examples:
  - `feat/dependabot-config` → `termaid-dependabot`
  - `feat/add-dark-mode` → `termaid-add-dark-mode`
  - `fix/login-bug` → `termaid-login-bug`

## Workflow Steps

### 1. Start New Task

When user requests a new feature or fix:

1. Determine the branch name (kebab-case from task description)
2. Create a new branch from main
3. Create a worktree for that branch
4. Checkout the new worktree

```bash
# Example: Starting a new feature
git branch feat/my-new-feature main
git worktree add ../termaid-my-new-feature feat/my-new-feature
cd ../termaid-my-new-feature
```

### 2. Work in Worktree

```bash
cd ../termaid-<feature>
# Make changes, commit, test
```

### 3. Create Pull Request

When changes are ready:

```bash
cd ../termaid-<feature>
git push -u origin feat/my-new-feature
gh pr create --title "feat: description" --body "..."
```

### 4. Cleanup After Merge

After PR is merged:

```bash
git worktree remove ../termaid-<feature>
git branch -d feat/my-new-feature
```

## Worktree Management Commands

```bash
# List all worktrees
git worktree list

# Create new worktree
git worktree add ../termaid-<name> <branch-name>

# Remove worktree (preserves branch)
git worktree remove ../termaid-<name>

# Prune stale worktree references
git worktree prune
```

## Integration with Other Rules

- Follow **Language Rule**: All commits and PRs in English
- Follow **Commit Messages Rule**: Conventional Commits format
- Follow **Quality Check Rule**: Run validation before committing
- Follow **Log Changes Rule**: Update CHANGELOG.md after changes

## Key Principles

1. **One worktree per feature/PR**: Each worktree corresponds to one branch and one PR
2. **Main worktree stays clean**: Only use main worktree for looking at code, not for making changes
3. **Always create PR**: Never commit directly to main
4. **Clean up after merge**: Remove worktrees after PRs are merged

## Kanban Integration

The KANBAN.md file must always be modified on the `main` branch before creating a worktree. This ensures task tracking is consistent across all worktrees.

### Mandatory Workflow Sequence

```
┌─────────────────────────────────────┐
│  STEP 1: On main worktree           │
│  - Select idea from backlog         │
│  - Update KANBAN.md                 │
│  - Commit KANBAN.md on main         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  STEP 2: On main worktree           │
│  - Create branch: git branch        │
│  - Create worktree: git worktree    │
└──────────────┬──────────────────────┘
               │
               │ Switch to worktree
               ▼
┌─────────────────────────────────────┐
│  STEP 3: In feature worktree        │
│  - Implement changes                │
│  - Validate: npm run validate       │
│  - Commit: /workflow-commit         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  STEP 4: In feature worktree        │
│  - Push: git push -u origin         │
│  - Create PR: gh pr create          │
└──────────────┬──────────────────────┘
               │
               │ PR merged
               ▼
┌─────────────────────────────────────┐
│  STEP 5: On main worktree           │
│  - Pull: git pull origin main       │
│  - Cleanup worktree                 │
│  - Delete branch                    │
└─────────────────────────────────────┘
```

### Skills Integration

| Skill | Location | Purpose |
|-------|----------|---------|
| `/start-task` | Main worktree | Start Kanban task: update KANBAN.md, create worktree |
| `/complete-task` | Feature worktree | Complete work: validate, commit, push, create PR |
| `/push-and-pr` | Feature worktree | Push branch and create PR only |
| `/cleanup-worktree` | Main worktree | Remove worktree and branch after PR merge |

### Workflow Commands

#### Start a new task (from main worktree)

```bash
# Use the skill
/start-task

# Or manually:
# 1. Update KANBAN.md (move idea to In Progress)
# 2. Commit KANBAN.md on main
# 3. Create branch and worktree
git branch feat/my-feature main
git worktree add ../termaid-my-feature feat/my-feature
```

#### Complete work (from feature worktree)

```bash
# Use the skill (includes validation, commit, push, PR)
/complete-task

# Or step by step:
npm run validate
/workflow-commit
/push-and-pr
```

#### After PR merge (from main worktree)

```bash
# Use the skill
/cleanup-worktree <name>

# Or manually:
git pull origin main
git worktree remove ../termaid-<name>
git branch -d <branch-name>
```

### Important Rules

1. **KANBAN.md on main only**: Never modify KANBAN.md in a feature worktree
2. **Commit before worktree**: Always commit KANBAN.md changes before creating worktree
3. **One idea per worktree**: Each worktree corresponds to exactly one Kanban task
4. **Clean separation**: Task tracking happens on main, implementation in worktree

## Example Workflow

User asks: "Add dark mode support"

1. Create branch and worktree:
   ```bash
   git branch feat/add-dark-mode main
   git worktree add ../termaid-add-dark-mode feat/add-dark-mode
   ```

2. Work in the new worktree:
   ```bash
   cd ../termaid-add-dark-mode
   # Make changes...
   ```

3. Create PR when ready:
   ```bash
   git push -u origin feat/add-dark-mode
   gh pr create --title "feat: add dark mode support" --body "..."
   ```

4. After merge:
   ```bash
   git worktree remove ../termaid-add-dark-mode
   git branch -d feat/add-dark-mode
   ```
