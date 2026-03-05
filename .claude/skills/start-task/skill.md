# Skill: Start Task

Start a Kanban task by selecting an idea from the backlog, updating KANBAN.md on main branch, and creating a worktree for isolated work.

## Purpose

This skill integrates the Kanban workflow with git worktrees to provide:
- Systematic task selection from backlog
- KANBAN.md updates committed on main branch
- Isolated worktrees for each feature/fix
- Clean separation between task tracking and implementation

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

- `idea-number` (optional): The number of the idea to start. If not provided, prompts user to select via AskUserQuestion.

## Execution Steps

### 1. Verify worktree context

Check that we are in the main worktree:
```bash
git worktree list
```

If not in main worktree, display error:
```
❌ Error: Must be in main worktree to start a task
   Current location: /path/to/termaid-<feature>
   Please switch to main worktree: cd /path/to/termaid
```

### 2. Read KANBAN.md

Read the KANBAN.md file at project root and parse ideas from "## 📝 Backlog" section.

### 3. Get idea selection

If idea number provided as argument, use it directly.

Otherwise, use AskUserQuestion to select from backlog ideas:

```
AskUserQuestion with:
- header: "Task"
- question: "Quelle idée souhaitez-vous démarrer ?"
- options: formatted backlog ideas (max 4, with priority and category)
```

**Important**: Do NOT display the list separately before using AskUserQuestion - the tool already presents options interactively. Use AskUserQuestion directly.

If the backlog has more than 4 ideas, show the first 4 and include an "Other" option for the user to specify by number.

### 4. Parse selected idea

Extract from the idea line:
- Priority (P1/P2/P3)
- Category (ARCHITECTURE, UX, TEST, etc.)
- Description
- Task ID (hash like `#arch-import`)

### 5. Generate worktree name

Convert idea description to kebab-case worktree name:
- Remove task ID and priority
- Extract key words from description
- Examples:
  - "Add keyboard shortcuts" → `keyboard-shortcuts`
  - "Fix login bug" → `login-bug`
  - "Implement conversation import" → `conversation-import`

### 6. Update KANBAN.md

Move idea from Backlog to In Progress:

**Before (in Backlog):**
```markdown
## 📝 Backlog

- [ ] **#arch-import [05/03/2026 10:30:00] 🟡 P2 🏗️ [ARCHITECTURE]** Refactor conversation import feature
```

**After (in In Progress):**
```markdown
## 🚧 In Progress

### [05/03/2026 10:30:00] 💡 [IDEA] #arch-import Refactor conversation import feature
- [ ] **[05/03/2026 10:30:00] ✨ [FEAT]** Refactor conversation import feature
```

Use Edit tool to:
1. Remove the idea line from "## 📝 Backlog" section
2. Add the idea as a section under "## 🚧 In Progress"

### 7. Commit KANBAN.md on main

```bash
git add KANBAN.md
git commit -m "chore(kanban): start task #<task-id> - <description>"
```

### 8. Create branch and worktree

Create the branch and worktree using git native commands:

```bash
# Create the branch
git checkout -b feat/<worktree-name>

# Create the worktree at the correct location
git worktree add ../termaid-<worktree-name> feat/<worktree-name>

# Return to main branch
git checkout main
```

**Important**:
- Worktrees are created at `/home/openhoat/work/termaid-<name>` (NOT in `.claude/worktrees/`)
- This follows the project's native worktree workflow defined in `.claude/rules/worktree.md`
- Do NOT use `EnterWorktree` tool as it creates worktrees in the wrong location

### 9. Display success message

```
✅ Task Started: #<task-id>
   📋 <description>

📋 Kanban Updated:
   - Moved idea from Backlog to In Progress
   - Commit: <commit-hash>

📁 Worktree Created: ../termaid-<worktree-name>

⚠️ Next Step: Switch to the worktree to start working:
   cd ../termaid-<worktree-name>
```

## Error Handling

- **Not in main worktree**: Abort and instruct user to switch to main
- **No ideas in backlog**: Inform user and suggest `/kanban-add-idea`
- **Worktree directory exists**: Abort and suggest cleanup
- **Branch already exists**: Abort and suggest different name or cleanup

## Integration with Other Skills

- **After this**: Switch to worktree manually with `cd ../termaid-<name>`
- **To complete**: Use `/complete-task` in the feature worktree
- **To push and create PR**: Use `/push-and-pr` in the feature worktree
- **After PR merge**: Use `/cleanup-worktree` in the main worktree

## Flow Diagram

```
┌─────────────────────────────────────┐
│  START: In main worktree            │
│  Run /start-task                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Select idea from backlog           │
│  (or use argument)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Update KANBAN.md                   │
│  - Move idea to In Progress         │
│  - Commit on main                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Create branch and worktree         │
│  - git checkout -b feat/<name>      │
│  - git worktree add ../termaid-<n>  │
│  - git checkout main                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  END: Worktree ready                │
│  User switches: cd ../termaid-<name>│
└─────────────────────────────────────┘
```

## Important Rules

- **Always on main**: KANBAN.md modifications must be committed on main branch
- **One idea per worktree**: Each worktree corresponds to one task/PR
- **Create branch first**: Always create branch before creating worktree
- **Commit before worktree**: Always commit KANBAN.md before creating worktree
- **Native git worktrees**: Use `git worktree add` (NOT EnterWorktree tool)
- **Return to main**: After creating worktree, return to main branch
- **Manual switch**: User must manually switch to worktree with `cd`

## Example

User runs `/start-task` without argument. AskUserQuestion displays options interactively:

```
AskUserQuestion:
  header: "Task"
  question: "Quelle idée souhaitez-vous démarrer ?"
  options:
    - "#1 - Conversation import (P2)"
    - "#2 - Keyboard shortcuts (P2)"
    - "#3 - Unit tests (P3)"
    - "Other..."
```

User selects option #1.

```
✅ Task Started: #arch-import
   📋 Implement conversation import feature

📋 Kanban Updated:
   - Moved idea from Backlog to In Progress
   - Commit: abc123

📁 Worktree Created: ../termaid-conversation-import

⚠️ Next Step: Switch to the worktree to start working:
   cd ../termaid-conversation-import
```
