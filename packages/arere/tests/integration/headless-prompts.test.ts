/**
 * Integration tests for headless mode with prompts
 */

import { createReadLineBackend } from '@/infrastructure/prompt/backends/readline-backend.js'
import { clearPromptHandler, setPromptHandler } from '@/infrastructure/prompt/renderer.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('Headless mode prompt integration', () => {
  let originalHandler: any

  beforeEach(() => {
    // Store any existing handler
    originalHandler = null
  })

  afterEach(() => {
    // Clean up
    clearPromptHandler()
  })

  describe('Prompt handler setup', () => {
    it('should set ReadLine backend as prompt handler', () => {
      const backend = createReadLineBackend()

      expect(() => {
        setPromptHandler(backend)
      }).not.toThrow()
    })

    it('should clear prompt handler', () => {
      const backend = createReadLineBackend()
      setPromptHandler(backend)

      expect(() => {
        clearPromptHandler()
      }).not.toThrow()
    })

    it('should allow setting handler multiple times', () => {
      const backend1 = createReadLineBackend()
      const backend2 = createReadLineBackend()

      setPromptHandler(backend1)
      setPromptHandler(backend2) // Should replace backend1

      expect(() => {
        clearPromptHandler()
      }).not.toThrow()
    })
  })

  describe('Backend compatibility', () => {
    it('should create compatible prompt handler', () => {
      const backend = createReadLineBackend()

      // Verify it's a valid PromptHandler (function that returns Promise)
      expect(typeof backend).toBe('function')
      expect(backend.constructor.name).toBe('AsyncFunction')
    })
  })
})
