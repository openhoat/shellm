const fs = require('fs-extra')
const path = require('path')

const distElectronDir = path.join(__dirname, '..', 'dist-electron')
const electronDir = path.join(distElectronDir, 'electron')

// Replace incorrect require paths in JS files
async function fixRequirePaths(filePath) {
  let content = await fs.readFile(filePath, 'utf8')

  // Replace all variations of require paths to electron
  content = content.replace(/require\(["']\.\/electron["']\)/g, 'require("electron")')
  content = content.replace(/require\(["']\.\.\/electron["']\)/g, 'require("electron")')
  content = content.replace(/require\(["']\.\.\/\.\.\/electron["']\)/g, 'require("electron")')

  // Replace require("../shared/...") with require("./shared/...")
  content = content.replace(/require\(["']\.\.\/shared\//g, 'require("./shared/')

  await fs.writeFile(filePath, content)
  console.log(`Fixed require paths in: ${path.relative(distElectronDir, filePath)}`)
}

// Recursively fix all JS files
async function fixAllJsFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true })

  for (const file of files) {
    const fullPath = path.join(dir, file.name)

    if (file.isDirectory()) {
      await fixAllJsFiles(fullPath)
    } else if (file.isFile() && file.name.endsWith('.js')) {
      await fixRequirePaths(fullPath)
    }
  }
}

// Move files from dist-electron/electron/* to dist-electron/*
async function restructure() {
  if (!fs.existsSync(electronDir)) {
    console.log('No electron directory to restructure')
    return
  }

  const files = await fs.readdir(electronDir)

  for (const file of files) {
    const srcPath = path.join(electronDir, file)
    const destPath = path.join(distElectronDir, file)

    await fs.move(srcPath, destPath, { overwrite: true })
    console.log(`Moved: ${file}`)
  }

  // Remove the empty electron directory
  await fs.rmdir(electronDir)
  console.log('Removed empty electron directory')

  // Fix all require paths in JS files
  console.log('Fixing require paths...')
  await fixAllJsFiles(distElectronDir)
}

restructure().catch(err => {
  console.error('Error restructuring dist-electron:', err)
  process.exit(1)
})
