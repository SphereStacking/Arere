/**
 * Tests for configuration schema
 */

import { configSchema } from '@/infrastructure/config/schema.js'
import { describe, expect, it } from 'vitest'

describe('Configuration schema', () => {
  it('should validate valid config', () => {
    const config = {
      actionsDir: './custom-actions',
      logLevel: 'debug' as const,
      theme: {
        primaryColor: 'green',
      },
    }

    const result = configSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('should accept empty config', () => {
    const config = {}
    const result = configSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('should accept partial config', () => {
    const config = {
      logLevel: 'info' as const,
    }

    const result = configSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('should reject invalid log level', () => {
    const config = {
      logLevel: 'invalid-level',
    }

    const result = configSchema.safeParse(config)
    expect(result.success).toBe(false)
  })

  it('should reject invalid actionsDir type', () => {
    const config = {
      actionsDir: 123,
    }

    const result = configSchema.safeParse(config)
    expect(result.success).toBe(false)
  })

  it('should accept all valid log levels', () => {
    const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const

    for (const level of levels) {
      const config = { logLevel: level }
      const result = configSchema.safeParse(config)
      expect(result.success).toBe(true)
    }
  })
})
