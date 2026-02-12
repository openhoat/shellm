# Workflow: Kanban Task Execution

## Objective

Execute tasks from KANBAN.md following the proper workflow: move to In Progress when starting, check when completed, commit after completion, then remove.

## When to Use

Use this workflow when:
- Executing tasks from the KANBAN Backlog section
- Automating the kanban workflow
- Creating structured commits from tasks
- Updating project history

## Kanban Sections

- **## 📝 Backlog** - Ideas and tasks to do
- **## 🚧 In Progress** - Tasks currently being worked on
- **## ✅ Done** - Completed tasks (after commit)

## Workflow Steps

### 1. Select Task to Work On

When the user requests to work on a task, move it from Backlog to In Progress:

**Format in In Progress:**
```
### [DD/MM/YYYY HH:mm:ss] 💡 [IDEA] Description
- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Task description
```

Or for isolated tasks:
```
- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Isolated task description
```

### 2. Execute the Task

Perform the work to complete the task. Use appropriate tools.

### 3. Mark Task as Completed

After successful completion, mark the task as checked in In Progress:
```
- [x] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Task description
```

### 4. Create Git Commit (After ALL Tasks Completed)

**For an idea section:** Only commit after ALL subtasks are checked (`- [x]`)

**For an isolated task:** Commit immediately after it's checked

#### Commit Message Format

```
[tag]: description

- detail 1
- detail 2
...
```

**Tags:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Refactoring
- `perf` - Performance
- `docs` - Documentation
- `style` - Style/formatting
- `test` - Tests
- `chore` - Configuration/maintenance

**Rules:**
- Subject must be lowercase
- Subject must not exceed 72 characters
- Use imperative mood ("add" not "added")
- No period at end of subject
- Include file changes in body

### 5. Update KANBAN After Successful Commit

Once the commit is created:
- **For an idea section:** Delete the entire section (header + tasks) from "## 🚧 In Progress"
- **For an isolated task:** Delete the task line from "## 🚧 In Progress"

The task is now considered done (it will appear in git history, not in KANBAN).

### 6. Update CHANGELOG.md

After committing, update CHANGELOG.md with the modification:

**Format:**
```markdown
**[HH:MM:SS] Emoji [TAG]** Description
```

Place after the date header `### DD/MM` in the appropriate year section.

## Important Rules

- **Move to In Progress before starting** a task
- **Check task (`- [x]`)** after completion
- **Only commit after ALL tasks** of an idea are completed
- **Only delete from In Progress after successful commit**
- **1 idea = 1 commit** (all tasks together)
- **1 isolated task = 1 commit**
- If a task fails, do NOT check it and do NOT commit
- Always run quality checks (`npm run validate`) before committing

## Example Flow

```
1. User: "Work on the P2 task: Refactor ChatPanel.tsx"

2. Move task to In Progress:
   ## 🚧 In Progress
   - [ ] **[12/02/2026 12:00:00] 🏗️ [ARCHITECTURE]** Refactor ChatPanel.tsx

3. Execute the task (create useChat hook, refactor component)

4. Mark as completed:
   - [x] **[12/02/2026 12:00:00] 🏗️ [ARCHITECTURE]** Refactor ChatPanel.tsx

5. Run validation: npm run validate (passes)

6. Create commit:
   git add src/hooks/useChat.ts src/components/ChatPanel.tsx
   git commit -m "refactor(chat): extract useChat custom hook from ChatPanel

   - Create src/hooks/useChat.ts for chat logic
   - Refactor ChatPanel.tsx to use useChat hook"

7. Delete from In Progress:
   ## 🚧 In Progress
   (No work in progress)

8. Update CHANGELOG.md:
   **[12:30:00] 🏗️ [ARCHITECTURE]** Refactor ChatPanel.tsx - extract useChat custom hook
```

## Multiple Tasks in an Idea

```
### [12/02/2026 10:00:00] 💡 [IDEA] Add a dark/light theme system
- [ ] **[10:30:00] 🔧 [CHORE]** Install dependencies
- [ ] **[11:00:00] ✨ [FEAT]** Create ThemeSwitcher component
- [ ] **[11:30:00] 🎨 [STYLE]** Create dark theme CSS
- [ ] **[12:00:00] ✨ [FEAT]** Add toggle in header

Work through all tasks:
- Task 1 completed → mark [x]
- Task 2 completed → mark [x]
- Task 3 completed → mark [x]
- Task 4 completed → mark [x]

ALL tasks checked → create ONE commit → delete entire section from In Progress
```

## Error Handling

If a task fails:
1. Do NOT check the task (`- [ ]` stays)
2. Inform the user of the error
3. Task remains in In Progress for retry
4. Do NOT create commit (incomplete tasks)
5. Do NOT delete from In Progress

## Quality Checks

Before committing, always run:
```bash
npm run validate
```

This runs:
- Biome linting (npm run qa)
- TypeScript build
- All tests

Only proceed with commit if validation passes.

## Integration with Other Rules

This workflow integrates with:
- **Language Rule**: All content in English
- **Commit Messages Rule**: Conventional Commits format
- **Quality Check Rule**: Run `npm run validate` before committing
- **Log Changes Rule**: Update CHANGELOG.md after commit