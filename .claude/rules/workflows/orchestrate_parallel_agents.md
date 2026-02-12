# Workflow: Orchestrate Parallel Agents

## Objective

Coordinate the execution of multiple subagents in parallel to handle independent tasks efficiently.

## When to Use

Use this workflow when you need to:
- Execute multiple independent tasks simultaneously
- Analyze different modules or files in parallel
- Generate documentation for multiple components
- Test different parts of the codebase
- Review multiple code changes

## Execution Instructions

### 1. Identify Parallelizable Tasks

Analyze the request to identify tasks that can be executed independently:
- Tasks that don't share files
- Tasks that don't depend on each other's results
- Tasks that can be completed in any order

### 2. Determine Appropriate Agents

For each task, determine which agent to use:
- Validation → Quality Validator
- Testing → Test Runner
- Review → Code Reviewer
- Documentation → Documentation Generator
- KANBAN → KANBAN Task Executor

### 3. Launch Parallel Subagents

For each independent task, invoke the appropriate subagent with a clear, self-contained prompt.

Example prompt structure:
```
"Review the authentication module in src/services/authService.ts.
Focus on token validation and user permissions.
Check for security vulnerabilities and suggest improvements."
```

### 4. Monitor Progress

Track the status of each subagent:
- Waiting for subagent to start
- Subagent in progress
- Subagent completed
- Subagent failed

### 5. Aggregate Results

Wait for all subagents to complete, then:
- Collect results from each subagent
- Identify any failures
- Compile a summary report

### 6. Report Findings

Provide a consolidated report to the user:
- List of tasks executed
- Results from each task
- Any issues or errors
- Recommended next steps

## Reporting Format

```
🚀 Parallel Agent Execution
============================

Tasks Executed: N

Task 1: [Agent Name]
Status: ✅ Completed
Result: [Summary of results]

Task 2: [Agent Name]
Status: ✅ Completed
Result: [Summary of results]

Task 3: [Agent Name]
Status: ❌ Failed
Error: [Error message]

Summary:
- Completed: N
- Failed: N
- Success Rate: XX%

Recommendations:
1. [Action based on results]
2. [Action based on results]
```

## Example Use Cases

### Example 1: Parallel Code Review

**Request**: "Review all services in src/services/"

**Parallel Tasks**:
1. Review chatService.ts with code-reviewer agent
2. Review terminalService.ts with code-reviewer agent
3. Review configService.ts with code-reviewer agent

### Example 2: Parallel Documentation

**Request**: "Generate documentation for all components in src/components/"

**Parallel Tasks**:
1. Document ChatPanel.tsx with documentation-generator agent
2. Document Terminal.tsx with documentation-generator agent
3. Document ConfigPanel.tsx with documentation-generator agent

### Example 3: Parallel Testing

**Request**: "Test all service files"

**Parallel Tasks**:
1. Run tests for chatService.test.ts with test-runner agent
2. Run tests for terminalService.test.ts with test-runner agent
3. Run tests for configService.test.ts with test-runner agent

## Important Rules

- Only launch subagents for truly independent tasks
- Each subagent must have all necessary context
- Don't launch subagents for tasks requiring coordination
- Wait for all subagents to complete before reporting
- Handle subagent failures gracefully
- Provide clear, actionable results

## Error Handling

If a subagent fails:
1. Document the error
2. Continue with other subagents if possible
3. Report the failure in the final summary
4. Suggest retrying the failed task
5. Offer to run the task in the main workflow instead

## Notes

- Parallel execution can significantly speed up independent tasks
- Monitor each subagent's output for progress
- Be prepared to handle partial failures
- Aggregate results into a cohesive report