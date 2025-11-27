/**
 * Tests for App component
 *
 * Note: App is the main application component that integrates all hooks and screens.
 * Full integration testing is complex, so we focus on basic rendering and structure.
 */

import type { Action } from '@/domain/action/types.js'
import type { LoadedPlugin } from '@/domain/plugin/types.js'
import type { ArereConfig } from '@/infrastructure/config/schema.js'
import { App } from '@/presentation/ui/App.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('App', () => {
  const mockAction: Action = {
    meta: {
      name: 'test-action',
      description: 'Test action',
    },
    filePath: '/fake/test.ts',
    run: async () => {},
  }

  const mockConfig: ArereConfig = {
    actionsDir: '.arere',
    logLevel: 'info',
    locale: 'en',
  }

  const mockPlugin: LoadedPlugin = {
    meta: {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'Test plugin',
    },
    path: '/fake/plugin-path',
    enabled: true,
    actionPaths: [],
    i18nNamespace: 'test-plugin',
  }

  let onPluginReload: (config: ArereConfig) => Promise<Action[]>
  let onExit: () => void

  beforeEach(() => {
    onPluginReload = vi.fn().mockResolvedValue([])
    onExit = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render with actions', () => {
    const { lastFrame } = render(
      <App
        actions={[mockAction]}
        config={mockConfig}
        plugins={[mockPlugin]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render with empty actions array', () => {
    const { lastFrame } = render(
      <App
        actions={[]}
        config={mockConfig}
        plugins={[mockPlugin]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render with no plugins', () => {
    const { lastFrame } = render(
      <App
        actions={[mockAction]}
        config={mockConfig}
        plugins={[]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should accept onExit callback', () => {
    const { lastFrame } = render(
      <App
        actions={[mockAction]}
        config={mockConfig}
        plugins={[mockPlugin]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    expect(onExit).toBeDefined()
    expect(lastFrame()).toBeTruthy()
  })

  it('should accept onPluginReload callback', () => {
    const { lastFrame } = render(
      <App
        actions={[mockAction]}
        config={mockConfig}
        plugins={[mockPlugin]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    expect(onPluginReload).toBeDefined()
    expect(lastFrame()).toBeTruthy()
  })

  it('should render with multiple actions', () => {
    const actions: Action[] = [
      mockAction,
      { ...mockAction, meta: { ...mockAction.meta, name: 'action-2' } },
      { ...mockAction, meta: { ...mockAction.meta, name: 'action-3' } },
    ]

    const { lastFrame } = render(
      <App
        actions={actions}
        config={mockConfig}
        plugins={[mockPlugin]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render with multiple plugins', () => {
    const plugins: LoadedPlugin[] = [
      mockPlugin,
      { ...mockPlugin, meta: { ...mockPlugin.meta, name: 'plugin-2' } },
    ]

    const { lastFrame } = render(
      <App
        actions={[mockAction]}
        config={mockConfig}
        plugins={plugins}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render with different config', () => {
    const customConfig: ArereConfig = {
      actionsDir: 'custom-actions',
      logLevel: 'debug',
      locale: 'ja',
    }

    const { lastFrame } = render(
      <App
        actions={[mockAction]}
        config={customConfig}
        plugins={[mockPlugin]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should unmount without errors', () => {
    const { unmount } = render(
      <App
        actions={[mockAction]}
        config={mockConfig}
        plugins={[mockPlugin]}
        onPluginReload={onPluginReload}
        onExit={onExit}
      />,
    )

    expect(() => unmount()).not.toThrow()
  })

  describe('Edge Cases', () => {
    it('should handle empty actions array', () => {
      const { lastFrame } = render(
        <App
          actions={[]}
          config={mockConfig}
          plugins={[mockPlugin]}
          onPluginReload={onPluginReload}
          onExit={onExit}
        />,
      )

      // Should show empty state or handle gracefully
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle actions with minimal metadata', () => {
      const minimalAction: Action = {
        meta: {
          name: 'minimal-action',
          description: 'Minimal action',
        },
        filePath: '/fake/minimal.ts',
        run: async () => {},
      }

      const { lastFrame } = render(
        <App
          actions={[minimalAction]}
          config={mockConfig}
          plugins={[mockPlugin]}
          onPluginReload={onPluginReload}
          onExit={onExit}
        />,
      )

      expect(lastFrame()).toBeTruthy()
    })

    it('should handle config with missing optional fields', () => {
      const minimalConfig: ArereConfig = {
        actionsDir: '.arere',
      }

      const { lastFrame } = render(
        <App
          actions={[mockAction]}
          config={minimalConfig}
          plugins={[mockPlugin]}
          onPluginReload={onPluginReload}
          onExit={onExit}
        />,
      )

      expect(lastFrame()).toBeTruthy()
    })

    it('should handle disabled plugins', () => {
      const disabledPlugin: LoadedPlugin = {
        ...mockPlugin,
        enabled: false,
      }

      const { lastFrame } = render(
        <App
          actions={[mockAction]}
          config={mockConfig}
          plugins={[disabledPlugin]}
          onPluginReload={onPluginReload}
          onExit={onExit}
        />,
      )

      expect(lastFrame()).toBeTruthy()
    })

    it('should handle plugin with userConfig', () => {
      const pluginWithConfig: LoadedPlugin = {
        ...mockPlugin,
        userConfig: {
          apiKey: 'test-key',
          timeout: 5000,
        },
      }

      const { lastFrame } = render(
        <App
          actions={[mockAction]}
          config={mockConfig}
          plugins={[pluginWithConfig]}
          onPluginReload={onPluginReload}
          onExit={onExit}
        />,
      )

      expect(lastFrame()).toBeTruthy()
    })
  })
})
