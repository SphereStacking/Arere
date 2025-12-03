/**
 * Integration tests for headless mode argument mapping
 */

import { createPromptAPIWithArgs } from '@/action/args/prompt-wrapper.js'
import { describe, expect, it } from 'vitest'

describe('Headless mode argument mapping integration', () => {
  describe('createPromptAPIWithArgs', () => {
    describe('text prompt with args', () => {
      it('should resolve text value from --name argument', async () => {
        const args = ['--name=John']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.text('Enter name', {
          arg: 'name',
        })

        expect(result).toBe('John')
      })

      it('should resolve text value from -n short argument', async () => {
        const args = ['-n=John']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.text('Enter name', {
          argShort: 'n',
        })

        expect(result).toBe('John')
      })

      it('should resolve text value from positional argument', async () => {
        const args = ['John', 'Doe']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.text('Enter first name', {
          argIndex: 0,
        })

        expect(result).toBe('John')
      })
    })

    describe('number prompt with args', () => {
      it('should convert string to number from argument', async () => {
        const args = ['--port=8080']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.number('Port', {
          arg: 'port',
        })

        expect(result).toBe(8080)
      })

      it('should validate min/max constraints', async () => {
        const args = ['--port=100']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        await expect(
          promptAPI.number('Port', {
            arg: 'port',
            min: 1024,
          }),
        ).rejects.toThrow('Must be at least 1024')
      })
    })

    describe('select prompt with args', () => {
      it('should resolve select value from choices', async () => {
        const args = ['--env=production']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.select('Environment', ['staging', 'production'], {
          arg: 'env',
        })

        expect(result).toBe('production')
      })

      it('should reject invalid choice', async () => {
        const args = ['--env=invalid']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        await expect(
          promptAPI.select('Environment', ['staging', 'production'], {
            arg: 'env',
          }),
        ).rejects.toThrow("Invalid value 'invalid' for --env")
      })
    })

    describe('confirm prompt with args', () => {
      it('should resolve boolean flag', async () => {
        const args = ['--yes']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.confirm('Continue?', {
          arg: 'yes',
        })

        expect(result).toBe(true)
      })

      it('should resolve explicit true value', async () => {
        const args = ['--force=true']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.confirm('Force?', {
          arg: 'force',
        })

        expect(result).toBe(true)
      })

      it('should resolve explicit false value', async () => {
        const args = ['--force=false']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.confirm('Force?', {
          arg: 'force',
        })

        expect(result).toBe(false)
      })
    })

    describe('multiSelect prompt with args', () => {
      it('should resolve comma-separated values', async () => {
        const args = ['--packages=a,b,c']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.multiSelect('Packages', ['a', 'b', 'c', 'd'], {
          arg: 'packages',
        })

        expect(result).toEqual(['a', 'b', 'c'])
      })

      it('should reject invalid choices in multi-select', async () => {
        const args = ['--packages=a,x']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        await expect(
          promptAPI.multiSelect('Packages', ['a', 'b', 'c'], {
            arg: 'packages',
          }),
        ).rejects.toThrow("Invalid value 'x'")
      })
    })

    describe('password prompt with args', () => {
      it('should resolve password value from argument', async () => {
        const args = ['--token=secret123']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        const result = await promptAPI.password('API Token', {
          arg: 'token',
        })

        expect(result).toBe('secret123')
      })
    })

    describe('non-interactive mode error handling', () => {
      it('should throw error for missing required argument in non-interactive mode', async () => {
        const args: string[] = []
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        await expect(
          promptAPI.text('Enter name', {
            arg: 'name',
          }),
        ).rejects.toThrow('Required argument --name is missing')
      })
    })

    describe('mixed prompts with partial args', () => {
      it('should resolve some values from args and require others', async () => {
        const args = ['--name=John']
        const promptAPI = createPromptAPIWithArgs(args, () => false)

        // First prompt should resolve from args
        const name = await promptAPI.text('Enter name', {
          arg: 'name',
        })
        expect(name).toBe('John')

        // Second prompt without arg should throw in non-interactive mode
        await expect(
          promptAPI.text('Enter email', {
            arg: 'email',
          }),
        ).rejects.toThrow('Required argument --email is missing')
      })
    })
  })
})
