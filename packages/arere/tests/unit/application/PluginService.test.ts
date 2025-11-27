/**
 * PluginService - Application Layer
 *
 * Responsible for plugin management business logic
 * - Toggle plugin enabled/disabled state
 * - Save and reload plugin configuration
 * - Testable service independent from UI layer
 *
 * Updated to test Repository Pattern
 */

import { PluginService } from '@/application/services/PluginService.js'
import type { LoadedPlugin } from '@/domain/plugin/types.js'
import type { ArereConfig } from '@/infrastructure/config/schema.js'
import type { ConfigLayer } from '@/infrastructure/config/types.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Infrastructure dependencies
vi.mock('@/infrastructure/config/manager.js', () => ({
  FileConfigManager: vi.fn().mockImplementation(() => ({
    loadMerged: vi.fn(),
    loadLayer: vi.fn(),
    loadAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    saveLayer: vi.fn(),
  })),
}))

vi.mock('@/shared/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { FileConfigManager } from '@/infrastructure/config/manager.js'

describe('PluginService', () => {
  let service: PluginService

  const mockPlugin: LoadedPlugin = {
    meta: {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'Test plugin',
    },
    path: '/fake/plugin-path',
    actionPaths: [],
    i18nNamespace: 'test-plugin',
    enabled: true,
  }

  beforeEach(() => {
    service = new PluginService()
    vi.clearAllMocks()
  })

  describe('togglePlugin', () => {
    it('should update plugin enabled state', async () => {
      // Given: Current plugin list and configuration
      const currentPlugins: LoadedPlugin[] = [
        mockPlugin,
        {
          meta: { name: 'other-plugin', version: '1.0.0', description: 'Other' },
          path: '/fake/other-plugin',
          actionPaths: [],
          i18nNamespace: 'other-plugin',
          enabled: false,
        },
      ]

      const currentConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {
          'test-plugin': { enabled: true },
        },
      }

      const layer: ConfigLayer = 'workspace'

      // When: Disable plugin
      const result = await service.togglePlugin(
        currentPlugins,
        currentConfig,
        mockPlugin,
        false,
        layer,
      )

      // Then: New plugin list is returned
      expect(result.plugins).toHaveLength(2)
      expect(result.plugins[0].enabled).toBe(false) // test-plugin disabled
      expect(result.plugins[1].enabled).toBe(false) // other-plugin unchanged
    })

    it('should update config with new enabled state', async () => {
      // Given
      const currentPlugins: LoadedPlugin[] = [mockPlugin]
      const currentConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }

      // When
      const result = await service.togglePlugin(
        currentPlugins,
        currentConfig,
        mockPlugin,
        true,
        'workspace',
      )

      // Then: Configuration is updated
      expect(result.config.plugins?.['test-plugin']).toEqual({ enabled: true })
    })

    it('should save to the specified layer', async () => {
      // Given
      const currentPlugins: LoadedPlugin[] = [mockPlugin]
      const currentConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }

      // When
      await service.togglePlugin(currentPlugins, currentConfig, mockPlugin, false, 'user')

      // Then: Saved to specified layer
      // Get the mock writer instance that was created during togglePlugin
      const MockedWriter = vi.mocked(FileConfigManager)
      const mockWriterInstance =
        MockedWriter.mock.results[MockedWriter.mock.results.length - 1].value
      expect(mockWriterInstance.save).toHaveBeenCalledWith(
        'user',
        'plugins.test-plugin.enabled',
        false,
      )
    })

    it('should preserve other plugins unchanged', async () => {
      // Given: Multiple plugins
      const currentPlugins: LoadedPlugin[] = [
        mockPlugin,
        {
          meta: { name: 'plugin-2', version: '1.0.0', description: 'Plugin 2' },
          path: '/fake/plugin-2',
          actionPaths: [],
          i18nNamespace: 'plugin-2',
          enabled: true,
        },
        {
          meta: { name: 'plugin-3', version: '1.0.0', description: 'Plugin 3' },
          path: '/fake/plugin-3',
          actionPaths: [],
          i18nNamespace: 'plugin-3',
          enabled: false,
        },
      ]

      const currentConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }

      // When: Change only test-plugin
      const result = await service.togglePlugin(
        currentPlugins,
        currentConfig,
        mockPlugin,
        false,
        'workspace',
      )

      // Then: Other plugins are unchanged
      expect(result.plugins[1].enabled).toBe(true) // plugin-2 unchanged
      expect(result.plugins[2].enabled).toBe(false) // plugin-3 unchanged
    })
  })

  describe('savePluginConfig', () => {
    it('should save each config key separately', async () => {
      // Given
      const pluginConfig = {
        apiKey: 'test-key',
        timeout: 5000,
      }

      const layer: ConfigLayer = 'workspace'

      // When
      await service.savePluginConfig(mockPlugin, pluginConfig, layer)

      // Then: Each key is saved individually
      // Get the mock writer instance that was created during savePluginConfig
      const MockedWriter = vi.mocked(FileConfigManager)
      const mockWriterInstance =
        MockedWriter.mock.results[MockedWriter.mock.results.length - 1].value
      expect(mockWriterInstance.save).toHaveBeenCalledWith(
        layer,
        'plugins.test-plugin.config.apiKey',
        'test-key',
      )
      expect(mockWriterInstance.save).toHaveBeenCalledWith(
        layer,
        'plugins.test-plugin.config.timeout',
        5000,
      )
    })

    it('should reload and merge config after save', async () => {
      // Given
      const pluginConfig = { apiKey: 'test-key' }

      // Mock FileConfigManager with all required methods
      const mockManager = {
        loadMerged: vi.fn().mockResolvedValue({
          locale: 'ja', // workspace wins
          logLevel: 'debug',
          theme: { primaryColor: 'blue' },
          actionsDir: '.arere',
          plugins: {
            'test-plugin': {
              enabled: true,
              config: { apiKey: 'test-key' },
            },
          },
        }),
        loadLayer: vi.fn(),
        loadAll: vi.fn(),
        save: vi.fn(),
        delete: vi.fn(),
        saveLayer: vi.fn(),
      }

      // Mock FileConfigManager constructor to return our mock
      vi.mocked(FileConfigManager).mockImplementation(() => mockManager as any)

      // When
      const result = await service.savePluginConfig(mockPlugin, pluginConfig, 'workspace')

      // Then: FileConfigManager.loadMerged() is called
      expect(mockManager.loadMerged).toHaveBeenCalled()

      // Then: Merged configuration is returned
      expect(result.locale).toBe('ja') // workspace overrides user
      expect(result.plugins?.['test-plugin']).toEqual({
        enabled: true,
        config: { apiKey: 'test-key' },
      })
    })

    it('should handle empty config object', async () => {
      // Given
      const pluginConfig = {}

      // When
      await service.savePluginConfig(mockPlugin, pluginConfig, 'workspace')

      // Then: writer.save() is not called
      // Get the mock writer instance that was created during savePluginConfig
      const MockedWriter = vi.mocked(FileConfigManager)
      const mockWriterInstance =
        MockedWriter.mock.results[MockedWriter.mock.results.length - 1].value
      expect(mockWriterInstance.save).not.toHaveBeenCalled()
    })
  })

  describe('updatePluginUserConfig', () => {
    it('should update plugin userConfig from merged config', () => {
      // Given: Plugin list and merged configuration
      const currentPlugins: LoadedPlugin[] = [
        mockPlugin,
        {
          meta: { name: 'other-plugin', version: '1.0.0', description: 'Other' },
          path: '/fake/other-plugin',
          actionPaths: [],
          i18nNamespace: 'other-plugin',
          enabled: false,
        },
      ]

      const mergedConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {
          'test-plugin': {
            enabled: true,
            config: {
              apiKey: 'my-key',
              timeout: 3000,
            },
          },
        },
      }

      // When
      const result = service.updatePluginUserConfig(currentPlugins, mergedConfig, mockPlugin)

      // Then: test-plugin userConfig is updated
      const updatedPlugin = result.find((p) => p.meta.name === 'test-plugin')
      expect(updatedPlugin?.userConfig).toEqual({
        apiKey: 'my-key',
        timeout: 3000,
      })

      // Then: Other plugins are unchanged
      const otherPlugin = result.find((p) => p.meta.name === 'other-plugin')
      expect(otherPlugin?.userConfig).toBeUndefined()
    })

    it('should handle plugin config as boolean (simple enabled flag)', () => {
      // Given: Simple enabled: true format
      const currentPlugins: LoadedPlugin[] = [mockPlugin]

      const mergedConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {
          'test-plugin': true, // Simple boolean format
        },
      }

      // When
      const result = service.updatePluginUserConfig(currentPlugins, mergedConfig, mockPlugin)

      // Then: userConfig is undefined (no config property)
      const updatedPlugin = result.find((p) => p.meta.name === 'test-plugin')
      expect(updatedPlugin?.userConfig).toBeUndefined()
    })
  })
})
