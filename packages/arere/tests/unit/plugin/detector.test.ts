/**
 * Tests for plugin detector
 */

import { detectPlugins } from '@/plugin/detector.js'
import { describe, expect, it } from 'vitest'

describe('detectPlugins', () => {
  it('should return an array', () => {
    const plugins = detectPlugins()

    expect(Array.isArray(plugins)).toBe(true)
  })

  it('should return plugin package info with correct structure', () => {
    const plugins = detectPlugins()

    for (const plugin of plugins) {
      expect(plugin).toHaveProperty('name')
      expect(plugin).toHaveProperty('path')
      expect(plugin).toHaveProperty('packageJson')
      expect(typeof plugin.name).toBe('string')
      expect(typeof plugin.path).toBe('string')
      expect(typeof plugin.packageJson).toBe('object')
    }
  })

  it('should only detect arere-plugin-* packages', () => {
    const plugins = detectPlugins()

    for (const plugin of plugins) {
      expect(plugin.name).toMatch(/^arere-plugin-/)
    }
  })
})
