import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import type { ArereConfig } from '@/infrastructure/config/schema'

describe('settingsStore - bookmark functionality', () => {
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

  describe('getBookmarks', () => {
    it('returns empty array when no bookmarks', () => {
      const store = useSettingsStore.getState()
      expect(store.getBookmarks()).toEqual([])
    })

    it('returns bookmarks from config', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:test', 'plugin:action'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      expect(store.getBookmarks()).toEqual(['local:test', 'plugin:action'])
    })

    it('returns empty array when bookmarks is undefined', () => {
      useSettingsStore.setState({
        currentConfig: {} as ArereConfig,
      })

      const store = useSettingsStore.getState()
      expect(store.getBookmarks()).toEqual([])
    })
  })

  describe('isBookmarked', () => {
    it('returns true for bookmarked action', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:my-script'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      expect(store.isBookmarked('local:my-script')).toBe(true)
    })

    it('returns false for non-bookmarked action', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:other'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      expect(store.isBookmarked('local:my-script')).toBe(false)
    })
  })

  describe('addBookmark', () => {
    it('adds a bookmark to empty list', () => {
      const store = useSettingsStore.getState()
      store.addBookmark('local:new-action')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([
        'local:new-action',
      ])
    })

    it('appends bookmark to existing list', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:existing'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      store.addBookmark('local:new')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([
        'local:existing',
        'local:new',
      ])
    })

    it('does not add duplicate bookmark', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:existing'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      store.addBookmark('local:existing')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([
        'local:existing',
      ])
    })
  })

  describe('removeBookmark', () => {
    it('removes a bookmark', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:a', 'local:b', 'local:c'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      store.removeBookmark('local:b')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([
        'local:a',
        'local:c',
      ])
    })

    it('does nothing when bookmark does not exist', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:a'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      store.removeBookmark('local:nonexistent')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([
        'local:a',
      ])
    })
  })

  describe('toggleBookmark', () => {
    it('adds bookmark when not bookmarked', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: [],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      store.toggleBookmark('local:new')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([
        'local:new',
      ])
    })

    it('removes bookmark when already bookmarked', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:existing'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      store.toggleBookmark('local:existing')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([])
    })

    it('preserves other bookmarks when toggling', () => {
      useSettingsStore.setState({
        currentConfig: {
          bookmarks: ['local:a', 'local:b', 'local:c'],
        } as ArereConfig,
      })

      const store = useSettingsStore.getState()
      store.toggleBookmark('local:b')

      expect(useSettingsStore.getState().currentConfig.bookmarks).toEqual([
        'local:a',
        'local:c',
      ])
    })
  })
})
