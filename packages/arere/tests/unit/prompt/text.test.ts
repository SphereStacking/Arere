/**
 * Tests for text prompt
 */

import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer.js'
import type { PromptRequest } from '@/infrastructure/prompt/renderer.js'
import { text } from '@/infrastructure/prompt/text.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('text', () => {
  let capturedRequest: PromptRequest | null = null

  beforeEach(() => {
    setPromptHandler(async (request) => {
      capturedRequest = request
      return 'test value'
    })
  })

  afterEach(() => {
    clearPromptHandler()
    capturedRequest = null
  })

  it('should call prompt handler with text request', async () => {
    const result = await text('Enter your name:')

    expect(capturedRequest).toEqual({
      type: 'text',
      message: 'Enter your name:',
      options: undefined,
    })
    expect(result).toBe('test value')
  })

  it('should pass options to prompt handler', async () => {
    await text('Enter your name:', {
      placeholder: 'John Doe',
      validate: (value) => value.length > 0,
    })

    expect(capturedRequest?.type).toBe('text')
    expect(capturedRequest).toHaveProperty('options')
    expect((capturedRequest as any).options?.placeholder).toBe('John Doe')
    expect(typeof (capturedRequest as any).options?.validate).toBe('function')
  })

  it('should pass prefix option to prompt handler', async () => {
    await text('Plugin name:', {
      prefix: 'arere-plugin-',
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.prefix).toBe('arere-plugin-')
  })

  it('should pass suffix option to prompt handler', async () => {
    await text('Username:', {
      suffix: '@company.com',
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.suffix).toBe('@company.com')
  })

  it('should pass maxLength option to prompt handler', async () => {
    await text('Short text:', {
      maxLength: 50,
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.maxLength).toBe(50)
  })

  it('should pass minLength option to prompt handler', async () => {
    await text('Password:', {
      minLength: 8,
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.minLength).toBe(8)
  })

  it('should pass pattern option to prompt handler', async () => {
    const pattern = /^[a-z0-9-]+$/

    await text('Slug:', {
      pattern,
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.pattern).toBe(pattern)
  })

  it('should pass format preset to prompt handler', async () => {
    await text('Slug:', {
      format: 'kebab-case',
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.format).toBe('kebab-case')
  })

  it('should pass custom format function to prompt handler', async () => {
    const customFormat = (value: string) => value.toUpperCase()

    await text('Code:', {
      format: customFormat,
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.format).toBe(customFormat)
  })

  it('should pass multiple options together', async () => {
    const pattern = /^[a-z0-9-]+$/

    await text('Plugin name:', {
      prefix: 'arere-plugin-',
      format: 'kebab-case',
      pattern,
      maxLength: 50,
      placeholder: 'example',
      validate: (value) => value.length > 0,
    })

    expect(capturedRequest?.type).toBe('text')
    expect((capturedRequest as any).options?.prefix).toBe('arere-plugin-')
    expect((capturedRequest as any).options?.format).toBe('kebab-case')
    expect((capturedRequest as any).options?.pattern).toBe(pattern)
    expect((capturedRequest as any).options?.maxLength).toBe(50)
    expect((capturedRequest as any).options?.placeholder).toBe('example')
    expect(typeof (capturedRequest as any).options?.validate).toBe('function')
  })
})
