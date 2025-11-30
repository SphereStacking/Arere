/**
 * Plugin type definitions
 */

import type { z } from 'zod'

/**
 * Plugin metadata (defined in plugin source)
 */
export interface PluginMeta {
  /** Plugin name (must start with 'arere-plugin-') */
  name: string
  /** Plugin description */
  description?: string
  /** Plugin author */
  author?: string
  /** i18n namespace (defaults to plugin name if not specified) */
  i18nNamespace?: string
}

/**
 * Plugin metadata with version (after loading from package.json)
 */
export interface LoadedPluginMeta extends PluginMeta {
  /** Plugin version (from package.json) */
  version: string
}

/**
 * Plugin definition
 */
export interface ArerePlugin {
  /** Plugin metadata */
  meta: PluginMeta
  /** Action file paths relative to plugin root */
  actions: string[]
  /** Translation files directory relative to plugin root (optional) */
  locales?: string
  /** Configuration schema (optional, for plugin settings) */
  configSchema?: z.AnyZodObject
}

/**
 * Loaded plugin with resolved paths
 */
export interface LoadedPlugin {
  /** Plugin metadata (with version from package.json) */
  meta: LoadedPluginMeta
  /** Absolute path to plugin directory */
  path: string
  /** Absolute paths to action files */
  actionPaths: string[]
  /** Absolute path to locales directory (if provided) */
  localesPath?: string
  /** i18n namespace for this plugin */
  i18nNamespace: string
  /** Configuration schema (if defined by plugin) */
  configSchema?: z.AnyZodObject
  /** User configuration for this plugin */
  userConfig?: Record<string, unknown>
  /** Whether this plugin is enabled */
  enabled: boolean
}
