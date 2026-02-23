#!/usr/bin/env node

/**
 * Fix incorrect path alias resolutions in compiled JavaScript files.
 *
 * The tsc-alias tool incorrectly resolves 'electron' npm package imports
 * to relative paths like '../electron' or '../../electron'. This script
 * fixes those imports back to 'electron'.
 *
 * Also fixes incorrect relative paths for local modules.
 */

const fs = require('node:fs')
const path = require('node:path')

/**
 * Recursively find all .js files in a directory
 */
function findJsFiles(dir) {
  const files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findJsFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Fix imports in a single file
 */
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false

  // Fix 'electron' npm package imports
  // These patterns match require(".../electron") with any number of ../ prefixes
  const electronPatterns = [
    [/'\.\.\/electron'/g, "'electron'"],
    [/'\.\.\/\.\.\/electron'/g, "'electron'"],
    [/'\.\.\/\.\.\/\.\.\/electron'/g, "'electron'"],
    [/"\.\.\/electron"/g, '"electron"'],
    [/"\.\.\/\.\.\/electron"/g, '"electron"'],
    [/"\.\.\/\.\.\/\.\.\/electron"/g, '"electron"'],
  ]

  for (const [pattern, replacement] of electronPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement)
      modified = true
    }
  }

  // Fix incorrect relative path for config in ipc-handlers/terminal.js
  // require('../../electron/ipc-handlers/config') should be require('./config')
  const configPatterns = [
    [/'\.\.\/\.\.\/electron\/ipc-handlers\/config'/g, "'./config'"],
    [/"\.\.\/\.\.\/electron\/ipc-handlers\/config"/g, '"./config"'],
  ]

  for (const [pattern, replacement] of configPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement)
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
  }
}

// Main - process electron and shared output directories
const distBase = path.join(__dirname, '..', 'dist')
const dirs = [path.join(distBase, 'electron'), path.join(distBase, 'shared')].filter(dir =>
  fs.existsSync(dir)
)

if (dirs.length === 0) {
  process.exit(0)
}

const jsFiles = dirs.flatMap(dir => findJsFiles(dir))

for (const file of jsFiles) {
  fixImportsInFile(file)
}
