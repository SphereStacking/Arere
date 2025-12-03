/**
 * usePluginManagement - Hook for plugin management
 *
 * Encapsulates plugin selection, toggling, and configuration save logic.
 * Uses Zustand stores for state management.
 */

import type { ConfigLayer } from '@/config/types'
import { logger } from '@/lib/logger'
import { PluginService } from '@/plugin/service'
import type { LoadedPlugin } from '@/plugin/types'
import { useScreenStore } from '@/ui/stores/screenStore'
import { useSettingsStore } from '@/ui/stores/settingsStore'
import { useMemo } from 'react'

/**
 * Hook for plugin management
 *
 * @example
 * ```tsx
 * const { selectPlugin, togglePlugin, savePluginConfig } = usePluginManagement()
 *
 * // Select a plugin to view details
 * selectPlugin(plugin)
 *
 * // Toggle plugin enabled state
 * await togglePlugin(plugin, true)
 *
 * // Save plugin configuration
 * await savePluginConfig({ apiKey: 'xxx' }, 'workspace')
 * ```
 */
export function usePluginManagement() {
  const setScreen = useScreenStore((s) => s.setScreen)

  const currentConfig = useSettingsStore((s) => s.currentConfig)
  const currentPlugins = useSettingsStore((s) => s.currentPlugins)
  const selectedPlugin = useSettingsStore((s) => s.selectedPlugin)
  const onPluginReload = useSettingsStore((s) => s.onPluginReload)
  const setSelectedPlugin = useSettingsStore((s) => s.setSelectedPlugin)
  const setCurrentConfig = useSettingsStore((s) => s.setCurrentConfig)
  const setCurrentPlugins = useSettingsStore((s) => s.setCurrentPlugins)
  const setCurrentActions = useSettingsStore((s) => s.setCurrentActions)
  const reloadLayerConfigs = useSettingsStore((s) => s.reloadLayerConfigs)

  // PluginService instance (Application Layer)
  const pluginService = useMemo(() => new PluginService(), [])

  const selectPlugin = (plugin: LoadedPlugin) => {
    setSelectedPlugin(plugin)
    setScreen('plugin-detail')
  }

  const togglePlugin = async (plugin: LoadedPlugin, enabled: boolean) => {
    try {
      // Delegate to PluginService (Application Layer)
      const result = await pluginService.togglePlugin(
        currentPlugins,
        currentConfig,
        plugin,
        enabled,
        'workspace',
      )

      // Update UI state
      setCurrentPlugins(result.plugins)
      setCurrentConfig(result.config)

      // Reload actions dynamically
      if (onPluginReload) {
        const reloadedActions = await onPluginReload(result.config)
        setCurrentActions(reloadedActions)
      }
    } catch (error) {
      logger.error('Failed to update plugin state', error)
    }
  }

  const savePluginConfig = async (config: Record<string, unknown>, layer: ConfigLayer) => {
    if (!selectedPlugin) return

    try {
      // Delegate to PluginService (Application Layer)
      const mergedConfig = await pluginService.savePluginConfig(selectedPlugin, config, layer)

      // Update UI state
      setCurrentConfig(mergedConfig)

      // Update plugin userConfig
      const updatedPlugins = pluginService.updatePluginUserConfig(
        currentPlugins,
        mergedConfig,
        selectedPlugin,
      )
      setCurrentPlugins(updatedPlugins)

      // Reload layer configs
      await reloadLayerConfigs()

      // Go back to settings
      setScreen('settings')
      setSelectedPlugin(null)
    } catch (error) {
      logger.error('Failed to save plugin configuration', error)
    }
  }

  return {
    selectPlugin,
    togglePlugin,
    savePluginConfig,
  }
}
