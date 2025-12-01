/**
 * Tests for override detection logic
 */

import { getOverriddenKeys, isKeyOverridden } from '@/config/override-detector.js'
import type { ArereConfig } from '@/config/schema.js'
import { describe, expect, it } from 'vitest'

describe('getOverriddenKeys', () => {
  it('should return empty array when user config is null', () => {
    const workspaceConfig: Partial<ArereConfig> = { locale: 'en' }
    const result = getOverriddenKeys(null, workspaceConfig)
    expect(result).toEqual([])
  })

  it('should return empty array when workspace config is null', () => {
    const userConfig: Partial<ArereConfig> = { locale: 'en' }
    const result = getOverriddenKeys(userConfig, null)
    expect(result).toEqual([])
  })

  it('should return empty array when both configs are null', () => {
    const result = getOverriddenKeys(null, null)
    expect(result).toEqual([])
  })

  it('should detect simple field override', () => {
    const userConfig: Partial<ArereConfig> = { locale: 'en' }
    const workspaceConfig: Partial<ArereConfig> = { locale: 'ja' }
    const result = getOverriddenKeys(userConfig, workspaceConfig)
    expect(result).toEqual(['locale'])
  })

  it('should detect multiple field overrides', () => {
    const userConfig: Partial<ArereConfig> = {
      locale: 'en',
      logLevel: 'info',
    }
    const workspaceConfig: Partial<ArereConfig> = {
      locale: 'ja',
      logLevel: 'debug',
    }
    const result = getOverriddenKeys(userConfig, workspaceConfig)
    expect(result).toContain('locale')
    expect(result).toContain('logLevel')
    expect(result).toHaveLength(2)
  })

  it('should not mark non-overridden fields', () => {
    const userConfig: Partial<ArereConfig> = {
      locale: 'en',
      logLevel: 'info',
    }
    const workspaceConfig: Partial<ArereConfig> = {
      locale: 'ja',
    }
    const result = getOverriddenKeys(userConfig, workspaceConfig)
    expect(result).toEqual(['locale'])
    expect(result).not.toContain('logLevel')
  })

  it('should detect nested field override', () => {
    const userConfig: Partial<ArereConfig> = {
      theme: { primaryColor: 'blue' },
    }
    const workspaceConfig: Partial<ArereConfig> = {
      theme: { primaryColor: 'cyan' },
    }
    const result = getOverriddenKeys(userConfig, workspaceConfig)
    expect(result).toEqual(['theme.primaryColor'])
  })

  it('should detect multiple nested field overrides', () => {
    const userConfig: Partial<ArereConfig> = {
      theme: { primaryColor: 'blue' },
      locale: 'en',
    }
    const workspaceConfig: Partial<ArereConfig> = {
      theme: { primaryColor: 'cyan' },
      locale: 'ja',
    }
    const result = getOverriddenKeys(userConfig, workspaceConfig)
    expect(result).toContain('theme.primaryColor')
    expect(result).toContain('locale')
    expect(result).toHaveLength(2)
  })

  it('should handle partial nested object override', () => {
    const userConfig: Partial<ArereConfig> = {
      theme: { primaryColor: 'blue' },
    }
    const workspaceConfig: Partial<ArereConfig> = {
      theme: {},
    }
    const result = getOverriddenKeys(userConfig, workspaceConfig)
    expect(result).toEqual([])
  })

  it('should return empty when no overrides exist', () => {
    const userConfig: Partial<ArereConfig> = {
      locale: 'en',
    }
    const workspaceConfig: Partial<ArereConfig> = {
      logLevel: 'debug',
    }
    const result = getOverriddenKeys(userConfig, workspaceConfig)
    expect(result).toEqual([])
  })
})

describe('isKeyOverridden', () => {
  it('should return true for overridden key', () => {
    const overriddenKeys = ['locale', 'theme.primaryColor']
    expect(isKeyOverridden('locale', overriddenKeys)).toBe(true)
  })

  it('should return false for non-overridden key', () => {
    const overriddenKeys = ['locale', 'theme.primaryColor']
    expect(isKeyOverridden('logLevel', overriddenKeys)).toBe(false)
  })

  it('should return true for nested overridden key', () => {
    const overriddenKeys = ['locale', 'theme.primaryColor']
    expect(isKeyOverridden('theme.primaryColor', overriddenKeys)).toBe(true)
  })

  it('should return false for empty array', () => {
    expect(isKeyOverridden('locale', [])).toBe(false)
  })

  it('should handle exact match only', () => {
    const overriddenKeys = ['theme']
    expect(isKeyOverridden('theme.primaryColor', overriddenKeys)).toBe(false)
  })
})
