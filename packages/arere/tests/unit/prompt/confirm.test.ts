/**
 * Tests for confirm prompt
 */

import { confirm } from '@/ui/prompts/confirm.js'
import { clearPromptHandler, setPromptHandler } from '@/ui/prompts/renderer.js'
import type { PromptRequest } from '@/ui/prompts/renderer.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('confirm', () => {
  let capturedRequest: PromptRequest | null = null

  beforeEach(() => {
    setPromptHandler(async (request) => {
      capturedRequest = request
      return true
    })
  })

  afterEach(() => {
    clearPromptHandler()
    capturedRequest = null
  })

  it('should call prompt handler with confirm request', async () => {
    const result = await confirm('Are you sure?')

    expect(capturedRequest).toEqual({
      type: 'confirm',
      message: 'Are you sure?',
      defaultValue: undefined,
    })
    expect(result).toBe(true)
  })

  it('should pass default value', async () => {
    await confirm('Are you sure?', { defaultValue: true })

    expect(capturedRequest?.type).toBe('confirm')
    expect((capturedRequest as any).options?.defaultValue).toBe(true)
  })
})
