/**
 * Timing control tests
 */

import { delay } from '@/ui/control/timing.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('delay()', () => {
  let originalNodeEnv: string | undefined
  let originalVitest: string | undefined

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV
    originalVitest = process.env.VITEST
    vi.useFakeTimers()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    process.env.VITEST = originalVitest
    vi.useRealTimers()
  })

  it('delays for specified milliseconds', async () => {
    process.env.NODE_ENV = 'production'
    process.env.VITEST = undefined

    const promise = delay(1000)

    // Fast-forward time
    await vi.advanceTimersByTimeAsync(1000)

    await expect(promise).resolves.toBeUndefined()
  })

  it('skips delay in test environment (NODE_ENV=test)', async () => {
    process.env.NODE_ENV = 'test'

    const start = Date.now()
    await delay(1000)
    const elapsed = Date.now() - start

    // Should complete immediately
    expect(elapsed).toBeLessThan(100)
  })

  it('skips delay in test environment (VITEST=true)', async () => {
    process.env.NODE_ENV = undefined
    process.env.VITEST = 'true'

    const start = Date.now()
    await delay(1000)
    const elapsed = Date.now() - start

    // Should complete immediately
    expect(elapsed).toBeLessThan(100)
  })

  it('throws error for negative delay', async () => {
    await expect(delay(-100)).rejects.toThrow('Delay duration must be non-negative')
  })

  it('accepts zero delay', async () => {
    process.env.NODE_ENV = 'production'
    process.env.VITEST = undefined

    const promise = delay(0)
    await vi.advanceTimersByTimeAsync(0)
    await expect(promise).resolves.toBeUndefined()
  })

  it('warns for very long delays (> 30 seconds)', async () => {
    process.env.NODE_ENV = 'production'
    process.env.VITEST = undefined

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const promise = delay(35000)
    await vi.advanceTimersByTimeAsync(35000)
    await promise

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Long delay detected'))

    warnSpy.mockRestore()
  })
})

