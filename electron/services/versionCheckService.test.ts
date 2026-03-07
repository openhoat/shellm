import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock axios before importing it
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

import axios from 'axios'
import {
  checkForUpdates,
  getCurrentVersion,
  getLatestVersion,
  isNewerVersion,
} from './versionCheckService'

const mockedAxios = vi.mocked(axios)

describe('versionCheckService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentVersion', () => {
    test('should return the current version from package.json', () => {
      const version = getCurrentVersion()
      expect(version).toBeDefined()
      expect(typeof version).toBe('string')
      expect(version).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe('getLatestVersion', () => {
    test('should return latest version from GitHub API', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          tag_name: 'v1.4.0',
          name: 'Release 1.4.0',
          published_at: '2024-01-01T00:00:00Z',
        },
      })

      const version = await getLatestVersion()
      expect(version).toBe('1.4.0')
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/openhoat/termaid/releases/latest',
        expect.objectContaining({
          timeout: 5000,
          headers: { 'User-Agent': 'Termaid-Version-Check' },
        })
      )
    })

    test('should handle tag name without "v" prefix', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          tag_name: '1.4.0',
          name: 'Release 1.4.0',
          published_at: '2024-01-01T00:00:00Z',
        },
      })

      const version = await getLatestVersion()
      expect(version).toBe('1.4.0')
    })

    test('should return null on API error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      const version = await getLatestVersion()
      expect(version).toBeNull()
    })
  })

  describe('isNewerVersion', () => {
    test('should return true when remote version is newer (major)', () => {
      expect(isNewerVersion('1.3.7', '2.0.0')).toBe(true)
    })

    test('should return true when remote version is newer (minor)', () => {
      expect(isNewerVersion('1.3.7', '1.4.0')).toBe(true)
    })

    test('should return true when remote version is newer (patch)', () => {
      expect(isNewerVersion('1.3.7', '1.3.8')).toBe(true)
    })

    test('should return false when versions are equal', () => {
      expect(isNewerVersion('1.3.7', '1.3.7')).toBe(false)
    })

    test('should return false when remote version is older', () => {
      expect(isNewerVersion('1.4.0', '1.3.7')).toBe(false)
    })

    test('should handle version with different lengths', () => {
      expect(isNewerVersion('1.3', '1.3.1')).toBe(true)
      expect(isNewerVersion('1.3.0', '1.3')).toBe(false)
    })
  })

  describe('checkForUpdates', () => {
    test('should detect update available', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          tag_name: 'v2.0.0',
          name: 'Release 2.0.0',
          published_at: '2024-01-01T00:00:00Z',
        },
      })

      const result = await checkForUpdates()
      expect(result.isUpdateAvailable).toBe(true)
      expect(result.latestVersion).toBe('2.0.0')
      expect(result.currentVersion).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    test('should detect no update available', async () => {
      const currentVersion = getCurrentVersion()
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          tag_name: `v${currentVersion}`,
          name: `Release ${currentVersion}`,
          published_at: '2024-01-01T00:00:00Z',
        },
      })

      const result = await checkForUpdates()
      expect(result.isUpdateAvailable).toBe(false)
      expect(result.latestVersion).toBe(currentVersion)
      expect(result.error).toBeUndefined()
    })

    test('should handle API error gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'))

      const result = await checkForUpdates()
      expect(result.isUpdateAvailable).toBe(false)
      expect(result.latestVersion).toBeNull()
      expect(result.error).toBe('Unable to fetch latest version')
    })
  })
})
