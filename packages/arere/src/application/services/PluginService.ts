/**
 * PluginService - Application Layer
 *
 * Service responsible for plugin management business logic
 *
 * - Toggle plugin enabled/disabled state
 * - Save and merge plugin configuration
 * - Testable independently from UI layer
 *
 * @remarks
 * This service performs the following plugin management workflow:
 * 1. Update plugin state (enabled/disabled)
 * 2. Persist configuration (Infrastructure layer)
 * 3. Reload and merge configuration
 */

import type { LoadedPlugin } from '@/domain/plugin/types'
import { FileConfigManager } from '@/infrastructure/config/manager'
import type { ArereConfig } from '@/infrastructure/config/schema'
import { defaultConfig } from '@/infrastructure/config/schema'
import type { ConfigLayer } from '@/infrastructure/config/types'
import { logger } from '@/shared/utils/logger'

/**
 * Plugin toggle operation result
 */
export interface PluginToggleResult {
  /** Updated plugin list */
  plugins: LoadedPlugin[]
  /** Updated configuration */
  config: ArereConfig
}

/**
 * Plugin management service
 *
 * @example
 * ```typescript
 * const service = new PluginService()
 *
 * // Disable a plugin
 * const result = await service.togglePlugin(
 *   currentPlugins,
 *   currentConfig,
 *   plugin,
 *   false,
 *   'workspace'
 * )
 *
 * // Save plugin configuration
 * const newConfig = await service.savePluginConfig(
 *   plugin,
 *   { apiKey: 'xxx' },
 *   'user'
 * )
 * ```
 */
export class PluginService {
  /**
   * Toggle plugin enabled/disabled state
   *
   * @param currentPlugins - Current plugin list
   * @param currentConfig - Current configuration
   * @param plugin - Target plugin
   * @param enabled - Whether to enable the plugin
   * @param layer - Target layer to save
   * @returns Updated plugin list and configuration
   *
   * @remarks
   * This method performs the following steps:
   * 1. Update enabled state of target plugin in plugin list
   * 2. Update plugins.{name}.enabled in configuration object
   * 3. Save to configuration file in Infrastructure layer
   */
  async togglePlugin(
    currentPlugins: LoadedPlugin[],
    currentConfig: ArereConfig,
    plugin: LoadedPlugin,
    enabled: boolean,
    layer: ConfigLayer = 'workspace',
  ): Promise<PluginToggleResult> {
    // 1. Update plugin list (immutable operation)
    const updatedPlugins = currentPlugins.map((p) =>
      p.meta.name === plugin.meta.name ? { ...p, enabled } : p,
    )

    // 2. Update configuration object (immutable operation)
    const newConfig: ArereConfig = {
      ...currentConfig,
      plugins: {
        ...currentConfig.plugins,
        [plugin.meta.name]: { enabled },
      },
    }

    // 3. Infrastructure layer: Persist to file system
    const manager = new FileConfigManager()
    await manager.save(layer, `plugins.${plugin.meta.name}.enabled`, enabled)

    logger.info(`Plugin ${plugin.meta.name} ${enabled ? 'enabled' : 'disabled'}`)

    return {
      plugins: updatedPlugins,
      config: newConfig,
    }
  }

  /**
   * Save plugin configuration
   *
   * @param plugin - Target plugin
   * @param config - Configuration to save
   * @param layer - Target layer to save
   * @returns New merged configuration
   *
   * @remarks
   * This method performs the following steps:
   * 1. Save each configuration key individually (partial save)
   * 2. Reload and merge configuration (user + workspace)
   * 3. Return merged configuration
   */
  async savePluginConfig(
    plugin: LoadedPlugin,
    config: Record<string, unknown>,
    layer: ConfigLayer,
  ): Promise<ArereConfig> {
    // 1. Save each configuration key individually
    const manager = new FileConfigManager()
    for (const [key, value] of Object.entries(config)) {
      await manager.save(layer, `plugins.${plugin.meta.name}.config.${key}`, value)
    }

    // 2. Reload and merge configuration
    const mergedConfig = await manager.loadMerged()

    logger.info(
      `Plugin ${plugin.meta.name} configuration saved to ${layer} layer (${Object.keys(config).length} key(s))`,
    )

    return mergedConfig
  }

  /**
   * Update plugin's userConfig from merged configuration
   *
   * @param currentPlugins - Current plugin list
   * @param mergedConfig - Merged configuration
   * @param plugin - Target plugin
   * @returns Updated plugin list
   *
   * @remarks
   * Used to update plugin's userConfig field with latest configuration after saving.
   */
  updatePluginUserConfig(
    currentPlugins: LoadedPlugin[],
    mergedConfig: ArereConfig,
    plugin: LoadedPlugin,
  ): LoadedPlugin[] {
    // Get target plugin's configuration from merged configuration
    const pluginConfig = mergedConfig.plugins?.[plugin.meta.name]

    // Update userConfig only if pluginConfig is an object with config property
    const pluginUserConfig =
      typeof pluginConfig === 'object' && pluginConfig !== null && 'config' in pluginConfig
        ? (pluginConfig.config as Record<string, unknown>)
        : undefined

    // Update plugin list
    return currentPlugins.map((p) =>
      p.meta.name === plugin.meta.name ? { ...p, userConfig: pluginUserConfig } : p,
    )
  }
}
