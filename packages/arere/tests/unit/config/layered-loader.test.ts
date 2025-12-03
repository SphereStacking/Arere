/**
 * Tests for layered configuration loading (VSCode-style 2-layer system)
 *
 * Updated to test FileConfigManager unified API
 * loadAll() returns { workspace, user } (defaults handled by loadMerged)
 */

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileConfigManager } from '@/config/manager.js'
import { defaultConfig } from '@/config/schema.js'
import type { ArereConfig } from '@/config/schema.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('FileConfigManager.loadAll', () => {
  let testDir: string
  let originalEnvVars: Record<string, string | undefined>

  beforeEach(async () => {
    // Save original environment variables
    originalEnvVars = {
      ARERE_WORKSPACE_CONFIG: process.env.ARERE_WORKSPACE_CONFIG,
      ARERE_USER_CONFIG: process.env.ARERE_USER_CONFIG,
    }

    // Create a temporary test directory
    testDir = join(tmpdir(), `arere-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    await mkdir(testDir, { recursive: true })
    await mkdir(join(testDir, '.arere'), { recursive: true })

    // Set environment variables to test-specific paths to isolate from real user config
    // Use non-existent paths to ensure clean state unless test explicitly creates them
    process.env.ARERE_WORKSPACE_CONFIG = join(testDir, '.arere', 'settings.json')
    process.env.ARERE_USER_CONFIG = join(testDir, '.arere-user', 'settings.json')
  })

  afterEach(async () => {
    // Restore original environment variables
    for (const [key, value] of Object.entries(originalEnvVars)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }

    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('file loading', () => {
    it('should return null for all layers when no files exist', async () => {
      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result).toEqual({
        user: null,
        workspace: null,
        // loadAll() only returns user/workspace
      })
    })

    it('should load workspace config when file exists', async () => {
      const workspaceConfig: Partial<ArereConfig> = {
        logLevel: 'debug',
      }

      await writeFile(
        join(testDir, '.arere', 'settings.json'),
        JSON.stringify(workspaceConfig, null, 2),
      )

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.workspace).toEqual(workspaceConfig)
      expect(result.user).toBeNull()
    })

    it('should load user config when file exists', async () => {
      const userConfig: Partial<ArereConfig> = {
        logLevel: 'warn',
      }

      // Create user config at the path set by beforeEach
      const userPath = process.env.ARERE_USER_CONFIG!
      await mkdir(join(testDir, '.arere-user'), { recursive: true })
      await writeFile(userPath, JSON.stringify(userConfig, null, 2))

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.user).toEqual(userConfig)
      expect(result.workspace).toBeNull()
    })

    it('should load both layers when both files exist', async () => {
      const workspaceConfig: Partial<ArereConfig> = {
        logLevel: 'debug',
      }
      const userConfig: Partial<ArereConfig> = {
        locale: 'ja',
      }

      // Create user config at the path set by beforeEach
      const userPath = process.env.ARERE_USER_CONFIG!
      await mkdir(join(testDir, '.arere-user'), { recursive: true })
      await writeFile(userPath, JSON.stringify(userConfig, null, 2))

      // Create workspace config
      await writeFile(
        join(testDir, '.arere', 'settings.json'),
        JSON.stringify(workspaceConfig, null, 2),
      )

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.user).toEqual(userConfig)
      expect(result.workspace).toEqual(workspaceConfig)
    })
  })

  describe('partial config support', () => {
    it('should accept partial config in workspace layer', async () => {
      const partialConfig = {
        logLevel: 'debug',
        // Missing actionsDir, theme, etc.
      }

      await writeFile(
        join(testDir, '.arere', 'settings.json'),
        JSON.stringify(partialConfig, null, 2),
      )

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.workspace).toEqual(partialConfig)
    })

    it('should accept empty config object', async () => {
      await writeFile(join(testDir, '.arere', 'settings.json'), JSON.stringify({}, null, 2))

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.workspace).toEqual({})
    })
  })

  describe('error handling', () => {
    it('should return null for invalid JSON', async () => {
      await writeFile(join(testDir, '.arere', 'settings.json'), 'invalid json {')

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.workspace).toBeNull()
    })

    it('should return null for invalid config schema', async () => {
      const invalidConfig = {
        logLevel: 'invalid-level', // Not a valid log level
      }

      await writeFile(
        join(testDir, '.arere', 'settings.json'),
        JSON.stringify(invalidConfig, null, 2),
      )

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.workspace).toBeNull()
    })

    it('should handle empty config files gracefully', async () => {
      // Create empty files
      await writeFile(join(testDir, '.arere', 'settings.json'), '')

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      // Empty files should be treated as null
      expect(result.workspace).toBeNull()
    })

    it('should handle whitespace-only config files gracefully', async () => {
      // Create files with only whitespace
      await writeFile(join(testDir, '.arere', 'settings.json'), '   \n\t  ')

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      // Whitespace-only files should be treated as null
      expect(result.workspace).toBeNull()
    })
  })

  describe('environment variable overrides', () => {
    it('should respect ARERE_WORKSPACE_CONFIG override', async () => {
      const customPath = join(testDir, 'custom-workspace.json')
      const config: Partial<ArereConfig> = {
        logLevel: 'error',
      }

      await writeFile(customPath, JSON.stringify(config, null, 2))

      process.env.ARERE_WORKSPACE_CONFIG = customPath

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.workspace).toEqual(config)
    })

    it('should respect ARERE_USER_CONFIG override', async () => {
      const customPath = join(testDir, 'custom-user.json')
      const config: Partial<ArereConfig> = {
        locale: 'en',
      }

      await writeFile(customPath, JSON.stringify(config, null, 2))

      process.env.ARERE_USER_CONFIG = customPath

      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)

      expect(result.user).toEqual(config)
    })
  })

  describe('parallel loading', () => {
    it('should load both layers in parallel', async () => {
      // Create user config at the path set by beforeEach
      const userPath = process.env.ARERE_USER_CONFIG!
      await mkdir(join(testDir, '.arere-user'), { recursive: true })
      await writeFile(userPath, JSON.stringify({ locale: 'ja' }, null, 2))

      // Create workspace config
      await writeFile(
        join(testDir, '.arere', 'settings.json'),
        JSON.stringify({ logLevel: 'debug' }, null, 2),
      )

      const startTime = Date.now()
      const repository = new FileConfigManager()
      const result = await repository.loadAll(testDir)
      const duration = Date.now() - startTime

      // Both configs should be loaded
      expect(result.user).toBeTruthy()
      expect(result.workspace).toBeTruthy()

      // Should complete reasonably fast (parallel loading)
      expect(duration).toBeLessThan(1000)
    })
  })
})
