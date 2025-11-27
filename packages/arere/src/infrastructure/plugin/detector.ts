/**
 * Plugin detector - finds installed arere-plugin-* packages
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { logger } from '@/shared/utils/logger'
import { getGlobalNodeModules } from './resolver'

/**
 * Plugin package information
 */
export interface PluginPackageInfo {
  /** Package name (e.g., 'arere-plugin-example') */
  name: string
  /** Absolute path to plugin directory */
  path: string
  /** Package.json data */
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
 * Scan a single directory for arere-plugin-* packages
 *
 * @param scanDir - Directory to scan
 * @returns Array of detected plugin package information
 */
function scanPluginDirectory(scanDir: string): PluginPackageInfo[] {
  if (!existsSync(scanDir)) {
    logger.debug(`Scan directory does not exist: ${scanDir}`)
    return []
  }

  const plugins: PluginPackageInfo[] = []

  try {
    // Read all directories in scan directory
    const entries = readdirSync(scanDir, { withFileTypes: true })

    for (const entry of entries) {
      // Check if it matches the arere-plugin-* pattern first
      if (!entry.name.startsWith('arere-plugin-')) {
        continue
      }

      const pluginPath = join(scanDir, entry.name)

      // Skip non-directories and symlinks that don't point to directories
      // We need to check the actual target for symlinks
      if (!entry.isDirectory() && !entry.isSymbolicLink()) {
        continue
      }

      // Verify it's actually a directory (handles symlinks)
      if (!existsSync(pluginPath)) {
        logger.debug(`Plugin ${entry.name} path does not exist, skipping`)
        continue
      }

      const packageJsonPath = join(pluginPath, 'package.json')

      // Check if package.json exists
      if (!existsSync(packageJsonPath)) {
        logger.debug(`Plugin ${entry.name} has no package.json, skipping`)
        continue
      }

      try {
        // Read and parse package.json
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageJsonContent)

        // Validate package.json structure
        if (!packageJson.name || !packageJson.version) {
          logger.warn(`Plugin ${entry.name} has invalid package.json, skipping`)
          continue
        }

        plugins.push({
          name: entry.name,
          path: pluginPath,
          packageJson,
        })

        logger.debug(`Detected plugin: ${entry.name} at ${pluginPath}`)
      } catch (error) {
        logger.warn(`Failed to read package.json for ${entry.name}:`, error)
      }
    }
  } catch (error) {
    logger.error(`Failed to scan directory ${scanDir}:`, error)
  }

  return plugins
}

/**
 * Detect installed arere-plugin-* packages
 *
 * Searches both local project node_modules (for workspace development)
 * and global node_modules (for installed plugins).
 *
 * @param searchPath - Optional custom path to search for plugins (for testing). If not provided, searches both local and global.
 * @returns Array of detected plugin package information (deduplicated by name)
 *
 * @example
 * ```typescript
 * const plugins = detectPlugins()
 * // => [{ name: 'arere-plugin-example', path: '/usr/local/lib/node_modules/arere-plugin-example', ... }]
 *
 * // Custom search path for testing
 * const testPlugins = detectPlugins('/path/to/test/plugins')
 * ```
 */
export function detectPlugins(searchPath?: string): PluginPackageInfo[] {
  // If custom search path is provided (for testing), use it exclusively
  if (searchPath) {
    const plugins = scanPluginDirectory(searchPath)
    logger.info(`Detected ${plugins.length} plugin(s)`)
    return plugins
  }

  // Otherwise, search both local and global node_modules
  const pluginMap = new Map<string, PluginPackageInfo>()

  // 1. Search local node_modules (project workspace - higher priority)
  const localNodeModules = join(process.cwd(), 'node_modules')
  const localPlugins = scanPluginDirectory(localNodeModules)
  for (const plugin of localPlugins) {
    pluginMap.set(plugin.name, plugin)
    logger.debug(`Found local plugin: ${plugin.name} at ${plugin.path}`)
  }

  // 1.5. Search parent directories' node_modules (for monorepo support)
  // Walk up the directory tree looking for node_modules
  let currentDir = process.cwd()
  const root = '/' // Unix root
  while (currentDir !== root) {
    const parentDir = join(currentDir, '..')
    if (parentDir === currentDir) break // Reached root

    const parentNodeModules = join(parentDir, 'node_modules')
    if (existsSync(parentNodeModules)) {
      const parentPlugins = scanPluginDirectory(parentNodeModules)
      for (const plugin of parentPlugins) {
        if (!pluginMap.has(plugin.name)) {
          pluginMap.set(plugin.name, plugin)
          logger.debug(`Found parent plugin: ${plugin.name} at ${plugin.path}`)
        }
      }
    }

    currentDir = parentDir
  }

  // 2. Search global node_modules (only if not already found locally)
  const globalNodeModules = getGlobalNodeModules()
  if (globalNodeModules) {
    const globalPlugins = scanPluginDirectory(globalNodeModules)
    for (const plugin of globalPlugins) {
      if (!pluginMap.has(plugin.name)) {
        pluginMap.set(plugin.name, plugin)
        logger.debug(`Found global plugin: ${plugin.name} at ${plugin.path}`)
      } else {
        logger.debug(
          `Skipping global plugin ${plugin.name}, already loaded from local or parent node_modules`,
        )
      }
    }
  }

  const plugins = Array.from(pluginMap.values())
  logger.info(`Detected ${plugins.length} plugin(s)`)
  return plugins
}
