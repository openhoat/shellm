# Workflow: Start Task

Start a Kanban task by selecting an idea from the backlog, updating KANBAN.md on main branch, and creating a worktree.

## Purpose

- Select task from KANBAN.md backlog
- Update KANBAN.md and commit on main
- Create git native worktree for isolated development
- Prepare for feature implementation

## Prerequisites

- Must be in the main worktree (branch: main)
- KANBAN.md must exist at project root
- Backlog must have at least one idea

## Execution Steps

### 1. Verify worktree context

Check we're in main worktree:
```bash
git worktree list
```

If not in main, error and instruct user to switch.

### 2. Read KANBAN.md

Parse ideas from "## 📝 Backlog" section.

### 3. Display backlog ideas

Show numbered list of ideas with format:
```
#1 [ARCHITECTURE] Description (P2)
#2 [UX] Description (P3)
```

Ask user to select an idea number.

### 4. Generate branch and worktree names

Convert idea description to kebab-case:
- Category → branch prefix (feat/, fix/, refactor/, test/, chore/)
- Description → kebab-case name
- Examples:
  - `[ARCHITECTURE]` + "Refactor import" → `feat/refactor-import` + `termaid-refactor-import`
  - `[UX]` + "Add shortcuts" → `feat/add-shortcuts` + `termaid-add-shortcuts`

### 5. Update KANBAN.md

Move idea from Backlog to In Progress:
- Remove line from Backlog
- Add task to In Progress with appropriate tag (FEAT/FIX/etc.)
- Format: `- [ ] **[TAG]** Description`

Use `replace_in_file` to update.

### 6. Commit KANBAN.md on main

```bash
git add KANBAN.md
git commit -m "chore(kanban): start task - <description>"
```

### 7. Create branch and worktree

```bash
git checkout -b <branch-name>
git worktree add ../termaid-<worktree-name> <branch-name>
git checkout main
```

### 8. Copy local files to new worktree

Copy files listed in `.worktree-sync` from main worktree to the new worktree:

```bash
if [ -f ".worktree-sync" ]; then
  while IFS= read -r file; do
    # Skip comments and empty lines
    [[ "$file" =~ ^#.*$ ]] && continue
    [[ -z "$file" ]] && continue
    
    if [ -f "$file" ]; then
      # Create directory structure if needed
      mkdir -p "../termaid-<worktree-name>/$(dirname "$file")"
      cp "$file" "../termaid-<worktree-name>/$file"
      echo "✓ Copied $file to worktree"
    fi
  done < .worktree-sync
fi
```

### 9. Inform user to navigate

Display success message and instruct user to manually navigate:
```
cd ../termaid-<worktree-name>
```

## Important Rules

- **KANBAN.md on main only**: Always commit before creating worktree
- **Git native worktrees**: Use `git worktree add ../termaid-<name>`
- **Manual navigation**: User must `cd` to worktree directory
- **One task per worktree**: Each worktree = one branch = one PR
