/**
 * Configuration file paths for hierarchical config system
 */

import os from 'node:os'
import path from 'node:path'
import type { ConfigLayer } from './types'

/**
 * Default configuration file paths for each layer (VSCode-style structure)
 */
export const CONFIG_PATHS = {
  /**
   * Global user configuration path
   * Default: ~/.arere/settings.json
   */
  user: (): string => {
    return path.join(os.homedir(), '.arere', 'settings.json')
  },

  /**
   * Workspace/project configuration path
   * Default: ./.arere/settings.json
   */
  workspace: (cwd: string): string => {
    return path.join(cwd, '.arere', 'settings.json')
  },
} as const

/**
 * Keybindings file paths for each layer (VSCode-style separate file)
 */
export const KEYBINDINGS_PATHS = {
  /**
   * Global user keybindings path
   * Default: ~/.arere/keybindings.json
   */
  user: (): string => {
    return path.join(os.homedir(), '.arere', 'keybindings.json')
  },

  /**
   * Workspace/project keybindings path
   * Default: ./.arere/keybindings.json
   */
  workspace: (cwd: string): string => {
    return path.join(cwd, '.arere', 'keybindings.json')
  },
} as const

/**
 * Default action directory paths (VSCode-style structure)
 */
export const ACTION_PATHS = {
  /**
   * Global user actions directory
   * Default: ~/.arere/actions/
   */
  user: (): string => {
    return path.join(os.homedir(), '.arere', 'actions')
  },

  /**
   * Workspace/project actions directory
   * Default: ./.arere/actions/
   */
  workspace: (cwd: string): string => {
    return path.join(cwd, '.arere', 'actions')
  },
} as const

/**
 * Get configuration file path for a specific layer
 * Supports environment variable overrides:
 * - ARERE_WORKSPACE_CONFIG: Override workspace config path
 * - ARERE_USER_CONFIG: Override user config path
 *
 * @param layer - Configuration layer
 * @param cwd - Current working directory (for workspace layer)
 * @returns Absolute path to config file
 *
 * @example
 * ```typescript
 * getConfigPath('user')
 * // Returns: ~/.arere/settings.json
 *
 * getConfigPath('workspace', '/path/to/project')
 * // Returns: /path/to/project/.arere/settings.json
 * ```
 */
export function getConfigPath(layer: ConfigLayer, cwd: string = process.cwd()): string {
  // Check for environment variable override
  const envKey = `ARERE_${layer.toUpperCase()}_CONFIG`
  const envOverride = process.env[envKey]
  if (envOverride) {
    return path.resolve(envOverride)
  }

  // Use default path
  switch (layer) {
    case 'workspace':
      return CONFIG_PATHS.workspace(cwd)
    case 'user':
      return CONFIG_PATHS.user()
  }
}

/**
 * Get all config paths for the 2-layer hierarchical system
 *
 * @param cwd - Current working directory
 * @returns Object with all config layer paths
 *
 * @example
 * ```typescript
 * const paths = getAllConfigPaths('/path/to/project')
 * // {
 * //   user: '~/.arere/settings.json',
 * //   workspace: '/path/to/project/.arere/settings.json'
 * // }
 * ```
 */
export function getAllConfigPaths(cwd: string = process.cwd()): Record<ConfigLayer, string> {
  return {
    user: getConfigPath('user', cwd),
    workspace: getConfigPath('workspace', cwd),
  }
}

/**
 * Get keybindings file path for a specific layer
 * Supports environment variable overrides:
 * - ARERE_WORKSPACE_KEYBINDINGS: Override workspace keybindings path
 * - ARERE_USER_KEYBINDINGS: Override user keybindings path
 *
 * @param layer - Configuration layer
 * @param cwd - Current working directory (for workspace layer)
 * @returns Absolute path to keybindings file
 *
 * @example
 * ```typescript
 * getKeybindingsPath('user')
 * // Returns: ~/.arere/keybindings.json
 *
 * getKeybindingsPath('workspace', '/path/to/project')
 * // Returns: /path/to/project/.arere/keybindings.json
 * ```
 */
export function getKeybindingsPath(layer: ConfigLayer, cwd: string = process.cwd()): string {
  // Check for environment variable override
  const envKey = `ARERE_${layer.toUpperCase()}_KEYBINDINGS`
  const envOverride = process.env[envKey]
  if (envOverride) {
    return path.resolve(envOverride)
  }

  // Use default path
  switch (layer) {
    case 'workspace':
      return KEYBINDINGS_PATHS.workspace(cwd)
    case 'user':
      return KEYBINDINGS_PATHS.user()
  }
}

/**
 * Get all keybindings paths for the 2-layer hierarchical system
 *
 * @param cwd - Current working directory
 * @returns Object with all keybindings layer paths
 */
export function getAllKeybindingsPath(cwd: string = process.cwd()): Record<ConfigLayer, string> {
  return {
    user: getKeybindingsPath('user', cwd),
    workspace: getKeybindingsPath('workspace', cwd),
  }
}
