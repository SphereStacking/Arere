/**
 * File-based Config Manager Implementation
 *
 * Unified configuration management combining read and write operations.
 * This replaces the separate Repository/Writer pattern for simpler API.
 *
 * @layer Infrastructure
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { logger } from '@/lib/logger'
import { ConfigLoadError, ConfigWriteError } from './errors'
import { getConfigPath } from './paths'
import type { ArereConfig } from './schema'
import { configSchema, defaultConfig } from './schema'
import type { ConfigLayer, LayeredConfig } from './types'
import { deleteNestedValue, mergeConfigs, setNestedValue } from './utils'

/**
 * Unified configuration manager for file-based config operations
 *
 * Responsibilities:
 * - Load configuration from JSON files (user/workspace layers)
 * - Merge configurations with priority: workspace > user > defaults
 * - Save configuration values (partial updates with nested key support)
 * - Delete configuration keys (reset to default)
 *
 * @example
 * ```typescript
 * const manager = new FileConfigManager()
 *
 * // Read operations
 * const config = await manager.loadMerged()
 * const userConfig = await manager.loadLayer('user')
 *
 * // Write operations
 * await manager.save('workspace', 'theme.primaryColor', 'blue')
 * await manager.delete('user', 'locale')
 * ```
 *
 * @layer Infrastructure
 */
