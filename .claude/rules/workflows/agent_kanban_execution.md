# Workflow: Agent KANBAN Execution

## Objective

Use the KANBAN Task Executor agent to execute tasks from KANBAN.md following the defined workflow.

## When to Use

Use this workflow when:
- Executing tasks from the KANBAN In Progress section
- Automating the kanban workflow
- Creating structured commits from tasks
- Updating project history

## Execution Instructions

### 1. Receive KANBAN Execution Request

The user may request execution with prompts like:
- "Execute the KANBAN tasks"
- "Process the In Progress tasks from KANBAN"
- "Complete tasks from the kanban board"
- "Run the kanban workflow"

### 2. Invoke KANBAN Task Executor Agent

Invoke the kanban-task-executor agent with instructions to execute tasks from KANBAN.md.

Example invocation:
```
"Use the kanban-task-executor agent to execute all tasks in the In Progress section of KANBAN.md.
Follow the defined workflow for each task, validate before committing, and create properly formatted commits."
```

### 3. Monitor Agent Execution

The agent will:
1. Read KANBAN.md to identify tasks
2. Execute tasks in the In Progress section
3. Validate code before committing
4. Create git commits with proper messages
5. Update KANBAN.md to remove completed tasks
6. Regenerate CHANGELOG.md

### 4. Receive Execution Report

The agent will provide a detailed report of execution progress.

**Example successful execution report:**
```
🚀 Executing KANBAN Tasks
==========================

Idea: [DATE] 💡 [IDEA] Add a dark/light theme system
Tasks: 4 total, 0 remaining

Task 1/4: 🔧 [CHORE] Install necessary dependencies
  ✅ Completed
  Updated KANBAN: Marked as checked

Task 2/4: ✨ [FEAT] Create ThemeSwitcher component
  ✅ Completed
  Updated KANBAN: Marked as checked

Task 3/4: 🎨 [STYLE] Create CSS styles for dark theme
  ✅ Completed
  Updated KANBAN: Marked as checked

Task 4/4: ✨ [FEAT] Add toggle in application header
  ✅ Completed
  Updated KANBAN: Marked as checked

All tasks completed. Validating code...
  ✅ Validation passed

Creating commit...
  Commit hash: abc123
  Message: feat: Add a dark/light theme system

Regenerating CHANGELOG...
  ✅ CHANGELOG updated

Updated KANBAN: Removed completed section

Summary:
- Tasks executed: 4
- Commits created: 1
- CHANGELOG regenerated: Yes
```

### 5. Handle Execution Results

**If execution successful:**
- Confirm all tasks completed
- Report commit hash(es)
- Confirm CHANGELOG updated
- Report KANBAN updated

**If execution failed:**
- Identify which task(s) failed
- Report error messages
- Suggest next steps
- Tasks not completed remain in KANBAN

### 6. Provide Final Summary

Summarize the execution results to the user:
```
✅ KANBAN Execution Complete
============================

Tasks Executed: N
Commits Created: N
CHANGELOG Updated: Yes

Commits:
- abc123: [TAG] Description
- def456: [TAG] Description

KANBAN Status:
- N tasks completed and removed
- N tasks remaining in In Progress

Next Steps:
- Continue with remaining tasks
- Review changes in commits
- Update documentation if needed
```

## Example Flow

```
User: "Execute the KANBAN tasks"

You: "I'll use the kanban-task-executor agent to process the In Progress tasks."

[Invoke kanban-task-executor agent]

Agent Report:
[Detailed execution report as shown above]

You: "KANBAN execution completed successfully. All tasks have been executed,
     validated, committed, and the kanban board has been updated."
```

## Important Rules

- Always use the kanban-task-executor agent for KANBAN execution
- The agent follows the defined workflow automatically
- Each idea creates one commit with all tasks
- Isolated tasks create individual commits
- Code is validated before committing
- Commit messages follow Conventional Commits format
- CHANGELOG is regenerated after commits
- Completed tasks are removed from KANBAN

## Error Handling

If the kanban-task-executor agent fails:
1. Identify which task failed
2. Report the error details
3. The agent will leave failed tasks unchecked
4. Uncompleted tasks remain in KANBAN
5. User can fix issues and retry
6. Only completed tasks are committed

## Notes

- One idea = one commit with all tasks
- One isolated task = one commit
- Validation runs before each commit
- CHANGELOG is regenerated from git history
- KANBAN is updated after successful commits
- Failed tasks remain for manual intervention

## Workflow Integration

This workflow integrates with:
- Quality Validator (for validation before commits)
- KANBAN Task Executor (agent that handles execution)
- Git workflows (for commits)
- CHANGELOG generation (for history tracking)