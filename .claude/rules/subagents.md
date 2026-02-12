# Subagents Rule

## Objective

This rule defines when and how to use Claude Code subagents to efficiently handle complex, independent tasks through parallel execution.

## When to use subagents

Use subagents when you need to:

- **Execute multiple independent tasks simultaneously** (e.g., test different implementations, analyze separate modules)
- **Perform comprehensive testing** across multiple components or scenarios
- **Generate extensive documentation** for different parts of the codebase
- **Refactor isolated modules** that don't require coordination with other changes
- **Run deep code analysis** on specific areas without blocking the main workflow
- **Create prototypes** or experimental implementations in parallel
- **Execute long-running operations** that can run independently
- **Explore codebase** for broader research tasks requiring multiple queries

## Available subagent types

Claude Code provides specialized subagents for different tasks:

| Subagent | Purpose | Tools Available |
|----------|---------|-----------------|
| `Bash` | Command execution specialist | Bash |
| `Explore` | Fast codebase exploration | All tools except Task, Edit, Write, NotebookEdit |
| `Plan` | Software architecture and implementation planning | All tools except Task, Edit, Write, NotebookEdit |
| `general-purpose` | Researching complex questions, searching code, multi-step tasks | All tools |
| `claude-code-guide` | Questions about Claude Code CLI, Agent SDK, API | Glob, Grep, Read, WebFetch, WebSearch |
| `statusline-setup` | Configure Claude Code status line settings | Read, Edit |

## Command syntax

To launch a subagent, use the `Task` tool:

```javascript
Task({
  description: "Brief task description (3-5 words)",
  prompt: "Detailed task description with all necessary context",
  subagent_type: "subagent_name",
  // Optional: model: "haiku" | "sonnet" | "opus"
})
```

**Important**: The prompt must be:
- Clear and specific
- Self-contained (the subagent should have all necessary context)
- Independently executable
- Focused on a single objective

## Best practices

### 1. Formulate self-contained tasks

Provide all necessary context in the prompt:

```javascript
// Good
Task({
  description: "Analyze auth module security",
  prompt: "Analyze the authentication module in src/services/authService.ts and identify security vulnerabilities. Focus on token validation and user permissions.",
  subagent_type: "Explore"
})

// Bad
Task({
  description: "Analyze auth module",
  prompt: "Analyze the auth module",
  subagent_type: "Explore"
})
```

### 2. Define clear deliverables

Specify what the subagent should produce:

```javascript
Task({
  description: "Create unit tests for chatService",
  prompt: "Create comprehensive unit tests for the chatService.ts file. Cover all public methods including sendMessage, receiveMessage, and clearHistory. Use Vitest framework and ensure 100% coverage.",
  subagent_type: "general-purpose"
})
```

### 3. Use for parallelization

Launch multiple subagents when tasks are independent:

```javascript
// Launch in parallel (multiple Task tool calls in a single message)
Task({ description: "Test terminal service", prompt: "...", subagent_type: "general-purpose" })
Task({ description: "Test chat service", prompt: "...", subagent_type: "general-purpose" })
Task({ description: "Test config service", prompt: "...", subagent_type: "general-purpose" })
```

### 4. Provide file context

Always specify relevant files and directories:

```javascript
Task({
  description: "Refactor conversationService to async/await",
  prompt: "Refactor the conversationService.ts file to use async/await instead of promises. Ensure all tests still pass after the changes.",
  subagent_type: "general-purpose"
})
```

### 5. Specify constraints

Include any limitations or requirements:

```javascript
Task({
  description: "Add error handling to command execution",
  prompt: "Add error handling to the command execution in commandExecutionService.ts. Do not modify the existing API contracts. Follow the existing error handling patterns in the codebase.",
  subagent_type: "general-purpose"
})
```

### 6. Choose the right subagent type

- **Bash**: For simple command execution, git operations, terminal tasks
- **Explore**: For fast codebase searches, finding files, understanding patterns (quick/medium/very thorough)
- **Plan**: For implementation planning, architectural decisions (use EnterPlanMode for non-trivial implementations)
- **general-purpose**: For complex multi-step tasks, when uncertain about matches in first attempts
- **claude-code-guide**: For questions about Claude Code features, hooks, commands, MCP servers

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

```javascript
Task({
  description: "Run tests and generate coverage",
  prompt: "Execute all unit tests and generate a coverage report. Identify any tests that fail and create a summary of issues.",
  subagent_type: "general-purpose"
})
```

### Example 2: Documentation generation

```javascript
Task({
  description: "Generate IPC handler docs",
  prompt: "Generate API documentation for the IPC handlers in electron/ipc-handlers/. Include function signatures, parameters, return types, and usage examples.",
  subagent_type: "general-purpose"
})
```

### Example 3: Code analysis

```javascript
Task({
  description: "Security audit of conversation storage",
  prompt: "Perform a security audit of the conversation storage in conversationService.ts. Check for injection vulnerabilities, proper data sanitization, and access control issues. Use thoroughness level: very thorough.",
  subagent_type: "Explore"
})
```

### Example 4: Codebase exploration

```javascript
Task({
  description: "Explore API endpoints",
  prompt: "Find and analyze all API endpoints in the codebase. I need to understand how they work. Use thoroughness level: medium.",
  subagent_type: "Explore"
})
```

### Example 5: Implementation planning

```javascript
// For non-trivial implementations, use EnterPlanMode instead
EnterPlanMode({})
```

## Background tasks

For long-running operations, use the `run_in_background` parameter:

```javascript
Task({
  description: "Long running analysis",
  prompt: "Perform comprehensive analysis...",
  subagent_type: "general-purpose",
  run_in_background: true
})
```

Then use `TaskOutput` to retrieve the output later:

```javascript
TaskOutput({
  task_id: "task_id_from_subagent",
  block: false,
  timeout: 60000
})
```

## Integration with other rules

When using subagents, ensure they also follow:

- **Language Rule**: All subagent output must be in English
- **Commit Messages Rule**: If subagent makes git commits, messages must follow Conventional Commits in English
- **Quality Check Rule**: Subagent should run `npm run validate` after code modifications
- **Log Changes Rule**: Subagent should log changes in CHANGELOG.md

## Monitoring subagents

When you launch a subagent:

1. **Monitor the output** for progress updates
2. **Verify the completion** of the subagent's task
3. **Review the changes** made by the subagent
4. **Run quality checks** (`npm run validate`) on the modified code
5. **Test the changes** to ensure they work as expected

## Troubleshooting

If a subagent fails:

1. **Check the error message** in the subagent's output
2. **Review the prompt** for clarity and completeness
3. **Provide more context** if necessary and relaunch the subagent
4. **Consider handling the task** in the main workflow if it requires coordination

## Important rules

- **Always provide sufficient context** in the prompt
- **Verify subagent output** before considering the task complete
- **Run quality checks** on any code modifications made by subagents
- **Use subagents for parallelization** when tasks are truly independent
- **Choose the appropriate subagent type** for the task at hand
- **Prefer using direct tools** (Read, Glob, Grep) for simple directed searches instead of subagents

## Note on tool usage

- For simple, directed codebase searches (e.g., for a specific file/class/function), use **Glob** or **Grep** directly instead of the Explore subagent
- For broader codebase exploration and deep research, use the **Explore** subagent
- The Explore subagent is slower than direct Glob/Grep calls, so use it only when necessary