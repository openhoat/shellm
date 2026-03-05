# Skill: List Worktrees

List all git worktrees and their branches.

## Purpose

Display all worktrees with their locations, branches, and commit hashes.

## Usage

```
/list-worktrees
```

## Arguments

None.

## Execution Steps

### 1. List worktrees

```bash
git worktree list
```

### 2. Parse and display results

Format the output for better readability:

```
📁 Worktrees:

  📂 /home/openhoat/work/termaid
     └── main (abc123)

  📂 /home/openhoat/work/termaid-conversation-import
     └── feat/conversation-import (def456)

  📂 /home/openhoat/work/termaid-dark-mode
     └── feat/dark-mode (ghi789)
```

### 3. Provide context

Indicate which worktree is the main one and which are feature worktrees.

## Example

```
User: /list-worktrees

📁 Worktrees:

  📂 /home/openhoat/work/termaid (main)
     └── main (a19ae04)

  📂 /home/openhoat/work/termaid-conversation-import
     └── feat/conversation-import (44ae0ac)

💡 Tip: Use cd ../termaid-<name> to switch between worktrees
```

## Related Skills

- `/start-task` - Create a new worktree
- `/cleanup-worktree` - Remove a worktree
- `/complete-task` - Complete work in current worktree