/**
 * Test for PluginRow component
 */

import type { LoadedPlugin } from '@/domain/plugin/types.js'
import { PluginRow } from '@/presentation/ui/screens/settings/components/PluginRow.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

describe('PluginRow', () => {
  const mockPlugin: LoadedPlugin = {
    meta: {
      name: 'arere-plugin-test',
      version: '1.0.0',
      description: 'Test plugin for unit testing',
    },
    path: '/path/to/plugin',
    i18nNamespace: 'arere-plugin-test',
    enabled: true,
    actionPaths: ['./actions/test1.ts', './actions/test2.ts'],
    configSchema: undefined,
    userConfig: {},
  }

  beforeEach(() => {
    // Reset any mocks if needed
  })

  it('should render enabled plugin with green indicator', () => {
    const { lastFrame } = render(<PluginRow plugin={mockPlugin} isSelected={false} />)

    const output = lastFrame()
    expect(output).toContain('[●]')
    expect(output).toContain('arere-plugin-test')
    expect(output).toContain('v1.0.0')
    expect(output).toContain('Test plugin for unit testing')
  })

  it('should render disabled plugin with red indicator', () => {
    const disabledPlugin = { ...mockPlugin, enabled: false }
    const { lastFrame } = render(<PluginRow plugin={disabledPlugin} isSelected={false} />)

    const output = lastFrame()
    expect(output).toContain('[○]')
  })

  it('should show selection indicator when selected', () => {
    const { lastFrame } = render(<PluginRow plugin={mockPlugin} isSelected={true} />)

    const output = lastFrame()
    expect(output).toContain('❯')
  })

  it('should not show selection indicator when not selected', () => {
    const { lastFrame } = render(<PluginRow plugin={mockPlugin} isSelected={false} />)

    const output = lastFrame()
    expect(output).not.toMatch(/❯.*arere-plugin-test/)
  })

  it('should display action count', () => {
    const { lastFrame } = render(<PluginRow plugin={mockPlugin} isSelected={false} />)

    const output = lastFrame()
    // Should show "2個のアクション" or "2 actions"
    expect(output).toMatch(/2.*アクション|action/)
  })

  it('should show configurable indicator when plugin has config schema', () => {
    const configurablePlugin: LoadedPlugin = {
      ...mockPlugin,
      configSchema: {} as any, // Mock schema
    }

    const { lastFrame } = render(<PluginRow plugin={configurablePlugin} isSelected={false} />)

    const output = lastFrame()
    // Should show "設定可能" or "configurable"
    expect(output).toMatch(/設定可能|configurable/)
  })

  it('should not show configurable indicator when plugin has no config schema', () => {
    const { lastFrame } = render(<PluginRow plugin={mockPlugin} isSelected={false} />)

    const output = lastFrame()
    // Should not contain configurable text (beyond action count)
    const lines = output?.split('\n') || []
    const lastLine = lines[lines.length - 1] || ''
    expect(lastLine).not.toMatch(/設定可能|configurable/)
  })

  it('should not display description when plugin has no description', () => {
    const noDescPlugin = {
      ...mockPlugin,
      meta: {
        ...mockPlugin.meta,
        description: undefined,
      },
    }

    const { lastFrame } = render(<PluginRow plugin={noDescPlugin} isSelected={false} />)

    const output = lastFrame()
    expect(output).toContain('arere-plugin-test')
    expect(output).not.toContain('Test plugin')
  })

  it('should render with multiple actions', () => {
    const multiActionPlugin = {
      ...mockPlugin,
      actionPaths: [
        './actions/action1.ts',
        './actions/action2.ts',
        './actions/action3.ts',
        './actions/action4.ts',
        './actions/action5.ts',
      ],
    }

    const { lastFrame } = render(<PluginRow plugin={multiActionPlugin} isSelected={false} />)

    const output = lastFrame()
    expect(output).toMatch(/5.*アクション|action/)
  })

  it('should render selected state with cyan color', () => {
    const { lastFrame } = render(<PluginRow plugin={mockPlugin} isSelected={true} />)

    const output = lastFrame()
    // When selected, the name should be bold and cyan
    // This is hard to test with text output, but we can at least verify the arrow is there
    expect(output).toContain('❯')
    expect(output).toContain('arere-plugin-test')
  })
})
