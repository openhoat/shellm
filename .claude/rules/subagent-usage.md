# Subagent Usage Rule

## Objective

This rule defines when and how to use subagents to efficiently handle complex, independent tasks through parallel execution.

## When to Use Subagents

Use subagents when you need to:

- **Execute multiple independent tasks simultaneously** (e.g., test different modules, analyze separate files)
- **Perform comprehensive validation** (qa, build, tests)
- **Generate documentation** for different parts of the codebase
- **Review code** for quality, security, and best practices
- **Execute KANBAN tasks** following the defined workflow
- **Analyze test coverage** across multiple files

## Available Agents

### Quality Validator
**Purpose**: Validate code quality by running Biome checks, TypeScript build, and tests.

**Use when**: Code changes need validation before committing.

**Example prompts**:
- "Validate this code change"
- "Run quality checks on the project"
- "Verify code is ready for commit"

### Test Runner
**Purpose**: Execute tests, analyze failures, and generate coverage reports.

**Use when**: Testing code or checking coverage.

**Example prompts**:
- "Run all tests and report results"
- "Generate a coverage report"
- "Analyze test failures"

### Code Reviewer
**Purpose**: Review code for quality, security, best practices, and standards.

**Use when**: New code needs review.

**Example prompts**:
- "Review these code changes"
- "Audit this file for security issues"
- "Check if this code follows best practices"

### Documentation Generator
**Purpose**: Generate and maintain project documentation.

**Use when**: Creating or updating documentation.

**Example prompts**:
- "Generate documentation for this module"
- "Add JSDoc comments to this file"
- "Update API documentation"

### KANBAN Task Executor
**Purpose**: Execute tasks from KANBAN.md and manage the workflow.

**Use when**: Executing kanban tasks.

**Example prompts**:
- "Execute the KANBAN tasks"
- "Process the In Progress tasks from KANBAN"
- "Complete tasks from the kanban board"

## Best Practices

### 1. Formulate Clear Requests

Provide specific context for the agent:
```
✅ Good:
"Validate the changes to src/components/Terminal.tsx and electron/ipc-handlers/terminal.ts"

❌ Bad:
"Validate the code"
```

### 2. Use Appropriate Agents

Choose the right agent for the task:
- Need validation? → Quality Validator
- Need testing? → Test Runner
- Need review? → Code Reviewer
- Need docs? → Documentation Generator
- Need KANBAN tasks? → KANBAN Task Executor

### 3. Provide Context

Include relevant files and directories:
```
"Review the authentication changes in src/services/authService.ts.
Focus on token validation and user permissions."
```

### 4. Specify Constraints

Include limitations or requirements:
```
"Add error handling to commandExecutionService.ts.
Do not modify the existing API contracts.
Follow the existing error handling patterns in the codebase."
```

## When NOT to Use Subagents

Avoid using subagents for:
- Tasks requiring coordination with the main agent
- Modifications to files currently being edited
- Critical operations needing immediate supervision
- Simple tasks completed quickly in main workflow
- Tasks dependent on shared state
- Operations requiring IDE active editor state

## Integration with Other Rules

When using subagents, ensure they follow:
- **Language Rule**: All output must be in English
- **Commit Messages Rule**: Follow Conventional Commits in English
- **Quality Check Rule**: Run `npm run validate` after code modifications
- **Log Changes Rule**: Log changes in CHANGELOG.md

## Monitoring Subagents

When you invoke a subagent:
1. Monitor the output for progress updates
2. Verify completion of the subagent's task
3. Review changes made by the subagent
4. Run quality checks (`npm run validate`) on modified code
5. Test changes to ensure they work

## Common Usage Patterns

### Pattern 1: Validate Before Commit
```
User: "I've made changes to the chat service. Can you validate them?"
You: Invoke quality-validator agent
```

### Pattern 2: Test and Review
```
User: "I implemented a new feature. Test it and review the code."
You: Invoke test-runner agent, then code-reviewer agent
```

### Pattern 3: Parallel Tasks
```
User: "Generate documentation for all services in src/services/"
You: Split tasks and invoke multiple documentation-generator agents
```

### Pattern 4: Execute KANBAN
```
User: "Execute the tasks in the KANBAN In Progress section"
You: Invoke kanban-task-executor agent
```

## Important Rules

- Always provide sufficient context in requests
- Verify subagent output before considering task complete
- Run quality checks on any code modifications
- Use subagents for parallelization when tasks are independent
- Document subagent usage in KANBAN.md if part of larger project