export class FileConfigManager {
  private cwd: string

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd
  }

  /**
   * Load merged configuration with priority: workspace > user > defaults
   *
   * @param cwd - Working directory (defaults to constructor cwd)
   * @returns Merged configuration
   *
   * @example
   * ```typescript
   * const manager = new FileConfigManager()
   * const config = await manager.loadMerged()
   * console.log(config.theme.primaryColor) // 'green' (default) or overridden value
   * ```
   */
  async loadMerged(cwd: string = this.cwd): Promise<ArereConfig> {
    try {
      const layered = await this.loadAll(cwd)
      return mergeConfigs(layered)
    } catch (error) {
      throw new ConfigLoadError('merged', 'layered-config', error as Error)
    }
  }

  /**
   * Load a specific configuration layer
   *
   * @param layer - Configuration layer ('user' or 'workspace')
   * @param cwd - Working directory (defaults to constructor cwd)
   * @returns Configuration for the specified layer, or null if not found
   *
   * @example
   * ```typescript
   * const manager = new FileConfigManager()
   * const workspaceConfig = await manager.loadLayer('workspace')
   * if (workspaceConfig) {
   *   console.log('Workspace has custom config')
   * }
   * ```
   */
  async loadLayer(
    layer: ConfigLayer,
    cwd: string = this.cwd,
  ): Promise<Partial<ArereConfig> | null> {
    const configPath = getConfigPath(layer, cwd)
    try {
      return await this.loadConfigFile(configPath)
    } catch (error) {
      throw new ConfigLoadError(layer, configPath, error as Error)
    }
  }

  /**
   * Load all configuration layers
   *
   * @param cwd - Working directory (defaults to constructor cwd)
   * @returns Layered configuration object
   *
   * @example
   * ```typescript
   * const manager = new FileConfigManager()
   * const { user, workspace } = await manager.loadAll()
   * console.log('User config:', user)
   * console.log('Workspace config:', workspace)
   * ```
   */
  async loadAll(cwd: string = this.cwd): Promise<LayeredConfig> {
    const [user, workspace] = await Promise.all([
      this.loadLayer('user', cwd),
      this.loadLayer('workspace', cwd),
    ])

    return { user, workspace }
  }

  /**
   * Save a configuration value
   *
   * Supports dot notation for nested keys (e.g., "theme.primaryColor")
   * Preserves existing keys in the config file (partial update)
   *
   * @param layer - Target layer ('user' or 'workspace')
   * @param key - Configuration key (supports dot notation)
   * @param value - Value to save
   * @param cwd - Working directory (defaults to constructor cwd)
   *
   * @example
   * ```typescript
   * const manager = new FileConfigManager()
   *
   * // Simple key
   * await manager.save('user', 'locale', 'ja')
   *
   * // Nested key with dot notation
   * await manager.save('workspace', 'theme.primaryColor', 'blue')
   * ```
   */
  async save(
    layer: ConfigLayer,
    key: string,
    value: unknown,
    cwd: string = this.cwd,
  ): Promise<void> {
    try {
      // 1. Load existing config file (raw, without validation)
      const configPath = getConfigPath(layer, cwd)
      const existing = await this.loadRawConfigFile(configPath)

      // 2. Merge changed value into existing config
      const updated = setNestedValue(existing || {}, key, value)

      // 3. Save to file
      await this.saveConfigObjectToFile(configPath, updated as Partial<ArereConfig>)

      logger.debug(`Saved config to ${layer} layer: ${key}`)
    } catch (error) {
      throw new ConfigWriteError(layer, key, error as Error)
    }
  }

  /**
   * Delete a configuration key (reset to default)
   *
   * Supports dot notation for nested keys
   *
   * @param layer - Target layer ('user' or 'workspace')
   * @param key - Configuration key to delete (supports dot notation)
   * @param cwd - Working directory (defaults to constructor cwd)
   *
   * @example
   * ```typescript
   * const manager = new FileConfigManager()
   *
   * // Delete simple key
   * await manager.delete('user', 'locale')
   *
   * // Delete nested key
   * await manager.delete('workspace', 'theme.primaryColor')
   * ```
   */
  async delete(layer: ConfigLayer, key: string, cwd: string = this.cwd): Promise<void> {
    try {
      // 1. Load existing config file
      const configPath = getConfigPath(layer, cwd)
      const existing = await this.loadRawConfigFile(configPath)

      if (!existing) {
        // File doesn't exist, nothing to delete
        logger.debug(`Config file doesn't exist for ${layer} layer, nothing to delete: ${key}`)
        return
      }

      // 2. Delete the key
      const updated = deleteNestedValue(existing, key)

      // 3. Save to file
      await this.saveConfigObjectToFile(configPath, updated as Partial<ArereConfig>)

      logger.debug(`Deleted config key from ${layer} layer: ${key}`)
    } catch (error) {
      throw new ConfigWriteError(layer, key, error as Error)
    }
  }

  /**
   * Save an entire config object to a layer
   *
   * This replaces the entire config file with the provided object.
   * Useful for integration tests and initial config creation.
   *
   * @param layer - Target layer ('user' or 'workspace')
   * @param config - Configuration object to save
   * @param cwd - Working directory (defaults to constructor cwd)
   *
   * @example
   * ```typescript
   * const manager = new FileConfigManager()
   * await manager.saveLayer('workspace', {
   *   locale: 'ja',
   *   theme: { primaryColor: 'blue' }
   * })
   * ```
   */
  async saveLayer(
    layer: ConfigLayer,
    config: Partial<ArereConfig>,
    cwd: string = this.cwd,
  ): Promise<void> {
    try {
      const configPath = getConfigPath(layer, cwd)
      await this.saveConfigObjectToFile(configPath, config)
      logger.debug(`Saved entire config to ${layer} layer`)
    } catch (error) {
      throw new ConfigWriteError(layer, 'entire-config', error as Error)
    }
  }

  /**
   * Load a single configuration file with validation (private helper)
   *
   * @param path - Absolute path to config file
   * @returns Parsed and validated config, or null if file doesn't exist
   */
  private async loadConfigFile(path: string): Promise<Partial<ArereConfig> | null> {
    if (!existsSync(path)) {
      return null
    }

    try {
      const content = await readFile(path, 'utf-8')

      // Handle empty files
      if (content.trim() === '') {
        logger.debug(`Config file is empty: ${path}`)
        return null
      }

      const parsed = JSON.parse(content)

      // Validate with Zod schema (partial validation)
      const validated = configSchema.partial().parse(parsed)
      return validated
    } catch (error) {
      logger.warn(`Failed to load config file from ${path}:`, error)
      return null
    }
  }

  /**
   * Load a single configuration file without validation (private helper)
   *
   * Used for partial updates where we need to preserve unknown keys
   *
   * @param path - Absolute path to config file
   * @returns Parsed config, or null if file doesn't exist
   */
  private async loadRawConfigFile(path: string): Promise<Record<string, unknown> | null> {
    if (!existsSync(path)) {
      return null
    }

    try {
      const content = await readFile(path, 'utf-8')

      // Handle empty files
      if (content.trim() === '') {
        logger.debug(`Config file is empty: ${path}`)
        return null
      }

      const parsed = JSON.parse(content)
      return parsed as Record<string, unknown>
    } catch (error) {
      logger.warn(`Failed to load config file from ${path}:`, error)
      return null
    }
  }

  /**
   * Save configuration object to file (private helper)
   *
   * @param configPath - Absolute path to config file
   * @param config - Configuration object to save
   */
  private async saveConfigObjectToFile(
    configPath: string,
    config: Partial<ArereConfig>,
  ): Promise<void> {
    // Ensure directory exists
    await mkdir(dirname(configPath), { recursive: true })

    // Save to file with pretty formatting
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
  }
}
