/**
 * Tests for path utilities
 *
 * Goal: Improve coverage from 61.44% to 80%+
 * Testing:
 * - getGlobalNodeModules with different env configs
 * - resolveActionPath with various path types
 */

import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock fs before importing
vi.mock('node:fs')

import {
  getGlobalActionsDir,
  getGlobalNodeModules,
  getProjectActionsDir,
  resolveActionPath,
} from '@/lib/path.js'

describe('Path utilities', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getGlobalActionsDir', () => {
    it('should return ~/.arere/actions/', () => {
      const expected = join(homedir(), '.arere', 'actions')
      expect(getGlobalActionsDir()).toBe(expected)
    })
  })

  describe('getProjectActionsDir', () => {
    it('should return ./.arere/actions/ for cwd', () => {
      const cwd = '/fake/project'
      const expected = join(cwd, '.arere', 'actions')
      expect(getProjectActionsDir(cwd)).toBe(expected)
    })

    it('should use process.cwd() by default', () => {
      const expected = join(process.cwd(), '.arere', 'actions')
      expect(getProjectActionsDir()).toBe(expected)
    })
  })

  describe('getGlobalNodeModules', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return a valid path', () => {
      const path = getGlobalNodeModules()
      expect(path).toBeDefined()
      expect(typeof path).toBe('string')
      expect(path.length).toBeGreaterThan(0)
    })

    it('should use npm_config_prefix if set', () => {
      process.env.npm_config_prefix = '/custom/npm/prefix'

      const result = getGlobalNodeModules()

      expect(result).toBe(join('/custom/npm/prefix', 'lib', 'node_modules'))
    })

    it('should check common paths when npm_config_prefix not set', () => {
      process.env.npm_config_prefix = undefined

      // Mock that second common path exists
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        return path.toString().includes('.npm-global')
      })

      const result = getGlobalNodeModules()

      expect(result).toContain('.npm-global')
      expect(fs.existsSync).toHaveBeenCalled()
    })

    it('should check NVM path', () => {
      process.env.npm_config_prefix = undefined

      // Mock that NVM path exists
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        return path.toString().includes('.nvm/versions/node')
      })

      const result = getGlobalNodeModules()

      expect(result).toContain('.nvm')
    })

    it('should check /usr/local/lib/node_modules', () => {
      process.env.npm_config_prefix = undefined

      // Mock that /usr/local path exists
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        return path.toString() === '/usr/local/lib/node_modules'
      })

      const result = getGlobalNodeModules()

      expect(result).toBe('/usr/local/lib/node_modules')
    })

    it('should fallback to local node_modules if no global found', () => {
      process.env.npm_config_prefix = undefined

      // Mock that no common paths exist
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const result = getGlobalNodeModules()

      expect(result).toBe(join(process.cwd(), 'node_modules'))
    })
  })

  describe('resolveActionPath', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return undefined for non-existent absolute path', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const result = resolveActionPath('/fake/non-existent/action.ts')

      expect(result).toBeUndefined()
    })

    it('should return absolute path if it exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)

      const result = resolveActionPath('/absolute/path/action.ts')

      expect(result).toBe('/absolute/path/action.ts')
    })

    it('should resolve relative path from cwd', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        return path.toString().includes('test-dir')
      })

      const result = resolveActionPath('action.ts', '/test-dir')

      expect(result).toContain('test-dir')
      expect(result).toContain('action.ts')
    })

    it('should resolve from project actions directory', () => {
      // First check (cwd) fails, second check (project .arere) succeeds
      let callCount = 0
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        callCount++
        return callCount === 2 && path.toString().includes('.arere')
      })

      const result = resolveActionPath('my-action.ts', '/my-project')

      expect(result).toBeDefined()
      expect(result).toContain('.arere')
      expect(result).toContain('my-action.ts')
    })

    it('should resolve from global actions directory', () => {
      // First two checks fail, third check (global .arere) succeeds
      let callCount = 0
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        callCount++
        return callCount === 3
      })

      const result = resolveActionPath('global-action.ts', '/some-cwd')

      expect(result).toBeDefined()
      expect(result).toContain(homedir())
      expect(result).toContain('.arere')
      expect(result).toContain('global-action.ts')
    })

    it('should return undefined if not found anywhere', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const result = resolveActionPath('nowhere.ts', '/test')

      expect(result).toBeUndefined()
    })

    it('should use process.cwd() by default', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        return path.toString().includes(process.cwd())
      })

      const result = resolveActionPath('test.ts')

      expect(result).toBeDefined()
      expect(result).toContain(process.cwd())
    })

    it('should check paths in correct order: absolute, cwd, project, global', () => {
      const calls: string[] = []
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        calls.push(path.toString())
        return false
      })

      resolveActionPath('action.ts', '/cwd')

      // Should have checked: cwd, project .arere, global .arere
      expect(calls.length).toBe(3)
      expect(calls[0]).toContain('/cwd')
      expect(calls[1]).toContain('.arere')
      expect(calls[2]).toContain(homedir())
    })
  })
})
