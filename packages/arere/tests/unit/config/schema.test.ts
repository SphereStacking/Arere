/**
 * Tests for configuration schema
 */

import { configSchema, defaultConfig } from '@/config/schema.js'
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

  describe('ui.actionListFormat', () => {
    it('should accept valid format string', () => {
      const config = {
        ui: {
          actionListFormat: '${prefix}[${category:max}] ${name:max} ${description:grow}',
        },
      }

      const result = configSchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should reject non-string format', () => {
      const config = {
        ui: {
          actionListFormat: 123,
        },
      }

      const result = configSchema.safeParse(config)
      expect(result.success).toBe(false)
    })

    it('should have default format in defaultConfig', () => {
      const format = defaultConfig.ui?.actionListFormat
      expect(format).toBeDefined()
      expect(typeof format).toBe('string')
    })

    it('should have valid default format with ArereRender variables', () => {
      const format = defaultConfig.ui!.actionListFormat!
      expect(format).toContain('${selectIcon:width(2)}')
      expect(format).toContain('${category:max}')
      expect(format).toContain('${name:max}')
      expect(format).toContain('${description:grow}')
      expect(format).toContain('${tags:max:dim:right}')
      expect(format).toContain('${bookmark:width(2)}')
    })
  })
})
