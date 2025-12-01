/**
 * useConfigManagement - Hook for configuration management
 *
 * Encapsulates config save/reset logic with store integration.
 * Uses ConfigService to ensure side effects (locale change, log level) are applied.
 */

import type { ConfigLayer } from '@/config/types'
import { useSettingsStore } from '@/ui/stores/settingsStore'

/**
 * Hook for configuration management
 *
 * @example
 * ```tsx
 * const { saveConfig, resetConfig } = useConfigManagement()
 *
 * // Save a config value
 * await saveConfig('locale', 'ja', 'workspace')
 *
 * // Reset a config value
 * await resetConfig('locale', 'workspace')
 * ```
 */
export function useConfigManagement() {
  const setCurrentConfig = useSettingsStore((s) => s.setCurrentConfig)
  const reloadLayerConfigs = useSettingsStore((s) => s.reloadLayerConfigs)

  const saveConfig = async (key: string, value: unknown, layer?: ConfigLayer) => {
    try {
      // Use ConfigService to apply side effects (locale → changeLocale, logLevel → setLogLevel)
      const { ConfigService } = await import('@/config/service')
      const service = new ConfigService()

      const newConfig = await service.changeConfig(key, value, layer || 'workspace')
      setCurrentConfig(newConfig)
      await reloadLayerConfigs()
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  const resetConfig = async (key: string, layer?: ConfigLayer) => {
    try {
      const { ConfigService } = await import('@/config/service')
      const service = new ConfigService()

      const newConfig = await service.resetConfig(key, layer || 'workspace')
      setCurrentConfig(newConfig)
      await reloadLayerConfigs()
    } catch (error) {
      console.error('Failed to reset config:', error)
    }
  }

  return { saveConfig, resetConfig }
}
