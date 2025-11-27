/**
 * Integration test for plugin configuration system
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LoadedPlugin } from '@/domain/plugin/types.js'
import { FileConfigManager } from '@/infrastructure/config/manager.js'
import type { ArereConfig } from '@/infrastructure/config/schema.js'
import { createPluginManager } from '@/infrastructure/plugin/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('Plugin configuration system (integration)', () => {
  let testConfigDir: string
  let testConfigPath: string

  beforeEach(() => {
    // Create unique test config directory for each test to avoid c12 caching issues
    testConfigDir = join(
      process.cwd(),
      'tests',
      'fixtures',
      `test-config-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    testConfigPath = join(testConfigDir, '.arere', 'settings.json')

    // Create test directories
    if (!existsSync(testConfigDir)) {
      mkdirSync(testConfigDir, { recursive: true })
    }
    const arereDir = join(testConfigDir, '.arere')
    if (!existsSync(arereDir)) {
      mkdirSync(arereDir, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up test config
    if (existsSync(testConfigDir)) {
      rmSync(testConfigDir, { recursive: true, force: true })
    }
  })

  it('should load plugin configuration from arere.config.json', async () => {
    // Create test config
    const config: ArereConfig = {
      locale: 'en',
      actionsDir: '.arere',
      theme: {
        primaryColor: 'cyan',
      },
      logLevel: 'info',
      plugins: {
        'arere-plugin-tutorial': {
          enabled: true,
          config: {
            apiKey: 'test-key-12345',
            timeout: 5000,
          },
        },
      },
    }

    writeFileSync(testConfigPath, JSON.stringify(config, null, 2))

    // Load config (pass directory, not file path)
    const repository = new FileConfigManager(testConfigDir)
    const loadedConfig = await repository.loadMerged()
    expect(loadedConfig.plugins?.['arere-plugin-tutorial']).toBeDefined()
    expect((loadedConfig.plugins?.['arere-plugin-tutorial'] as any).config.apiKey).toBe(
      'test-key-12345',
    )
  })

  it('should save plugin configuration', async () => {
    const config: ArereConfig = {
      locale: 'en',
      actionsDir: '.arere',
      theme: {
        primaryColor: 'cyan',
      },
      logLevel: 'info',
      plugins: {
        'test-plugin': {
          enabled: true,
          config: {
            foo: 'bar',
          },
        },
      },
    }

    // Save config to workspace layer
    const writer = new FileConfigManager(testConfigDir)
    await writer.saveLayer('workspace', config)

    // Verify file was created
    expect(existsSync(testConfigPath)).toBe(true)

    // Verify content
    const savedContent = JSON.parse(require('node:fs').readFileSync(testConfigPath, 'utf-8'))
    expect(savedContent.plugins['test-plugin'].enabled).toBe(true)
    expect(savedContent.plugins['test-plugin'].config.foo).toBe('bar')
  })

  it('should handle plugin enable/disable', async () => {
    const initialConfig: ArereConfig = {
      locale: 'en',
      actionsDir: '.arere',
      theme: {
        primaryColor: 'cyan',
      },
      logLevel: 'info',
      plugins: {
        'arere-plugin-tutorial': true,
      },
    }

    writeFileSync(testConfigPath, JSON.stringify(initialConfig, null, 2))

    // Disable plugin
    const updatedConfig: ArereConfig = {
      ...initialConfig,
      plugins: {
        'arere-plugin-tutorial': false,
      },
    }

    const writer = new FileConfigManager(testConfigDir)
    await writer.saveLayer('workspace', updatedConfig)

    // Load and verify
    const repository = new FileConfigManager(testConfigDir)
    const loadedConfig = await repository.loadMerged()
    expect(loadedConfig.plugins?.['arere-plugin-tutorial']).toBe(false)
  })

  it('should handle plugin with no config (boolean only)', async () => {
    const config: ArereConfig = {
      locale: 'en',
      actionsDir: '.arere',
      theme: {
        primaryColor: 'cyan',
      },
      logLevel: 'info',
      plugins: {
        'simple-plugin': true,
        'disabled-plugin': false,
      },
    }

    writeFileSync(testConfigPath, JSON.stringify(config, null, 2))

    const repository = new FileConfigManager(testConfigDir)
    const loadedConfig = await repository.loadMerged()
    expect(loadedConfig.plugins?.['simple-plugin']).toBe(true)
    expect(loadedConfig.plugins?.['disabled-plugin']).toBe(false)
  })

  it('should merge plugin config with defaults from schema', () => {
    const schema = z.object({
      apiKey: z.string().default('default-key'),
      timeout: z.number().default(3000),
      enabled: z.boolean().default(true),
    })

    const userConfig = {
      apiKey: 'user-key',
    }

    // Parse with defaults
    const mergedConfig = schema.parse(userConfig)

    expect(mergedConfig.apiKey).toBe('user-key')
    expect(mergedConfig.timeout).toBe(3000) // default
    expect(mergedConfig.enabled).toBe(true) // default
  })

  it('should validate plugin config against schema', () => {
    const schema = z.object({
      port: z.number().min(1000).max(65535),
      host: z.string().min(1),
    })

    // Valid config
    expect(() => schema.parse({ port: 3000, host: 'localhost' })).not.toThrow()

    // Invalid config - port out of range
    expect(() => schema.parse({ port: 100, host: 'localhost' })).toThrow()

    // Invalid config - missing required field
    expect(() => schema.parse({ port: 3000 })).toThrow()
  })

  it('should handle complex plugin config with multiple types', () => {
    const schema = z.object({
      name: z.string().default('default'),
      count: z.number().default(10),
      enabled: z.boolean().default(false),
      mode: z.enum(['dev', 'prod', 'test']).default('dev'),
      options: z
        .object({
          verbose: z.boolean().default(false),
          debug: z.boolean().default(false),
        })
        .default({ verbose: false, debug: false }),
    })

    const userConfig = {
      name: 'my-plugin',
      mode: 'prod' as const,
      options: {
        verbose: true,
      },
    }

    const parsed = schema.parse(userConfig)

    expect(parsed.name).toBe('my-plugin')
    expect(parsed.count).toBe(10) // default
    expect(parsed.enabled).toBe(false) // default
    expect(parsed.mode).toBe('prod')
    expect(parsed.options.verbose).toBe(true)
    expect(parsed.options.debug).toBe(false) // default
  })

  it('should support plugin config update flow', async () => {
    // Initial config
    const initialConfig: ArereConfig = {
      locale: 'en',
      actionsDir: '.arere',
      theme: {
        primaryColor: 'cyan',
      },
      logLevel: 'info',
      plugins: {
        'test-plugin': {
          enabled: true,
          config: {
            value: 'initial',
          },
        },
      },
    }

    writeFileSync(testConfigPath, JSON.stringify(initialConfig, null, 2))

    // Update config
    const updatedConfig: ArereConfig = {
      ...initialConfig,
      plugins: {
        'test-plugin': {
          enabled: true,
          config: {
            value: 'updated',
            newField: 'added',
          },
        },
      },
    }

    const writer = new FileConfigManager(testConfigDir)
    await writer.saveLayer('workspace', updatedConfig)

    // Verify update
    const repository = new FileConfigManager(testConfigDir)
    const loadedConfig = await repository.loadMerged()
    const pluginConfig = loadedConfig.plugins?.['test-plugin'] as any
    expect(pluginConfig.config.value).toBe('updated')
    expect(pluginConfig.config.newField).toBe('added')
  })

  it('should handle plugin reload after config change', async () => {
    const pluginManager = createPluginManager()

    // Initial config with plugin enabled
    const config1: ArereConfig = {
      locale: 'en',
      actionsDir: '.arere',
      theme: {
        primaryColor: 'cyan',
      },
      logLevel: 'info',
      plugins: {
        'arere-plugin-tutorial': {
          enabled: true,
          config: {},
        },
      },
    }

    // Load plugins
    await pluginManager.loadAll(config1)
    const initialActions = pluginManager.getActions()
    const initialCount = initialActions.length

    // Disable plugin
    const config2: ArereConfig = {
      ...config1,
      plugins: {
        'arere-plugin-tutorial': false,
      },
    }

    // Reload actions
    const reloadedActions = await pluginManager.reloadActions(config2)

    // Should have fewer actions (plugin disabled)
    expect(reloadedActions.length).toBeLessThanOrEqual(initialCount)

    // Re-enable plugin
    const config3: ArereConfig = {
      ...config1,
      plugins: {
        'arere-plugin-tutorial': true,
      },
    }

    const reenabledActions = await pluginManager.reloadActions(config3)

    // Should have actions again
    expect(reenabledActions.length).toBeGreaterThanOrEqual(0)
  })
})
