/**
 * End-to-end tests for Shell Executor ($)
 *
 * Tests that shell commands run correctly and
 * return proper results (stdout, stderr, exitCode).
 */

import { defineAction } from '@/action/define.js'
import { runAction } from '@/action/executor.js'
import { describe, expect, it } from 'vitest'

describe('E2E: Shell Executor', () => {
  describe('basic execution', () => {
    it('should run simple command', async () => {
      const action = defineAction({
        name: 'shell-basic-test',
        description: 'Shell basic test',
        async run({ $, tui }) {
          const result = await $`echo Hello`
          tui.output.log(`stdout: ${result.stdout.trim()}`)
          tui.output.log(`exitCode: ${result.exitCode}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('stdout: Hello')
      expect(messages[1].content).toBe('exitCode: 0')
    })

    it('should handle command with arguments', async () => {
      const action = defineAction({
        name: 'shell-args-test',
        description: 'Shell args test',
        async run({ $, tui }) {
          const result = await $`echo Hello World`
          tui.output.log(result.stdout.trim())
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Hello World')
    })
  })

  describe('template interpolation', () => {
    it('should safely interpolate variables', async () => {
      const action = defineAction({
        name: 'shell-interpolate-test',
        description: 'Shell interpolate test',
        async run({ $, tui }) {
          const name = 'World'
          const result = await $`echo Hello, ${name}!`
          tui.output.log(result.stdout.trim())
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('Hello, World!')
    })

    it('should escape special characters', async () => {
      const action = defineAction({
        name: 'shell-escape-test',
        description: 'Shell escape test',
        async run({ $, tui }) {
          // Characters that need escaping in shell
          const value = 'test with spaces'
          const result = await $`echo ${value}`
          tui.output.log(result.stdout.trim())
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('test with spaces')
    })
  })

  describe('exit codes', () => {
    it('should capture non-zero exit code', async () => {
      const action = defineAction({
        name: 'shell-exitcode-test',
        description: 'Shell exit code test',
        async run({ $, tui }) {
          const result = await $`exit 1`
          tui.output.log(`exitCode: ${result.exitCode}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('exitCode: 1')
    })

    it('should capture exit code from failing command', async () => {
      const action = defineAction({
        name: 'shell-fail-test',
        description: 'Shell fail test',
        async run({ $, tui }) {
          const result = await $`ls /nonexistent-directory-12345`
          tui.output.log(`exitCode: ${result.exitCode}`)
          tui.output.log(`hasStderr: ${result.stderr.length > 0}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).not.toBe('exitCode: 0')
      expect(messages[1].content).toBe('hasStderr: true')
    })
  })

  describe('stderr capture', () => {
    it('should capture stderr output', async () => {
      const action = defineAction({
        name: 'shell-stderr-test',
        description: 'Shell stderr test',
        async run({ $, tui }) {
          const result = await $`echo "error message" >&2`
          tui.output.log(`stderr: ${result.stderr.trim()}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('stderr: error message')
    })
  })

  describe('multi-line output', () => {
    it('should capture multi-line stdout', async () => {
      const action = defineAction({
        name: 'shell-multiline-test',
        description: 'Shell multiline test',
        async run({ $, tui }) {
          const result = await $`echo -e "line1\nline2\nline3"`
          const lines = result.stdout.trim().split('\n')
          tui.output.log(`lines: ${lines.length}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('lines: 3')
    })
  })

  describe('command chaining', () => {
    it('should handle piped commands', async () => {
      const action = defineAction({
        name: 'shell-pipe-test',
        description: 'Shell pipe test',
        async run({ $, tui }) {
          const result = await $`echo "hello world" | tr 'a-z' 'A-Z'`
          tui.output.log(result.stdout.trim())
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('HELLO WORLD')
    })

    it('should handle sequential commands with &&', async () => {
      const action = defineAction({
        name: 'shell-and-test',
        description: 'Shell && test',
        async run({ $, tui }) {
          const result = await $`echo "first" && echo "second"`
          tui.output.log(result.stdout.trim())
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toContain('first')
      expect(messages[0].content).toContain('second')
    })
  })

  describe('environment variables', () => {
    it('should have access to environment variables', async () => {
      const action = defineAction({
        name: 'shell-env-test',
        description: 'Shell env test',
        async run({ $, tui }) {
          const result = await $`echo $HOME`
          tui.output.log(`hasHome: ${result.stdout.trim().length > 0}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('hasHome: true')
    })
  })

  describe('working directory', () => {
    it('should run in correct working directory', async () => {
      const action = defineAction({
        name: 'shell-cwd-test',
        description: 'Shell cwd test',
        async run({ $, cwd, tui }) {
          const result = await $`pwd`
          tui.output.log(`matches: ${result.stdout.trim() === cwd}`)
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].content).toBe('matches: true')
    })
  })

  describe('error handling in actions', () => {
    it('should allow action to handle command failure', async () => {
      const action = defineAction({
        name: 'shell-error-handling-test',
        description: 'Shell error handling test',
        async run({ $, tui }) {
          const result = await $`exit 42`
          if (result.exitCode !== 0) {
            tui.output.warn(`Command failed with exit code ${result.exitCode}`)
          }
        },
      })

      const result = await runAction(action)

      expect(result.success).toBe(true)
      const messages = result.outputCollector.getMessages()
      expect(messages[0].type).toBe('warn')
      expect(messages[0].content).toBe('Command failed with exit code 42')
    })
  })
})
