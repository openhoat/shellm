#!/usr/bin/env node

/**
 * Script to bump version across multiple files in the project.
 *
 * Updates version in:
 * - package.json (via npm version)
 * - package-lock.json (via npm version)
 * - README.md (download links)
 *
 * Usage:
 *   node scripts/bump-version.js <version|bump-type>
 *
 * Examples:
 *   node scripts/bump-version.js 1.2.4      # Set specific version
 *   node scripts/bump-version.js patch      # Bump patch (1.2.3 -> 1.2.4)
 *   node scripts/bump-version.js minor      # Bump minor (1.2.3 -> 1.3.0)
 *   node scripts/bump-version.js major      # Bump major (1.2.3 -> 2.0.0)
 */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const PROJECT_ROOT = process.cwd()
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json')
const README_PATH = path.join(PROJECT_ROOT, 'README.md')

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'))
  return packageJson.version
}

/**
 * Calculate new version based on bump type
 */
function calculateNewVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(Number)

  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${currentVersion}`)
  }

  let [major, minor, patch] = parts

  switch (bumpType) {
    case 'major':
      major++
      minor = 0
      patch = 0
      break
    case 'minor':
      minor++
      patch = 0
      break
    case 'patch':
      patch++
      break
    default:
      throw new Error(`Invalid bump type: ${bumpType}. Use: patch, minor, or major`)
  }

  return `${major}.${minor}.${patch}`
}

/**
 * Check if string is a valid semantic version
 */
function isValidSemver(version) {
  return /^\d+\.\d+\.\d+$/.test(version)
}

/**
 * Bump version in package.json and package-lock.json using npm version
 */
function bumpPackageVersion(bumpTypeOrVersion) {
  // biome-ignore lint/suspicious/noConsole: Script CLI - logging progress
  console.log(`Bumping version in package.json and package-lock.json...`)

  try {
    execSync(`npm version ${bumpTypeOrVersion} --no-git-tag-version`, {
      stdio: 'inherit',
      cwd: PROJECT_ROOT,
    })
  } catch (error) {
    throw new Error(`Failed to bump package version: ${error.message}`)
  }
}

/**
 * Update download links in README.md
 */
function updateReadmeVersion(oldVersion, newVersion) {
  // biome-ignore lint/suspicious/noConsole: Script CLI - logging progress
  console.log(`Updating download links in README.md...`)

  const readme = fs.readFileSync(README_PATH, 'utf-8')

  // Replace version in download links
  // Pattern: Termaid-X.Y.Z.AppImage, termaid_X.Y.Z_amd64.deb, Termaid-X.Y.Z-arm64.dmg, Termaid.Setup.X.Y.Z.exe
  const versionPattern = new RegExp(
    `(Termaid-|termaid_|Termaid\\.Setup\\.)${escapeRegExp(oldVersion)}`,
    'g'
  )

  const updatedReadme = readme.replace(versionPattern, `$1${newVersion}`)

  if (updatedReadme === readme) {
    // biome-ignore lint/suspicious/noConsole: Script CLI - warning
    console.log('Warning: No version references found in README.md')
    return false
  }

  fs.writeFileSync(README_PATH, updatedReadme, 'utf-8')
  return true
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    // biome-ignore lint/suspicious/noConsole: Script CLI - usage info
    console.log(`
Usage: node scripts/bump-version.js <version|bump-type>

Arguments:
  version    Specific version to set (e.g., 1.2.4)
  bump-type  Version bump type: patch, minor, or major

Examples:
  node scripts/bump-version.js 1.2.4      # Set specific version
  node scripts/bump-version.js patch      # Bump patch (1.2.3 -> 1.2.4)
  node scripts/bump-version.js minor      # Bump minor (1.2.3 -> 1.3.0)
  node scripts/bump-version.js major      # Bump major (1.2.3 -> 2.0.0)
`)
    process.exit(1)
  }

  const input = args[0]
  const currentVersion = getCurrentVersion()

  // biome-ignore lint/suspicious/noConsole: Script CLI - logging progress
  console.log(`Current version: ${currentVersion}`)

  let newVersion
  let bumpType

  if (isValidSemver(input)) {
    // Direct version specified
    newVersion = input
    bumpType = input
  } else if (['patch', 'minor', 'major'].includes(input)) {
    // Bump type specified
    newVersion = calculateNewVersion(currentVersion, input)
    bumpType = input
  } else {
    // biome-ignore lint/suspicious/noConsole: Script CLI - error
    console.error(
      `Error: Invalid argument "${input}". Use a version (X.Y.Z) or bump type (patch|minor|major)`
    )
    process.exit(1)
  }

  if (newVersion === currentVersion) {
    // biome-ignore lint/suspicious/noConsole: Script CLI - error
    console.error(`Error: New version (${newVersion}) is the same as current version`)
    process.exit(1)
  }

  // biome-ignore lint/suspicious/noConsole: Script CLI - logging progress
  console.log(`New version: ${newVersion}`)
  console.log('')

  try {
    // Step 1: Bump package.json and package-lock.json
    bumpPackageVersion(bumpType)

    // Step 2: Update README.md download links
    const readmeUpdated = updateReadmeVersion(currentVersion, newVersion)

    // Summary
    // biome-ignore lint/suspicious/noConsole: Script CLI - logging success
    console.log('')
    console.log('Version bump completed successfully!')
    console.log('')
    console.log('Summary:')
    console.log(`  - package.json: ${currentVersion} -> ${newVersion}`)
    console.log(`  - package-lock.json: updated`)
    console.log(`  - README.md: ${readmeUpdated ? 'download links updated' : 'no changes needed'}`)
    console.log('')
    console.log('Next steps:')
    console.log('  1. Run: npm run validate')
    console.log('  2. Run: npm run changelog')
    console.log(
      '  3. Commit: git add . && git commit -m "chore(release): bump version to v' +
        newVersion +
        '"'
    )
    console.log('  4. Tag: git tag -a v' + newVersion + ' -m "Release v' + newVersion + '"')
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Script CLI - error
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  getCurrentVersion,
  calculateNewVersion,
  bumpPackageVersion,
  updateReadmeVersion,
}
