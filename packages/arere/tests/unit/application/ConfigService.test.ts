/**
 * ConfigService - Application Layer
 *
 * Updated to test unified FileConfigManager API
 * - ConfigService uses FileConfigManager internally (no DI needed)
 * - changeConfig() uses manager.save() and manager.loadMerged()
 * - Tests verify correct manager interactions
 */

import { ConfigService } from '@/config/service.js'
import type { ArereConfig } from '@/config/schema.js'
import type { ConfigLayer } from '@/config/types.js'
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock FileConfigManager
vi.mock('@/config/manager.js', () => {
  return {
    FileConfigManager: vi.fn().mockImplementation(() => ({
      loadMerged: vi.fn(),
      loadLayer: vi.fn(),
      loadAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      saveLayer: vi.fn(),
    })),
  }
})

// Mock Infrastructure dependencies
vi.mock('@/i18n/index.js', () => ({
  changeLocale: vi.fn(),
}))

vi.mock('@/lib/logger.js', () => ({
  setLogLevel: vi.fn(),
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { FileConfigManager } from '@/config/manager.js'
import { changeLocale } from '@/i18n/index.js'
import { setLogLevel } from '@/lib/logger.js'

describe('ConfigService (Unified Config Manager)', () => {
  let service: ConfigService
  let mockManagerInstance: any

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks()

    // Create service (which internally creates FileConfigManager)
    service = new ConfigService()

    // Get the mocked manager instance
    const MockedManager = vi.mocked(FileConfigManager)
    mockManagerInstance = MockedManager.mock.results[MockedManager.mock.results.length - 1].value
  })

  describe('changeConfig', () => {
    it('should save to manager and reload', async () => {
      // Given: Expected merged config after save
      const expectedConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'debug',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      const layer: ConfigLayer = 'workspace'
      const key = 'logLevel'
      const value = 'debug'

      // When: Change config
      const result = await service.changeConfig(key, value, layer)

      // Then: Manager.save should be called
      expect(mockManagerInstance.save).toHaveBeenCalledWith(layer, key, value, undefined)

      // Then: Manager.loadMerged should be called to reload
      expect(mockManagerInstance.loadMerged).toHaveBeenCalled()

      // Then: Result should be the reloaded config
      expect(result).toEqual(expectedConfig)
      expect(result.logLevel).toBe('debug')
    })

    it('should apply locale side effect', async () => {
      // Given
      const expectedConfig: ArereConfig = {
        locale: 'ja',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      // When: Change locale
      await service.changeConfig('locale', 'ja', 'workspace')

      // Then: changeLocale should be called
      expect(changeLocale).toHaveBeenCalledWith('ja')
    })

    it('should apply logLevel side effect', async () => {
      // Given
      const expectedConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'debug',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      // When: Change logLevel
      await service.changeConfig('logLevel', 'debug', 'workspace')

      // Then: setLogLevel should be called
      expect(setLogLevel).toHaveBeenCalledWith('debug')
    })

    it('should support nested key (dot notation)', async () => {
      // Given
      const expectedConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      // When: Change nested key
      await service.changeConfig('theme.primaryColor', 'cyan', 'workspace')

      // Then: Manager should be called with dot notation key
      expect(mockManagerInstance.save).toHaveBeenCalledWith(
        'workspace',
        'theme.primaryColor',
        'cyan',
        undefined,
      )

      // Then: Result should have nested value
      const result = await service.changeConfig('theme.primaryColor', 'cyan', 'workspace')
      expect(result.theme?.primaryColor).toBe('cyan')
    })

    it('should default to workspace layer', async () => {
      // Given
      const expectedConfig: ArereConfig = {
        locale: 'ja',
        logLevel: 'info',
        theme: { primaryColor: 'cyan' },
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      // When: Change config without specifying layer
      await service.changeConfig('locale', 'ja')

      // Then: Should default to workspace layer
      expect(mockManagerInstance.save).toHaveBeenCalledWith('workspace', 'locale', 'ja', undefined)
    })
  })

  describe('getConfig', () => {
    it('should return merged config from manager', async () => {
      // Given
      const expectedConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'green' },
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      // When
      const result = await service.getConfig()

      // Then
      expect(mockManagerInstance.loadMerged).toHaveBeenCalled()
      expect(result).toEqual(expectedConfig)
    })
  })

  describe('resetConfig', () => {
    it('should delete key and reload', async () => {
      // Given
      const expectedConfig: ArereConfig = {
        locale: 'en',
        logLevel: 'info',
        theme: { primaryColor: 'green' },
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      const layer: ConfigLayer = 'user'
      const key = 'logLevel'

      // When
      const result = await service.resetConfig(key, layer)

      // Then: Manager.delete should be called
      expect(mockManagerInstance.delete).toHaveBeenCalledWith(layer, key, undefined)

      // Then: Manager.loadMerged should be called to reload
      expect(mockManagerInstance.loadMerged).toHaveBeenCalled()

      // Then: Result should be the reloaded config
      expect(result).toEqual(expectedConfig)
    })
  })

  describe('Layer priority verification', () => {
    it('should return correct merged result respecting workspace > user priority', async () => {
      // Given: Workspace overrides user
      const expectedConfig: ArereConfig = {
        locale: 'ja', // from workspace
        logLevel: 'debug', // from workspace
        theme: { primaryColor: 'blue' }, // from user
        actionsDir: '.arere',
        plugins: {},
      }
      mockManagerInstance.loadMerged.mockResolvedValue(expectedConfig)

      // When
      const result = await service.getConfig()

      // Then: Should respect workspace > user priority
      expect(result.locale).toBe('ja')
      expect(result.logLevel).toBe('debug')
      expect(result.theme?.primaryColor).toBe('blue')
    })
  })
})
