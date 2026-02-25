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
