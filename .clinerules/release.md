# Release Rule

## Objective

This rule defines the standard release process for the project to ensure consistent versioning and documentation.

## Versioning Scheme

The project follows [Semantic Versioning (SemVer)](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

## Tag Format

All releases must be tagged using the format `vX.Y.Z` (with a `v` prefix). This format is required to trigger the CI/CD pipelines (e.g., GitHub Actions for building releases).

## Release Workflow

The following steps must be followed when performing a release:

1. **Read current version**: Check the current version in `package.json`.
2. **Choose bump type**: Decide between `patch`, `minor`, or `major`.
3. **Execute version bump**: Run the dedicated script:
   ```bash
   npm run bump-version -- <type>
   ```
   This script updates `package.json`, `package-lock.json`, and `README.md`.
4. **Regenerate CHANGELOG**: Run the changelog generator to include latest commits:
   ```bash
   npm run changelog
   ```
5. **Validation**: Always run full project validation before committing:
   ```bash
   npm run validate
   ```
6. **Coherence Check**: Ensure no residual references to the old version remain in the project:
   ```bash
   # Replace OLD_VERSION and NEW_VERSION with actual values
   grep -r "OLD_VERSION" . --exclude-dir=node_modules --exclude-dir=dist --exclude=package-lock.json
   ```
   Check especially: `README.md`, `CHANGELOG.md`, `docs/.vitepress/config.mts`, `docs/guide/getting-started.md`, and test files.
7. **Commit release**: Create a commit following Conventional Commits:
   ```bash
   git commit -m "chore(release): bump version to vX.Y.Z"
   ```
8. **Create tag**: Create an annotated Git tag:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   ```

## Files Modified during Release

- `package.json`: Main version source.
- `package-lock.json`: Dependency lock file.
- `README.md`: Download links and documentation references.
- `CHANGELOG.md`: Modification history.

## Verification

Before pushing, ensure:
- [ ] Version is consistent across all modified files.
- [ ] All tests pass (`npm run validate`).
- [ ] CHANGELOG.md is up to date.
- [ ] Git tag `vX.Y.Z` exists locally.
