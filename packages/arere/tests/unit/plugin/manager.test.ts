/**
 * Tests for PluginManager
 */

import type { Action } from '@/action/types.js'
import { PluginManager, type PluginManagerDependencies } from '@/plugin/manager.js'
import type { LoadedPlugin } from '@/plugin/types.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('PluginManager', () => {
  let manager: PluginManager
  let mockDeps: PluginManagerDependencies

  const createMockPlugin = (name: string, enabled = true): LoadedPlugin => ({
    meta: {
      name,
      version: '1.0.0',
      description: `Mock plugin ${name}`,
    },
    path: `/mock/path/${name}`,
    actionPaths: [`/mock/path/${name}/actions/test.ts`],
    i18nNamespace: name,
    enabled,
  })

  const createMockAction = (name: string): Action => ({
    meta: {
      name,
      description: `Mock action ${name}`,
    },
    filePath: `/mock/path/actions/${name}.ts`,
    location: { plugin: 'test-plugin' },
    run: vi.fn(),
  })

  beforeEach(() => {
    mockDeps = {
      detectPlugins: vi.fn().mockReturnValue([]),
      loadPlugin: vi.fn(),
      loadPluginActions: vi.fn().mockResolvedValue([]),
      registerPluginTranslations: vi.fn().mockResolvedValue(undefined),
    }
    manager = new PluginManager(mockDeps)
  })

  it('should create a plugin manager instance', () => {
    expect(manager).toBeDefined()
    expect(manager.count).toBe(0)
    expect(manager.isLoaded).toBe(false)
  })

  it('should load plugins when detectPlugins returns empty array', async () => {
    await manager.loadAll()

    expect(manager.isLoaded).toBe(true)
    expect(mockDeps.detectPlugins).toHaveBeenCalled()
  })

  it('should load plugins and actions', async () => {
    const mockPackageInfo = {
      name: 'arere-plugin-test',
      path: '/mock/path/arere-plugin-test',
      packageJson: { name: 'arere-plugin-test', version: '1.0.0' },
    }
    const mockPlugin = createMockPlugin('arere-plugin-test')
    const mockAction = createMockAction('test-action')

    vi.mocked(mockDeps.detectPlugins).mockReturnValue([mockPackageInfo])
    vi.mocked(mockDeps.loadPlugin).mockResolvedValue(mockPlugin)
    vi.mocked(mockDeps.loadPluginActions).mockResolvedValue([mockAction])

    await manager.loadAll()

    expect(manager.isLoaded).toBe(true)
    expect(manager.count).toBe(1)
    expect(manager.getPlugins()).toHaveLength(1)
    expect(manager.getActions()).toHaveLength(1)
  })

  it('should register plugin translations when localesPath is provided', async () => {
    const mockPackageInfo = {
      name: 'arere-plugin-test',
      path: '/mock/path/arere-plugin-test',
      packageJson: { name: 'arere-plugin-test', version: '1.0.0' },
    }
    const mockPlugin = createMockPlugin('arere-plugin-test')
    mockPlugin.localesPath = '/mock/path/locales'

    vi.mocked(mockDeps.detectPlugins).mockReturnValue([mockPackageInfo])
    vi.mocked(mockDeps.loadPlugin).mockResolvedValue(mockPlugin)

    await manager.loadAll()

    expect(mockDeps.registerPluginTranslations).toHaveBeenCalledWith(
      'arere-plugin-test',
      '/mock/path/locales',
    )
  })

  it('should not load actions for disabled plugins', async () => {
    const mockPackageInfo = {
      name: 'arere-plugin-test',
      path: '/mock/path/arere-plugin-test',
      packageJson: { name: 'arere-plugin-test', version: '1.0.0' },
    }
    const mockPlugin = createMockPlugin('arere-plugin-test', false)

    vi.mocked(mockDeps.detectPlugins).mockReturnValue([mockPackageInfo])
    vi.mocked(mockDeps.loadPlugin).mockResolvedValue(mockPlugin)

    await manager.loadAll({
      plugins: { 'arere-plugin-test': false },
    })

    expect(mockDeps.loadPluginActions).not.toHaveBeenCalled()
  })

  it('should get plugins', async () => {
    await manager.loadAll()

    const plugins = manager.getPlugins()
    expect(Array.isArray(plugins)).toBe(true)
  })

  it('should get actions', async () => {
    await manager.loadAll()

    const actions = manager.getActions()
    expect(Array.isArray(actions)).toBe(true)
  })

  it('should not reload plugins if already loaded', async () => {
    await manager.loadAll()
    vi.mocked(mockDeps.detectPlugins).mockClear()

    await manager.loadAll()

    expect(mockDeps.detectPlugins).not.toHaveBeenCalled()
  })

  it('should clear plugins and actions', async () => {
    const mockPackageInfo = {
      name: 'arere-plugin-test',
      path: '/mock/path/arere-plugin-test',
      packageJson: { name: 'arere-plugin-test', version: '1.0.0' },
    }
    const mockPlugin = createMockPlugin('arere-plugin-test')

    vi.mocked(mockDeps.detectPlugins).mockReturnValue([mockPackageInfo])
    vi.mocked(mockDeps.loadPlugin).mockResolvedValue(mockPlugin)

    await manager.loadAll()
    manager.clear()

    expect(manager.count).toBe(0)
    expect(manager.isLoaded).toBe(false)
    expect(manager.getPlugins()).toHaveLength(0)
    expect(manager.getActions()).toHaveLength(0)
  })

  it('should reload actions based on updated config', async () => {
    const mockPackageInfo = {
      name: 'arere-plugin-test',
      path: '/mock/path/arere-plugin-test',
      packageJson: { name: 'arere-plugin-test', version: '1.0.0' },
    }
    const mockPlugin = createMockPlugin('arere-plugin-test')
    const mockAction = createMockAction('test-action')

    vi.mocked(mockDeps.detectPlugins).mockReturnValue([mockPackageInfo])
    vi.mocked(mockDeps.loadPlugin).mockResolvedValue(mockPlugin)
    vi.mocked(mockDeps.loadPluginActions).mockResolvedValue([mockAction])

    await manager.loadAll()

    // Clear the mock and reload actions
    vi.mocked(mockDeps.loadPluginActions).mockClear()
    vi.mocked(mockDeps.loadPluginActions).mockResolvedValue([mockAction])

    const actions = await manager.reloadActions({})

    expect(mockDeps.loadPluginActions).toHaveBeenCalled()
    expect(actions).toHaveLength(1)
  })

  it('should handle plugin load errors gracefully', async () => {
    const mockPackageInfo = {
      name: 'arere-plugin-test',
      path: '/mock/path/arere-plugin-test',
      packageJson: { name: 'arere-plugin-test', version: '1.0.0' },
    }

    vi.mocked(mockDeps.detectPlugins).mockReturnValue([mockPackageInfo])
    vi.mocked(mockDeps.loadPlugin).mockRejectedValue(new Error('Load failed'))

    await manager.loadAll()

    expect(manager.isLoaded).toBe(true)
    expect(manager.count).toBe(0)
  })
})
