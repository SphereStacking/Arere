/**
 * Plugin system exports
 *
 * This module provides both Domain layer types and Infrastructure layer implementations.
 * It also provides a factory function to create PluginManager with injected dependencies.
 */

import { registerPluginTranslations } from '@/i18n/index'
// Infrastructure function imports
import { detectPlugins } from './detector'
import { loadPlugin, loadPluginActions } from './loader'

// Domain layer imports
import { PluginManager } from '@/plugin/manager'

// Re-export Domain layer
export { PluginManager }
export type { PluginManagerDependencies } from '@/plugin/manager'
export type { ArerePlugin, PluginMeta, LoadedPlugin } from '@/plugin/types'

// Re-export Infrastructure layer
export { detectPlugins }
export { loadPlugin, loadPluginActions }
export { getGlobalNodeModules, clearGlobalNodeModulesCache } from './resolver'
export type { PluginPackageInfo } from './detector'

/**
 * Create a PluginManager instance with Infrastructure layer dependencies injected
 *
 * @returns PluginManager instance ready to use
 *
 * @example
 * ```typescript
 * const pluginManager = createPluginManager()
 * await pluginManager.loadAll(config)
 * ```
 */
export function createPluginManager(): PluginManager {
  return new PluginManager({
    detectPlugins,
    loadPlugin,
    loadPluginActions,
    registerPluginTranslations,
  })
}
