# Native Git Worktree Workflow

## Objective

This workflow defines how to use native git worktrees to work on multiple branches simultaneously with Claude Code.

**This workflow is MANDATORY for all task-based work.** Direct commits to main branch are not permitted.

## When to Use Worktrees

Use worktrees when:
- The user requests a new feature or fix that requires a Pull Request
- You need to switch between multiple branches without losing local changes
- You are working on isolated changes that should be reviewed separately
- **ALL task-based work must use worktrees** (no exceptions)

## Worktree Directory Structure

```
/home/openhoat/work/
├── termaid/              # Main worktree (main branch)
├── termaid-<feature>/    # Feature worktrees (e.g., termaid-conversation-import)
```

**Important**: Worktrees are created at `/home/openhoat/work/termaid-<name>`, NOT in `.claude/worktrees/`.

## Worktree Naming Convention

- Format: `termaid-<branch-name>` (kebab-case)
- Branch prefix: `feat/` for features, `fix/` for bugfixes
- Examples:
  - `feat/dependabot-config` → `termaid-dependabot`
  - `feat/add-dark-mode` → `termaid-add-dark-mode`
  - `fix/login-bug` → `termaid-login-bug`

## MANDATORY Workflow Steps

### 1. Start a New Task

**ALWAYS use `/start-task` from main worktree:**

```bash
# From main worktree
/start-task
```

This will:
1. Select idea from backlog
2. Update KANBAN.md on main branch
3. Commit KANBAN.md on main
4. Create branch (e.g., `feat/conversation-import`)
5. Create worktree at `../termaid-<name>`
6. Return to main branch

**Then manually switch to the worktree:**
```bash
cd ../termaid-<name>
```

### 2. Work in the Worktree

After manually switching to the feature worktree:

```bash
# Already in the worktree
# Make changes, commit, test
npm run validate
```

### 3. Complete the Task

**ALWAYS use `/complete-task` from feature worktree:**

```bash
# From feature worktree
/complete-task
```

This will:
1. Validate code
2. Commit changes
3. Push to origin
4. Create Pull Request

### 4. Cleanup After Merge

After PR merge:

```bash
# From main worktree
git pull origin main
/cleanup-worktree <name>
```

## Worktree Management Commands

```bash
# List all worktrees
git worktree list

# Create a new worktree
git worktree add ../termaid-<name> <branch-name>

# Remove a worktree (preserves branch)
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
3. **Always create a PR**: Never commit directly to main
4. **Clean up after merge**: Remove worktrees after PRs are merged
5. **KANBAN.md on main only**: Never modify KANBAN.md in a feature worktree
6. **Manual worktree switch**: After `/start-task`, manually switch with `cd`

## Kanban Integration

The KANBAN.md file must always be modified on the `main` branch before creating a worktree. This ensures that task tracking is consistent across all worktrees.

### Mandatory Workflow Sequence

```
┌─────────────────────────────────────┐
│  STEP 1: On main worktree           │
│  - Run /start-task                  │
│  - Select idea from backlog         │
│  - Update KANBAN.md                  │
│  - Commit KANBAN.md on main          │
│  - Create branch                     │
│  - Create worktree                   │
│  - Return to main                    │
└──────────────┬──────────────────────┘
               │
               │ Manual switch
               ▼
┌─────────────────────────────────────┐
│  STEP 2: In feature worktree        │
│  - cd ../termaid-<name>              │
│  - Implement changes                 │
│  - Run /complete-task                │
│  - (validates, commits, pushes, PR) │
└──────────────┬──────────────────────┘
               │
               │ PR merged
               ▼
┌─────────────────────────────────────┐
│  STEP 3: On main worktree           │
│  - Pull: git pull origin main       │
│  - Run /cleanup-worktree            │
└─────────────────────────────────────┘
```

### Skills Integration

| Skill | Location | Purpose |
|-------|----------|---------|
| `/start-task` | **Main worktree only** | Start Kanban task: update KANBAN.md, create branch and worktree, stay on main |
| `/complete-task` | **Feature worktree only** | Complete work: validate, commit, push, PR |
| `/push-and-pr` | **Feature worktree only** | Push branch and create PR only |
| `/cleanup-worktree` | **Main worktree only** | Remove worktree and branch after PR merge |

### Workflow Commands

#### Start a new task (from main worktree)

```bash
# Use the skill (RECOMMENDED)
/start-task
# Stays on main - manually switch to worktree
cd ../termaid-<name>
```

#### Complete work (from feature worktree)

```bash
# Use the skill (REQUIRED)
/complete-task
```

#### After PR merge (from main worktree)

```bash
# Use the skill
/cleanup-worktree <name>
```

### Important Rules

1. **KANBAN.md on main only**: Never modify KANBAN.md in a feature worktree
2. **Commit before worktree**: Always commit KANBAN.md changes before creating worktree
3. **One idea per worktree**: Each worktree corresponds to exactly one Kanban task
4. **Clean separation**: Task tracking happens on main, implementation in worktree
5. **No direct commits to main**: All changes must go through PR workflow
6. **Manual switch required**: After `/start-task`, manually switch with `cd`

## Example Workflow

User asks: "Add dark mode support"

1. From main worktree:
   ```bash
   /start-task
   # Select the idea from backlog
   # Creates worktree, returns to main
   cd ../termaid-dark-mode  # Manual switch
   ```

2. Work in the worktree:
   ```bash
   # Already in termaid-dark-mode worktree
   # Make changes...
   ```

3. Complete from feature worktree:
   ```bash
   /complete-task
   ```

4. After merge, from main worktree:
   ```bash
   cd ../termaid
   git pull origin main
   /cleanup-worktree dark-mode
   ```

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

## Prohibited Actions

- **Direct commits to main branch**: Always use PR workflow
- **Modifying KANBAN.md from feature worktree**: Update from main only
- **Using EnterWorktree tool**: Creates worktrees in wrong location, use `git worktree add` instead