/**
 * Tests for select prompt
 */

import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer.js'
import type { PromptRequest } from '@/infrastructure/prompt/renderer.js'
import { select } from '@/infrastructure/prompt/select.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('select', () => {
  let capturedRequest: PromptRequest | null = null

  beforeEach(() => {
    setPromptHandler(async (request) => {
      capturedRequest = request
      return 'blue'
    })
  })

  afterEach(() => {
    clearPromptHandler()
    capturedRequest = null
  })

  it('should call prompt handler with select request', async () => {
    const result = await select('Choose a color:', ['red', 'blue', 'green'])

    expect(capturedRequest?.type).toBe('select')
    if (capturedRequest?.type === 'select') {
      expect(capturedRequest.message).toBe('Choose a color:')
    }
    expect(result).toBe('blue')
  })

  it('should normalize simple string choices', async () => {
    await select('Choose:', ['a', 'b', 'c'])

    expect(capturedRequest?.type).toBe('select')
    const choices = (capturedRequest as any).choices
    expect(choices).toHaveLength(3)
    expect(choices[0]).toEqual({ label: 'a', value: 'a' })
    expect(choices[1]).toEqual({ label: 'b', value: 'b' })
    expect(choices[2]).toEqual({ label: 'c', value: 'c' })
  })

  it('should handle SelectChoice objects', async () => {
    await select('Choose:', [
      { label: 'Red', value: 'r' },
      { label: 'Blue', value: 'b' },
    ])

    const choices = (capturedRequest as any).choices
    expect(choices).toHaveLength(2)
    expect(choices[0]).toEqual({ label: 'Red', value: 'r' })
    expect(choices[1]).toEqual({ label: 'Blue', value: 'b' })
  })

  it('should throw error if choices arere empty', async () => {
    await expect(select('Choose:', [])).rejects.toThrow('Select choices cannot be empty')
  })
})
