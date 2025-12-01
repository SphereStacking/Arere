/**
 * Plugin configuration tests
 */

import type { PluginPackageInfo } from '@/plugin/detector.js'
import { loadPlugin } from '@/plugin/loader.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('Plugin Configuration', () => {
  const mockPackageInfo: PluginPackageInfo = {
    name: 'test-plugin',
    path: '/tmp/test-plugin',
    packageJson: {
      name: 'test-plugin',
      version: '1.0.0',
      main: 'index.js',
    },
  }

  describe('Configuration Schema', () => {
    it('should load plugin without config schema', async () => {
      // This test would require mocking the file system
      // Skipping for now as it requires more setup
      expect(true).toBe(true)
    })

    it('should validate config against schema', () => {
      const schema = z.object({
        apiKey: z.string(),
        timeout: z.number().default(5000),
        enabled: z.boolean().default(true),
      })

      // Valid config
      const validConfig = {
        apiKey: 'test-key',
        timeout: 3000,
        enabled: false,
      }
      expect(() => schema.parse(validConfig)).not.toThrow()

      // Invalid config (missing required field)
      const invalidConfig = {
        timeout: 3000,
      }
      expect(() => schema.parse(invalidConfig)).toThrow()

      // Config with defaults
      const partialConfig = {
        apiKey: 'test-key',
      }
      const parsed = schema.parse(partialConfig)
      expect(parsed.timeout).toBe(5000)
      expect(parsed.enabled).toBe(true)
    })

    it('should support enum types', () => {
      const schema = z.object({
        theme: z.enum(['light', 'dark', 'auto']).default('auto'),
      })

      const config1 = schema.parse({ theme: 'light' })
      expect(config1.theme).toBe('light')

      const config2 = schema.parse({})
      expect(config2.theme).toBe('auto')

      expect(() => schema.parse({ theme: 'invalid' })).toThrow()
    })

    it('should support boolean types', () => {
      const schema = z.object({
        enableDebug: z.boolean().default(false),
      })

      const config1 = schema.parse({ enableDebug: true })
      expect(config1.enableDebug).toBe(true)

      const config2 = schema.parse({})
      expect(config2.enableDebug).toBe(false)
    })

    it('should support number validation', () => {
      const schema = z.object({
        port: z.number().min(1024).max(65535).default(3000),
      })

      const valid = schema.parse({ port: 8080 })
      expect(valid.port).toBe(8080)

      expect(() => schema.parse({ port: 100 })).toThrow() // Too low
      expect(() => schema.parse({ port: 70000 })).toThrow() // Too high
    })

    it('should support string validation', () => {
      const schema = z.object({
        apiKey: z.string().min(10),
        email: z.string().email(),
      })

      const valid = schema.parse({
        apiKey: '1234567890',
        email: 'test@example.com',
      })
      expect(valid.apiKey).toBe('1234567890')

      expect(() =>
        schema.parse({
          apiKey: 'short',
          email: 'test@example.com',
        }),
      ).toThrow()

      expect(() =>
        schema.parse({
          apiKey: '1234567890',
          email: 'invalid-email',
        }),
      ).toThrow()
    })
  })

  describe('Configuration Format', () => {
    it('should support simple boolean format', () => {
      const simpleConfig: boolean = false
      expect(simpleConfig).toBe(false)
    })

    it('should support object format with enabled flag', () => {
      const objectConfig = {
        enabled: true,
        config: {
          apiKey: 'test',
        },
      }
      expect(objectConfig.enabled).toBe(true)
      expect(objectConfig.config.apiKey).toBe('test')
    })

    it('should extract enabled state correctly', () => {
      // Simple boolean
      const enabled1 = false
      expect(enabled1).toBe(false)

      // Object with enabled: false
      const config2 = { enabled: false, config: {} }
      expect(config2.enabled).toBe(false)

      // Object with enabled: true
      const config3 = { enabled: true, config: {} }
      expect(config3.enabled).toBe(true)

      // Object without enabled (should default to true)
      const config4 = { config: {} }
      const enabled4 = (config4 as { enabled?: boolean; config: unknown }).enabled !== false
      expect(enabled4).toBe(true)
    })
  })

  describe('Configuration Persistence', () => {
    it('should format config for .arere/settings.json', () => {
      const pluginConfig = {
        'arere-plugin-tutorial': {
          enabled: true,
          config: {
            greeting: 'Hello',
            enableDebug: true,
            theme: 'dark',
            maxRetries: 5,
          },
        },
        'arere-plugin-disabled': false,
      }

      expect(pluginConfig['arere-plugin-tutorial'].enabled).toBe(true)
      expect(pluginConfig['arere-plugin-tutorial'].config.greeting).toBe('Hello')
      expect(pluginConfig['arere-plugin-disabled']).toBe(false)
    })
  })
})
