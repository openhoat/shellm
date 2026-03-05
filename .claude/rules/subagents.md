# Subagents Rule

## Objective

Defines when and how to use Claude Code subagents for parallel execution of independent tasks.

## When to use subagents

- Execute multiple independent tasks simultaneously
- Perform comprehensive testing across multiple components
- Generate extensive documentation for different codebase parts
- Run deep code analysis without blocking the main workflow
- Explore codebase for broader research tasks

## Available subagent types

| Subagent | Purpose | Tools |
|----------|---------|-------|
| `Bash` | Command execution | Bash |
| `Explore` | Fast codebase exploration | All except Task, Edit, Write, NotebookEdit |
| `Plan` | Architecture/implementation planning | All except Task, Edit, Write, NotebookEdit |
| `general-purpose` | Complex multi-step tasks | All |
| `claude-code-guide` | Claude Code CLI/SDK/API questions | Glob, Grep, Read, WebFetch, WebSearch |
| `statusline-setup` | Status line configuration | Read, Edit |

## Command syntax

```javascript
Task({
  description: "Brief description (3-5 words)",
  prompt: "Detailed self-contained task description with all context",
  subagent_type: "subagent_name",
  // Optional: model: "haiku" | "sonnet" | "opus"
})
```

## Best practices

1. **Self-contained tasks**: Provide all necessary context in the prompt
2. **Clear deliverables**: Specify what the subagent should produce
3. **Parallelization**: Launch multiple subagents for independent tasks
4. **File context**: Always specify relevant files and directories
5. **Choose right type**:
   - `Bash`: Simple commands, git operations
   - `Explore`: Fast searches, pattern discovery
   - `Plan`: Architecture decisions (or use EnterPlanMode)
   - `general-purpose`: Complex multi-step tasks

## When NOT to use subagents

- Tasks requiring coordination with main agent
- Modifications to files currently being edited
- Critical operations needing immediate supervision
- Simple tasks completable in main workflow
- Tasks dependent on shared state

## Examples

```javascript
// Parallel testing
Task({ description: "Test terminal service", prompt: "Test src/services/terminalService.ts", subagent_type: "general-purpose" })
Task({ description: "Test chat service", prompt: "Test src/services/chatService.ts", subagent_type: "general-purpose" })

// Codebase exploration
Task({ description: "Explore API endpoints", prompt: "Find all API endpoints and analyze their patterns", subagent_type: "Explore" })

// Security audit
Task({ description: "Audit auth module", prompt: "Security audit of src/services/authService.ts - check token validation, permissions", subagent_type: "Explore" })
```

## Background tasks

```javascript
Task({ description: "Long analysis", prompt: "...", subagent_type: "general-purpose", run_in_background: true })
// Retrieve later with TaskOutput({ task_id: "...", block: false, timeout: 60000 })
```

## Integration with other rules

- **Language Rule**: All output in English
- **Commit Messages Rule**: Conventional Commits format
- **Quality Check Rule**: Run `npm run validate` after code modifications

## Important rules

- Always provide sufficient context in prompt
- Verify subagent output before considering task complete
- Run quality checks on code modifications
- **Prefer direct tools** (Glob, Grep) for simple searches instead of Explore subagent