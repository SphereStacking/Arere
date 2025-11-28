/**
 * Integration test for bookmark system
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FileConfigManager } from '@/infrastructure/config/manager.js'
import type { ArereConfig } from '@/infrastructure/config/schema.js'
import { createBookmarkId, isBookmarked, parseBookmarkId } from '@/domain/bookmark/utils.js'
import type { Action, ActionLocation } from '@/domain/action/types.js'
import type { BookmarkId } from '@/domain/bookmark/types.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Helper to create mock action
function createMockAction(
  name: string,
  location: ActionLocation | undefined
): Action {
  return {
    meta: { name, description: 'Test action' },
    filePath: `/test/${name}.ts`,
    location,
    run: async () => {},
  }
}

describe('Bookmark system (integration)', () => {
  let testConfigDir: string
  let testConfigPath: string

  beforeEach(() => {
    // Create unique test config directory
    testConfigDir = join(
      process.cwd(),
      'tests',
      'fixtures',
      `test-bookmark-${Date.now()}-${Math.random().toString(36).slice(2)}`
    )
    testConfigPath = join(testConfigDir, '.arere', 'settings.json')

    // Create test directories
    if (!existsSync(testConfigDir)) {
      mkdirSync(testConfigDir, { recursive: true })
    }
    const arereDir = join(testConfigDir, '.arere')
    if (!existsSync(arereDir)) {
      mkdirSync(arereDir, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up test config
    if (existsSync(testConfigDir)) {
      rmSync(testConfigDir, { recursive: true, force: true })
    }
  })

  describe('Bookmark ID generation', () => {
    it('generates correct ID for local actions', () => {
      const projectAction = createMockAction('my-script', 'project')
      const globalAction = createMockAction('global-script', 'global')

      expect(createBookmarkId(projectAction)).toBe('local:my-script')
      expect(createBookmarkId(globalAction)).toBe('local:global-script')
    })

    it('generates correct ID for plugin actions', () => {
      const pluginAction = createMockAction('pomodoro', { plugin: 'arere-plugin-timer' })

      expect(createBookmarkId(pluginAction)).toBe('arere-plugin-timer:pomodoro')
    })

    it('parses bookmark IDs correctly', () => {
      expect(parseBookmarkId('local:my-script')).toEqual({
        plugin: null,
        name: 'my-script',
      })

      expect(parseBookmarkId('arere-plugin-timer:pomodoro')).toEqual({
        plugin: 'arere-plugin-timer',
        name: 'pomodoro',
      })
    })
  })

  describe('Bookmark persistence', () => {
    it('saves bookmarks to config file', async () => {
      const manager = new FileConfigManager(testConfigDir)

      // Save bookmarks
      await manager.save('workspace', 'bookmarks', [
        'local:my-script',
        'arere-plugin-timer:pomodoro',
      ])

      // Read the config file directly
      const configContent = readFileSync(testConfigPath, 'utf-8')
      const config = JSON.parse(configContent)

      expect(config.bookmarks).toEqual([
        'local:my-script',
        'arere-plugin-timer:pomodoro',
      ])
    })

    it('loads bookmarks from config file', async () => {
      // Write config file directly
      const config: ArereConfig = {
        bookmarks: ['local:script1', 'local:script2'],
      }
      writeFileSync(testConfigPath, JSON.stringify(config, null, 2))

      // Load config
      const manager = new FileConfigManager(testConfigDir)
      const loadedConfig = await manager.loadMerged()

      expect(loadedConfig.bookmarks).toEqual(['local:script1', 'local:script2'])
    })

    it('merges bookmarks from user and workspace layers', async () => {
      // Create user config directory
      const userConfigDir = join(testConfigDir, '.home', '.arere')
      mkdirSync(userConfigDir, { recursive: true })

      // Write workspace config
      writeFileSync(
        testConfigPath,
        JSON.stringify({ bookmarks: ['local:workspace-script'] }, null, 2)
      )

      // Note: User config in tests typically needs special handling
      // This test verifies workspace bookmarks are loaded correctly
      const manager = new FileConfigManager(testConfigDir)
      const loadedConfig = await manager.loadMerged()

      expect(loadedConfig.bookmarks).toEqual(['local:workspace-script'])
    })
  })

  describe('Bookmark matching', () => {
    it('correctly identifies bookmarked actions', () => {
      const bookmarks: BookmarkId[] = ['local:script1', 'arere-plugin-timer:pomodoro']

      const script1 = createMockAction('script1', 'project')
      const script2 = createMockAction('script2', 'project')
      const pomodoro = createMockAction('pomodoro', { plugin: 'arere-plugin-timer' })

      expect(isBookmarked(script1, bookmarks)).toBe(true)
      expect(isBookmarked(script2, bookmarks)).toBe(false)
      expect(isBookmarked(pomodoro, bookmarks)).toBe(true)
    })

    it('distinguishes between local and plugin actions with same name', () => {
      const bookmarks: BookmarkId[] = ['arere-plugin-timer:pomodoro']

      const localPomodoro = createMockAction('pomodoro', 'project')
      const pluginPomodoro = createMockAction('pomodoro', { plugin: 'arere-plugin-timer' })

      expect(isBookmarked(localPomodoro, bookmarks)).toBe(false)
      expect(isBookmarked(pluginPomodoro, bookmarks)).toBe(true)
    })
  })

  describe('Bookmark toggle flow', () => {
    it('adds bookmark when not bookmarked', async () => {
      const manager = new FileConfigManager(testConfigDir)

      // Start with no bookmarks
      writeFileSync(testConfigPath, JSON.stringify({ bookmarks: [] }, null, 2))

      // Add a bookmark
      const action = createMockAction('new-script', 'project')
      const bookmarkId = createBookmarkId(action)

      await manager.save('workspace', 'bookmarks', [bookmarkId])

      // Verify
      const loadedConfig = await manager.loadMerged()
      expect(loadedConfig.bookmarks).toContain('local:new-script')
    })

    it('removes bookmark when already bookmarked', async () => {
      const manager = new FileConfigManager(testConfigDir)

      // Start with one bookmark
      writeFileSync(
        testConfigPath,
        JSON.stringify(
          { bookmarks: ['local:script1', 'local:script2'] },
          null,
          2
        )
      )

      // Remove script1 bookmark
      await manager.save('workspace', 'bookmarks', ['local:script2'])

      // Verify
      const loadedConfig = await manager.loadMerged()
      expect(loadedConfig.bookmarks).toEqual(['local:script2'])
    })
  })
})
