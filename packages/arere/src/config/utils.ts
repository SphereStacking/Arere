/**
 * Configuration utility functions
 *
 * This module provides utilities for:
 * - Nested value manipulation (dot notation)
 * - Configuration merging (deep merge with priority)
 *
 * @layer Infrastructure
 */

import type { ArereConfig } from './schema'
import { defaultConfig } from './schema'
import type { LayeredConfig } from './types'

// ============================================================================
// Nested Value Utilities (from nested-value.ts)
// ============================================================================

/**
 * Set a nested value in an object using dot notation
 *
 * @param obj - Target object
 * @param path - Dot-notation path (e.g., "theme.primaryColor")
 * @param value - Value to set
 * @returns Updated object (immutable - creates a new object)
 *
 * @example
 * ```typescript
 * const obj = {}
 * const result = setNestedValue(obj, 'theme.primaryColor', 'blue')
 * // Returns: { theme: { primaryColor: 'blue' } }
 *
 * const obj2 = { theme: { fontSize: 14 } }
 * const result2 = setNestedValue(obj2, 'theme.primaryColor', 'cyan')
 * // Returns: { theme: { fontSize: 14, primaryColor: 'cyan' } }
 * ```
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const keys = path.split('.')

  // Handle simple case (no nesting)
  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value }
  }

  // Handle nested case
  const result = { ...obj }
  let current: Record<string, unknown> = result

  // Navigate to the parent of the target key
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    // If key doesn't exist or is not an object, create new object
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    } else {
      // Clone the nested object to maintain immutability
      current[key] = { ...(current[key] as Record<string, unknown>) }
    }

    current = current[key] as Record<string, unknown>
  }

  // Set the final value
  const lastKey = keys[keys.length - 1]
  current[lastKey] = value

  return result
}

/**
 * Delete a nested key from an object using dot notation
 *
 * @param obj - Target object
 * @param path - Dot-notation path (e.g., "theme.primaryColor")
 * @returns Updated object (immutable - creates a new object)
 *
 * @example
 * ```typescript
 * const obj = { theme: { primaryColor: 'blue', fontSize: 14 } }
 * const result = deleteNestedValue(obj, 'theme.primaryColor')
 * // Returns: { theme: { fontSize: 14 } }
 * ```
 */
export function deleteNestedValue(
  obj: Record<string, unknown>,
  path: string,
): Record<string, unknown> {
  const keys = path.split('.')

  // Handle simple case (no nesting)
  if (keys.length === 1) {
    const result = { ...obj }
    delete result[keys[0]]
    return result
  }

  // Handle nested case
  const result = { ...obj }
  let current: Record<string, unknown> = result

  // Navigate to the parent of the target key
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    // If path doesn't exist, return unchanged
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      return result
    }

    // Clone the nested object to maintain immutability
    current[key] = { ...(current[key] as Record<string, unknown>) }
    current = current[key] as Record<string, unknown>
  }

  // Delete the final key
  const lastKey = keys[keys.length - 1]
  delete current[lastKey]

  return result
}

/**
 * Get a nested value from an object using dot notation
 *
 * @param obj - Source object
 * @param path - Dot-notation path (e.g., "theme.primaryColor")
 * @returns Value at the path, or undefined if not found
 *
 * @example
 * ```typescript
 * const obj = { theme: { primaryColor: 'blue' } }
 * getNestedValue(obj, 'theme.primaryColor') // 'blue'
 * getNestedValue(obj, 'theme.fontSize') // undefined
 * ```
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

// ============================================================================
// Configuration Merging Utilities (from merge.ts)
// ============================================================================

/**
 * Plugin configuration value types
 */
export type PluginConfigValue =
  | boolean
  | {
      enabled: boolean
      config?: Record<string, unknown>
    }

/**
 * Merge layered configurations with priority: workspace > user (VSCode-style)
 *
 * @param layered - Configuration from both layers
 * @returns Merged configuration with highest priority values
 *
 * @example
 * ```typescript
 * const layered = await loadLayeredConfig()
 * const config = mergeConfigs(layered)
 * // Workspace settings override user settings
 * ```
 */
