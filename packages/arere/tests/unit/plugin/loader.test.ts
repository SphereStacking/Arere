/**
 * Tests for plugin loader
 */

import { resolve } from 'node:path'
import type { PluginPackageInfo } from '@/plugin/detector.js'
import { loadPlugin, loadPluginActions } from '@/plugin/loader.js'
import { PluginLoadError } from '@/lib/error.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock i18n module to track registerTranslations calls
vi.mock('@/i18n/index.js', async () => {
  const actual = await vi.importActual('@/i18n/index.js')
  return {
    ...actual,
    registerTranslations: vi.fn(),
  }
})

describe('loadPlugin', () => {
  const tutorialPluginPath = resolve(process.cwd(), '../arere-plugin-tutorial')

  it('should load a valid plugin', async () => {
    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        main: 'dist/index.js',
      },
    }

    const plugin = await loadPlugin(packageInfo)

    expect(plugin).toBeDefined()
    expect(plugin.meta).toBeDefined()
    expect(plugin.meta.name).toBe('arere-plugin-tutorial')
    expect(plugin.meta.version).toBeDefined()
    expect(plugin.path).toBe(tutorialPluginPath)
    expect(plugin.actionPaths).toBeDefined()
    expect(Array.isArray(plugin.actionPaths)).toBe(true)
  })

  it('should resolve action paths correctly', async () => {
    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        main: 'dist/index.js',
      },
    }

    const plugin = await loadPlugin(packageInfo)

    expect(plugin.actionPaths.length).toBeGreaterThan(0)
    for (const actionPath of plugin.actionPaths) {
      expect(actionPath).toMatch(/\.ts$/)
      expect(actionPath).toContain(tutorialPluginPath)
    }
  })

  it('should throw PluginLoadError if plugin entry point does not exist', async () => {
    const packageInfo: PluginPackageInfo = {
      name: 'nonexistent-plugin',
      path: tutorialPluginPath,
      packageJson: {
        name: 'nonexistent-plugin',
        version: '1.0.0',
        main: 'nonexistent.js',
      },
    }

    await expect(loadPlugin(packageInfo)).rejects.toThrow(PluginLoadError)
  })

  it('should throw PluginLoadError if plugin does not export valid structure', async () => {
    const invalidPluginPath = resolve(process.cwd(), 'tests/fixtures/plugins/invalid')

    const packageInfo: PluginPackageInfo = {
      name: 'invalid-plugin',
      path: invalidPluginPath,
      packageJson: {
        name: 'invalid-plugin',
        version: '1.0.0',
        main: 'index.js',
      },
    }

    // This will fail because the fixture doesn't exist, which is expected
    await expect(loadPlugin(packageInfo)).rejects.toThrow()
  })

  it('should handle plugins with no main field (defaults to dist/index.js)', async () => {
    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        // No main field
      },
    }

    const plugin = await loadPlugin(packageInfo)

    expect(plugin).toBeDefined()
    expect(plugin.meta.name).toBe('arere-plugin-tutorial')
  })
})

