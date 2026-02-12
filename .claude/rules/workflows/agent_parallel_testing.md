# Workflow: Agent Parallel Testing

## Objective

Use multiple Test Runner agents in parallel to execute tests for different modules or files simultaneously.

## When to Use

Use this workflow when:
- Testing multiple independent modules
- Running tests for different services in parallel
- Checking test coverage across multiple components
- Need to speed up test execution for independent test suites

## Execution Instructions

### 1. Identify Testable Components

Analyze the request to identify independent test suites:
- Tests for different services/modules
- Tests for different components
- Tests that don't share dependencies or state

### 2. Split into Parallel Tasks

Group tests by module or component:
- chatService.test.ts → Task 1
- terminalService.test.ts → Task 2
- configService.test.ts → Task 3

### 3. Launch Parallel Test Runner Agents

For each independent test suite, invoke a test-runner agent with specific context.

Example invocation:
```
"Use the test-runner agent to run tests for chatService.test.ts.
Generate a coverage report and report any failures."
```

### 4. Monitor Each Agent

Track the status of each test-runner agent:
- Agent 1: chatService tests
- Agent 2: terminalService tests
- Agent 3: configService tests

### 5. Aggregate Results

Wait for all agents to complete, then:
- Collect test results from each agent
- Combine coverage statistics
- Identify any failing tests across all suites

### 6. Provide Consolidated Report

Report the combined results:
```
🧪 Parallel Test Results
========================

Test Suites Executed: N

Suite 1: chatService.test.ts
Status: ✅ Passed
Tests: N/N passed
Coverage: XX%

Suite 2: terminalService.test.ts
Status: ✅ Passed
Tests: N/N passed
Coverage: XX%

Suite 3: configService.test.ts
Status: ❌ Failed
Tests: N/M passed
Failures:
  - test_name
    Error: error message

Overall Summary:
- Total Tests: N
- Passed: N
- Failed: N
- Overall Coverage: XX%

Recommendations:
1. Fix failing tests in configService.test.ts
2. Improve coverage for [module]
```

## Example Use Cases

### Example 1: Test All Services

**Request**: "Run tests for all services in parallel"

**Parallel Tasks**:
1. Test chatService.test.ts with test-runner agent
2. Test terminalService.test.ts with test-runner agent
3. Test configService.test.ts with test-runner agent

### Example 2: Test All Components

**Request**: "Test all React components in parallel"

**Parallel Tasks**:
1. Test ChatPanel with test-runner agent
2. Test Terminal with test-runner agent
3. Test ConfigPanel with test-runner agent

### Example 3: Coverage Analysis

**Request**: "Generate coverage reports for all modules in parallel"

**Parallel Tasks**:
1. Generate coverage for src/services with test-runner agent
2. Generate coverage for src/components with test-runner agent
3. Generate coverage for electron/ipc-handlers with test-runner agent

## Important Rules

- Only launch test-runner agents for independent test suites
- Each agent should test a different module or file
- Wait for all agents to complete before reporting
- Aggregate results into a single report
- Handle agent failures gracefully

## Error Handling

If a test-runner agent fails:
1. Document which test suite failed
2. Record the error message
3. Continue with other test suites if possible
4. Include the failure in the final report
5. Suggest retrying the failed suite

## Notes

- Parallel testing can significantly reduce execution time
- Each test-runner agent operates independently
- Combine results for a complete picture
- Use this workflow for large test suites