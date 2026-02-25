# Cline Workflow for Selecting and Executing Backlog Ideas

## Objective

This workflow allows the user to select ideas from the backlog and have the AI execute them interactively. It combines idea conversion and task execution into a single streamlined process.

## Format rules

See `.clinerules/task_format.md` for detailed format rules.

Summary:
- `- [ ]` → idea/task to do
- `- [x]` → checked idea/task
- Idea format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Priority CategoryEmoji [CATEGORY]** Description`
- Task format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Description`

## Execution instructions

### 1. Read KANBAN.md

Use the `read_file` tool to read the content of the `/KANBAN.md` file at the project root.

### 2. List backlog ideas

Identify all ideas in the "## 📝 Backlog" section:
- Search for lines with format `- [ ] **[...]] Priority CategoryEmoji [CATEGORY]**`
- **Ignore** already checked lines (`- [x]`)
- **Ignore** comments and header lines

Display the list to the user with a number for each idea:

**Format:**
```
📋 **Backlog Ideas:**

**#1** [P1] 🐛 [FIX] Fix language change not applying after Save
**#2** [P2] 🌍 [I18N] Create GitHub Pages documentation site
**#3** [P2] ⚙️ [CONFIG] Build application executables

Type the number(s) of the idea(s) you want me to execute (e.g., "1" or "1,3" or "all"):
```

### 3. Ask user for selection

Use `ask_followup_question` to let the user select which ideas to execute.

**Accepted responses:**
- Single number: `1`
- Multiple numbers: `1,3,5` or `1 3 5`
- Range: `1-3`
- All: `all` or `*`

### 4. For each selected idea, execute the following steps

#### 4a. Display the idea and ask for task breakdown

Show the selected idea and ask the user how to proceed:

```
📝 **Selected Idea #1:**
[P1] 🐛 [FIX] Fix language change not applying after Save

How would you like to break this down into tasks?
- Describe the tasks yourself
- Let me suggest tasks
- Execute as a single task
```

Use `ask_followup_question` to get the user's preference.

#### 4b. Create the "In Progress" section

Based on the user's response:

**If user describes tasks:**
- Create tasks from user's description
- Use appropriate emoji/tag for each task

**If user wants suggestions:**
- Analyze the idea and propose relevant tasks
- Wait for user confirmation before proceeding

**If single task:**
- Create one task with the appropriate tag

Create the section in "## 🚧 In Progress":

```markdown
### [DD/MM/YYYY HH:mm:ss] Priority CategoryEmoji [CATEGORY] Idea description
- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Task 1
- [ ] **[DD/MM/YYYY HH:mm:ss] Emoji [TAG]** Task 2
```

#### 4c. Delete idea from Backlog

Use `replace_in_file` to remove the idea line from "## 📝 Backlog".

**Important:** Delete the line completely, do not leave a checked trace.

#### 4d. Execute tasks interactively

For each task in the section:

1. **Display the current task:**
   ```
   🔧 **Executing Task 1/3:**
   [CHORE] Install necessary dependencies
   
   Proceed? (yes/no/skip)
   ```

2. **Ask for confirmation** using `ask_followup_question`

3. **Execute the task** using appropriate tools:
   - `execute_command` for CLI commands
   - `write_to_file` for new files
   - `replace_in_file` for edits

4. **Mark as completed:**
   - If success: Change `- [ ]` to `- [x]` in KANBAN.md
   - If failed: Inform user and ask whether to continue or abort

5. **Repeat** for each task

#### 4e. Move completed tasks to Done

After all tasks of an idea are completed:

1. **Add each completed task** as `- [x]` entry at the top of the "## ✅ Done" section
2. **Delete the idea section from In Progress** using `replace_in_file`

#### 4f. Create Git commit

When all tasks are moved to Done:

1. **Generate commit message:**
   ```
   [TAG]: Description of the idea

   - Task 1 description
   - Task 2 description
   ```

2. **Stage files:**
   ```bash
   git add <modified_files>
   ```

3. **Create commit:**
   ```bash
   git commit -m "Commit message"
   ```

#### 4g. Clean up Done section

After a successful commit:
1. **Delete all committed tasks** from the "## ✅ Done" section
2. The Done section should be empty after cleanup (completed tasks are tracked in git history and CHANGELOG.md)

#### 4h. Move to next idea

Continue with the next selected idea until all are completed.

### 5. Regenerate CHANGELOG.md

After all ideas are processed, execute:
```bash
npm run changelog
```

### 6. Final report

Display a summary of what was accomplished:

```
📊 **Execution Summary:**

✅ **#1** Fix language change not applying after Save
   - 3 tasks completed
   - Commit: abc1234

✅ **#2** Create GitHub Pages documentation site
   - 2 tasks completed
   - Commit: def5678

Total: 2 ideas completed, 5 tasks executed, 2 commits created
```

## Important rules

- **Always ask for confirmation** before executing each task
- **Wait for user input** when breaking down ideas into tasks
- **One idea = one commit**: All tasks of an idea are committed together
- **Delete ideas from Backlog** only after "In Progress" section is created
- **Move completed tasks to Done** after execution
- **Delete from In Progress** only after tasks are moved to Done and commit is successful
- **After successful commit**, delete all committed tasks from Done section (keep Done empty)
- **If a task fails**, ask user whether to continue or abort
- **Do not skip tasks** without user approval

## Interactive prompts

Use `ask_followup_question` for these interactions:

1. **Selection prompt:**
   ```
   Which idea(s) would you like me to execute?
   (Enter number(s), range, or 'all')
   ```

2. **Task breakdown prompt:**
   ```
   How should I break down this idea into tasks?
   - Describe tasks yourself
   - Let me suggest tasks  
   - Execute as single task
   ```

3. **Task confirmation prompt:**
   ```
   Ready to execute: [TAG] Task description
   Proceed? (yes/no/skip)
   ```

4. **Error handling prompt:**
   ```
   Task failed: [error message]
   Continue with next task? (yes/no)
   ```

## Example complete flow

```
1. Read KANBAN.md → found 3 ideas in Backlog

2. Display ideas:
   📋 **Backlog Ideas:**
   **#1** [P1] 🐛 [FIX] Fix language change not applying
   **#2** [P2] 🌍 [I18N] Create GitHub Pages documentation
   **#3** [P2] ⚙️ [CONFIG] Build application executables

3. User selects: "1,2"

4. Process Idea #1:
   - Ask for task breakdown → user chooses "single task"
   - Create In Progress section
   - Delete from Backlog
   - Ask confirmation: "Ready to execute? yes"
   - Execute task → success
   - Create commit → abc1234
   - Delete from In Progress

5. Process Idea #2:
   - Ask for task breakdown → user describes 2 tasks
   - Create In Progress section with 2 tasks
   - Delete from Backlog
   - Task 1: "Create docs structure" → confirm → execute → success
   - Task 2: "Deploy to GitHub Pages" → confirm → execute → success
   - Create commit → def5678
   - Delete from In Progress

6. npm run changelog

7. Report: 2 ideas completed, 3 tasks executed, 2 commits created
```

## Error handling

- **User cancels selection**: Abort workflow, no changes made
- **Task execution fails**: Ask whether to continue or abort
- **Git commit fails**: Do not delete from In Progress, inform user
- **Multiple ideas selected**: Continue with remaining ideas if one fails

## Workflow replacement

This workflow replaces:
- `kanban_convert_idea_to_task.md` (conversion is now integrated)
- `kanban_execute_task.md` (execution is now interactive)

These files should be deleted after this workflow is created.