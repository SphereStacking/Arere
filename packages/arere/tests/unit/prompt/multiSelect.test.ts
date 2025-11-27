/**
 * Tests for multiSelect prompt
 */

import { multiSelect } from '@/infrastructure/prompt/multiSelect.js'
import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer.js'
import type { PromptRequest } from '@/infrastructure/prompt/renderer.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('multiSelect', () => {
  let capturedRequest: PromptRequest | null = null

  beforeEach(() => {
    setPromptHandler(async (request) => {
      capturedRequest = request
      return ['blue', 'green']
    })
  })

  afterEach(() => {
    clearPromptHandler()
    capturedRequest = null
  })

  it('should call prompt handler with multiSelect request', async () => {
    const result = await multiSelect('Choose colors:', ['red', 'blue', 'green'])

    expect(capturedRequest?.type).toBe('multiSelect')
    if (capturedRequest?.type === 'multiSelect') {
      expect(capturedRequest.message).toBe('Choose colors:')
    }
    expect(result).toEqual(['blue', 'green'])
  })

  it('should normalize simple string choices', async () => {
    await multiSelect('Choose:', ['a', 'b', 'c'])

    expect(capturedRequest?.type).toBe('multiSelect')
    const choices = (capturedRequest as any).choices
    expect(choices).toHaveLength(3)
    expect(choices[0]).toEqual({ label: 'a', value: 'a' })
    expect(choices[1]).toEqual({ label: 'b', value: 'b' })
    expect(choices[2]).toEqual({ label: 'c', value: 'c' })
  })

  it('should handle SelectChoice objects', async () => {
    await multiSelect('Choose:', [
      { label: 'Red', value: 'r' },
      { label: 'Blue', value: 'b' },
    ])

    const choices = (capturedRequest as any).choices
    expect(choices).toHaveLength(2)
    expect(choices[0]).toEqual({ label: 'Red', value: 'r' })
    expect(choices[1]).toEqual({ label: 'Blue', value: 'b' })
  })

  it('should throw error if choices arere empty', async () => {
    await expect(multiSelect('Choose:', [])).rejects.toThrow('MultiSelect choices cannot be empty')
  })
})
