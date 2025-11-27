import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { loadKeybindingsLayer, loadMergedKeybindings } from '@/infrastructure/keybindings/manager'
import { defaultKeyBindings } from '@/infrastructure/keybindings/defaults'

describe('loadKeybindingsLayer', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arere-keybindings-test-'))
    // Create .arere directory
    fs.mkdirSync(path.join(tempDir, '.arere'), { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should return null if file does not exist', () => {
    const result = loadKeybindingsLayer('workspace', tempDir)
    expect(result).toBeNull()
  })

  it('should load and parse keybindings file', () => {
    const keybindingsPath = path.join(tempDir, '.arere', 'keybindings.json')
    fs.writeFileSync(
      keybindingsPath,
      JSON.stringify({
        global: {
          exit: [{ key: 'ctrl+q' }],
        },
      })
    )

    const result = loadKeybindingsLayer('workspace', tempDir)
    expect(result).toEqual({
      global: {
        exit: [{ key: 'q', ctrl: true }],
      },
    })
  })

  it('should parse multiple keybindings', () => {
    const keybindingsPath = path.join(tempDir, '.arere', 'keybindings.json')
    fs.writeFileSync(
      keybindingsPath,
      JSON.stringify({
        list: {
          up: [{ key: 'up' }, { key: 'k' }],
          down: [{ key: 'down' }, { key: 'j' }],
        },
      })
    )

    const result = loadKeybindingsLayer('workspace', tempDir)
    expect(result).toEqual({
      list: {
        up: [{ key: 'upArrow' }, { key: 'k' }],
        down: [{ key: 'downArrow' }, { key: 'j' }],
      },
    })
  })

  it('should return null for invalid JSON', () => {
    const keybindingsPath = path.join(tempDir, '.arere', 'keybindings.json')
    fs.writeFileSync(keybindingsPath, 'invalid json')

    const result = loadKeybindingsLayer('workspace', tempDir)
    expect(result).toBeNull()
  })
})

describe('loadMergedKeybindings', () => {
  let tempDir: string
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arere-keybindings-test-'))
    fs.mkdirSync(path.join(tempDir, '.arere'), { recursive: true })
    originalEnv = { ...process.env }
    // Override paths to use temp directory
    process.env.ARERE_USER_KEYBINDINGS = path.join(tempDir, 'user-keybindings.json')
    process.env.ARERE_WORKSPACE_KEYBINDINGS = path.join(tempDir, '.arere', 'keybindings.json')
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
    process.env = originalEnv
  })

  it('should return defaults if no config files exist', () => {
    const result = loadMergedKeybindings(tempDir)
    expect(result).toEqual(defaultKeyBindings)
  })

  it('should merge user config with defaults', () => {
    fs.writeFileSync(
      process.env.ARERE_USER_KEYBINDINGS!,
      JSON.stringify({
        global: {
          exit: [{ key: 'ctrl+q' }],
        },
      })
    )

    const result = loadMergedKeybindings(tempDir)
    expect(result.global.exit).toEqual([{ key: 'q', ctrl: true }])
    // Other settings should be default
    expect(result.global.search).toEqual(defaultKeyBindings.global.search)
    expect(result.list).toEqual(defaultKeyBindings.list)
  })

  it('should override user config with workspace config', () => {
    // User config
    fs.writeFileSync(
      process.env.ARERE_USER_KEYBINDINGS!,
      JSON.stringify({
        global: {
          exit: [{ key: 'ctrl+q' }],
        },
        list: {
          up: [{ key: 'k' }],
        },
      })
    )

    // Workspace config (overrides user)
    fs.writeFileSync(
      process.env.ARERE_WORKSPACE_KEYBINDINGS!,
      JSON.stringify({
        global: {
          exit: [{ key: 'ctrl+w' }],
        },
      })
    )

    const result = loadMergedKeybindings(tempDir)
    // Workspace overrides user
    expect(result.global.exit).toEqual([{ key: 'w', ctrl: true }])
    // User config still applies for list.up (not overridden by workspace)
    expect(result.list.up).toEqual([{ key: 'k' }])
  })

  it('should handle partial configs correctly (replacement strategy)', () => {
    fs.writeFileSync(
      process.env.ARERE_USER_KEYBINDINGS!,
      JSON.stringify({
        list: {
          up: [{ key: 'k' }], // Only 'k', no arrow key
        },
      })
    )

    const result = loadMergedKeybindings(tempDir)
    // list.up is completely replaced (not merged)
    expect(result.list.up).toEqual([{ key: 'k' }])
    // list.down is still default
    expect(result.list.down).toEqual(defaultKeyBindings.list.down)
  })
})
