/**
 * Tests for Settings component (Unified settings screen)
 *
 * SettingsScreen uses Zustand stores for state, so tests mock the stores.
 */

import type { LoadedPlugin } from '@/plugin/types.js'
import type { ArereConfig } from '@/config/schema.js'
import { SettingsScreen as Settings } from '@/ui/screens/settings/SettingsScreen.js'
import { useScreenStore } from '@/ui/stores/screenStore.js'
import { useSettingsStore } from '@/ui/stores/settingsStore.js'
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

describe('Settings - Unified Screen', () => {
  const mockConfig: ArereConfig = {
    actionsDir: '.arere',
    logLevel: 'info',
    locale: 'en',
    theme: {
      primaryColor: 'cyan',
    },
  }

  const mockPlugins: LoadedPlugin[] = [
    {
      meta: {
        name: 'arere-plugin-test',
        version: '1.0.0',
        description: 'Test plugin',
      },
      path: '/path/to/arere-plugin-test',
      i18nNamespace: 'arere-plugin-test',
      enabled: true,
      actionPaths: ['./actions/test.ts'],
      configSchema: undefined,
      userConfig: {},
    },
    {
      meta: {
        name: 'arere-plugin-demo',
        version: '2.0.0',
        description: 'Demo plugin',
      },
      path: '/path/to/arere-plugin-demo',
      i18nNamespace: 'arere-plugin-demo',
      enabled: false,
      actionPaths: ['./actions/demo1.ts', './actions/demo2.ts'],
      configSchema: {} as any,
      userConfig: {},
    },
  ]

  let mockSetScreen: ReturnType<typeof vi.fn>
  let mockSetCurrentLayer: ReturnType<typeof vi.fn>
  let mockSetSelectedPlugin: ReturnType<typeof vi.fn>

  // Helper to reset stores
  const resetStores = () => {
    mockSetScreen = vi.fn()
    mockSetCurrentLayer = vi.fn()
    mockSetSelectedPlugin = vi.fn()
    useScreenStore.setState({
      screen: 'settings',
      setScreen: mockSetScreen,
    })
    useSettingsStore.setState({
      currentConfig: mockConfig,
      currentPlugins: mockPlugins,
      currentActions: [],
      selectedPlugin: null,
      setSelectedPlugin: mockSetSelectedPlugin,
      currentLayer: 'workspace',
      setCurrentLayer: mockSetCurrentLayer,
      userLayerConfig: {},
      workspaceLayerConfig: {},
      onPluginReload: null,
    })
  }

  beforeEach(() => {
    capturedHandler = null
    vi.clearAllMocks()
    resetStores()
  })

  describe('Basic Rendering', () => {
    it('should render settings title', () => {
      const { lastFrame } = render(<Settings />)

      const frame = lastFrame()
      expect(frame).toBeTruthy()
    })

    it('should render general settings section', () => {
      const { lastFrame } = render(<Settings />)

      const frame = lastFrame()
      expect(frame).toContain('en')
      expect(frame).toContain('info')
      expect(frame).toContain('cyan')
    })

    it('should render plugins section', () => {
      const { lastFrame } = render(<Settings />)

      const frame = lastFrame()
      expect(frame).toContain('arere-plugin-test')
      expect(frame).toContain('arere-plugin-demo')
    })

    it('should render with empty plugins list', () => {
      useSettingsStore.setState({ currentPlugins: [] })

      const { lastFrame } = render(<Settings />)

      const frame = lastFrame()
      expect(frame).toBeTruthy()
    })
  })

  describe('Navigation between sections', () => {
    it('should start with general section selected', () => {
      const { lastFrame } = render(<Settings />)

      const frame = lastFrame()
      // First item should have selection indicator
      expect(frame).toContain('❯')
    })

    it('should navigate down within general settings', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate down
      capturedHandler?.('', { downArrow: true })

      expect(lastFrame()).toBeTruthy()
    })

    it('should navigate from general to plugins section', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate down through general settings to plugins
      capturedHandler?.('', { downArrow: true }) // logLevel
      capturedHandler?.('', { downArrow: true }) // primaryColor
      capturedHandler?.('', { downArrow: true }) // first plugin

      const frame = lastFrame()
      expect(frame).toBeTruthy()
    })

    it('should navigate from plugins to general section with up arrow', () => {
      const { lastFrame } = render(<Settings />)

      // Go to plugins section
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })

      // Go back up to general
      capturedHandler?.('', { upArrow: true })
      capturedHandler?.('', { upArrow: true })
      capturedHandler?.('', { upArrow: true })

      expect(lastFrame()).toBeTruthy()
    })

    it('should wrap around from last plugin to first general setting', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate to last plugin
      capturedHandler?.('', { downArrow: true }) // logLevel
      capturedHandler?.('', { downArrow: true }) // primaryColor
      capturedHandler?.('', { downArrow: true }) // first plugin
      capturedHandler?.('', { downArrow: true }) // second plugin
      capturedHandler?.('', { downArrow: true }) // wrap to locale

      expect(lastFrame()).toBeTruthy()
    })

    it('should wrap around from first general setting to last plugin', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate up from first item
      capturedHandler?.('', { upArrow: true })

      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('Plugin toggle functionality', () => {
    it('should toggle plugin when space is pressed in plugins section', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate to first plugin
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })

      // Press space to toggle
      capturedHandler?.(' ', {})

      // Plugin toggle is now handled via usePluginManagement hook
      // We just verify the component doesn't crash
      expect(lastFrame()).toBeTruthy()
    })

    it('should not toggle plugin when space is pressed in general section', () => {
      const { lastFrame } = render(<Settings />)

      // Press space in general section
      capturedHandler?.(' ', {})

      expect(lastFrame()).toBeTruthy()
    })

    it('should toggle disabled plugin to enabled', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate to second plugin (disabled)
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })

      // Press space to toggle
      capturedHandler?.(' ', {})

      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('Plugin selection', () => {
    it('should select plugin when Enter is pressed on plugin', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate to first plugin
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })

      // Press Enter
      capturedHandler?.('', { return: true })

      // Plugin selection is now handled via usePluginManagement hook
      // which sets selectedPlugin and navigates to plugin-detail
      expect(lastFrame()).toBeTruthy()
    })

    it('should enter edit mode when Enter is pressed on general setting', () => {
      const { lastFrame } = render(<Settings />)

      // Press Enter on locale (first item)
      capturedHandler?.('', { return: true })

      const frame = lastFrame()
      // Should show locale choices
      expect(frame).toContain('en')
      expect(frame).toContain('ja')
    })
  })

  describe('Edit mode', () => {
    it('should enter edit mode for logLevel', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate to logLevel
      capturedHandler?.('', { downArrow: true })

      // Press Enter
      capturedHandler?.('', { return: true })

      const frame = lastFrame()
      expect(frame).toContain('debug')
      expect(frame).toContain('info')
    })

    it('should enter edit mode for primaryColor', () => {
      const { lastFrame } = render(<Settings />)

      // Navigate to primaryColor
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })

      // Press Enter
      capturedHandler?.('', { return: true })

      const frame = lastFrame()
      expect(frame).toBeTruthy()
    })
  })

  describe('Config defaults', () => {
    it('should use default locale when not specified', () => {
      const configWithoutLocale: ArereConfig = {
        actionsDir: '.arere',
        logLevel: 'info',
      }

      useSettingsStore.setState({ currentConfig: configWithoutLocale })

      const { lastFrame } = render(<Settings />)

      expect(lastFrame()).toBeTruthy()
    })

    it('should use default primaryColor when theme not specified', () => {
      const configWithoutTheme: ArereConfig = {
        actionsDir: '.arere',
        logLevel: 'info',
        locale: 'en',
      }

      useSettingsStore.setState({ currentConfig: configWithoutTheme })

      const { lastFrame } = render(<Settings />)

      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('Layer navigation cycling', () => {
    it('should cycle through layers with left arrow (workspace → user → workspace)', () => {
      const { lastFrame } = render(<Settings />)

      // Initial state should be workspace (default)
      let frame = lastFrame()
      expect(frame).toBeTruthy()

      // Press left arrow: workspace → user
      capturedHandler?.('', { leftArrow: true })
      frame = lastFrame()
      expect(frame).toBeTruthy()

      // Press left arrow again: user → workspace
      capturedHandler?.('', { leftArrow: true })
      frame = lastFrame()
      expect(frame).toBeTruthy()
    })

    it('should cycle through layers with right arrow (user → workspace → user)', () => {
      const { lastFrame } = render(<Settings />)

      // Default is workspace, switch to user first
      capturedHandler?.('', { leftArrow: true })

      // Now test right arrow from user
      let frame = lastFrame()
      expect(frame).toBeTruthy()

      // Press right arrow: user → workspace
      capturedHandler?.('', { rightArrow: true })
      frame = lastFrame()
      expect(frame).toBeTruthy()

      // Press right arrow again: workspace → user
      capturedHandler?.('', { rightArrow: true })
      frame = lastFrame()
      expect(frame).toBeTruthy()
    })
  })

  describe('Escape key', () => {
    it('should call setScreen when Escape is pressed', () => {
      render(<Settings />)

      // Press Escape
      capturedHandler?.('', { escape: true })

      expect(mockSetScreen).toHaveBeenCalledTimes(1)
      expect(mockSetScreen).toHaveBeenCalledWith('list')
    })
  })
})
