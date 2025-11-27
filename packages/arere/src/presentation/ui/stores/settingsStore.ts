/**
 * Settings Store - Configuration and plugin state management
 */

import type { Action } from '@/domain/action/types'
import type { LoadedPlugin } from '@/domain/plugin/types'
import type { ArereConfig } from '@/infrastructure/config/schema'
import type { ConfigLayer } from '@/infrastructure/config/types'
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

  // Actions
  setCurrentConfig: (config: ArereConfig) => void
  setCurrentPlugins: (plugins: LoadedPlugin[]) => void
  setCurrentActions: (actions: Action[]) => void
  setSelectedPlugin: (plugin: LoadedPlugin | null) => void
  setCurrentLayer: (layer: ConfigLayer) => void
  setUserLayerConfig: (config: Partial<ArereConfig> | null) => void
  setWorkspaceLayerConfig: (config: Partial<ArereConfig> | null) => void

  // Async actions
  reloadLayerConfigs: () => Promise<void>

  // Initialization
  initialize: (
    config: ArereConfig,
    plugins: LoadedPlugin[],
    actions: Action[],
    onPluginReload: (config: ArereConfig) => Promise<Action[]>
  ) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial state (will be initialized via initialize())
  currentConfig: {} as ArereConfig,
  currentPlugins: [],
  currentActions: [],
  selectedPlugin: null,
  currentLayer: 'workspace',
  userLayerConfig: null,
  workspaceLayerConfig: null,
  onPluginReload: null,

  // Actions
  setCurrentConfig: (config) => set({ currentConfig: config }),
  setCurrentPlugins: (plugins) => set({ currentPlugins: plugins }),
  setCurrentActions: (actions) => set({ currentActions: actions }),
  setSelectedPlugin: (plugin) => set({ selectedPlugin: plugin }),
  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  setUserLayerConfig: (config) => set({ userLayerConfig: config }),
  setWorkspaceLayerConfig: (config) => set({ workspaceLayerConfig: config }),

  // Async actions
  reloadLayerConfigs: async () => {
    try {
      const { FileConfigManager } = await import('@/infrastructure/config/manager')
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
