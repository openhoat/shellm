import { Logger } from '@/utils/logger'

const logger = new Logger('updateService')

/**
 * GitHub release information from the API
 */
interface GitHubRelease {
  tag_name: string
  name: string
  html_url: string
  published_at: string
  body?: string
}

/**
 * Update check result
 */
export interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  releaseUrl: string
  releaseNotes?: string
}

/**
 * Compare two semantic version strings
 * Returns:
 *   - positive number if v1 > v2
 *   - negative number if v1 < v2
 *   - 0 if v1 === v2
 */
function compareVersions(v1: string, v2: string): number {
  // Remove 'v' prefix if present
  const normalize = (v: string) => v.replace(/^v/, '')

  const parts1 = normalize(v1).split('.').map(Number)
  const parts2 = normalize(v2).split('.').map(Number)

  const maxLength = Math.max(parts1.length, parts2.length)

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] ?? 0
    const p2 = parts2[i] ?? 0

    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }

  return 0
}

/**
 * Service for checking application updates from GitHub releases
 */
export const updateService = {
  /**
   * Get the current application version
   */
  getCurrentVersion(): string {
    // Import version from package.json via vite define or use hardcoded fallback
    return __APP_VERSION__ ?? '1.3.9'
  },

  /**
   * Fetch the latest release from GitHub API
   * @param timeout - Request timeout in milliseconds (default: 5000)
   */
  async fetchLatestRelease(timeout = 5000): Promise<GitHubRelease | null> {
    const GITHUB_API_URL = 'https://api.github.com/repos/openhoat/termaid/releases/latest'

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(GITHUB_API_URL, {
        signal: controller.signal,
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        logger.warn(`GitHub API returned ${response.status}`)
        return null
      }

      const release: GitHubRelease = await response.json()
      return release
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn('Update check timed out')
      } else {
        logger.warn('Failed to fetch latest release:', error)
      }
      return null
    }
  },

  /**
   * Check if a newer version is available
   * @param timeout - Request timeout in milliseconds (default: 5000)
   */
  async checkForUpdate(timeout = 5000): Promise<UpdateCheckResult | null> {
    const currentVersion = this.getCurrentVersion()
    const release = await this.fetchLatestRelease(timeout)

    if (!release) {
      return null
    }

    const latestVersion = release.tag_name
    const hasUpdate = compareVersions(currentVersion, latestVersion) < 0

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseUrl: release.html_url,
      releaseNotes: release.body,
    }
  },
}
