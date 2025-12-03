/**
 * Tests for action context creation
 *
 * Updated to pass config parameter to createActionContext
 */

import { createActionContext } from '@/action/context.js'
import { defaultConfig } from '@/config/schema.js'
import { describe, expect, it } from 'vitest'

describe('createActionContext', () => {
  it('should create a context with all required properties', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(context).toHaveProperty('tui')
    expect(context).toHaveProperty('$')
    expect(context).toHaveProperty('t')
    expect(context).toHaveProperty('cwd')
    expect(context).toHaveProperty('env')
    expect(context).toHaveProperty('config')
  })

  it('should have prompt API with all methods', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(typeof context.tui.prompt.text).toBe('function')
    expect(typeof context.tui.prompt.select).toBe('function')
    expect(typeof context.tui.prompt.confirm).toBe('function')
    expect(typeof context.tui.prompt.multiSelect).toBe('function')
  })

  it('should have shell executor', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(typeof context.$).toBe('function')
  })

  it('should have current working directory', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(typeof context.cwd).toBe('string')
    expect(context.cwd.length).toBeGreaterThan(0)
  })

  it('should have environment variables', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(typeof context.env).toBe('object')
    expect(context.env).not.toBeNull()
  })

  it('should have config property', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(context.config).toBeDefined()
    expect(context.config).toEqual(defaultConfig)
  })

  it('should have scoped translation function', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(typeof context.t).toBe('function')
  })

  describe('args property', () => {
    it('should have args property as empty array by default', () => {
      const { context } = createActionContext({
        actionName: 'test-action',
        config: defaultConfig,
      })

      expect(context.args).toBeDefined()
      expect(Array.isArray(context.args)).toBe(true)
      expect(context.args).toEqual([])
    })

    it('should pass args when provided', () => {
      const { context } = createActionContext({
        actionName: 'test-action',
        config: defaultConfig,
        args: ['arg1', 'arg2', '--flag'],
      })

      expect(context.args).toEqual(['arg1', 'arg2', '--flag'])
    })

    it('should handle empty args array', () => {
      const { context } = createActionContext({
        actionName: 'test-action',
        config: defaultConfig,
        args: [],
      })

      expect(context.args).toEqual([])
    })

    it('should preserve args order', () => {
      const { context } = createActionContext({
        actionName: 'test-action',
        config: defaultConfig,
        args: ['production', '--force', '--verbose', 'extra'],
      })

      expect(context.args[0]).toBe('production')
      expect(context.args[1]).toBe('--force')
      expect(context.args[2]).toBe('--verbose')
      expect(context.args[3]).toBe('extra')
    })
  })
})
