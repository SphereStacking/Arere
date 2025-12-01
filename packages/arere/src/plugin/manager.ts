/**
 * Plugin manager - manages plugin loading and action retrieval
 */

import type { Action } from '@/action/types'
import type { ArereConfig } from '@/config/schema'
import { logger } from '@/lib/logger'
import type { LoadedPlugin } from './types'

// Infrastructure layer types (for dependency injection)
export interface PluginPackageInfo {
  name: string
  path: string
  packageJson: {
    name: string
    version: string
    main?: string
    description?: string
    author?: string
    [key: string]: unknown
  }
}

/**
 * Plugin manager dependencies (injected from Infrastructure layer)
 */
export interface PluginManagerDependencies {
  detectPlugins: () => PluginPackageInfo[]
  loadPlugin: (
    packageInfo: PluginPackageInfo,
    userConfig?: Record<string, unknown>,
    enabled?: boolean,
  ) => Promise<LoadedPlugin>
  loadPluginActions: (plugin: LoadedPlugin) => Promise<Action[]>
  registerPluginTranslations: (namespace: string, localesPath: string) => Promise<void>
}

/**
 * Plugin manager class
 */
export class PluginManager {
  private plugins: LoadedPlugin[] = []
  private actions: Action[] = []
  private loaded = false

  constructor(private deps: PluginManagerDependencies) {}

  /**
   * Load all plugins
   *
   * @param config - Arere configuration (optional)
   *
   * @example
   * ```typescript
   * const manager = new PluginManager(deps)
   * await manager.loadAll(config)
   * ```
   */
  async loadAll(config?: ArereConfig): Promise<void> {
    if (this.loaded) {
      logger.debug('Plugins already loaded, skipping')
      return
    }

    logger.info('Loading plugins...')

    // Detect installed plugins
    const packageInfos = this.deps.detectPlugins()

    if (packageInfos.length === 0) {
      logger.info('No plugins found')
      this.loaded = true
      return
    }

    // Load all plugins in parallel
    const results = await Promise.allSettled(
      packageInfos.map(async (packageInfo) => {
        // Extract plugin-specific config
        const pluginUserConfig = config?.plugins?.[packageInfo.name]

        // Determine enabled state
        const enabled =
          pluginUserConfig === false
            ? false
            : typeof pluginUserConfig === 'object'
              ? pluginUserConfig.enabled !== false
              : true

        // Extract config object
        const userConfig =
          typeof pluginUserConfig === 'object' ? pluginUserConfig.config : undefined

        // Load plugin (even if disabled, so it appears in settings)
        const plugin = await this.deps.loadPlugin(packageInfo, userConfig, enabled)

        // Only load actions if plugin is enabled
        const actions = enabled ? await this.deps.loadPluginActions(plugin) : []

        // Log disabled state
        if (!enabled) {
          logger.debug(`Plugin disabled: ${packageInfo.name}`)
        }

        // Register plugin translations if available
        if (plugin.localesPath) {
          try {
            await this.deps.registerPluginTranslations(plugin.i18nNamespace, plugin.localesPath)
            logger.debug(`Registered translations for plugin: ${plugin.meta.name}`)
          } catch (error) {
            logger.warn(`Failed to register translations for plugin ${plugin.meta.name}:`, error)
          }
        }

        return { plugin, actions }
      }),
    )

    // Process results
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result.status === 'fulfilled') {
        const { plugin, actions } = result.value
        this.plugins.push(plugin)
        this.actions.push(...actions)

        const status = plugin.enabled ? 'enabled' : 'disabled'
        logger.info(
          `Loaded plugin: ${plugin.meta.name}@${plugin.meta.version} (${status}) with ${actions.length} action(s)`,
        )
      } else {
        logger.warn(`Failed to load plugin ${packageInfos[i].name}:`, result.reason)
      }
    }

    this.loaded = true
    logger.info(`Loaded ${this.plugins.length} plugin(s) with ${this.actions.length} action(s)`)
  }

  /**
   * Get all loaded plugins
   *
   * @returns Array of loaded plugins
   *
   * @example
   * ```typescript
   * const plugins = manager.getPlugins()
   * ```
   */
  getPlugins(): LoadedPlugin[] {
    return [...this.plugins]
  }

  /**
   * Get all actions from loaded plugins
   *
   * @returns Array of actions
   *
   * @example
   * ```typescript
   * const actions = manager.getActions()
   * ```
   */
  getActions(): Action[] {
    return [...this.actions]
  }

  /**
   * Get the number of loaded plugins
   *
   * @returns Number of plugins
   */
  get count(): number {
    return this.plugins.length
  }

  /**
   * Check if plugins have been loaded
   *
   * @returns True if plugins have been loaded
   */
  get isLoaded(): boolean {
    return this.loaded
  }

  /**
   * Reload actions based on current plugin enabled states
   *
   * @param config - Arere configuration with updated plugin states
   * @returns Array of actions from enabled plugins
   *
   * @example
   * ```typescript
   * const updatedActions = await manager.reloadActions(config)
   * ```
   */
  async reloadActions(config: ArereConfig): Promise<Action[]> {
    const actions: Action[] = []

    // Reload actions for each plugin based on enabled state
    for (const plugin of this.plugins) {
      const pluginUserConfig = config?.plugins?.[plugin.meta.name]

      // Determine enabled state
      const enabled =
        pluginUserConfig === false
          ? false
          : typeof pluginUserConfig === 'object'
            ? pluginUserConfig.enabled !== false
            : true

      // Update plugin enabled state
      plugin.enabled = enabled

      // Load actions only if enabled
      if (enabled) {
        const pluginActions = await this.deps.loadPluginActions(plugin)
        actions.push(...pluginActions)
      }
    }

    // Update internal actions cache
    this.actions = actions

    logger.info(
      `Reloaded actions: ${actions.length} action(s) from ${this.plugins.filter((p) => p.enabled).length} enabled plugin(s)`,
    )

    return actions
  }

  /**
   * Clear all loaded plugins and actions
   * Useful for testing
   */
  clear(): void {
    this.plugins = []
    this.actions = []
    this.loaded = false
  }
}
