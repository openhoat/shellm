# Cline Workflow for Executing Kanban Tasks

## Objective

This workflow automates the execution of tasks from the `/KANBAN.md` file and the creation of Git commits. For ideas with multiple tasks, a single commit is created with task details in the description.

## Format rules

See `.clinerules/task_format.md` for detailed format rules.

Summary:
- `- [ ]` → task to do
- `- [x]` → checked task (completed)
- Task format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`

## Execution instructions

### 1. Read KANBAN.md

Use the `read_file` tool to read the content of the `/KANBAN.md` file at the project root.

### 2. Analyze "In Progress" sections

Identify all sections in "## 🚧 In Progress":
- **Idea sections**: start with `### [DATE] 💡 [IDEA]`
  - Contain one or more underlying tasks
- **Isolated tasks**: lines with `- [ ] **[...]]` without idea section

### 3. Execute tasks

For each section or task identified:

#### 3a. For an idea section with tasks

1. Execute each unchecked task in order
2. Use appropriate Cline tools (execute_command, write_to_file, replace_in_file, etc.)
3. After each successful task, mark it as checked (`- [x]`) in KANBAN.md

4. **Check if all tasks of the idea are completed**
   - If all tasks are checked → Go to step 4a
   - If tasks remain to do → Continue with next idea/task

#### 3b. For an isolated task

1. Execute the task
2. If successful → Go to step 4b

### 4. Create Git commit

#### 4a. For a completed idea (all tasks checked)

Generate the commit message in Conventional Commits format:

**Format:**
```
[TAG]: Description of the idea

- Description of task 1
- Description of task 2
- Description of task 3
```

**Rules:**
- Use the tag of the main modification type (ex: `[FEAT]` for features)
- The main description is the original idea's description
- List all tasks with their description
- Start each line with "- " (bullet point)

**Example:**
```
[FEAT]: Add a dark/light theme system

- Install necessary dependencies (npm install theme-provider)
- Create ThemeSwitcher component in src/components/
- Create CSS styles for dark theme
- Add toggle in application header
```

#### 4b. For a completed isolated task

Generate the commit message in Conventional Commits format:

**Format:**
```
[TAG]: Description of the task
```

**Example:**
```
[FIX]: Fix connection bug in authentication handler
```

### 5. Add files to Git

Execute the command:
```bash
git add <modified_files>
```

Add all modified/created/deleted files for this task/idea.

### 6. Create commit

Execute the command:
```bash
git commit -m "Commit message"
```

Always use double quotes around the commit message to handle line breaks.

### 7. Delete section/task from KANBAN.md

Once the commit is successfully created:

- **For an idea**: Delete the entire section (header + tasks) from "## 🚧 In Progress"
- **For an isolated task**: Delete the task line from "## 🚧 In Progress"

Use `replace_in_file` to delete the complete block.

### 8. Repeat for other ideas/tasks

Continue with other sections or tasks in "## 🚧 In Progress" until everything is processed.

### 9. Regenerate CHANGELOG.md

After completing all tasks, execute:
```bash
npm run changelog
```

This will regenerate the `CHANGELOG.md` file from Git history.

### 10. Execution report

Inform the user of progress after each step:
- Successfully executed tasks
- Created commits with their hash and message
- Deleted sections/tasks from KANBAN.md
- In case of error, explain the reason without modifying KANBAN.md

## Important rules

- **1 idea = 1 commit**: All tasks of an idea are committed together
- **1 isolated task = 1 commit**: Each isolated task is committed individually
- Only create a commit if **all** tasks of an idea are completed
- Only delete a section/task from KANBAN.md after a **successful** commit
- If a task fails, mark it as failed and move to next (don't check)
- Always include `CHANGELOG.md` in the commit (as it will be regenerated)

## Example complete flow

```
1. Read KANBAN.md → find 2 ideas + 1 isolated task in In Progress

2. Idea #1: "Add a theme system" with 3 tasks
   - Execute task 1 (Install dependencies) → success → check
   - Execute task 2 (Create ThemeSwitcher) → success → check
   - Execute task 3 (Create styles) → success → check
   - All tasks checked → create commit
   - git add ...
   - git commit -m "[FEAT]: Add a dark/light theme system

   - Install necessary dependencies (npm install theme-provider)
   - Create ThemeSwitcher component in src/components/
   - Create CSS styles for dark theme"
   - Delete section from KANBAN.md

3. Isolated task: "Fix login bug"
   - Execute task → success → check
   - Create commit
   - git add ...
   - git commit -m "[FIX]: Fix connection bug in login form"
   - Delete task from KANBAN.md

4. Idea #2: "Improve performance" (remaining tasks)
   - Execute task 1 → success → check
   - Task 2 not completed → stop, don't create commit

5. npm run changelog → regenerate CHANGELOG.md

6. Report: 2 commits created, 1 idea in progress, 1 remaining task
```

## Example KANBAN.md before/after

**Before - In Progress:**
```markdown
## 🚧 In Progress
### [09/02/2026 08:00:00] 💡 [IDEA] Add a theme system
- [ ] **[09/02/2026 08:30:15] 🔧 [CHORE]** Install necessary dependencies
- [ ] **[09/02/2026 08:30:20] ✨ [FEAT]** Create ThemeSwitcher component
- [ ] **[09/02/2026 08:30:25] 🎨 [STYLE]** Create styles for dark theme

- [ ] **[09/02/2026 09:00:00] 🐛 [FIX]** Fix login bug
```

**After partial execution - In Progress:**
```markdown
## 🚧 In Progress
### [09/02/2026 08:00:00] 💡 [IDEA] Add a theme system
- [x] **[09/02/2026 08:30:15] 🔧 [CHORE]** Install necessary dependencies
- [x] **[09/02/2026 08:30:20] ✨ [FEAT]** Create ThemeSwitcher component
- [x] **[09/02/2026 08:30:25] 🎨 [STYLE]** Create styles for dark theme
```

**After commit - In Progress:**
```markdown
## 🚧 In Progress

(No work in progress for the moment)
```

## Error handling

If a task fails:
1. Don't check it
2. Inform the user of the error
3. Move to next task
4. Don't create commit if the idea is not completely completed

## Note on CHANGELOG.md

The `CHANGELOG.md` file is automatically generated from Git by the script `scripts/generate-changelog.js`. It should not be manually modified.