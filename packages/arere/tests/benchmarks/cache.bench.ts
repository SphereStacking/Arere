/**
 * Benchmark tests for cache system performance
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CacheManager } from '@/core/cache.js'
import { beforeEach, bench, describe } from 'vitest'

describe('Cache System Performance', () => {
  let cacheManager: CacheManager
  let tempDir: string
  let testFilePath: string

  beforeEach(() => {
    cacheManager = new CacheManager()
    tempDir = mkdtempSync(join(tmpdir(), 'arere-bench-'))
    testFilePath = join(tempDir, 'test-file.txt')
    writeFileSync(testFilePath, 'initial content')
  })

  describe('Single cache operations', () => {
    bench('set cache entry', () => {
      cacheManager.set('bench-key', { data: 'test value' }, testFilePath)
    })

    bench('get cache entry (hit)', () => {
      cacheManager.set('bench-key', { data: 'test value' }, testFilePath)
      cacheManager.get('bench-key', testFilePath)
    })

    bench('get cache entry (miss)', () => {
      cacheManager.get('non-existent-key', testFilePath)
    })

    // Note: has() and delete() methods are not implemented in CacheManager
    // bench('has cache entry (hit)', () => {
    //   cacheManager.set('bench-key', { data: 'test value' }, testFilePath)
    //   cacheManager.has('bench-key')
    // })

    // bench('has cache entry (miss)', () => {
    //   cacheManager.has('non-existent-key')
    // })

    // bench('delete cache entry', () => {
    //   cacheManager.set('bench-key', { data: 'test value' }, testFilePath)
    //   cacheManager.delete('bench-key')
    // })
  })

  describe('Bulk cache operations', () => {
    bench('set 10 entries', () => {
      for (let i = 0; i < 10; i++) {
        cacheManager.set(`key-${i}`, { data: `value-${i}` }, testFilePath)
      }
    })

    bench('set 100 entries', () => {
      for (let i = 0; i < 100; i++) {
        cacheManager.set(`key-${i}`, { data: `value-${i}` }, testFilePath)
      }
    })

    bench('set 1000 entries', () => {
      for (let i = 0; i < 1000; i++) {
        cacheManager.set(`key-${i}`, { data: `value-${i}` }, testFilePath)
      }
    })

    bench('get 100 entries (all hits)', () => {
      // Setup
      for (let i = 0; i < 100; i++) {
        cacheManager.set(`key-${i}`, { data: `value-${i}` }, testFilePath)
      }
      // Benchmark
      for (let i = 0; i < 100; i++) {
        cacheManager.get(`key-${i}`, testFilePath)
      }
    })

    bench('get 100 entries (all misses)', () => {
      for (let i = 0; i < 100; i++) {
        cacheManager.get(`missing-key-${i}`, testFilePath)
      }
    })
  })

  describe('Cache with different value sizes', () => {
    const smallValue = { data: 'x'.repeat(100) }
    const mediumValue = { data: 'x'.repeat(1000) }
    const largeValue = { data: 'x'.repeat(10000) }
    const xlargeValue = { data: 'x'.repeat(100000) }

    bench('set small value (100 bytes)', () => {
      cacheManager.set('key', smallValue, testFilePath)
    })

    bench('set medium value (1KB)', () => {
      cacheManager.set('key', mediumValue, testFilePath)
    })

    bench('set large value (10KB)', () => {
      cacheManager.set('key', largeValue, testFilePath)
    })

    bench('set xlarge value (100KB)', () => {
      cacheManager.set('key', xlargeValue, testFilePath)
    })

    bench('get small value (100 bytes)', () => {
      cacheManager.set('key', smallValue, testFilePath)
      cacheManager.get('key', testFilePath)
    })

    bench('get medium value (1KB)', () => {
      cacheManager.set('key', mediumValue, testFilePath)
      cacheManager.get('key', testFilePath)
    })

    bench('get large value (10KB)', () => {
      cacheManager.set('key', largeValue, testFilePath)
      cacheManager.get('key', testFilePath)
    })

    bench('get xlarge value (100KB)', () => {
      cacheManager.set('key', xlargeValue, testFilePath)
      cacheManager.get('key', testFilePath)
    })
  })

  describe('Cache invalidation', () => {
    bench('validate entry (valid)', () => {
      cacheManager.set('key', { data: 'value' }, testFilePath)
      cacheManager.get('key', testFilePath)
    })

    bench('clear all cache', () => {
      for (let i = 0; i < 100; i++) {
        cacheManager.set(`key-${i}`, { data: `value-${i}` }, testFilePath)
      }
      cacheManager.clear()
    })
  })
})
