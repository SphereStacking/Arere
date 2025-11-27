/**
 * Override detection logic for settings layers
 *
 * Detects which user settings are overridden by workspace settings.
 */

import type { ArereConfig } from './schema'

/**
 * Get keys that are overridden by workspace config
 *
 * @param userConfig - User layer configuration
 * @param workspaceConfig - Workspace layer configuration
 * @returns Array of dot-notation keys that are overridden
 *
 * @example
 * ```ts
 * const userConfig = { locale: 'en', theme: { primaryColor: 'blue' } }
 * const workspaceConfig = { locale: 'ja' }
 * const overridden = getOverriddenKeys(userConfig, workspaceConfig)
 * // Returns: ['locale']
 * ```
 */
export function getOverriddenKeys(
  userConfig: Partial<ArereConfig> | null,
  workspaceConfig: Partial<ArereConfig> | null,
): string[] {
  if (!userConfig || !workspaceConfig) return []

  const overridden: string[] = []

  /**
   * Recursively check nested objects for overrides
   */
  function checkOverrides(
    userObj: Record<string, unknown>,
    workspaceObj: Record<string, unknown>,
    prefix = '',
  ) {
    for (const key in userObj) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (key in workspaceObj) {
        const userValue = userObj[key]
        const workspaceValue = workspaceObj[key]

        if (
          typeof userValue === 'object' &&
          userValue !== null &&
          typeof workspaceValue === 'object' &&
          workspaceValue !== null &&
          !Array.isArray(userValue) &&
          !Array.isArray(workspaceValue)
        ) {
          // Nested object - recurse
          checkOverrides(
            userValue as Record<string, unknown>,
            workspaceValue as Record<string, unknown>,
            fullKey,
          )
        } else {
          // Primitive value or array - mark as overridden
          overridden.push(fullKey)
        }
      }
    }
  }

  checkOverrides(userConfig as Record<string, unknown>, workspaceConfig as Record<string, unknown>)

  return overridden
}

/**
 * Check if a specific key is overridden
 *
 * @param key - Dot-notation key to check
 * @param overriddenKeys - Array of overridden keys
 * @returns True if the key is overridden
 *
 * @example
 * ```ts
 * isKeyOverridden('locale', ['locale', 'theme.primaryColor']) // true
 * isKeyOverridden('logLevel', ['locale']) // false
 * isKeyOverridden('theme.primaryColor', ['theme.primaryColor']) // true
 * ```
 */
export function isKeyOverridden(key: string, overriddenKeys: string[]): boolean {
  return overriddenKeys.includes(key)
}
