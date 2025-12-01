/**
 * Tests for shell executor
 */

import { createShellExecutor } from '@/shell/executor.js'
import { describe, expect, it } from 'vitest'

describe('createShellExecutor', () => {
  it('should create a shell executor function', () => {
    const $ = createShellExecutor()

    expect(typeof $).toBe('function')
  })

  it('should run a simple command', async () => {
    const $ = createShellExecutor()

    const result = await $`echo "Hello, World!"`

    expect(result.stdout).toBe('Hello, World!')
    expect(result.exitCode).toBe(0)
  })

  it('should run commands with arguments', async () => {
    const $ = createShellExecutor()
    const message = 'Test message'

    const result = await $`echo ${message}`

    expect(result.stdout).toBe('Test message')
    expect(result.exitCode).toBe(0)
  })

  it('should escape special characters in arguments', async () => {
    const $ = createShellExecutor()
    const arg = "test's value"

    const result = await $`echo ${arg}`

    expect(result.stdout).toBe("test's value")
  })

  it('should handle multiple arguments', async () => {
    const $ = createShellExecutor()
    const arg1 = 'Hello'
    const arg2 = 'World'

    const result = await $`echo ${arg1} ${arg2}`

    expect(result.stdout).toBe('Hello World')
  })

  it('should handle command failure', async () => {
    const $ = createShellExecutor()

    const result = await $`exit 1`

    expect(result.exitCode).toBe(1)
  })

  it('should capture stderr', async () => {
    const $ = createShellExecutor()

    const result = await $`echo "error" >&2`

    expect(result.stderr).toBe('error')
    expect(result.exitCode).toBe(0)
  })

  it('should handle non-zero exit codes without throwing', async () => {
    const $ = createShellExecutor()

    const result = await $`exit 42`

    expect(result.exitCode).toBe(42)
  })

  it('should handle commands that produce no output', async () => {
    const $ = createShellExecutor()

    const result = await $`true`

    expect(result.stdout).toBe('')
    expect(result.stderr).toBe('')
    expect(result.exitCode).toBe(0)
  })
})
