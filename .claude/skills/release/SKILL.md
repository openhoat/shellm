---
name: release
description: Automate app versioning - bump version, regenerate changelog, create git commit and tag, optionally push.
disable-model-invocation: false
---

# Skill: Release

Base directory for this skill: /home/openhoat/work/shellm/.claude/skills/release

## Description

Automate the release process: version bump, changelog regeneration, git commit, and tag creation.

## Purpose

This skill streamlines the release workflow by automating all the steps needed to create a new version of the application.

## Usage

Invoke this skill when you need to:
- Create a new release version
- Bump the application version (patch, minor, or major)
- Prepare a release commit and tag for CI pipeline

## Execution Steps

### 1. Read current version

Read the current version from `package.json`:
```bash
node -e "console.log(require('./package.json').version)"
```

Display the current version to the user.

### 2. Ask bump type

Ask the user which version bump to apply:

```
Current version: X.Y.Z

Which version bump?
- patch (X.Y.Z+1) - Bug fixes, minor changes
- minor (X.Y+1.0) - New features, backward compatible
- major (X+1.0.0) - Breaking changes
```

Use AskUserQuestion with options:
- **patch**: Bug fixes and minor changes (X.Y.Z -> X.Y.Z+1)
- **minor**: New features, backward compatible (X.Y.Z -> X.Y+1.0)
- **major**: Breaking changes (X.Y.Z -> X+1.0.0)

### 3. Compute new version

Calculate the new version based on the bump type:
- **patch**: Increment Z (e.g., 1.0.0 -> 1.0.1)
- **minor**: Increment Y, reset Z (e.g., 1.0.0 -> 1.1.0)
- **major**: Increment X, reset Y and Z (e.g., 1.0.0 -> 2.0.0)

Display the new version and ask for confirmation.

### 4. Bump version in package.json

Use `npm version <patch|minor|major> --no-git-tag-version` to update the version:
```bash
npm version <bump_type> --no-git-tag-version
```

This updates `package.json` and `package-lock.json` without creating a git commit or tag.

### 5. Regenerate CHANGELOG

Run the changelog generation script:
```bash
npm run changelog
```

### 6. Run validation

Run the project validation to ensure everything is clean:
```bash
npm run validate
```

If validation fails, fix the issues before proceeding.

### 7. Create git commit

Stage all modified files and create the release commit:
```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): bump version to vX.Y.Z"
```

### 8. Create git tag

Create an annotated git tag:
```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

### 9. Ask about pushing

Ask the user if they want to push the commit and tag to trigger the CI release pipeline:

```
Release vX.Y.Z created locally.

Push to remote to trigger CI release pipeline?
- Yes, push commit and tag
- No, keep local only
```

If yes:
```bash
git push && git push --tags
```

### 10. Summary

Display a release summary:
```
Release Summary:
- Version: X.Y.Z -> X'.Y'.Z'
- Commit: <hash>
- Tag: vX'.Y'.Z'
- Pushed: yes/no

Next steps:
- If pushed: CI pipeline will build and publish executables
- If not pushed: run `git push && git push --tags` when ready
```

## Error Handling

### npm version fails
- Check if package.json is valid JSON
- Verify the current version format is valid semver

### Validation fails
- Fix issues reported by `npm run validate`
- Re-run the skill from step 6

### Git commit fails
- Check for uncommitted changes that need to be staged
- Verify git configuration (user.name, user.email)

### Git tag fails
- Check if the tag already exists: `git tag -l vX.Y.Z`
- Delete existing tag if needed: `git tag -d vX.Y.Z`

### Push fails
- Check remote configuration: `git remote -v`
- Verify authentication and permissions

## Important Rules

- Always run validation before creating the release commit
- The tag format must be `vX.Y.Z` (with `v` prefix) to trigger the CI pipeline
- Commit message must follow Conventional Commits: `chore(release): bump version to vX.Y.Z`
- Never force push tags
- Always ask for confirmation before pushing

## Integration

This skill works with:
- `.github/workflows/release.yml` - CI pipeline triggered by `v*` tags
- `scripts/generate-changelog.js` - Changelog generation from git history
- `package.json` - Version source of truth
