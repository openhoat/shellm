# Subagents Rule

## Objective

This rule defines when and how to use Cline subagents to efficiently handle complex, independent tasks through parallel execution.

## When to use subagents

Use subagents when you need to:

- **Execute multiple independent tasks simultaneously** (e.g., test different implementations, analyze separate modules)
- **Perform comprehensive testing** across multiple components or scenarios
- **Generate extensive documentation** for different parts of the codebase
- **Refactor isolated modules** that don't require coordination with other changes
- **Run deep code analysis** on specific areas without blocking the main workflow
- **Create prototypes** or experimental implementations in parallel
- **Execute long-running operations** that can run independently

## Command syntax

To launch a subagent, use the following command format:

```bash
cline --subagents "your task description"
```

**Important**: The task description must be enclosed in double quotes and should be:
- Clear and specific
- Self-contained (the subagent should have all necessary context)
- Independently executable
- Focused on a single objective

## Best practices

### 1. Formulate self-contained tasks

Provide all necessary context in the task description:

```bash
# Good
cline --subagents "Analyze the authentication module in src/services/authService.ts and identify security vulnerabilities. Focus on token validation and user permissions."

# Bad
cline --subagents "Analyze the auth module"
```

### 2. Define clear deliverables

Specify what the subagent should produce:

```bash
cline --subagents "Create comprehensive unit tests for the chatService.ts file. Cover all public methods including sendMessage, receiveMessage, and clearHistory. Use Vitest framework and ensure 100% coverage."
```

### 3. Use for parallelization

Launch multiple subagents when tasks are independent:

```bash
# Terminal 1
cline --subagents "Write unit tests for terminalService.ts"

# Terminal 2
cline --subagents "Write unit tests for chatService.ts"

# Terminal 3
cline --subagents "Write unit tests for configService.ts"
```

### 4. Provide file context

Always specify relevant files and directories:

```bash
cline --subagents "Refactor the conversationService.ts file to use async/await instead of promises. Ensure all tests still pass after the changes."
```

### 5. Specify constraints

Include any limitations or requirements:

```bash
cline --subagents "Add error handling to the command execution in commandExecutionService.ts. Do not modify the existing API contracts. Follow the existing error handling patterns in the codebase."
```

## When NOT to use subagents

Avoid using subagents for:

- **Tasks requiring coordination** with the main agent or other subagents
- **Modifications to files currently being edited** in the main workflow
- **Critical operations** that need immediate supervision and verification
- **Simple tasks** that can be completed quickly in the main workflow
- **Tasks dependent on shared state** or resources
- **Operations that need access to** the IDE's active editor state

## Examples

### Example 1: Parallel testing

```bash
# Run comprehensive test suites simultaneously
cline --subagents "Execute all unit tests and generate a coverage report. Identify any tests that fail and create a summary of issues."
```

### Example 2: Documentation generation

```bash
# Generate docs for different modules
cline --subagents "Generate API documentation for the IPC handlers in electron/ipc-handlers/. Include function signatures, parameters, return types, and usage examples."
```

### Example 3: Code analysis

```bash
# Analyze specific components
cline --subagents "Perform a security audit of the conversation storage in conversationService.ts. Check for injection vulnerabilities, proper data sanitization, and access control issues."
```

### Example 4: Refactoring

```bash
# Refactor isolated module
cline --subagents "Refactor the ModelSelector component to use TypeScript strict mode. Add proper type definitions for all props and state. Ensure the component still works correctly with the chat panel."
```

### Example 5: Feature implementation

```bash
# Implement standalone feature
cline --subagents "Implement a dark mode toggle feature. Create a theme provider component, add dark mode styles to all CSS files, and ensure the theme preference persists in local storage."
```

## Integration with other rules

When using subagents, ensure they also follow:

- **Language Rule**: All subagent output must be in English
- **Commit Messages Rule**: If subagent makes git commits, messages must follow Conventional Commits in English
- **Quality Check Rule**: Subagent should run `npm run validate` after code modifications
- **Log Changes Rule**: Subagent should log changes in CHANGELOG.md

## Monitoring subagents

When you launch a subagent:

1. **Monitor the terminal output** for progress updates
2. **Verify the completion** of the subagent's task
3. **Review the changes** made by the subagent
4. **Run quality checks** (`npm run validate`) on the modified code
5. **Test the changes** to ensure they work as expected

## Troubleshooting

If a subagent fails:

1. **Check the error message** in the subagent's terminal output
2. **Review the task description** for clarity and completeness
3. **Provide more context** if necessary and relaunch the subagent
4. **Consider handling the task** in the main workflow if it requires coordination

## Important rules

- **Always provide sufficient context** in the task description
- **Verify subagent output** before considering the task complete
- **Run quality checks** on any code modifications made by subagents
- **Use subagents for parallelization** when tasks are truly independent
- **Document subagent usage** in KANBAN.md if the task is part of a larger project