/**
 * Integration test for core action loading flow
 *
 * Updated to pass config parameter to createActionContext
 */

import { join } from 'node:path'
import { loadActions } from '@/action/loader.js'
import { ActionRegistry } from '@/action/registry.js'
import { findActions } from '@/action/resolver.js'
import { createActionContext } from '@/action/context.js'
import { defaultConfig } from '@/config/schema.js'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Core action loading flow (integration)', () => {
  let registry: ActionRegistry

  beforeEach(() => {
    registry = new ActionRegistry()
  })

  it('should complete full flow: find -> load -> register -> retrieve', async () => {
    const fixturesDir = join(process.cwd(), 'tests', 'fixtures', 'actions')

    // Step 1: Find actions in directory
    const actionPaths = await findActions(fixturesDir)
    expect(actionPaths.length).toBeGreaterThan(0)

    // Step 2: Load actions
    const actions = await loadActions(actionPaths)
    expect(actions.length).toBeGreaterThan(0)

    // Step 3: Register actions
    for (const action of actions) {
      registry.register(action)
    }

    expect(registry.count).toBe(actions.length)

    // Step 4: Retrieve actions
    const allActions = registry.getAll()
    expect(allActions.length).toBe(actions.length)

    // Verify specific action
    const simpleAction = registry.getByName('simple-action')
    expect(simpleAction).toBeDefined()
    expect(simpleAction?.meta.name).toBe('simple-action')
  })

  it('should handle category filtering', async () => {
    const fixturesDir = join(process.cwd(), 'tests', 'fixtures', 'actions')

    const actionPaths = await findActions(fixturesDir)
    const actions = await loadActions(actionPaths)

    for (const action of actions) {
      registry.register(action)
    }

    const categorized = registry.getByCategory('test-category')
    expect(categorized.length).toBeGreaterThan(0)
    expect(categorized.every((s) => s.meta.category === 'test-category')).toBe(true)
  })

  it('should handle action execution context', async () => {
    const fixturesDir = join(process.cwd(), 'tests', 'fixtures', 'actions')

    const actionPaths = await findActions(fixturesDir)
    const actions = await loadActions(actionPaths)

    expect(actions.length).toBeGreaterThan(0)

    const action = actions[0]
    expect(typeof action.run).toBe('function')

    // Verify run function can be called with context (requires config parameter)
    const { context } = createActionContext({
      actionName: action.meta.name,
      config: defaultConfig,
      pluginNamespace: action.pluginNamespace,
    })
    await expect(action.run(context)).resolves.not.toThrow()
  })
})
