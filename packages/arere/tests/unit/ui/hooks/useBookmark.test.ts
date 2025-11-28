import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import { useBookmark } from '@/presentation/ui/hooks/useBookmark'
import type { ArereConfig } from '@/infrastructure/config/schema'
import type { Action, ActionLocation } from '@/domain/action/types'
import { createBookmarkId, isBookmarked } from '@/domain/bookmark/utils'

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

describe('useBookmark integration with settingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSettingsStore.setState({
      currentConfig: {
        bookmarks: [],
      } as ArereConfig,
      currentPlugins: [],
      currentActions: [],
      selectedPlugin: null,
      currentLayer: 'workspace',
      userLayerConfig: null,
      workspaceLayerConfig: null,
      onPluginReload: null,
    })
  })

  describe('isBookmarked with Action', () => {
    it('returns false for non-bookmarked action', () => {
      const action = createMockAction('test', 'project')
      const bookmarks = useSettingsStore.getState().getBookmarks()

      expect(isBookmarked(action, bookmarks)).toBe(false)
    })

    it('returns true for bookmarked project action', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:test'],
        } as ArereConfig,
      })

      const action = createMockAction('test', 'project')
      const bookmarks = useSettingsStore.getState().getBookmarks()

      expect(isBookmarked(action, bookmarks)).toBe(true)
    })

    it('returns true for bookmarked global action', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:global-test'],
        } as ArereConfig,
      })

      const action = createMockAction('global-test', 'global')
      const bookmarks = useSettingsStore.getState().getBookmarks()

      expect(isBookmarked(action, bookmarks)).toBe(true)
    })

    it('returns true for bookmarked plugin action', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['arere-plugin-timer:pomodoro'],
        } as ArereConfig,
      })

      const action = createMockAction('pomodoro', {
        plugin: 'arere-plugin-timer',
      })
      const bookmarks = useSettingsStore.getState().getBookmarks()

      expect(isBookmarked(action, bookmarks)).toBe(true)
    })

    it('distinguishes between local and plugin actions with same name', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['arere-plugin-timer:pomodoro'],
        } as ArereConfig,
      })

      const localAction = createMockAction('pomodoro', 'project')
      const pluginAction = createMockAction('pomodoro', {
        plugin: 'arere-plugin-timer',
      })
      const bookmarks = useSettingsStore.getState().getBookmarks()

      expect(isBookmarked(localAction, bookmarks)).toBe(false)
      expect(isBookmarked(pluginAction, bookmarks)).toBe(true)
    })
  })

  describe('toggle bookmark with Action', () => {
    it('adds bookmark for non-bookmarked action', () => {
      const action = createMockAction('test', 'project')
      const bookmarkId = createBookmarkId(action)

      useSettingsStore.getState().toggleBookmark(bookmarkId)

      const bookmarks = useSettingsStore.getState().getBookmarks()
      expect(isBookmarked(action, bookmarks)).toBe(true)
      expect(bookmarks).toContain('local:test')
    })

    it('removes bookmark for bookmarked action', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:test'],
        } as ArereConfig,
      })

      const action = createMockAction('test', 'project')
      const bookmarkId = createBookmarkId(action)

      useSettingsStore.getState().toggleBookmark(bookmarkId)

      const bookmarks = useSettingsStore.getState().getBookmarks()
      expect(isBookmarked(action, bookmarks)).toBe(false)
      expect(bookmarks).not.toContain('local:test')
    })

    it('preserves other bookmarks when toggling', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:a', 'local:b', 'local:c'],
        } as ArereConfig,
      })

      const action = createMockAction('b', 'project')
      const bookmarkId = createBookmarkId(action)

      useSettingsStore.getState().toggleBookmark(bookmarkId)

      const bookmarks = useSettingsStore.getState().getBookmarks()
      expect(bookmarks).toContain('local:a')
      expect(bookmarks).not.toContain('local:b')
      expect(bookmarks).toContain('local:c')
    })
  })

  describe('createBookmarkId', () => {
    it('creates local:name for project actions', () => {
      const action = createMockAction('my-script', 'project')
      expect(createBookmarkId(action)).toBe('local:my-script')
    })

    it('creates local:name for global actions', () => {
      const action = createMockAction('global-script', 'global')
      expect(createBookmarkId(action)).toBe('local:global-script')
    })

    it('creates plugin:name for plugin actions', () => {
      const action = createMockAction('pomodoro', {
        plugin: 'arere-plugin-timer',
      })
      expect(createBookmarkId(action)).toBe('arere-plugin-timer:pomodoro')
    })
  })
})
