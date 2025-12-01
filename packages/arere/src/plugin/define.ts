/**
 * Plugin definition function
 */

import type { ArerePlugin } from './types'

/**
 * Define a plugin
 *
 * Provides validation and a consistent API for plugin definitions,
 * similar to defineAction() for actions.
 *
 * @param config - Plugin configuration
 * @returns ArerePlugin object
 *
 * @example Basic plugin
 * ```typescript
 * import { definePlugin } from 'arere'
 *
 * export default definePlugin({
 *   meta: {
 *     name: 'arere-plugin-example',
 *     description: 'Example plugin',
 *     author: 'Your Name',
 *   },
 *   actions: [
 *     'actions/hello.ts',
 *     'actions/goodbye.ts',
 *   ],
 * })
 * ```
 *
 * @example Plugin with i18n and config schema
 * ```typescript
 * import { z } from 'zod'
 *
 * export default definePlugin({
 *   meta: {
 *     name: 'arere-plugin-example',
 *     description: 'Example plugin with i18n',
 *     i18nNamespace: 'example',
 *   },
 *   actions: ['actions/hello.ts'],
 *   locales: 'locales',
 *   configSchema: z.object({
 *     apiKey: z.string().describe('API key for service'),
 *     timeout: z.number().default(5000).describe('Request timeout'),
 *   }),
 * })
 * ```
 *
 * Note: version is automatically read from package.json at load time
 */
export function definePlugin(config: ArerePlugin): ArerePlugin {
  // Validate required fields
  if (!config.meta) {
    throw new Error('Plugin meta is required')
  }

  if (!config.meta.name) {
    throw new Error('Plugin meta.name is required')
  }

  // Validate plugin name format (must start with 'arere-plugin-')
  if (!config.meta.name.startsWith('arere-plugin-')) {
    throw new Error(`Plugin name must start with 'arere-plugin-', got: ${config.meta.name}`)
  }

  // Validate plugin name format (alphanumeric, dash only after prefix)
  const nameAfterPrefix = config.meta.name.slice('arere-plugin-'.length)
  if (!/^[a-z0-9-]+$/.test(nameAfterPrefix)) {
    throw new Error(
      `Plugin name after 'arere-plugin-' must contain only lowercase alphanumeric characters and dashes, got: ${config.meta.name}`,
    )
  }

  // Validate actions array
  if (!config.actions) {
    throw new Error('Plugin actions array is required')
  }

  if (!Array.isArray(config.actions)) {
    throw new Error('Plugin actions must be an array')
  }

  if (config.actions.length === 0) {
    throw new Error('Plugin must have at least one action')
  }

  // Validate action paths are strings
  for (const actionPath of config.actions) {
    if (typeof actionPath !== 'string') {
      throw new Error(`Action path must be a string, got: ${typeof actionPath}`)
    }
  }

  // Validate locales if provided
  if (config.locales !== undefined && typeof config.locales !== 'string') {
    throw new Error('Plugin locales must be a string path')
  }

  return {
    meta: config.meta,
    actions: config.actions,
    locales: config.locales,
    configSchema: config.configSchema,
  }
}
