/**
 * Plugin resolver - finds global node_modules directory
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { logger } from '@/lib/logger'

// Cache the global node_modules path
let cachedGlobalNodeModules: string | null = null

/**
 * Get the global node_modules directory path
 *
 * @returns Absolute path to global node_modules or null if not found
 *
 * @example
 * ```typescript
 * const globalNodeModules = getGlobalNodeModules()
 * // => '/usr/local/lib/node_modules' or similar
 * ```
 */
export function getGlobalNodeModules(): string | null {
  // Return cached value if available
  if (cachedGlobalNodeModules) {
    return cachedGlobalNodeModules
  }

  // Try npm root -g first
  try {
    const npmRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim()
    if (npmRoot && existsSync(npmRoot)) {
      logger.debug(`Found global node_modules via npm: ${npmRoot}`)
      cachedGlobalNodeModules = npmRoot
      return npmRoot
    }
  } catch (error) {
    logger.debug('Failed to get global node_modules via npm root -g')
  }

  // Try common platform-specific locations
  const commonPaths: string[] = []

  if (process.platform === 'win32') {
    // Windows
    const appData = process.env.APPDATA
    if (appData) {
      commonPaths.push(join(appData, 'npm', 'node_modules'))
    }
    commonPaths.push(
      join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'node_modules'),
    )
  } else {
    // macOS / Linux
    commonPaths.push('/usr/local/lib/node_modules')
    commonPaths.push(join(homedir(), '.npm-global', 'lib', 'node_modules'))

    // NVM path
    const nvmNodeVersion = process.version
    commonPaths.push(
      join(homedir(), '.nvm', 'versions', 'node', nvmNodeVersion, 'lib', 'node_modules'),
    )
  }

  // Check each common path
  for (const path of commonPaths) {
    if (existsSync(path)) {
      logger.debug(`Found global node_modules at: ${path}`)
      cachedGlobalNodeModules = path
      return path
    }
  }

  logger.debug('Could not find global node_modules directory')
  return null
}

/**
 * Clear the cached global node_modules path
 * Useful for testing
 */
export function clearGlobalNodeModulesCache(): void {
  cachedGlobalNodeModules = null
}
