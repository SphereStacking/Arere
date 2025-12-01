/**
 * Tests for ActionRegistry
 */

import { ActionRegistry } from '@/action/registry.js'
import type { Action } from '@/action/types.js'
import { beforeEach, describe, expect, it } from 'vitest'

describe('ActionRegistry', () => {
  let registry: ActionRegistry

  beforeEach(() => {
    registry = new ActionRegistry()
  })

  const createMockAction = (name: string, category?: string): Action => ({
    meta: {
      name,
      description: `Test action: ${name}`,
      category,
    },
    filePath: `/fake/path/${name}.ts`,
    run: async () => {},
  })

  describe('register', () => {
    it('should register an action', () => {
      const action = createMockAction('test-action')
      registry.register(action)

      expect(registry.count).toBe(1)
      expect(registry.getByName('test-action')).toBe(action)
    })

    it('should overwrite action with same name (last-wins)', () => {
      const action1 = createMockAction('test-action')
      const action2 = createMockAction('test-action')

      registry.register(action1)
      registry.register(action2)

      expect(registry.count).toBe(1)
      expect(registry.getByName('test-action')).toBe(action2)
    })
  })

  describe('getAll', () => {
    it('should return empty array when no actions registered', () => {
      expect(registry.getAll()).toEqual([])
    })

    it('should return all registered actions', () => {
      const action1 = createMockAction('action-1')
      const action2 = createMockAction('action-2')

      registry.register(action1)
      registry.register(action2)

      const all = registry.getAll()
      expect(all).toHaveLength(2)
      expect(all).toContain(action1)
      expect(all).toContain(action2)
    })
  })

  describe('getByName', () => {
    it('should return undefined for non-existent action', () => {
      expect(registry.getByName('non-existent')).toBeUndefined()
    })

    it('should return action by name', () => {
      const action = createMockAction('test-action')
      registry.register(action)

      expect(registry.getByName('test-action')).toBe(action)
    })
  })

  describe('getByCategory', () => {
    it('should return empty array when no actions match category', () => {
      const action = createMockAction('action-1', 'cat-a')
      registry.register(action)

      expect(registry.getByCategory('cat-b')).toEqual([])
    })

    it('should return actions matching category', () => {
      const action1 = createMockAction('action-1', 'cat-a')
      const action2 = createMockAction('action-2', 'cat-a')
      const action3 = createMockAction('action-3', 'cat-b')

      registry.register(action1)
      registry.register(action2)
      registry.register(action3)

      const catA = registry.getByCategory('cat-a')
      expect(catA).toHaveLength(2)
      expect(catA).toContain(action1)
      expect(catA).toContain(action2)
    })

    it('should not return actions without category', () => {
      const action1 = createMockAction('action-1', 'cat-a')
      const action2 = createMockAction('action-2')

      registry.register(action1)
      registry.register(action2)

      const catA = registry.getByCategory('cat-a')
      expect(catA).toHaveLength(1)
      expect(catA).toContain(action1)
    })
  })

  describe('count', () => {
    it('should return 0 when no actions registered', () => {
      expect(registry.count).toBe(0)
    })

    it('should return correct count', () => {
      registry.register(createMockAction('action-1'))
      registry.register(createMockAction('action-2'))

      expect(registry.count).toBe(2)
    })
  })

  describe('clear', () => {
    it('should clear all actions', () => {
      registry.register(createMockAction('action-1'))
      registry.register(createMockAction('action-2'))

      expect(registry.count).toBe(2)

      registry.clear()

      expect(registry.count).toBe(0)
      expect(registry.getAll()).toEqual([])
    })
  })
})
