/**
 * Tests for ReadLine prompt backend
 */

import { createReadLineBackend } from '@/infrastructure/prompt/backends/readline-backend.js'
import { describe, expect, it } from 'vitest'

describe('ReadLineBackend', () => {
  describe('createReadLineBackend', () => {
    it('should create a prompt handler function', () => {
      const backend = createReadLineBackend()
      expect(typeof backend).toBe('function')
    })

    it('should return a function that accepts PromptRequest', () => {
      const backend = createReadLineBackend()
      // Verify function signature (accepts PromptRequest, returns Promise)
      expect(backend.length).toBe(1) // Single parameter
      expect(backend.constructor.name).toBe('AsyncFunction')
    })
  })

  // Note: Full integration tests with actual stdin/stdout would require complex mocking
  // These tests verify the backend structure and can be expanded with proper mocking
  describe('error handling', () => {
    it('should throw error for unknown prompt type', async () => {
      const backend = createReadLineBackend()

      await expect(backend({ type: 'unknown-type' as any })).rejects.toThrow('Unknown prompt type')
    })
  })
})
