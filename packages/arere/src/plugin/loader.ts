/**
 * Plugin loader - loads plugin definitions and actions
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Action } from '@/action/types'
import { registerTranslations } from '@/i18n/index'
import { PluginLoadError } from '@/lib/error'
import { logger } from '@/lib/logger'
import type { ArerePlugin, LoadedPlugin } from '@/plugin/types'
import createJiti from 'jiti'
import { z } from 'zod'
import type { PluginPackageInfo } from './detector'

// Get the path to the arere package for alias resolution
const getArerePackagePath = (): string => {
  // Simply return 'arere' as a module specifier
  // This works because:
  // 1. In workspace development: node_modules/arere symlinks to packages/arere
  // 2. When globally installed: arere is in global node_modules
  // 3. jiti will resolve it correctly using Node's module resolution
  return 'arere'
}

/**
 * Load a plugin from package information
 *
 * @param packageInfo - Plugin package information
 * @param userConfig - User configuration for this plugin (optional)
 * @param enabled - Whether this plugin is enabled (default: true)
 * @returns Loaded plugin with resolved paths
 * @throws {PluginLoadError} If the plugin fails to load
 *
 * @example
 * ```typescript
 * const plugin = await loadPlugin(packageInfo, config, true)
 * ```
 */
export async function loadPlugin(
  packageInfo: PluginPackageInfo,
  userConfig?: Record<string, unknown>,
  enabled = true,
): Promise<LoadedPlugin> {
  logger.debug(`Loading plugin: ${packageInfo.name}`)

  try {
    // Create jiti instance for this plugin
    // This ensures dependencies are resolved from the plugin's node_modules
    const jiti = createJiti(packageInfo.path, {
      interopDefault: true,
      extensions: ['.ts', '.js', '.mjs', '.cjs'],
    })

    // Determine the entry point
    const entryPoint = packageInfo.packageJson.main || 'dist/index.js'
    const pluginModulePath = resolve(packageInfo.path, entryPoint)

    if (!existsSync(pluginModulePath)) {
      throw new Error(`Plugin entry point not found: ${pluginModulePath}`)
    }

    // Load the plugin module
    const module = jiti(pluginModulePath)
    const pluginDefinition = (module.default || module) as ArerePlugin

    // Validate plugin definition
    if (!pluginDefinition || typeof pluginDefinition !== 'object') {
      throw new Error('Plugin must export a default ArerePlugin object')
    }

    if (!pluginDefinition.meta) {
      throw new Error('Plugin must have a "meta" field')
    }

    if (!pluginDefinition.meta.name || typeof pluginDefinition.meta.name !== 'string') {
      throw new Error('Plugin must have a "meta.name" field')
    }

    if (!Array.isArray(pluginDefinition.actions)) {
      throw new Error('Plugin must have an "actions" array')
    }

    // Resolve action paths
    const actionPaths = pluginDefinition.actions.map((actionPath) => {
      const absolutePath = resolve(packageInfo.path, actionPath)
      if (!existsSync(absolutePath)) {
        logger.warn(`Action file not found: ${absolutePath}`)
      }
      return absolutePath
    })

    // Resolve locales path if provided
    let localesPath: string | undefined
    if (pluginDefinition.locales) {
      const absoluteLocalesPath = resolve(packageInfo.path, pluginDefinition.locales)
      if (existsSync(absoluteLocalesPath)) {
        localesPath = absoluteLocalesPath
      } else {
        logger.warn(`Locales directory not found: ${absoluteLocalesPath}`)
      }
    }

    // Determine i18n namespace (use meta.i18nNamespace or plugin name)
    const i18nNamespace = pluginDefinition.meta.i18nNamespace || pluginDefinition.meta.name

    // Validate user config if schema is provided
    let validatedConfig = userConfig
    if (pluginDefinition.configSchema && userConfig) {
      try {
        validatedConfig = pluginDefinition.configSchema.parse(userConfig)
        logger.debug(`Validated config for ${packageInfo.name}`)
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.error(`Invalid config for ${packageInfo.name}:`)
          for (const err of error.errors) {
            logger.error(`  - ${err.path.join('.')}: ${err.message}`)
          }
          throw new Error(`Plugin config validation failed: ${packageInfo.name}`)
        }
        throw error
      }
    }

    // Get version from package.json
    const version = packageInfo.packageJson.version || '0.0.0'

    const loadedPlugin: LoadedPlugin = {
      meta: {
        ...pluginDefinition.meta,
        version,
      },
      path: packageInfo.path,
      actionPaths: actionPaths.filter(existsSync),
      localesPath,
      i18nNamespace,
      configSchema: pluginDefinition.configSchema,
      userConfig: validatedConfig,
      enabled,
    }

    logger.info(
      `Loaded plugin: ${loadedPlugin.meta.name}@${loadedPlugin.meta.version} (${loadedPlugin.actionPaths.length} action(s))${enabled ? '' : ' [disabled]'}`,
    )

    return loadedPlugin
  } catch (error) {
    throw new PluginLoadError(
      packageInfo.name,
      error instanceof Error ? error : new Error(String(error)),
    )
  }
}

