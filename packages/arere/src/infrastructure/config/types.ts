/**
 * Configuration layer types for hierarchical config system
 */

import type { ArereConfig } from './schema'

/**
 * Configuration layers following VSCode-style hierarchy
 * - user: Global user settings (~/.arere/settings.json)
 * - workspace: Project-specific settings (./.arere/settings.json) - highest priority
 *
 * Priority: workspace > user (project settings override user settings)
 */
export type ConfigLayer = 'user' | 'workspace'

/**
 * Layered configuration structure (VSCode-style 2-layer system)
 * Each layer can be null if not present
 */
export interface LayeredConfig {
  /** Global user configuration (lower priority) */
  user: ArereConfig | null
  /** Workspace/project configuration (highest priority) */
  workspace: ArereConfig | null
}

/**
 * Configuration with metadata about its source
 */
export interface ConfigWithMetadata extends ArereConfig {
  /** Metadata about the config source */
  _metadata: {
    /** Layer where this config was loaded from */
    layer: ConfigLayer
    /** File path of the config */
    path: string
    /** Timestamp when config was loaded */
    loadedAt: Date
  }
}

/**
 * Config value with its source layer information
 */
export interface ConfigValueWithSource<T = unknown> {
  /** The configuration value */
  value: T
  /** Layer where this value came from */
  source: ConfigLayer
  /** Path to the config file */
  path: string
}
