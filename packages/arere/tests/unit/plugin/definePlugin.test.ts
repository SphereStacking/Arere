/**
 * Tests for definePlugin helper function
 */

import { definePlugin } from '@/domain/plugin/definePlugin.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('definePlugin', () => {
  describe('valid plugin definitions', () => {
    it('should accept a valid minimal plugin', () => {
      const plugin = definePlugin({
        meta: {
          name: 'arere-plugin-test',
          version: '1.0.0',
        },
        actions: ['actions/hello.ts'],
      })

      expect(plugin).toEqual({
        meta: {
          name: 'arere-plugin-test',
          version: '1.0.0',
        },
        actions: ['actions/hello.ts'],
        locales: undefined,
        configSchema: undefined,
      })
    })

    it('should accept a plugin with all optional fields', () => {
      const configSchema = z.object({
        apiKey: z.string(),
      })

      const plugin = definePlugin({
        meta: {
          name: 'arere-plugin-full',
          version: '2.0.0',
          description: 'Full plugin',
          author: 'Test Author',
          i18nNamespace: 'test-ns',
        },
        actions: ['actions/a.ts', 'actions/b.ts'],
        locales: 'locales',
        configSchema,
      })

      expect(plugin.meta.name).toBe('arere-plugin-full')
      expect(plugin.meta.description).toBe('Full plugin')
      expect(plugin.meta.author).toBe('Test Author')
      expect(plugin.meta.i18nNamespace).toBe('test-ns')
      expect(plugin.actions).toEqual(['actions/a.ts', 'actions/b.ts'])
      expect(plugin.locales).toBe('locales')
      expect(plugin.configSchema).toBe(configSchema)
    })

    it('should accept plugin names with hyphens', () => {
      const plugin = definePlugin({
        meta: {
          name: 'arere-plugin-multi-word-name',
          version: '1.0.0',
        },
        actions: ['actions/test.ts'],
      })

      expect(plugin.meta.name).toBe('arere-plugin-multi-word-name')
    })

    it('should accept plugin names with numbers', () => {
      const plugin = definePlugin({
        meta: {
          name: 'arere-plugin-test123',
          version: '1.0.0',
        },
        actions: ['actions/test.ts'],
      })

      expect(plugin.meta.name).toBe('arere-plugin-test123')
    })
  })

  describe('validation errors - required fields', () => {
    it('should throw error if meta is missing', () => {
      expect(() =>
        definePlugin({
          actions: ['actions/test.ts'],
        } as any),
      ).toThrow('Plugin meta is required')
    })

    it('should throw error if meta.name is missing', () => {
      expect(() =>
        definePlugin({
          meta: {
            version: '1.0.0',
          },
          actions: ['actions/test.ts'],
        } as any),
      ).toThrow('Plugin meta.name is required')
    })

    it('should throw error if meta.version is missing', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-test',
          },
          actions: ['actions/test.ts'],
        } as any),
      ).toThrow('Plugin meta.version is required')
    })

    it('should throw error if actions is missing', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-test',
            version: '1.0.0',
          },
        } as any),
      ).toThrow('Plugin actions array is required')
    })
  })

  describe('validation errors - plugin name format', () => {
    it('should throw error if plugin name does not start with arere-plugin-', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'my-plugin',
            version: '1.0.0',
          },
          actions: ['actions/test.ts'],
        }),
      ).toThrow("Plugin name must start with 'arere-plugin-'")
    })

    it('should throw error if plugin name contains uppercase letters', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-MyPlugin',
            version: '1.0.0',
          },
          actions: ['actions/test.ts'],
        }),
      ).toThrow('must contain only lowercase alphanumeric characters and dashes')
    })

    it('should throw error if plugin name contains underscores', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-my_plugin',
            version: '1.0.0',
          },
          actions: ['actions/test.ts'],
        }),
      ).toThrow('must contain only lowercase alphanumeric characters and dashes')
    })

    it('should throw error if plugin name contains special characters', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-test@plugin',
            version: '1.0.0',
          },
          actions: ['actions/test.ts'],
        }),
      ).toThrow('must contain only lowercase alphanumeric characters and dashes')
    })
  })

  describe('validation errors - actions array', () => {
    it('should throw error if actions is not an array', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-test',
            version: '1.0.0',
          },
          actions: 'actions/test.ts' as any,
        }),
      ).toThrow('Plugin actions must be an array')
    })

    it('should throw error if actions array is empty', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-test',
            version: '1.0.0',
          },
          actions: [],
        }),
      ).toThrow('Plugin must have at least one action')
    })

    it('should throw error if action path is not a string', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-test',
            version: '1.0.0',
          },
          actions: [123 as any],
        }),
      ).toThrow('Action path must be a string')
    })
  })

  describe('validation errors - optional fields', () => {
    it('should throw error if locales is not a string', () => {
      expect(() =>
        definePlugin({
          meta: {
            name: 'arere-plugin-test',
            version: '1.0.0',
          },
          actions: ['actions/test.ts'],
          locales: 123 as any,
        }),
      ).toThrow('Plugin locales must be a string path')
    })
  })
})
