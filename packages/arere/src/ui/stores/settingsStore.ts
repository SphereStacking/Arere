/**
 * Settings Store - Configuration and plugin state management
 */

import type { Action } from '@/action/types'
import type { ArereConfig } from '@/config/schema'
import type { ConfigLayer } from '@/config/types'
import type { LoadedPlugin } from '@/plugin/types'
import type { BookmarkId } from '@/ui/bookmark/types'
import { create } from 'zustand'

export interface SettingsStore {
  // State
  currentConfig: ArereConfig
  currentPlugins: LoadedPlugin[]
  currentActions: Action[]
  selectedPlugin: LoadedPlugin | null
  currentLayer: ConfigLayer
  userLayerConfig: Partial<ArereConfig> | null
  workspaceLayerConfig: Partial<ArereConfig> | null
  onPluginReload: ((config: ArereConfig) => Promise<Action[]>) | null

  // Derived state helpers
  getBookmarks: () => BookmarkId[]
  isBookmarked: (id: BookmarkId) => boolean

  // Actions
  setCurrentConfig: (config: ArereConfig) => void
  setCurrentPlugins: (plugins: LoadedPlugin[]) => void
  setCurrentActions: (actions: Action[]) => void
  setSelectedPlugin: (plugin: LoadedPlugin | null) => void
  setCurrentLayer: (layer: ConfigLayer) => void
  setUserLayerConfig: (config: Partial<ArereConfig> | null) => void
  setWorkspaceLayerConfig: (config: Partial<ArereConfig> | null) => void

  // Bookmark actions (updates local state only, persistence handled separately)
  addBookmark: (id: BookmarkId) => void
  removeBookmark: (id: BookmarkId) => void
  toggleBookmark: (id: BookmarkId) => void

  // Async actions
  reloadLayerConfigs: () => Promise<void>

  // Initialization
  initialize: (
    config: ArereConfig,
    plugins: LoadedPlugin[],
    actions: Action[],
    onPluginReload: (config: ArereConfig) => Promise<Action[]>,
  ) => void
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state (will be initialized via initialize())
  currentConfig: {} as ArereConfig,
  currentPlugins: [],
  currentActions: [],
  selectedPlugin: null,
  currentLayer: 'workspace',
  userLayerConfig: null,
  workspaceLayerConfig: null,
  onPluginReload: null,

  // Derived state helpers
  getBookmarks: () => (get().currentConfig.bookmarks ?? []) as BookmarkId[],
  isBookmarked: (id) => {
    const bookmarks = get().currentConfig.bookmarks ?? []
    return bookmarks.includes(id)
  },

  // Actions
  setCurrentConfig: (config) => set({ currentConfig: config }),
  setCurrentPlugins: (plugins) => set({ currentPlugins: plugins }),
  setCurrentActions: (actions) => set({ currentActions: actions }),
  setSelectedPlugin: (plugin) => set({ selectedPlugin: plugin }),
  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  setUserLayerConfig: (config) => set({ userLayerConfig: config }),
  setWorkspaceLayerConfig: (config) => set({ workspaceLayerConfig: config }),

  // Bookmark actions (updates local state only)
  addBookmark: (id) =>
    set((state) => {
      const bookmarks = state.currentConfig.bookmarks ?? []
      if (bookmarks.includes(id)) return state
      return {
        currentConfig: {
          ...state.currentConfig,
          bookmarks: [...bookmarks, id],
        },
      }
    }),

  removeBookmark: (id) =>
    set((state) => {
      const bookmarks = state.currentConfig.bookmarks ?? []
      return {
        currentConfig: {
          ...state.currentConfig,
          bookmarks: bookmarks.filter((b) => b !== id),
        },
      }
    }),

  toggleBookmark: (id) =>
    set((state) => {
      const bookmarks = state.currentConfig.bookmarks ?? []
      const newBookmarks = bookmarks.includes(id)
        ? bookmarks.filter((b) => b !== id)
        : [...bookmarks, id]
      return {
        currentConfig: {
          ...state.currentConfig,
          bookmarks: newBookmarks,
        },
      }
    }),

  // Async actions
  reloadLayerConfigs: async () => {
    try {
      const { FileConfigManager } = await import('@/config/manager')
      const manager = new FileConfigManager()
      const user = await manager.loadLayer('user')
      const workspace = await manager.loadLayer('workspace')
      set({ userLayerConfig: user, workspaceLayerConfig: workspace })
    } catch {
      set({ userLayerConfig: null, workspaceLayerConfig: null })
    }
  },

  // Initialization
  initialize: (config, plugins, actions, onPluginReload) =>
    set({
      currentConfig: config,
      currentPlugins: plugins,
      currentActions: actions,
      onPluginReload,
    }),
}))
