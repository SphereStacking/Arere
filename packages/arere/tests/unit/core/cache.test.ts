/**
 * Tests for cache system
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CacheManager } from '@/action/cache.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('CacheManager', () => {
  let testCacheDir: string
  let cacheManager: CacheManager
  let testFilePath: string

  beforeEach(() => {
    // Create temporary cache directory
    testCacheDir = join(tmpdir(), `arere-cache-test-${Date.now()}`)
    mkdirSync(testCacheDir, { recursive: true })

    // Create test file
    testFilePath = join(testCacheDir, 'test-file.txt')
    writeFileSync(testFilePath, 'test content')

    // Create cache manager
    cacheManager = new CacheManager(testCacheDir)
  })

  afterEach(() => {
    // Clean up
    if (existsSync(testCacheDir)) {
      rmSync(testCacheDir, { recursive: true, force: true })
    }
  })

  describe('set and get', () => {
    it('should cache and retrieve value', () => {
      const key = 'test-key'
      const value = { message: 'Hello Cache!' }

      cacheManager.set(key, value, testFilePath)
      const cached = cacheManager.get(key, testFilePath)

      expect(cached).toEqual(value)
    })

    it('should return null for non-existent key', () => {
      const cached = cacheManager.get('non-existent', testFilePath)
      expect(cached).toBeNull()
    })

    it('should return null if file does not exist', () => {
      const key = 'test-key'
      cacheManager.set(key, 'value', testFilePath)

      const nonExistentPath = join(testCacheDir, 'non-existent.txt')
      const cached = cacheManager.get(key, nonExistentPath)

      expect(cached).toBeNull()
    })

    it('should invalidate cache if file is modified', async () => {
      const key = 'test-key'
      const value = 'original value'

      cacheManager.set(key, value, testFilePath)

      // Wait a bit to ensure mtime changes
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Modify file
      writeFileSync(testFilePath, 'modified content')

      const cached = cacheManager.get(key, testFilePath)
      expect(cached).toBeNull()
    })
  })

  describe('isValid', () => {
    it('should return true for valid cache', () => {
      const key = 'test-key'
      cacheManager.set(key, 'value', testFilePath)

      expect(cacheManager.isValid(key, testFilePath)).toBe(true)
    })

    it('should return false for invalid cache', () => {
      expect(cacheManager.isValid('non-existent', testFilePath)).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cacheManager.set('key1', 'value1', testFilePath)
      cacheManager.set('key2', 'value2', testFilePath)

      cacheManager.clear()

      expect(cacheManager.get('key1', testFilePath)).toBeNull()
      expect(cacheManager.get('key2', testFilePath)).toBeNull()
    })
  })

  describe('clearKey', () => {
    it('should clear specific cache entry', () => {
      cacheManager.set('key1', 'value1', testFilePath)
      cacheManager.set('key2', 'value2', testFilePath)

      cacheManager.clearKey('key1')

      expect(cacheManager.get('key1', testFilePath)).toBeNull()
      expect(cacheManager.get('key2', testFilePath)).not.toBeNull()
    })
  })

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cacheManager.set('key1', 'value1', testFilePath)
      cacheManager.set('key2', 'value2', testFilePath)

      const stats = cacheManager.getStats()

      expect(stats.totalEntries).toBe(2)
      expect(stats.cacheDir).toBe(testCacheDir)
      expect(stats.cacheFile).toBe(join(testCacheDir, 'metadata.json'))
    })

    it('should return zero entries for empty cache', () => {
      const stats = cacheManager.getStats()
      expect(stats.totalEntries).toBe(0)
    })
  })
})