/**
 * Load actions from a loaded plugin
 *
 * @param plugin - Loaded plugin
 * @returns Array of actions
 *
 * @example
 * ```typescript
 * const actions = await loadPluginActions(plugin)
 * ```
 */
export async function loadPluginActions(plugin: LoadedPlugin): Promise<Action[]> {
  const actions: Action[] = []

  // Create jiti instance from plugin's directory
  // This ensures proper module resolution for both:
  // - Plugin's internal imports (../src/...)
  // - External dependencies including 'arere' package
  const jiti = createJiti(plugin.path, {
    interopDefault: true,
    extensions: ['.ts', '.js', '.mjs', '.cjs'],
    // Alias 'arere' to the built package for plugin action imports
    alias: {
      arere: getArerePackagePath(),
    },
  })

  for (const actionPath of plugin.actionPaths) {
    try {
      logger.debug(`Loading plugin action: ${actionPath}`)

      // Load the action module
      const module = jiti(actionPath)
      const actionDefinition = (module.default || module) as Action

      // Validate action structure
      if (!actionDefinition || typeof actionDefinition !== 'object') {
        logger.warn(`Action ${actionPath} does not export a valid Action object`)
        continue
      }

      if (!actionDefinition.meta || !actionDefinition.run) {
        logger.warn(`Action ${actionPath} is missing required fields`)
        continue
      }

      // Update file path
      actionDefinition.filePath = actionPath

      // Derive name from filename if not provided or empty
      if (!actionDefinition.meta.name || actionDefinition.meta.name === '') {
        const filename = actionPath.split('/').pop() || actionPath
        const derivedName = filename.replace(/\.(ts|js)$/, '')
        logger.debug(`Deriving plugin action name from filename: ${actionPath} -> ${derivedName}`)
        actionDefinition.meta.name = derivedName
      }

      // Add plugin location
      actionDefinition.location = { plugin: plugin.meta.name }

      // Set plugin namespace for scoped translations
      actionDefinition.pluginNamespace = plugin.i18nNamespace

      // Set plugin metadata for display purposes
      actionDefinition.pluginMeta = plugin.meta

      // Add plugin metadata to action
      if (actionDefinition.meta.category === undefined) {
        actionDefinition.meta.category = `plugin:${plugin.meta.name}`
      }

      // Register action translations if provided
      if (actionDefinition.translations) {
        registerTranslations(actionDefinition.meta.name, actionDefinition.translations)
      }

      actions.push(actionDefinition)
      logger.debug(`Loaded plugin action: ${actionDefinition.meta.name}`)
    } catch (error) {
      logger.warn(`Failed to load action ${actionPath}:`, error)
    }
  }

  return actions
}
