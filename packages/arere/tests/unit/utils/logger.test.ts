/**
 * Tests for logger utilities
 */

import { logger, setLogLevel } from '@/lib/logger.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('Logger utilities', () => {
  const originalEnv = process.env.ARERE_LOG_LEVEL

  beforeEach(() => {
    delete process.env.ARERE_LOG_LEVEL
    // Reset to default info level
    logger.level = 3
  })

  afterEach(() => {
    if (originalEnv) {
      process.env.ARERE_LOG_LEVEL = originalEnv
    } else {
      delete process.env.ARERE_LOG_LEVEL
    }
    // Reset to default info level
    logger.level = 3
  })

  describe('logger', () => {
    it('should be a logger instance with standard methods', () => {
      expect(logger).toBeDefined()
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.trace).toBe('function')
      expect(typeof logger.fatal).toBe('function')
    })
  })

  describe('setLogLevel', () => {
    it('should set log level from parameter', () => {
      setLogLevel('debug')
      expect(logger.level).toBe(1) // debug level
    })

    it('should set log level from environment variable', () => {
      process.env.ARERE_LOG_LEVEL = 'error'
      setLogLevel()
      expect(logger.level).toBe(5) // error level
    })

    it('should default to info level', () => {
      setLogLevel()
      expect(logger.level).toBe(3) // info level
    })

    it('should prioritize parameter over environment variable', () => {
      process.env.ARERE_LOG_LEVEL = 'error'
      setLogLevel('debug')
      expect(logger.level).toBe(1) // debug level
    })
  })
})
