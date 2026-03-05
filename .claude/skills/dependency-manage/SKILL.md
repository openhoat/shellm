# Dependency Manage Skill

Invoke the `dependency-manager` agent to manage package dependencies.

## Usage

```
/dependency-manage
```

## Description

This skill invokes the `dependency-manager` agent to:

1. **Update Dependencies**: Check for and apply dependency updates
2. **Security Audit**: Identify vulnerable dependencies
3. **Cleanup**: Remove unused dependencies
4. **Compatibility Check**: Verify dependency compatibility

## Agent Details

| Property | Value |
|----------|-------|
| Agent | `dependency-manager` |
| Tools | `Bash(npm*)`, `Read`, `Edit`, `Glob`, `Grep` |

## Workflow

1. Check for outdated dependencies with `npm outdated`
2. Run security audit with `npm audit`
3. Identify unused dependencies
4. Check for peer dependency conflicts
5. Provide update recommendations

## Output

- Outdated dependencies list
- Security vulnerability report
- Unused dependencies report
- Peer dependency conflicts
- Update recommendations with breaking changes notes

## When to Use

- When dependencies need updating
- After security vulnerability report
- When cleaning up the project
- Before major releases
- When adding new dependencies