# Generate Docs Skill

Invoke the `documentation-generator` agent to generate and maintain documentation.

## Usage

```
/generate-docs
```

## Description

This skill invokes the `documentation-generator` agent to:

1. **API Documentation**: Generate documentation for APIs and services
2. **README Updates**: Update README with current project state
3. **Code Comments**: Add missing documentation comments
4. **Architecture Docs**: Create or update architecture documentation

## Agent Details

| Property | Value |
|----------|-------|
| Agent | `documentation-generator` |
| Tools | `Bash(npm run validate*)`, `read-kanban`, `run-validation`, `Read`, `Write`, `Edit`, `Glob`, `Grep` |

## Workflow

1. Read the KANBAN to understand current task context
2. Scan the codebase for undocumented APIs
3. Identify missing or outdated documentation
4. Generate documentation following project standards
5. Validate changes

## Output

- Updated README.md
- New API documentation files
- Updated inline code comments
- Architecture documentation updates

## When to Use

- After implementing new features
- When documentation is outdated
- Before releases
- After major refactoring
- When onboarding new developers