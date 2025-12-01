/**
 * Action registry for managing loaded actions
 */

import type { Action } from '@/action/types'
import { logger } from '@/lib/logger'

/**
 * Action registry class
 */
export class ActionRegistry {
  private actions = new Map<string, Action>()

  /**
   * Register an action
   * If an action with the same name exists, it will be overwritten (last-wins)
   */
  register(action: Action): void {
    if (this.actions.has(action.meta.name)) {
      logger.debug(`Overwriting existing action: ${action.meta.name} (last-wins policy)`)
    }

    this.actions.set(action.meta.name, action)
    logger.debug(`Registered action: ${action.meta.name}`)
  }

  /**
   * Get all registered actions
   */
  getAll(): Action[] {
    return Array.from(this.actions.values())
  }

  /**
   * Get an action by name
   */
  getByName(name: string): Action | undefined {
    return this.actions.get(name)
  }

  /**
   * Get actions by category
   */
  getByCategory(category: string): Action[] {
    return this.getAll().filter((action) => action.meta.category === category)
  }

  /**
   * Get the number of registered actions
   */
  get count(): number {
    return this.actions.size
  }

  /**
   * Clear all registered actions
   */
  clear(): void {
    this.actions.clear()
    logger.debug('Cleared all actions from registry')
  }
}
