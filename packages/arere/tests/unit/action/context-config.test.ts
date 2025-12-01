/**
 * ActionContext plugin configuration tests
 *
 * Updated to pass config parameter to createActionContext
 */

import { createActionContext } from '@/action/context.js'
import { defaultConfig } from '@/config/schema.js'
import { describe, expect, it } from 'vitest'

describe('ActionContext Plugin Configuration', () => {
  it('should create context without plugin config', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
    })

    expect(context).toBeDefined()
    expect(context.pluginConfig).toBeUndefined()
    expect(context.tui.prompt).toBeDefined()
    expect(context.$).toBeDefined()
    expect(context.t).toBeDefined()
    expect(context.cwd).toBeDefined()
    expect(context.env).toBeDefined()
  })

  it('should create context with plugin config', () => {
    const pluginConfig = {
      apiKey: 'test-key',
      timeout: 5000,
      enabled: true,
    }

    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
      pluginConfig,
    })

    expect(context.pluginConfig).toBeDefined()
    expect(context.pluginConfig).toEqual(pluginConfig)
  })

  it('should pass empty object as plugin config', () => {
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
      pluginConfig: {},
    })

    expect(context.pluginConfig).toBeDefined()
    expect(context.pluginConfig).toEqual({})
  })

  it('should preserve plugin config values', () => {
    const pluginConfig = {
      greeting: 'Hello',
      enableDebug: true,
      theme: 'dark',
      maxRetries: 3,
    }

    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
      pluginConfig,
    })

    expect(context.pluginConfig?.greeting).toBe('Hello')
    expect(context.pluginConfig?.enableDebug).toBe(true)
    expect(context.pluginConfig?.theme).toBe('dark')
    expect(context.pluginConfig?.maxRetries).toBe(3)
  })

  it('should handle complex plugin config', () => {
    const pluginConfig = {
      nested: {
        value: 'test',
      },
      array: [1, 2, 3],
      boolean: false,
      number: 42,
      string: 'test',
    }

    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
      pluginConfig,
    })

    expect(context.pluginConfig?.nested).toEqual({ value: 'test' })
    expect(context.pluginConfig?.array).toEqual([1, 2, 3])
    expect(context.pluginConfig?.boolean).toBe(false)
    expect(context.pluginConfig?.number).toBe(42)
    expect(context.pluginConfig?.string).toBe('test')
  })

  it('should not affect other context properties', () => {
    const pluginConfig = { test: 'value' }
    const { context } = createActionContext({
      actionName: 'test-action',
      config: defaultConfig,
      pluginConfig,
    })

    // Ensure other properties are still present
    expect(context.tui.prompt).toBeDefined()
    expect(context.$).toBeDefined()
    expect(context.t).toBeDefined()
    expect(context.cwd).toBeDefined()
    expect(context.env).toBeDefined()

    // Ensure they are independent of pluginConfig
    expect(context.tui.prompt).not.toBe(pluginConfig)
    expect(context.$).not.toBe(pluginConfig)
  })
})
