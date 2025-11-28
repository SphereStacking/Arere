/**
 * Tests for configuration merging (VSCode-style 2-layer system)
 */

import type { ArereConfig } from '@/infrastructure/config/schema.js'
import type { LayeredConfig } from '@/infrastructure/config/types.js'
import { type PluginConfigValue, mergeConfigs } from '@/infrastructure/config/utils.js'
import { describe, expect, it } from 'vitest'

describe('mergeConfigs', () => {
  describe('basic merging', () => {
    it('should use defaults when all layers are null', () => {
      const layered: LayeredConfig = {
        user: null,
        workspace: null,
      }

      const result = mergeConfigs(layered)

      expect(result).toEqual({
        actionsDir: './.arere',
        logLevel: 'info',
        theme: {
          primaryColor: 'green',
        },
        ui: {
          bookmarkIcon: '🔖',
        },
      })
    })

    it('should merge user config with defaults', () => {
      const layered: LayeredConfig = {
        user: {
          logLevel: 'debug',
        },
        workspace: null,
      }

      const result = mergeConfigs(layered)

      expect(result.logLevel).toBe('debug')
      expect(result.actionsDir).toBe('./.arere') // from defaults
    })

    it('should merge workspace over user (VSCode-style priority)', () => {
      const layered: LayeredConfig = {
        user: {
          logLevel: 'debug',
        },
        workspace: {
          logLevel: 'warn',
        },
      }

      const result = mergeConfigs(layered)

      expect(result.logLevel).toBe('warn') // workspace wins
    })
  })

  describe('nested object merging', () => {
    it('should deep merge theme objects', () => {
      const layered: LayeredConfig = {
        user: {
          theme: {
            primaryColor: 'blue',
          },
        },
        workspace: null,
      }

      const result = mergeConfigs(layered)

      expect(result.theme?.primaryColor).toBe('blue')
    })

    it('should override nested values correctly (workspace > user)', () => {
      const layered: LayeredConfig = {
        user: {
          theme: {
            primaryColor: 'blue',
          },
        },
        workspace: {
          theme: {
            primaryColor: 'red',
          },
        },
      }

      const result = mergeConfigs(layered)

      expect(result.theme?.primaryColor).toBe('red') // workspace wins
    })

    it('should use user layer value when workspace key is deleted (empty object)', () => {
      // Regression test for bug where empty workspace theme {} overrides user theme
      const layered: LayeredConfig = {
        user: {
          theme: {
            primaryColor: 'blue',
          },
        },
        workspace: {
          theme: {}, // Empty after deleting primaryColor key
        },
      }

      const result = mergeConfigs(layered)

      // Should use user layer value 'blue', not default 'green'
      expect(result.theme?.primaryColor).toBe('blue')
    })
  })

  describe('plugin configuration merging', () => {
    it('should merge simple boolean plugin configs', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {
            'plugin-a': true,
          },
        },
        workspace: {
          plugins: {
            'plugin-b': true,
          },
        },
      }

      const result = mergeConfigs(layered)

      expect(result.plugins).toEqual({
        'plugin-a': true,
        'plugin-b': true,
      })
    })

    it('should override boolean plugin config (workspace > user)', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {
            'plugin-a': true,
          },
        },
        workspace: {
          plugins: {
            'plugin-a': false,
          },
        },
      }

      const result = mergeConfigs(layered)

      expect(result.plugins?.['plugin-a']).toBe(false) // workspace wins
    })

    it('should merge plugin config objects', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {
            'plugin-a': {
              enabled: true,
              config: {
                apiKey: 'user-key',
                timeout: 1000,
              },
            },
          },
        },
        workspace: {
          plugins: {
            'plugin-a': {
              enabled: true,
              config: {
                apiKey: 'workspace-key',
              },
            },
          },
        },
      }

      const result = mergeConfigs(layered)

      const pluginConfig = result.plugins?.['plugin-a']
      expect(pluginConfig).toEqual({
        enabled: true,
        config: {
          apiKey: 'workspace-key', // workspace wins
          timeout: 1000, // from user
        },
      })
    })

    it('should override enabled flag independently', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {
            'plugin-a': {
              enabled: true,
              config: {
                key: 'value',
              },
            },
          },
        },
        workspace: {
          plugins: {
            'plugin-a': {
              enabled: false,
            },
          },
        },
      }

      const result = mergeConfigs(layered)

      const pluginConfig = result.plugins?.['plugin-a']
      expect(pluginConfig).toMatchObject({
        enabled: false, // workspace wins
        config: {
          key: 'value', // from user
        },
      })
    })

    it('should convert boolean to object when merging with object config', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {
            'plugin-a': true,
          },
        },
        workspace: {
          plugins: {
            'plugin-a': {
              enabled: true,
              config: {
                key: 'value',
              },
            },
          },
        },
      }

      const result = mergeConfigs(layered)

      const pluginConfig = result.plugins?.['plugin-a']
      expect(pluginConfig).toEqual({
        enabled: true,
        config: {
          key: 'value',
        },
      })
    })

    it('should handle complex two-layer plugin merge', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {
            'plugin-a': {
              enabled: true,
              config: {
                apiKey: 'user-key',
                timeout: 1000,
                retries: 3,
              },
            },
          },
        },
        workspace: {
          plugins: {
            'plugin-a': {
              enabled: false,
              config: {
                apiKey: 'workspace-key',
                timeout: 2000,
              },
            },
          },
        },
      }

      const result = mergeConfigs(layered)

      const pluginConfig = result.plugins?.['plugin-a']
      expect(pluginConfig).toEqual({
        enabled: false, // workspace wins
        config: {
          apiKey: 'workspace-key', // workspace wins
          timeout: 2000, // workspace wins
          retries: 3, // from user
        },
      })
    })
  })

  describe('priority validation', () => {
    it('should respect workspace > user priority (VSCode-style)', () => {
      const layered: LayeredConfig = {
        user: {
          actionsDir: './user-actions',
          logLevel: 'debug',
          locale: 'en',
        },
        workspace: {
          actionsDir: './workspace-actions',
          logLevel: 'info',
        },
      }

      const result = mergeConfigs(layered)

      expect(result.actionsDir).toBe('./workspace-actions') // workspace wins
      expect(result.logLevel).toBe('info') // workspace wins
      expect(result.locale).toBe('en') // user wins (no workspace override)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined values in override', () => {
      const layered: LayeredConfig = {
        user: {
          logLevel: 'debug',
        },
        workspace: {
          logLevel: undefined,
        },
      }

      const result = mergeConfigs(layered)

      expect(result.logLevel).toBe('debug') // undefined doesn't override
    })

    it('should handle empty plugin configs', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {},
        },
        workspace: null,
      }

      const result = mergeConfigs(layered)

      expect(result.plugins).toEqual({})
    })

    it('should handle mixed plugin config types', () => {
      const layered: LayeredConfig = {
        user: {
          plugins: {
            'plugin-a': true,
            'plugin-b': {
              enabled: false,
            },
          },
        },
        workspace: {
          plugins: {
            'plugin-a': {
              enabled: true,
              config: {
                key: 'value',
              },
            },
            'plugin-b': true,
          },
        },
      }

      const result = mergeConfigs(layered)

      expect(result.plugins?.['plugin-a']).toEqual({
        enabled: true,
        config: {
          key: 'value',
        },
      })
      expect(result.plugins?.['plugin-b']).toBe(true)
    })
  })
})
