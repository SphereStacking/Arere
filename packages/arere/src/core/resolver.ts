/**
 * Action file resolution logic
 */

import { existsSync } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { logger } from '@/shared/utils/logger'

/**
 * Directories to exclude from action search
 */
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'build', '.git', 'coverage', '.cache'])

/**
 * Find all action files in a directory
 * @param directory - Directory to search
 * @param options - Search options
 * @param options.recursive - Whether to search recursively (default: true)
 * @returns Array of absolute file paths
 */
export async function findActions(
  directory: string,
  options: { recursive?: boolean } = {},
): Promise<string[]> {
  if (!existsSync(directory)) {
    logger.debug(`Directory does not exist: ${directory}`)
    return []
  }

  const { recursive = true } = options
  const actions: string[] = []

  async function walk(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (EXCLUDED_DIRS.has(entry.name)) {
            continue
          }

          // Only recurse if recursive option is enabled
          if (recursive) {
            await walk(fullPath)
          }
        } else if (entry.isFile()) {
          // Check if it's a TypeScript file
          const ext = extname(entry.name)
          if (ext === '.ts' || ext === '.tsx') {
            actions.push(fullPath)
          }
        }
      }
    } catch (error) {
      logger.warn(`Failed to read directory: ${dir}`, error)
    }
  }

  await walk(directory)
  return actions
}

/**
 * Find actions from multiple directories in priority order
 * @param directories - Directories to search in priority order (first has lowest priority)
 * @returns Array of absolute file paths (higher priority actions come last)
 */
export async function findActionsWithPriority(directories: string[]): Promise<string[]> {
  const allActions: string[] = []

  for (const dir of directories) {
    const actions = await findActions(dir)
    logger.debug(`Found ${actions.length} action(s) in ${dir}`)
    allActions.push(...actions)
  }

  return allActions
}
