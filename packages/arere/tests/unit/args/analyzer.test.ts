import { describe, expect, it } from 'vitest'
import { analyzeActionArgs, formatArgsHelp } from '@/infrastructure/args/analyzer'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

describe('analyzeActionArgs', () => {
  const createTempFile = (content: string): string => {
    const tmpDir = os.tmpdir()
    const filePath = path.join(tmpDir, `test-action-${Date.now()}.ts`)
    fs.writeFileSync(filePath, content)
    return filePath
  }

  const cleanupTempFile = (filePath: string): void => {
    try {
      fs.unlinkSync(filePath)
    } catch {
      // Ignore
    }
  }

  it('should extract text prompt with arg mapping', () => {
    const content = `
      import { defineAction } from 'arere'
      export default defineAction({
        name: 'test',
        description: 'Test action',
        async run({ tui }) {
          const name = await tui.prompt.text('Enter name', {
            arg: 'name',
            argShort: 'n',
            description: 'Your name',
          })
        }
      })
    `
    const filePath = createTempFile(content)
    try {
      const result = analyzeActionArgs(filePath)
      expect(result).not.toBeNull()
      expect(result?.name).toBe('test')
      expect(result?.description).toBe('Test action')
      expect(result?.args).toHaveLength(1)
      expect(result?.args[0]).toMatchObject({
        type: 'text',
        name: 'name',
        short: 'n',
        description: 'Your name',
        message: 'Enter name',
      })
    } finally {
      cleanupTempFile(filePath)
    }
  })

  it('should extract select prompt with static choices', () => {
    const content = `
      import { defineAction } from 'arere'
      export default defineAction({
        name: 'deploy',
        async run({ tui }) {
          const target = await tui.prompt.select('Target', ['staging', 'production'], {
            arg: 'target',
            argShort: 't',
          })
        }
      })
    `
    const filePath = createTempFile(content)
    try {
      const result = analyzeActionArgs(filePath)
      expect(result?.args).toHaveLength(1)
      expect(result?.args[0]).toMatchObject({
        type: 'select',
        name: 'target',
        short: 't',
        choices: ['staging', 'production'],
      })
    } finally {
      cleanupTempFile(filePath)
    }
  })

  it('should mark dynamic choices as null', () => {
    const content = `
      import { defineAction } from 'arere'
      export default defineAction({
        name: 'deploy',
        async run({ tui }) {
          const targets = await fetchTargets()
          const target = await tui.prompt.select('Target', targets, {
            arg: 'target',
          })
        }
      })
    `
    const filePath = createTempFile(content)
    try {
      const result = analyzeActionArgs(filePath)
      expect(result?.args).toHaveLength(1)
      expect(result?.args[0].choices).toBeNull()
    } finally {
      cleanupTempFile(filePath)
    }
  })

  it('should extract confirm prompt', () => {
    const content = `
      import { defineAction } from 'arere'
      export default defineAction({
        name: 'test',
        async run({ tui }) {
          const yes = await tui.prompt.confirm('Continue?', {
            arg: 'yes',
            argShort: 'y',
          })
        }
      })
    `
    const filePath = createTempFile(content)
    try {
      const result = analyzeActionArgs(filePath)
      expect(result?.args).toHaveLength(1)
      expect(result?.args[0]).toMatchObject({
        type: 'confirm',
        name: 'yes',
        short: 'y',
      })
    } finally {
      cleanupTempFile(filePath)
    }
  })

  it('should extract number prompt with argIndex', () => {
    const content = `
      import { defineAction } from 'arere'
      export default defineAction({
        name: 'test',
        async run({ tui }) {
          const port = await tui.prompt.number('Port', {
            argIndex: 0,
            description: 'Port number',
          })
        }
      })
    `
    const filePath = createTempFile(content)
    try {
      const result = analyzeActionArgs(filePath)
      expect(result?.args).toHaveLength(1)
      expect(result?.args[0]).toMatchObject({
        type: 'number',
        index: 0,
        description: 'Port number',
      })
    } finally {
      cleanupTempFile(filePath)
    }
  })

  it('should extract multiple prompts', () => {
    const content = `
      import { defineAction } from 'arere'
      export default defineAction({
        name: 'deploy',
        async run({ tui }) {
          const target = await tui.prompt.select('Target', ['staging', 'production'], {
            arg: 'target',
          })
          const confirmed = await tui.prompt.confirm('Deploy?', {
            arg: 'yes',
          })
        }
      })
    `
    const filePath = createTempFile(content)
    try {
      const result = analyzeActionArgs(filePath)
      expect(result?.args).toHaveLength(2)
      expect(result?.args[0].name).toBe('target')
      expect(result?.args[1].name).toBe('yes')
    } finally {
      cleanupTempFile(filePath)
    }
  })

  it('should ignore prompts without arg mapping', () => {
    const content = `
      import { defineAction } from 'arere'
      export default defineAction({
        name: 'test',
        async run({ tui }) {
          const name = await tui.prompt.text('Enter name')
          const port = await tui.prompt.number('Port', { defaultValue: 3000 })
        }
      })
    `
    const filePath = createTempFile(content)
    try {
      const result = analyzeActionArgs(filePath)
      expect(result?.args).toHaveLength(0)
    } finally {
      cleanupTempFile(filePath)
    }
  })

  it('should return null for invalid file', () => {
    const result = analyzeActionArgs('/nonexistent/file.ts')
    expect(result).toBeNull()
  })
})

describe('formatArgsHelp', () => {
  it('should format basic help text', () => {
    const meta = {
      name: 'deploy',
      description: 'Deploy application',
      args: [
        {
          type: 'select' as const,
          name: 'target',
          short: 't',
          choices: ['staging', 'production'],
          description: 'Deploy target',
        },
        {
          type: 'confirm' as const,
          name: 'yes',
          short: 'y',
          description: 'Skip confirmation',
        },
      ],
    }

    const help = formatArgsHelp(meta)
    expect(help).toContain('deploy')
    expect(help).toContain('Deploy application')
    expect(help).toContain('-t, --target')
    expect(help).toContain('<staging|production>')
    expect(help).toContain('-y, --yes')
    expect(help).toContain('Deploy target')
    expect(help).toContain('Skip confirmation')
  })

  it('should handle dynamic choices', () => {
    const meta = {
      args: [
        {
          type: 'select' as const,
          name: 'target',
          choices: null,
        },
      ],
    }

    const help = formatArgsHelp(meta)
    expect(help).toContain('--target <value>')
  })

  it('should handle positional arguments', () => {
    const meta = {
      args: [
        {
          type: 'text' as const,
          index: 0,
          description: 'Input file',
        },
      ],
    }

    const help = formatArgsHelp(meta)
    expect(help).toContain('[position 0]')
  })

  it('should handle empty args', () => {
    const meta = {
      name: 'test',
      args: [],
    }

    const help = formatArgsHelp(meta)
    expect(help).toContain('No CLI arguments available')
  })
})
