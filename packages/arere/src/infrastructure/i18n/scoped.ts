/**
 * Scoped translation functions for namespace isolation
 */

import type { TranslationManager } from './manager'

/**
 * Translation function type
 */
export type TranslationFunction = (key: string, options?: Record<string, unknown>) => string

/**
 * Create a scoped translation function for a specific namespace
 * This ensures actions can only access their own translations
 *
 * Supports `:` prefix notation for namespace specification:
 * - `t('greeting')` → from own namespace
 * - `t('common:actions.quit')` → from common namespace
 * - `t('plugin:error.key')` → from plugin namespace
 *
 * @param manager - TranslationManager instance
 * @param namespace - Primary namespace to scope translations to
 * @param allowedNamespaces - Additional namespaces that can be accessed (for plugins)
 * @returns Scoped translation function
 *
 * @example Basic usage
 * ```typescript
 * const t = createScopedT(manager, 'my-action')
 * t('greeting')               // my-action:greeting
 * t('common:actions.quit')    // common:actions.quit
 * ```
 *
 * @example Plugin action with plugin namespace
 * ```typescript
 * const t = createScopedT(manager, 'config-action', ['arere-plugin-example'])
 * t('title')                  // config-action:title
 * t('plugin:error.invalid')   // arere-plugin-example:error.invalid
 * t('common:actions.cancel')  // common:actions.cancel
 * ```
 */
export function createScopedT(
  manager: TranslationManager,
  namespace: string,
  allowedNamespaces: string[] = [],
): TranslationFunction {
  // Build set of allowed namespaces (always include 'common')
  const allowed = new Set([namespace, ...allowedNamespaces, 'common'])

  return (key: string, options?: Record<string, unknown>): string => {
    // Check for `:` prefix notation (e.g., 'common:actions.quit', 'plugin:error.key')
    if (key.includes(':')) {
      const colonIndex = key.indexOf(':')
      const prefix = key.slice(0, colonIndex)
      const actualKey = key.slice(colonIndex + 1)

      // Handle 'plugin:' prefix (maps to first allowed namespace)
      if (prefix === 'plugin') {
        if (allowedNamespaces.length > 0) {
          return manager.t(`${allowedNamespaces[0]}:${actualKey}`, options)
        }
        // No plugin namespace available
        return key
      }

      // Handle 'common:' or explicit namespace prefix
      if (allowed.has(prefix)) {
        return manager.t(`${prefix}:${actualKey}`, options)
      }

      // Unauthorized namespace
      return key
    }

    // No prefix → use own namespace
    return manager.t(`${namespace}:${key}`, options)
  }
}
