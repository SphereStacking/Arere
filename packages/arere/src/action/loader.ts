/**
 * Action loader using jiti for TypeScript execution
 */

import { existsSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Action, ActionDefinition } from '@/action/types'
import { registerTranslations } from '@/i18n/index'
import { ActionLoadError } from '@/lib/error'
import { logger } from '@/lib/logger'
import createJiti from 'jiti'

// Get the src directory path for path alias resolution
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const srcDir = resolve(__dirname, '..')

/**
 * Derive action name from file path
 * @param filePath - Absolute path to the action file
 * @returns Action name derived from filename (without extension)
 */
function deriveActionName(filePath: string): string {
  const filename = basename(filePath)
  // Remove .ts, .js extensions
  return filename.replace(/\.(ts|js)$/, '')
}

/**
 * Load an action from a file path
 * @param filePath - Absolute path to the action file
 * @returns Loaded action
 * @throws {ActionLoadError} If the action fails to load
 */
export async function loadAction(filePath: string): Promise<Action> {
  if (!existsSync(filePath)) {
    throw new ActionLoadError(filePath, new Error('File does not exist'))
  }

  try {
    // Create jiti instance for the action's directory with path alias support
    const jiti = createJiti(dirname(filePath), {
      interopDefault: true,
      alias: {
        '@': srcDir,
      },
    })

    // Load the action
    const module = jiti(filePath)

    // Check if the module has a default export
    if (!module || typeof module !== 'object') {
      throw new Error('Action must export a default object')
    }

    // Handle both default export and direct export
    // jiti with interopDefault should handle this, but we check both
    const exported = (module.default || module) as Action | ActionDefinition

    // Check if it's already an Action object (from defineAction)
    let action: Action
    if ('meta' in exported && 'filePath' in exported && 'run' in exported) {
      // Already an Action object
      action = exported as Action
      // Update filePath to the actual file path
      action.filePath = filePath
      // Derive name from filename if not provided or empty
      if (!action.meta.name || action.meta.name === '') {
        const derivedName = deriveActionName(filePath)
        logger.debug(`Deriving action name from filename: ${filePath} -> ${derivedName}`)
        action.meta.name = derivedName
      }
    } else {
      // It's an ActionDefinition, convert to Action
      const definition = exported as ActionDefinition

      // Derive name from filename if not provided
      const actionName = definition.name || deriveActionName(filePath)

      // Validate required fields
      if (!actionName || typeof actionName !== 'string') {
        throw new Error('Action must have a "name" field or valid filename')
      }

      if (!definition.description) {
        throw new Error('Action must have a "description" field')
      }

      if (
        typeof definition.description !== 'string' &&
        typeof definition.description !== 'function'
      ) {
        throw new Error('Action description must be a string or function')
      }

      if (!definition.run || typeof definition.run !== 'function') {
        throw new Error('Action must have a "run" function')
      }

      // Build the Action object
      action = {
        meta: {
          name: actionName,
          description: definition.description,
          category: definition.category,
          tags: definition.tags,
        },
        filePath,
        run: definition.run,
        translations: definition.translations,
      }
    }

    // Register action translations if provided
    if (action.translations) {
      registerTranslations(action.meta.name, action.translations)
    }

    logger.debug(`Loaded action: ${action.meta.name} from ${filePath}`)
    return action
  } catch (error) {
    if (error instanceof ActionLoadError) {
      throw error
    }
    throw new ActionLoadError(filePath, error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Load multiple actions from file paths in parallel
 * @param filePaths - Array of absolute file paths
 * @returns Array of loaded actions (failed loads are skipped with warnings)
 */
export async function loadActions(filePaths: string[]): Promise<Action[]> {
  // Load all actions in parallel using Promise.all
  const results = await Promise.allSettled(filePaths.map((filePath) => loadAction(filePath)))

  // Filter successful results and log failures
  const actions: Action[] = []
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      actions.push(result.value)
    } else {
      logger.warn(`Failed to load action from ${filePaths[i]}:`, result.reason)
    }
  }

  return actions
}
