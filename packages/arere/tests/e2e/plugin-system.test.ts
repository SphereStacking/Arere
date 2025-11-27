/**
 * End-to-end tests for plugin system
 */

import { resolve } from 'node:path'
import { runAction } from '@/domain/action/executor.js'
import { detectPlugins } from '@/infrastructure/plugin/detector.js'
import { type PluginManager, createPluginManager } from '@/infrastructure/plugin/index.js'
import { loadPlugin, loadPluginActions } from '@/infrastructure/plugin/loader.js'
import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('E2E: Plugin System', () => {
  let manager: PluginManager

  beforeEach(() => {
    manager = createPluginManager()

    // Set up a basic prompt handler for testing
    setPromptHandler(async (request) => {
      switch (request.type) {
        case 'text':
          return 'test input'
        case 'select':
          return (request.choices as any)[0]?.value
        case 'confirm':
          return true
        case 'multiSelect':
          return [(request.choices as any)[0]?.value]
        default:
          return null
      }
    })
  })

  afterEach(() => {
    manager.clear()
    clearPromptHandler()
  })

  describe('Plugin Detection', () => {
    it('should detect example plugins in packages directory', async () => {
      // Detect plugins in packages directory
      const packagesPath = resolve(process.cwd(), '../')

      // Manually detect plugins in packages directory
      const plugins = await detectPlugins(packagesPath)

      expect(Array.isArray(plugins)).toBe(true)
      expect(plugins.length).toBeGreaterThan(0)

      // Check that arere-plugin-tutorial is detected
      const tutorialPlugin = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      expect(tutorialPlugin).toBeDefined()
      expect(tutorialPlugin?.packageJson.name).toBe('arere-plugin-tutorial')
    })

    it('should detect plugin metadata correctly', async () => {
      const packagesPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(packagesPath)

      for (const plugin of plugins) {
        expect(plugin.name).toBeDefined()
        expect(plugin.path).toBeDefined()
        expect(plugin.packageJson).toBeDefined()
        expect(plugin.packageJson.name).toBeDefined()
        expect(plugin.packageJson.version).toBeDefined()
      }
    })
  })

  describe('Plugin Loading', () => {
    it('should load plugin and actions from arere-plugin-tutorial', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const examplePluginInfo = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      expect(examplePluginInfo).toBeDefined()

      if (!examplePluginInfo) return

      const loadedPlugin = await loadPlugin(examplePluginInfo)

      expect(loadedPlugin).toBeDefined()
      expect(loadedPlugin.meta.name).toBe('arere-plugin-tutorial')
      expect(loadedPlugin.meta.version).toBeDefined()
      expect(loadedPlugin.actionPaths.length).toBeGreaterThan(0)
    })

    it('should load actions from plugin', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const examplePluginInfo = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      if (!examplePluginInfo) return

      const loadedPlugin = await loadPlugin(examplePluginInfo)
      const actions = await loadPluginActions(loadedPlugin)

      expect(Array.isArray(actions)).toBe(true)
      expect(actions.length).toBeGreaterThan(0)

      // Verify action structure
      for (const action of actions) {
        expect(action.meta).toBeDefined()
        expect(action.meta.name).toBeDefined()
        expect(action.run).toBeDefined()
        expect(typeof action.run).toBe('function')
      }
    })

    it('should assign plugin category to actions', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const examplePluginInfo = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      if (!examplePluginInfo) return

      const loadedPlugin = await loadPlugin(examplePluginInfo)
      const actions = await loadPluginActions(loadedPlugin)

      for (const action of actions) {
        // Actions should have a category (either from action or from plugin)
        expect(action.meta.category).toBeDefined()
      }
    })
  })

  describe('Plugin Manager Integration', () => {
    it('should load all plugins through manager', async () => {
      await manager.loadAll()

      expect(manager.isLoaded).toBe(true)
      const plugins = manager.getPlugins()
      expect(Array.isArray(plugins)).toBe(true)
    })

    it('should get all actions from loaded plugins', async () => {
      await manager.loadAll()

      const actions = manager.getActions()
      expect(Array.isArray(actions)).toBe(true)
    })

    it('should not reload plugins multiple times', async () => {
      await manager.loadAll()
      const firstCount = manager.count

      await manager.loadAll()
      const secondCount = manager.count

      expect(firstCount).toBe(secondCount)
    })
  })

  describe('Plugin Action Execution', () => {
    it('should run plugin actions successfully', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const examplePluginInfo = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      if (!examplePluginInfo) return

      const loadedPlugin = await loadPlugin(examplePluginInfo)
      const actions = await loadPluginActions(loadedPlugin)

      expect(actions.length).toBeGreaterThan(0)

      // Run the first action
      const action = actions[0]
      const result = await runAction(action)

      // The action should run without errors
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('should provide correct context to plugin actions', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const examplePluginInfo = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      if (!examplePluginInfo) return

      const loadedPlugin = await loadPlugin(examplePluginInfo)
      const actions = await loadPluginActions(loadedPlugin)

      if (actions.length === 0) return

      const action = actions[0]
      const result = await runAction(action)

      // Action should have access to context (cwd, env, prompt, $)
      expect(result).toBeDefined()
    })
  })

  describe('Plugin Dependencies', () => {
    it('should load plugin with external dependencies', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const pluginWithDeps = plugins.find((p) => p.name === 'arere-plugin-with-deps')

      if (!pluginWithDeps) {
        // Skip if the dependency plugin doesn't exist
        return
      }

      const loadedPlugin = await loadPlugin(pluginWithDeps)

      expect(loadedPlugin).toBeDefined()
      expect(loadedPlugin.meta.name).toBe('arere-plugin-with-deps')
    })

    it('should run plugin actions that use external dependencies', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const pluginWithDeps = plugins.find((p) => p.name === 'arere-plugin-with-deps')

      if (!pluginWithDeps) {
        // Skip if the dependency plugin doesn't exist
        return
      }

      const loadedPlugin = await loadPlugin(pluginWithDeps)
      const actions = await loadPluginActions(loadedPlugin)

      if (actions.length === 0) return

      // Run action that uses external dependency (e.g., date-fns)
      const action = actions[0]
      const result = await runAction(action)

      // If jiti dependency resolution works, this should succeed
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing plugin gracefully', async () => {
      const invalidPluginInfo = {
        name: 'nonexistent-plugin',
        path: '/nonexistent/path',
        packageJson: {
          name: 'nonexistent-plugin',
          version: '1.0.0',
        },
      }

      await expect(loadPlugin(invalidPluginInfo)).rejects.toThrow()
    })

    it('should skip invalid actions in plugin', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const examplePluginInfo = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      if (!examplePluginInfo) return

      const loadedPlugin = await loadPlugin(examplePluginInfo)

      // Add an invalid action path
      const pluginWithInvalidAction = {
        ...loadedPlugin,
        actionPaths: [...loadedPlugin.actionPaths, '/invalid/action.ts'],
      }

      const actions = await loadPluginActions(pluginWithInvalidAction)

      // Should load valid actions and skip invalid ones
      expect(Array.isArray(actions)).toBe(true)
      expect(actions.length).toBeGreaterThan(0)
    })

    it('should handle plugin action execution errors', async () => {
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const plugins = await detectPlugins(examplesPluginsPath)

      const examplePluginInfo = plugins.find((p) => p.name === 'arere-plugin-tutorial')
      if (!examplePluginInfo) return

      const loadedPlugin = await loadPlugin(examplePluginInfo)
      const actions = await loadPluginActions(loadedPlugin)

      if (actions.length === 0) return

      // Create an action that will fail
      const failingAction = {
        ...actions[0],
        run: async () => {
          throw new Error('Intentional error')
        },
      }

      const result = await runAction(failingAction)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Complete Plugin Workflow', () => {
    it('should complete full plugin lifecycle: detect -> load -> run', async () => {
      // 1. Detect plugins
      const examplesPluginsPath = resolve(process.cwd(), '../')
      const detectedPlugins = await detectPlugins(examplesPluginsPath)

      expect(detectedPlugins.length).toBeGreaterThan(0)

      // 2. Load plugin
      const pluginInfo = detectedPlugins.find((p) => p.name === 'arere-plugin-tutorial')
      expect(pluginInfo).toBeDefined()

      if (!pluginInfo) return

      const loadedPlugin = await loadPlugin(pluginInfo)
      expect(loadedPlugin).toBeDefined()
      expect(loadedPlugin.actionPaths.length).toBeGreaterThan(0)

      // 3. Load actions
      const actions = await loadPluginActions(loadedPlugin)
      expect(actions.length).toBeGreaterThan(0)

      // 4. Run action
      const action = actions[0]
      const result = await runAction(action)

      expect(result.success).toBe(true)
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })
  })
})
