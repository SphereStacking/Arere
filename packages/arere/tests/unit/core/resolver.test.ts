/**
 * Tests for action resolver
 */

import { join } from 'node:path'
import { findActions, findActionsWithPriority } from '@/core/resolver.js'
import { describe, expect, it } from 'vitest'

describe('Action resolver', () => {
  const fixturesDir = join(process.cwd(), 'tests', 'fixtures', 'actions')

  describe('findActions', () => {
    it('should find TypeScript files in directory', async () => {
      const actions = await findActions(fixturesDir)
      expect(actions.length).toBeGreaterThan(0)
      expect(actions.every((path) => path.endsWith('.ts'))).toBe(true)
    })

    it('should return empty array for non-existent directory', async () => {
      const actions = await findActions('/non-existent-directory')
      expect(actions).toEqual([])
    })

    it('should exclude node_modules', async () => {
      const actions = await findActions(process.cwd())
      const hasNodeModules = actions.some((path) => path.includes('node_modules'))
      expect(hasNodeModules).toBe(false)
    })
  })

  describe('findActionsWithPriority', () => {
    it('should find actions from multiple directories', async () => {
      const actions = await findActionsWithPriority([fixturesDir])
      expect(actions.length).toBeGreaterThan(0)
    })

    it('should combine actions from all directories', async () => {
      const srcDir = join(process.cwd(), 'src')
      const actions = await findActionsWithPriority([fixturesDir, srcDir])
      expect(actions.length).toBeGreaterThan(0)
    })
  })
})
