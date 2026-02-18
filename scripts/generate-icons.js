#!/usr/bin/env node
/**
 * Generate application icons from the SVG logo
 * Creates PNG, ICO, and ICNS files for Electron packaging
 */

const sharp = require('sharp')
const path = require('node:path')
const fs = require('node:fs')

const INPUT_SVG = path.join(__dirname, '../docs/public/logo.svg')
const OUTPUT_DIR = path.join(__dirname, '../build/icons')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Icon sizes to generate
const sizes = [16, 24, 32, 48, 64, 96, 128, 256, 512]

async function generatePngIcons() {
  // biome-ignore lint/suspicious/noConsole: Build script output
  console.log('Generating PNG icons...')

  for (const size of sizes) {
    const outputPath = path.join(OUTPUT_DIR, `${size}x${size}.png`)
    await sharp(INPUT_SVG).resize(size, size).png().toFile(outputPath)
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log(`  Created: ${size}x${size}.png`)
  }

  // Create the main icon.png (512x512)
  const mainIconPath = path.join(OUTPUT_DIR, 'icon.png')
  await sharp(INPUT_SVG).resize(512, 512).png().toFile(mainIconPath)
  // biome-ignore lint/suspicious/noConsole: Build script output
  console.log('  Created: icon.png (512x512)')
}

async function generateIco() {
  // biome-ignore lint/suspicious/noConsole: Build script output
  console.log('Generating ICO for Windows...')

  // For ICO, we need multiple sizes in one file
  // Use png-to-ico or similar package, but for simplicity,
  // we'll create a basic 256x256 PNG that electron-builder can use
  const icoPath = path.join(OUTPUT_DIR, 'icon.ico')

  // Note: electron-builder will convert PNG to ICO automatically
  // We'll copy the 256x256 as a fallback

  // For now, create a PNG that electron-builder can convert
  // electron-builder handles the conversion during build
  // biome-ignore lint/suspicious/noConsole: Build script output
  console.log('  Note: electron-builder will generate ICO from PNG during build')

  // Create icon.ico as a 256x256 PNG (electron-builder will convert it)
  await sharp(INPUT_SVG).resize(256, 256).png().toFile(icoPath.replace('.ico', '-ico-source.png'))
  // biome-ignore lint/suspicious/noConsole: Build script output
  console.log('  Created: icon-ico-source.png (will be converted by electron-builder)')
}

async function generateIcns() {
  // biome-ignore lint/suspicious/noConsole: Build script output
  console.log('Generating ICNS for macOS...')

  // Note: ICNS generation requires specific tools
  // electron-builder can convert PNG to ICNS during build
  // We just need to provide a high-resolution PNG
  // biome-ignore lint/suspicious/noConsole: Build script output
  console.log('  Note: electron-builder will generate ICNS from PNG during build')
}

async function main() {
  try {
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log('Starting icon generation...')
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log(`Input: ${INPUT_SVG}`)
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log(`Output: ${OUTPUT_DIR}`)
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log()

    await generatePngIcons()
    await generateIco()
    await generateIcns()

    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log()
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log('Icon generation complete!')
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log('Note: For Windows and macOS builds, electron-builder will')
    // biome-ignore lint/suspicious/noConsole: Build script output
    console.log('automatically convert the PNG icons to ICO and ICNS formats.')
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Build script error output
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

main()
