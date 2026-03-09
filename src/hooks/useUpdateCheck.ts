import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { updateService } from '@/services/updateService'
import { Logger } from '@/utils/logger'
import { useToast } from './useToast'

const logger = new Logger('useUpdateCheck')

/**
 * Hook to check for application updates at startup
 * Displays a toast notification if a newer version is available
 */
export const useUpdateCheck = () => {
  const { t } = useTranslation()
  const { addToast } = useToast()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Only check once per app session
    if (hasCheckedRef.current) {
      return
    }

    hasCheckedRef.current = true

    const checkForUpdates = async () => {
      try {
        const result = await updateService.checkForUpdate()

        if (result?.hasUpdate) {
          const message = t('update.available', {
            currentVersion: result.currentVersion,
            latestVersion: result.latestVersion,
          })

          // Use 'info' type with longer duration for update notification
          addToast('info', message, 10000, {
            url: result.releaseUrl,
            label: t('update.viewRelease'),
          })

          logger.info(`Update available: ${result.currentVersion} -> ${result.latestVersion}`)
        }
      } catch (error) {
        // Silently fail - update check is not critical
        logger.warn('Update check failed:', error)
      }
    }

    // Delay the check slightly to not block initial rendering
    const timeoutId = setTimeout(checkForUpdates, 2000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [addToast, t])
}