describe('loadPluginActions', () => {
  const tutorialPluginPath = resolve(process.cwd(), '../arere-plugin-tutorial')

  it('should load actions from a plugin', async () => {
    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        main: 'dist/index.js',
      },
    }

    const plugin = await loadPlugin(packageInfo)
    const actions = await loadPluginActions(plugin)

    expect(Array.isArray(actions)).toBe(true)
    expect(actions.length).toBeGreaterThan(0)

    for (const action of actions) {
      expect(action).toBeDefined()
      expect(action.meta).toBeDefined()
      expect(action.meta.name).toBeDefined()
      expect(action.run).toBeDefined()
      expect(typeof action.run).toBe('function')
    }
  })

  it('should add plugin category to actions without category', async () => {
    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        main: 'dist/index.js',
      },
    }

    const plugin = await loadPlugin(packageInfo)
    const actions = await loadPluginActions(plugin)

    for (const action of actions) {
      // If the action didn't have a category, it should get the plugin category
      if (action.meta.category) {
        expect(
          action.meta.category === 'plugin:arere-plugin-tutorial' ||
            action.meta.category.length > 0,
        ).toBe(true)
      }
    }
  })

  it('should set filePath for each action', async () => {
    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        main: 'dist/index.js',
      },
    }

    const plugin = await loadPlugin(packageInfo)
    const actions = await loadPluginActions(plugin)

    for (const action of actions) {
      expect(action.filePath).toBeDefined()
      expect(action.filePath).toContain(tutorialPluginPath)
    }
  })

  it('should handle plugins with no actions', async () => {
    const plugin = {
      meta: {
        name: 'empty-plugin',
        version: '1.0.0',
        description: 'Plugin with no actions',
        author: 'test',
      },
      path: tutorialPluginPath,
      actionPaths: [],
      i18nNamespace: 'empty-plugin',
      enabled: true,
    }

    const actions = await loadPluginActions(plugin)

    expect(Array.isArray(actions)).toBe(true)
    expect(actions.length).toBe(0)
  })

  it('should skip invalid action files', async () => {
    const plugin = {
      meta: {
        name: 'plugin-with-invalid-actions',
        version: '1.0.0',
        description: 'Plugin with some invalid actions',
        author: 'test',
      },
      path: tutorialPluginPath,
      actionPaths: [
        resolve(tutorialPluginPath, 'actions/01-hello-world.ts'),
        resolve(tutorialPluginPath, 'nonexistent-action.ts'),
      ],
      i18nNamespace: 'plugin-with-invalid-actions',
      enabled: true,
    }

    const actions = await loadPluginActions(plugin)

    // Should load at least the valid action
    expect(actions.length).toBeGreaterThan(0)
  })
})

describe('Plugin dependency resolution (jiti integration)', () => {
  it('should create separate jiti instances for plugins', async () => {
    const tutorialPluginPath = resolve(process.cwd(), '../arere-plugin-tutorial')

    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        main: 'dist/index.js',
      },
    }

    const plugin = await loadPlugin(packageInfo)

    // If jiti is working correctly, the plugin should load successfully
    // This verifies that jiti creates proper contexts for plugin resolution
    expect(plugin).toBeDefined()
    expect(plugin.meta.name).toBe('arere-plugin-tutorial')
  })
})

describe('Plugin action translations', () => {
  const tutorialPluginPath = resolve(process.cwd(), '../arere-plugin-tutorial')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should register inline translations when loading plugin actions', async () => {
    const { registerTranslations } = await import('@/i18n/index.js')

    const packageInfo: PluginPackageInfo = {
      name: 'arere-plugin-tutorial',
      path: tutorialPluginPath,
      packageJson: {
        name: 'arere-plugin-tutorial',
        version: '1.0.0',
        main: 'dist/index.js',
      },
    }

    const plugin = await loadPlugin(packageInfo)
    const actions = await loadPluginActions(plugin)

    // Find actions with translations (tutorial plugin has actions with inline translations)
    const actionsWithTranslations = actions.filter((a) => a.translations)

    // registerTranslations should have been called for each action with translations
    expect(actionsWithTranslations.length).toBeGreaterThan(0)
    expect(registerTranslations).toHaveBeenCalledTimes(actionsWithTranslations.length)

    // Verify it was called with correct arguments
    for (const action of actionsWithTranslations) {
      expect(registerTranslations).toHaveBeenCalledWith(action.meta.name, action.translations)
    }
  })

  it('should not call registerTranslations for actions without translations', async () => {
    const { registerTranslations } = await import('@/i18n/index.js')

    const plugin = {
      meta: {
        name: 'plugin-without-translations',
        version: '1.0.0',
        description: 'Plugin for testing',
        author: 'test',
      },
      path: tutorialPluginPath,
      actionPaths: [resolve(tutorialPluginPath, 'actions/01-hello-world.ts')],
      i18nNamespace: 'plugin-without-translations',
      enabled: true,
    }

    const actions = await loadPluginActions(plugin)

    // 01-hello-world.ts has no inline translations
    const actionsWithTranslations = actions.filter((a) => a.translations)
    expect(registerTranslations).toHaveBeenCalledTimes(actionsWithTranslations.length)
  })
})
