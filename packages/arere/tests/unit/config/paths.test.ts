/**
 * Tests for config paths module (VSCode-style 2-layer system)
 */

import os from 'node:os'
import path from 'node:path'
import {
  ACTION_PATHS,
  CONFIG_PATHS,
  getAllConfigPaths,
  getConfigPath,
} from '@/infrastructure/config/paths.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('Config Paths', () => {
  const originalEnv = process.env
  const testCwd = '/test/project'

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('CONFIG_PATHS', () => {
    it('should return user config path', () => {
      const userPath = CONFIG_PATHS.user()
      expect(userPath).toBe(path.join(os.homedir(), '.arere', 'settings.json'))
    })

    it('should return workspace config path', () => {
      const workspacePath = CONFIG_PATHS.workspace(testCwd)
      expect(workspacePath).toBe(path.join(testCwd, '.arere', 'settings.json'))
    })
  })

  describe('ACTION_PATHS', () => {
    it('should return user actions directory path', () => {
      const userPath = ACTION_PATHS.user()
      expect(userPath).toBe(path.join(os.homedir(), '.arere', 'actions'))
    })

    it('should return workspace actions directory path', () => {
      const workspacePath = ACTION_PATHS.workspace(testCwd)
      expect(workspacePath).toBe(path.join(testCwd, '.arere', 'actions'))
    })
  })

  describe('getConfigPath', () => {
    it('should return user config path', () => {
      const configPath = getConfigPath('user', testCwd)
      expect(configPath).toBe(path.join(os.homedir(), '.arere', 'settings.json'))
    })

    it('should return workspace config path', () => {
      const configPath = getConfigPath('workspace', testCwd)
      expect(configPath).toBe(path.join(testCwd, '.arere', 'settings.json'))
    })

    it('should use environment variable override for workspace config', () => {
      process.env.ARERE_WORKSPACE_CONFIG = '/custom/workspace/config.json'
      const configPath = getConfigPath('workspace', testCwd)
      expect(configPath).toBe(path.resolve('/custom/workspace/config.json'))
    })

    it('should use environment variable override for user config', () => {
      process.env.ARERE_USER_CONFIG = '/custom/user/config.json'
      const configPath = getConfigPath('user', testCwd)
      expect(configPath).toBe(path.resolve('/custom/user/config.json'))
    })

    it('should use process.cwd() if cwd not provided', () => {
      const configPath = getConfigPath('workspace')
      expect(configPath).toBe(path.join(process.cwd(), '.arere', 'settings.json'))
    })
  })

  describe('getAllConfigPaths', () => {
    it('should return all config paths (VSCode-style 2-layer)', () => {
      const paths = getAllConfigPaths(testCwd)
      expect(paths).toEqual({
        user: path.join(os.homedir(), '.arere', 'settings.json'),
        workspace: path.join(testCwd, '.arere', 'settings.json'),
      })
    })

    it('should respect environment variable overrides', () => {
      process.env.ARERE_USER_CONFIG = '/custom/user.json'
      process.env.ARERE_WORKSPACE_CONFIG = '/custom/workspace.json'

      const paths = getAllConfigPaths(testCwd)
      expect(paths).toEqual({
        user: path.resolve('/custom/user.json'),
        workspace: path.resolve('/custom/workspace.json'),
      })
    })

    it('should use process.cwd() if cwd not provided', () => {
      const paths = getAllConfigPaths()
      expect(paths.workspace).toBe(path.join(process.cwd(), '.arere', 'settings.json'))
    })
  })
})
