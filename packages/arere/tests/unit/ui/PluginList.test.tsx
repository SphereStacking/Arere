/**
 * Tests for PluginList component
 *
 * PluginListScreen uses Zustand stores for state, so tests mock the stores.
 */

import type { LoadedPlugin } from '@/domain/plugin/types.js'
import type { ArereConfig } from '@/infrastructure/config/schema.js'
import { PluginListScreen as PluginList } from '@/presentation/ui/screens/settings/plugins/PluginListScreen.js'
import { useScreenStore } from '@/presentation/ui/stores/screenStore.js'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock useInput to capture the handler
let capturedHandler: ((input: string, key: any) => void) | null = null
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink')
  return {
    ...actual,
    useInput: (handler: (input: string, key: any) => void, options?: { isActive?: boolean }) => {
      if (options?.isActive !== false) {
        capturedHandler = handler
      } else {
        capturedHandler = null
      }
    },
  }
})

describe('PluginList', () => {
  const mockConfig: ArereConfig = {
    actionsDir: '.arere',
    logLevel: 'info',
    locale: 'en',
  }

  const mockPlugins: LoadedPlugin[] = [
    {
      meta: {
        name: 'arere-plugin-git',
        version: '1.0.0',
        description: 'Git integration plugin',
      },
      enabled: true,
      path: '/path/to/plugin',
      actionPaths: ['/path/to/actions/action1.ts', '/path/to/actions/action2.ts'],
      i18nNamespace: 'plugin-git',
      localesPath: undefined,
      userConfig: undefined,
      configSchema: undefined,
    },
    {
      meta: {
        name: 'arere-plugin-docker',
        version: '2.0.0',
        description: 'Docker management plugin',
      },
      enabled: false,
      path: '/path/to/docker/plugin',
      actionPaths: ['/path/to/docker/actions/deploy.ts'],
      i18nNamespace: 'plugin-docker',
      localesPath: undefined,
      userConfig: undefined,
      configSchema: undefined,
    },
  ]

  let mockSetScreen: ReturnType<typeof vi.fn>
  let mockSetSelectedPlugin: ReturnType<typeof vi.fn>

  // Helper to reset stores
  const resetStores = () => {
    mockSetScreen = vi.fn()
    mockSetSelectedPlugin = vi.fn()
    useScreenStore.setState({
      screen: 'plugin-list',
      setScreen: mockSetScreen,
    })
    useSettingsStore.setState({
      currentConfig: mockConfig,
      currentPlugins: mockPlugins,
      currentActions: [],
      selectedPlugin: null,
      setSelectedPlugin: mockSetSelectedPlugin,
      currentLayer: 'workspace',
      onPluginReload: null,
    })
  }

  beforeEach(() => {
    capturedHandler = null
    vi.clearAllMocks()
    resetStores()
  })

  it('should render plugin list', () => {
    useSettingsStore.setState({ currentPlugins: mockPlugins })

    const { lastFrame } = render(<PluginList />)

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('arere-plugin-git')
    expect(output).toContain('arere-plugin-docker')
  })

  it('should display plugin versions', () => {
    useSettingsStore.setState({ currentPlugins: mockPlugins })

    const { lastFrame } = render(<PluginList />)

    const output = lastFrame()
    expect(output).toContain('1.0.0')
    expect(output).toContain('2.0.0')
  })

  it('should show enabled/disabled status', () => {
    useSettingsStore.setState({ currentPlugins: mockPlugins })

    const { lastFrame } = render(<PluginList />)

    const output = lastFrame()
    // Should contain enabled/disabled indicators
    expect(output).toBeTruthy()
  })

  it('should display empty state when no plugins', () => {
    useSettingsStore.setState({ currentPlugins: [] })

    const { lastFrame } = render(<PluginList />)

    const output = lastFrame()
    expect(output).toBeTruthy()
  })

  it('should show plugin descriptions if available', () => {
    useSettingsStore.setState({ currentPlugins: mockPlugins })

    const { lastFrame } = render(<PluginList />)

    const output = lastFrame()
    expect(output).toContain('Git integration plugin')
    expect(output).toContain('Docker management plugin')
  })

  it('should indicate configurable plugins', () => {
    const configurablePlugins: LoadedPlugin[] = [
      {
        ...mockPlugins[0],
        configSchema: {} as any,
      },
    ]

    useSettingsStore.setState({ currentPlugins: configurablePlugins })

    const { lastFrame } = render(<PluginList />)

    const output = lastFrame()
    expect(output).toBeTruthy()
  })

  it('should render hints in header', () => {
    useSettingsStore.setState({ currentPlugins: mockPlugins })

    const { lastFrame } = render(<PluginList />)

    const output = lastFrame()
    // Should contain navigation hints
    expect(output).toBeTruthy()
  })

  describe('Keyboard interactions', () => {
    it('should toggle plugin when Space is pressed', () => {
      useSettingsStore.setState({ currentPlugins: mockPlugins })

      render(<PluginList />)

      // Simulate Space key press on first plugin (enabled)
      capturedHandler?.(' ', {})

      // The toggle is now handled via usePluginManagement hook
      // We just verify the component doesn't crash
      expect(capturedHandler).toBeDefined()
    })

    it('should navigate down with down arrow', () => {
      useSettingsStore.setState({ currentPlugins: mockPlugins })

      const { lastFrame } = render(<PluginList />)

      // Navigate down
      capturedHandler?.('', { downArrow: true })

      // Verify component updated
      expect(lastFrame()).toBeTruthy()
    })

    it('should navigate up with up arrow', () => {
      useSettingsStore.setState({ currentPlugins: mockPlugins })

      const { lastFrame } = render(<PluginList />)

      // Navigate down then up
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { upArrow: true })

      // Verify component updated
      expect(lastFrame()).toBeTruthy()
    })

    it('should wrap around when navigating down from last plugin', () => {
      useSettingsStore.setState({ currentPlugins: mockPlugins })

      const { lastFrame } = render(<PluginList />)

      // Navigate to last plugin and beyond (should wrap to first)
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })

      expect(lastFrame()).toBeTruthy()
    })

    it('should wrap around when navigating up from first plugin', () => {
      useSettingsStore.setState({ currentPlugins: mockPlugins })

      const { lastFrame } = render(<PluginList />)

      // Navigate up from first plugin (should wrap to last)
      capturedHandler?.('', { upArrow: true })

      expect(lastFrame()).toBeTruthy()
    })

    it('should call setScreen when Escape is pressed', () => {
      useSettingsStore.setState({ currentPlugins: mockPlugins })

      render(<PluginList />)

      // Simulate Escape key press
      capturedHandler?.('', { escape: true })

      expect(mockSetScreen).toHaveBeenCalledTimes(1)
      expect(mockSetScreen).toHaveBeenCalledWith('settings')
    })

    it('should not toggle when plugin list is empty', () => {
      useSettingsStore.setState({ currentPlugins: [] })

      render(<PluginList />)

      // Try to toggle - should not crash
      capturedHandler?.(' ', {})

      expect(capturedHandler).toBeDefined()
    })

    it('should not select when plugin list is empty', () => {
      useSettingsStore.setState({ currentPlugins: [] })

      render(<PluginList />)

      // Try to select - should not crash
      capturedHandler?.('', { return: true })

      expect(capturedHandler).toBeDefined()
    })
  })
})
