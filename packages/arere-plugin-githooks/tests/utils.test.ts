import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  HOOK_MARKER,
  SUPPORTED_HOOKS,
  findGitDir,
  generateHookScript,
  getHookPath,
  getHooksDir,
  hookExists,
  isPluginGeneratedHook,
  isValidHookName,
} from '../src/utils'

describe('utils', () => {
  const testDir = join(process.cwd(), 'test-temp-git')
  const gitDir = join(testDir, '.git')
  const hooksDir = join(gitDir, 'hooks')

  beforeEach(() => {
    // Create test git directory structure
    mkdirSync(hooksDir, { recursive: true })
  })

  afterEach(() => {
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('SUPPORTED_HOOKS', () => {
    it('should contain all common git hooks', () => {
      expect(SUPPORTED_HOOKS).toContain('pre-commit')
      expect(SUPPORTED_HOOKS).toContain('pre-push')
      expect(SUPPORTED_HOOKS).toContain('commit-msg')
    })
  })

  describe('isValidHookName', () => {
    it('should return true for valid hook names', () => {
      expect(isValidHookName('pre-commit')).toBe(true)
      expect(isValidHookName('pre-push')).toBe(true)
      expect(isValidHookName('commit-msg')).toBe(true)
    })

    it('should return false for invalid hook names', () => {
      expect(isValidHookName('invalid-hook')).toBe(false)
      expect(isValidHookName('')).toBe(false)
      expect(isValidHookName('PRE-COMMIT')).toBe(false)
    })
  })

  describe('getHooksDir', () => {
    it('should return the hooks directory path', () => {
      expect(getHooksDir(gitDir)).toBe(hooksDir)
    })
  })

  describe('getHookPath', () => {
    it('should return the full path to a hook file', () => {
      expect(getHookPath(gitDir, 'pre-commit')).toBe(join(hooksDir, 'pre-commit'))
    })
  })

  describe('generateHookScript', () => {
    it('should generate a valid hook script with marker', () => {
      const script = generateHookScript('pre-commit')
      expect(script).toContain('#!/bin/sh')
      expect(script).toContain(HOOK_MARKER)
      expect(script).toContain('npx arere run githooks-run pre-commit')
    })

    it('should include the correct hook name', () => {
      const script = generateHookScript('pre-push')
      expect(script).toContain('npx arere run githooks-run pre-push')
    })
  })

  describe('hookExists', () => {
    it('should return false for non-existent hook', () => {
      expect(hookExists(join(hooksDir, 'pre-commit'))).toBe(false)
    })

    it('should return true for existing hook', () => {
      const hookPath = join(hooksDir, 'pre-commit')
      writeFileSync(hookPath, '#!/bin/sh\necho test')
      expect(hookExists(hookPath)).toBe(true)
    })
  })

  describe('isPluginGeneratedHook', () => {
    it('should return false for non-existent hook', () => {
      expect(isPluginGeneratedHook(join(hooksDir, 'pre-commit'))).toBe(false)
    })

    it('should return true for plugin-generated hook', () => {
      const hookPath = join(hooksDir, 'pre-commit')
      const script = generateHookScript('pre-commit')
      writeFileSync(hookPath, script)
      expect(isPluginGeneratedHook(hookPath)).toBe(true)
    })

    it('should return false for other hooks', () => {
      const hookPath = join(hooksDir, 'pre-commit')
      writeFileSync(hookPath, '#!/bin/sh\necho "custom hook"')
      expect(isPluginGeneratedHook(hookPath)).toBe(false)
    })
  })

  describe('findGitDir', () => {
    it('should find git directory from test directory', () => {
      // Use the test directory which is inside a git repo
      const result = findGitDir(testDir)
      expect(result).toBe(gitDir)
    })

    it('should return null for non-git directory', () => {
      const result = findGitDir('/tmp')
      expect(result).toBeNull()
    })
  })
})
