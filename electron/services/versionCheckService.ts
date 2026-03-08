import * as fs from 'node:fs'
import * as path from 'node:path'
import axios from 'axios'
import { Logger } from '../utils/logger'

// Logger instance for version check service
const logger = new Logger('VersionCheck')

interface VersionCheckResult {
  currentVersion: string
  latestVersion: string | null
  isUpdateAvailable: boolean
  error?: string
}

interface GitHubRelease {
  tag_name: string
  name: string
  published_at: string
}

/**
 * Get the current version from package.json
 */
export const getCurrentVersion = (): string => {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    return packageJson.version as string
  } catch (error) {
    throw new Error(`Failed to read version from package.json: ${error}`)
  }
}

/**
 * Fetch the latest version from GitHub releases
 */
export const getLatestVersion = async (): Promise<string | null> => {
  try {
    const response = await axios.get<GitHubRelease>(
      'https://api.github.com/repos/openhoat/termaid/releases/latest',
      {
        timeout: 5000,
        headers: {
          'User-Agent': 'Termaid-Version-Check',
        },
      }
    )

    // Extract version from tag_name (e.g., "v1.3.7" -> "1.3.7")
    const tagName = response.data.tag_name
    return tagName.startsWith('v') ? tagName.substring(1) : tagName
  } catch (error) {
    logger.warn('Failed to fetch latest version from GitHub', error)
    return null
  }
}

/**
 * Compare two semantic versions (e.g., "1.3.7" vs "1.4.0")
 * Returns true if remote version is newer than current version
 */
export const isNewerVersion = (current: string, remote: string): boolean => {
  const parseCurrent = current.split('.').map(Number)
  const parseRemote = remote.split('.').map(Number)

  for (let i = 0; i < Math.max(parseCurrent.length, parseRemote.length); i++) {
    const currentPart = parseCurrent[i] || 0
    const remotePart = parseRemote[i] || 0

    if (remotePart > currentPart) {
      return true
    }
    if (remotePart < currentPart) {
      return false
    }
  }

  return false
}

/**
 * Check for updates by comparing current version with latest GitHub release
 */
export const checkForUpdates = async (): Promise<VersionCheckResult> => {
  try {
    const currentVersion = getCurrentVersion()
    const latestVersion = await getLatestVersion()

    if (!latestVersion) {
      return {
        currentVersion,
        latestVersion: null,
        isUpdateAvailable: false,
        error: 'Unable to fetch latest version',
      }
    }

    const isUpdateAvailable = isNewerVersion(currentVersion, latestVersion)

    logger.info('Version check completed', {
      currentVersion,
      latestVersion,
      updateAvailable: isUpdateAvailable,
    })

    return {
      currentVersion,
      latestVersion,
      isUpdateAvailable,
    }
  } catch (error) {
    return {
      currentVersion: 'unknown',
      latestVersion: null,
      isUpdateAvailable: false,
      error: String(error),
    }
  }
}
