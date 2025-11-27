/**
 * Path utilities for action and configuration management
 */

import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

/**
 * Get the global actions directory path (~/.arere/actions/)
 */
export function getGlobalActionsDir(): string {
  return join(homedir(), '.arere', 'actions')
}

/**
 * Get the project actions directory path (./.arere/actions/)
 */
export function getProjectActionsDir(cwd: string = process.cwd()): string {
  return join(cwd, '.arere', 'actions')
}

/**
 * Get action directories for both global and project scopes
 *
 * @param cwd - Current working directory
 * @returns Object with arrays of directories for each scope
 */
export function getActionDirectories(cwd: string = process.cwd()): {
  global: string[]
  project: string[]
} {
  return {
    global: [join(homedir(), '.arere', 'actions')],
    project: [join(cwd, '.arere', 'actions')],
  }
}

/**
 * Get the global node_modules path
 */
export function getGlobalNodeModules(): string {
  // Try to get global node_modules from npm
  // Fallback to common locations
  const npmRoot = process.env.npm_config_prefix
  if (npmRoot) {
    return join(npmRoot, 'lib', 'node_modules')
  }

  // Common global locations
  const commonPaths = [
    join(homedir(), '.npm-global', 'lib', 'node_modules'),
    join(homedir(), '.nvm', 'versions', 'node', process.version, 'lib', 'node_modules'),
    '/usr/local/lib/node_modules',
  ]

  for (const path of commonPaths) {
    if (existsSync(path)) {
      return path
    }
  }

  // Fallback to local node_modules if global not found
  return join(process.cwd(), 'node_modules')
}

/**
 * Resolve an action path
 * Checks in order: absolute path, relative to cwd, relative to project actions, relative to global actions
 */
export function resolveActionPath(
  actionPath: string,
  cwd: string = process.cwd(),
): string | undefined {
  // If absolute path, check if it exists
  if (actionPath.startsWith('/')) {
    return existsSync(actionPath) ? actionPath : undefined
  }

  // Try relative to cwd
  const cwdPath = resolve(cwd, actionPath)
  if (existsSync(cwdPath)) {
    return cwdPath
  }

  // Try relative to project actions
  const projectPath = resolve(getProjectActionsDir(cwd), actionPath)
  if (existsSync(projectPath)) {
    return projectPath
  }

  // Try relative to global actions
  const globalPath = resolve(getGlobalActionsDir(), actionPath)
  if (existsSync(globalPath)) {
    return globalPath
  }

  return undefined
}
