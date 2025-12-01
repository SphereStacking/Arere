/**
 * Tests for action loader
 */

import { join } from 'node:path'
import { loadAction, loadActions } from '@/action/loader.js'
import { ActionLoadError } from '@/lib/error.js'
import { describe, expect, it } from 'vitest'

describe('Action loader', () => {
  const fixturesDir = join(process.cwd(), 'tests', 'fixtures', 'actions')

  describe('loadAction', () => {
    it('should load a valid action', async () => {
      const actionPath = join(fixturesDir, 'simple.ts')
      const action = await loadAction(actionPath)

      expect(action.meta.name).toBe('simple-action')
      expect(action.meta.description).toBe('A simple test action')
      expect(action.filePath).toBe(actionPath)
      expect(typeof action.run).toBe('function')
    })

    it('should load action with category', async () => {
      const actionPath = join(fixturesDir, 'with-category.ts')
      const action = await loadAction(actionPath)

      expect(action.meta.name).toBe('categorized-action')
      expect(action.meta.category).toBe('test-category')
    })

    it('should load action with tags', async () => {
      const actionPath = join(fixturesDir, 'with-tags.ts')
      const action = await loadAction(actionPath)

      expect(action.meta.name).toBe('test-tags')
      expect(action.meta.tags).toEqual(['test', 'example', 'dev'])
    })

    it('should throw ActionLoadError for non-existent file', async () => {
      await expect(loadAction('/non-existent/action.ts')).rejects.toThrow(ActionLoadError)
    })

    it('should throw ActionLoadError for invalid action', async () => {
      const actionPath = join(fixturesDir, 'invalid.ts')
      await expect(loadAction(actionPath)).rejects.toThrow(ActionLoadError)
    })
  })

  describe('loadActions', () => {
    it('should load multiple actions', async () => {
      const paths = [join(fixturesDir, 'simple.ts'), join(fixturesDir, 'with-category.ts')]

      const actions = await loadActions(paths)
      expect(actions.length).toBe(2)
    })

    it('should skip failed actions and continue', async () => {
      const paths = [
        join(fixturesDir, 'simple.ts'),
        '/non-existent/action.ts',
        join(fixturesDir, 'with-category.ts'),
      ]

      const actions = await loadActions(paths)
      expect(actions.length).toBe(2) // Should skip the non-existent one
    })

    it('should return empty array for empty input', async () => {
      const actions = await loadActions([])
      expect(actions).toEqual([])
    })
  })
})