export function mergeConfigs(layered: LayeredConfig): ArereConfig {
  const { user, workspace } = layered

  // Priority: workspace > user > defaults (VSCode-style)
  const base = user ? deepMerge(defaultConfig, user) : defaultConfig
  let final = workspace ? deepMerge(base, workspace) : base

  // Special handling for plugin configurations
  if (user?.plugins || workspace?.plugins) {
    final = {
      ...final,
      plugins: mergePluginConfigs(user?.plugins || {}, workspace?.plugins || {}),
    }
  }

  return final
}

/**
 * Deep merge two configuration objects
 *
 * @param base - Base configuration (lower priority)
 * @param override - Override configuration (higher priority)
 * @returns Merged configuration
 *
 * @remarks
 * - Objects are recursively merged
 * - Arrays are replaced (not concatenated)
 * - Primitive values are overridden
 * - undefined values in override are ignored
 */
function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base }

  for (const key in override) {
    const value = override[key]
    if (value === undefined) continue

    const baseValue = result[key]

    // Recursively merge objects
    if (isPlainObject(value) && isPlainObject(baseValue)) {
      // Type guards ensure both are plain objects (Record<string, unknown>)
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        value as Record<string, unknown>,
      ) as T[Extract<keyof T, string>]
    } else {
      // Override primitive values and arrays
      result[key] = value as T[Extract<keyof T, string>]
    }
  }

  return result
}

/**
 * Check if a value is a plain object (not array, null, or other special object)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

/**
 * Merge plugin configurations from both layers (VSCode-style)
 *
 * @param user - User layer plugin config (lower priority)
 * @param workspace - Workspace layer plugin config (higher priority)
 * @returns Merged plugin configuration
 *
 * @remarks
 * Plugin merging rules:
 * - Simple boolean values override completely
 * - Object configs merge:
 *   - `enabled` field uses highest priority value
 *   - `config` object is deep merged
 * - Priority: workspace > user
 *
 * @example
 * ```typescript
 * // User: { 'plugin-a': true }
 * // Workspace: { 'plugin-a': { enabled: true, config: { key: 'value' } } }
 * // Result: { 'plugin-a': { enabled: true, config: { key: 'value' } } }
 * ```
 */
function mergePluginConfigs(
  user: Record<string, PluginConfigValue>,
  workspace: Record<string, PluginConfigValue>,
): Record<string, PluginConfigValue> {
  // Collect all plugin names
  const allPluginNames = new Set([...Object.keys(user), ...Object.keys(workspace)])

  const result: Record<string, PluginConfigValue> = {}

  for (const pluginName of allPluginNames) {
    const userValue = user[pluginName]
    const workspaceValue = workspace[pluginName]

    // Merge with workspace overriding user
    result[pluginName] = mergePluginValue(userValue, workspaceValue)
  }

  return result
}

/**
 * Merge two plugin configuration values
 *
 * @param base - Base plugin config (lower priority)
 * @param override - Override plugin config (higher priority)
 * @returns Merged plugin config value
 */
function mergePluginValue(
  base: PluginConfigValue | undefined,
  override: PluginConfigValue | undefined,
): PluginConfigValue {
  // If no override, use base
  if (override === undefined) {
    return base ?? false
  }

  // If no base, use override
  if (base === undefined) {
    return override
  }

  // If override is boolean, it completely replaces base
  if (typeof override === 'boolean') {
    return override
  }

  // If base is boolean, convert to object form
  if (typeof base === 'boolean') {
    return {
      enabled: override.enabled ?? base,
      config: override.config || {},
    }
  }

  // Both are objects - merge them
  return {
    enabled: override.enabled ?? base.enabled,
    config: override.config
      ? base.config
        ? deepMerge(base.config, override.config)
        : override.config
      : base.config,
  }
}
