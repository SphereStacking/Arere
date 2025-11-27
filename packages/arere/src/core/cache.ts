/**
 * Cache system for action metadata
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { logger } from '@/shared/utils/logger'

/**
 * Cache entry structure
 */
interface CacheEntry<T = unknown> {
  /** Cached value */
  value: T
  /** File modification time (milliseconds since epoch) */
  mtime: number
  /** Cache creation timestamp */
  cachedAt: number
}

/**
 * Cache storage structure
 */
interface CacheStorage {
  [key: string]: CacheEntry
}

/**
 * Cache manager for action metadata
 *
 * @example
 * ```typescript
 * const cache = new CacheManager()
 *
 * // Set cache with file path
 * cache.set('action-meta', metadata, '/path/to/action.ts')
 *
 * // Get cache if valid
 * const cached = cache.get('action-meta', '/path/to/action.ts')
 * if (cached) {
 *   console.log('Using cached metadata')
 * }
 * ```
 */
export class CacheManager {
  private cacheDir: string
  private cacheFile: string
  private storage: CacheStorage = {}

  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir || join(homedir(), '.arere', 'cache')
    this.cacheFile = join(this.cacheDir, 'metadata.json')
    this.ensureCacheDir()
    this.load()
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      try {
        mkdirSync(this.cacheDir, { recursive: true })
        logger.debug(`Created cache directory: ${this.cacheDir}`)
      } catch (error) {
        logger.warn(`Failed to create cache directory: ${this.cacheDir}`, error)
      }
    }
  }

  /**
   * Load cache from disk
   */
  private load(): void {
    if (!existsSync(this.cacheFile)) {
      logger.debug('No cache file found')
      return
    }

    try {
      const content = readFileSync(this.cacheFile, 'utf-8')
      this.storage = JSON.parse(content)
      logger.debug(`Loaded cache from ${this.cacheFile}`)
    } catch (error) {
      logger.warn(`Failed to load cache: ${this.cacheFile}`, error)
      this.storage = {}
    }
  }

  /**
   * Save cache to disk
   */
  private save(): void {
    try {
      const content = JSON.stringify(this.storage, null, 2)
      writeFileSync(this.cacheFile, content, 'utf-8')
      logger.debug(`Saved cache to ${this.cacheFile}`)
    } catch (error) {
      logger.warn(`Failed to save cache: ${this.cacheFile}`, error)
    }
  }

  /**
   * Get cached value if valid
   *
   * @param key - Cache key
   * @param filePath - File path to check modification time
   * @returns Cached value or null if invalid/not found
   */
  get<T = unknown>(key: string, filePath: string): T | null {
    const entry = this.storage[key]

    if (!entry) {
      logger.debug(`Cache miss: ${key}`)
      return null
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      logger.debug(`Cache invalid: file not found - ${filePath}`)
      delete this.storage[key]
      this.save()
      return null
    }

    // Check if file has been modified
    try {
      const stat = statSync(filePath)
      const currentMtime = stat.mtimeMs

      if (currentMtime !== entry.mtime) {
        logger.debug(`Cache invalid: file modified - ${filePath}`)
        delete this.storage[key]
        this.save()
        return null
      }

      logger.debug(`Cache hit: ${key}`)
      return entry.value as T
    } catch (error) {
      logger.warn(`Failed to check file mtime: ${filePath}`, error)
      return null
    }
  }

  /**
   * Set cache value with file path
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param filePath - File path to track modification time
   */
  set<T = unknown>(key: string, value: T, filePath: string): void {
    try {
      const stat = statSync(filePath)
      const mtime = stat.mtimeMs

      this.storage[key] = {
        value,
        mtime,
        cachedAt: Date.now(),
      }

      this.save()
      logger.debug(`Cached: ${key}`)
    } catch (error) {
      logger.warn(`Failed to cache: ${key}`, error)
    }
  }

  /**
   * Check if cache entry is valid
   *
   * @param key - Cache key
   * @param filePath - File path to check modification time
   * @returns true if cache is valid, false otherwise
   */
  isValid(key: string, filePath: string): boolean {
    return this.get(key, filePath) !== null
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.storage = {}
    this.save()
    logger.info('Cache cleared')
  }

  /**
   * Clear specific cache entry
   *
   * @param key - Cache key to clear
   */
  clearKey(key: string): void {
    if (this.storage[key]) {
      delete this.storage[key]
      this.save()
      logger.debug(`Cleared cache: ${key}`)
    }
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  getStats(): {
    totalEntries: number
    cacheDir: string
    cacheFile: string
  } {
    return {
      totalEntries: Object.keys(this.storage).length,
      cacheDir: this.cacheDir,
      cacheFile: this.cacheFile,
    }
  }
}

/**
 * Global cache manager instance
 */
export const cacheManager = new CacheManager()
