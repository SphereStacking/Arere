/**
 * Tests for action context creation
 *
 * Updated to pass config parameter to createActionContext
 */

import { createActionContext } from '@/domain/action/context.js'
import { defaultConfig } from '@/infrastructure/config/schema.js'
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
})
