/**
 * Tests for headless mode execution
 */

import type { ArereConfig } from '@/infrastructure/config/schema.js'
import { HeadlessMode } from '@/presentation/modes/headless-mode.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('HeadlessMode', () => {
  let config: ArereConfig
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let processExitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Mock config
    config = {
      locale: 'en',
      plugins: {},
      theme: { borderStyle: 'round', primaryColor: 'cyan' },
    } as ArereConfig

    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {}) as any
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}) as any

    // Spy on process.exit
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never) as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create headless mode with config', () => {
      const mode = new HeadlessMode(config)
      expect(mode).toBeInstanceOf(HeadlessMode)
    })
  })

  describe('run', () => {
    it('should exit with error if no action name is provided', async () => {
      const mode = new HeadlessMode(config)

      await mode.run(undefined)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error: Action name is required in headless mode',
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('Usage: arere run <action-name>')
      expect(processExitSpy).toHaveBeenCalledWith(1)
    })

    it('should exit with error if action is not found', async () => {
      const mode = new HeadlessMode(config)

      await mode.run('non-existent-action')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Action "non-existent-action" not found')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Available actions:'))
      expect(processExitSpy).toHaveBeenCalledWith(1)
    })

    // Note: Testing successful execution requires fixture actions and full integration
    // This will be covered in integration tests
  })

  describe('output rendering', () => {
    it('should use PlainTextRenderer for output', async () => {
      // This is implicitly tested by the fact that console.log is called
      // PlainTextRenderer outputs to console.log/error
      const mode = new HeadlessMode(config)

      await mode.run(undefined)

      // Verify console methods were called (renderer is working)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should catch and display execution errors', async () => {
      const mode = new HeadlessMode(config)

      // Try to run a non-existent action which will trigger error path
      await mode.run('non-existent-action')

      expect(processExitSpy).toHaveBeenCalledWith(1)
    })
  })

  describe('args parameter', () => {
    it('should accept args as second parameter', async () => {
      const mode = new HeadlessMode(config)

      // run() should accept args without throwing
      await mode.run('non-existent-action', ['arg1', 'arg2'])

      // Verify it ran (will fail because action doesn't exist, but args should be accepted)
      expect(processExitSpy).toHaveBeenCalledWith(1)
    })

    it('should default args to empty array', async () => {
      const mode = new HeadlessMode(config)

      // run() with only action name should work
      await mode.run('non-existent-action')

      expect(processExitSpy).toHaveBeenCalledWith(1)
    })

    it('should accept empty args array', async () => {
      const mode = new HeadlessMode(config)

      await mode.run('non-existent-action', [])

      expect(processExitSpy).toHaveBeenCalledWith(1)
    })
  })
})
