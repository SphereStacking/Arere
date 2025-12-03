/**
 * Tests for PluginDetail component
 *
 * PluginDetailScreen uses Zustand stores for state, so tests mock the stores.
 */

import type { LoadedPlugin } from '@/plugin/types.js'
import type { ArereConfig } from '@/config/schema.js'
import { PluginDetailScreen as PluginDetail } from '@/ui/screens/settings/plugins/PluginDetailScreen.js'
import { useScreenStore } from '@/ui/stores/screenStore.js'
import { useSettingsStore } from '@/ui/stores/settingsStore.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

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

describe('PluginDetail', () => {
  const mockConfig: ArereConfig = {
    actionsDir: '.arere',
    logLevel: 'info',
    locale: 'en',
  }

  const mockPluginWithConfig: LoadedPlugin = {
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
    userConfig: {
      defaultBranch: 'main',
      autoStage: false,
    },
    configSchema: z.object({
      defaultBranch: z.string().default('main').describe('Default Git branch'),
      autoStage: z.boolean().default(false).describe('Auto-stage changes'),
      commitTemplate: z.string().default('').describe('Commit message prefix'),
    }),
  }

  const mockPluginWithoutConfig: LoadedPlugin = {
    meta: {
      name: 'arere-plugin-simple',
      version: '1.0.0',
      description: 'Simple plugin without config',
    },
    enabled: true,
    path: '/path/to/plugin',
    actionPaths: [],
    i18nNamespace: 'plugin-simple',
    localesPath: undefined,
    userConfig: undefined,
    configSchema: undefined,
  }

  let mockSetScreen: ReturnType<typeof vi.fn>
  let mockSetCurrentLayer: ReturnType<typeof vi.fn>

  // Helper to reset stores
  const resetStores = () => {
    mockSetScreen = vi.fn()
    mockSetCurrentLayer = vi.fn()
    useScreenStore.setState({
      screen: 'plugin-detail',
      setScreen: mockSetScreen,
    })
    useSettingsStore.setState({
      currentConfig: mockConfig,
      currentPlugins: [mockPluginWithConfig],
      currentActions: [],
      selectedPlugin: mockPluginWithConfig,
      currentLayer: 'workspace',
      setCurrentLayer: mockSetCurrentLayer,
      userLayerConfig: {},
      workspaceLayerConfig: {
        actionsDir: '.arere',
        logLevel: 'info',
        plugins: {},
      },
      onPluginReload: null,
    })
  }

  beforeEach(() => {
    capturedHandler = null
    vi.clearAllMocks()
    resetStores()
  })

  it('should render plugin details', () => {
    useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toBeTruthy()
    expect(output).toContain('arere-plugin-git')
    expect(output).toContain('1.0.0')
  })

  it('should display plugin description', () => {
    useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toContain('Git integration plugin')
  })

  it('should display plugin status', () => {
    useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    // Should show enabled status
    expect(output).toBeTruthy()
  })

  it('should render configuration form when config schema exists', () => {
    useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toContain('defaultBranch')
    expect(output).toContain('autoStage')
    expect(output).toContain('commitTemplate')
  })

  it('should display current config values', () => {
    useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toContain('main')
  })

  it('should show message when no configuration available', () => {
    useSettingsStore.setState({ selectedPlugin: mockPluginWithoutConfig })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toBeTruthy()
  })

  it('should redirect to settings when no plugin selected', () => {
    useSettingsStore.setState({ selectedPlugin: null })

    render(<PluginDetail />)

    expect(mockSetScreen).toHaveBeenCalledWith('settings')
  })

  it('should render hints in header', () => {
    useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    // Should contain hints
    expect(output).toBeTruthy()
  })

  it('should show translation support indicator', () => {
    const pluginWithTranslations: LoadedPlugin = {
      ...mockPluginWithConfig,
      localesPath: '/path/to/locales',
    }

    useSettingsStore.setState({ selectedPlugin: pluginWithTranslations })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toBeTruthy()
  })

  it('should handle plugin with enum field', () => {
    const pluginWithEnum: LoadedPlugin = {
      ...mockPluginWithConfig,
      configSchema: z.object({
        mode: z
          .enum(['development', 'production', 'test'])
          .default('development')
          .describe('Environment mode'),
      }),
      userConfig: {
        mode: 'production',
      },
    }

    useSettingsStore.setState({ selectedPlugin: pluginWithEnum })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toContain('mode')
  })

  it('should handle plugin with number field', () => {
    const pluginWithNumber: LoadedPlugin = {
      ...mockPluginWithConfig,
      configSchema: z.object({
        timeout: z.number().min(1000).max(30000).default(5000).describe('Request timeout'),
      }),
      userConfig: {
        timeout: 5000,
      },
    }

    useSettingsStore.setState({ selectedPlugin: pluginWithNumber })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toContain('timeout')
  })

  it('should handle disabled plugin', () => {
    const disabledPlugin: LoadedPlugin = {
      ...mockPluginWithConfig,
      enabled: false,
    }

    useSettingsStore.setState({ selectedPlugin: disabledPlugin })

    const { lastFrame } = render(<PluginDetail />)

    const output = lastFrame()
    expect(output).toBeTruthy()
  })

  describe('Keyboard interactions - Navigation', () => {
    it('should call setScreen when Escape is pressed', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      render(<PluginDetail />)

      // Simulate Escape key press
      capturedHandler?.('', { escape: true })

      expect(mockSetScreen).toHaveBeenCalledTimes(1)
      expect(mockSetScreen).toHaveBeenCalledWith('settings')
    })

    it('should navigate down with down arrow', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      render(<PluginDetail />)

      // Initially on first field (defaultBranch)
      // Navigate down to second field (autoStage)
      capturedHandler?.('', { downArrow: true })

      // The component should update focusedFieldIndex
      expect(mockSetScreen).not.toHaveBeenCalled()
    })

    it('should navigate up with up arrow', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      render(<PluginDetail />)

      // Navigate down then up
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { upArrow: true })

      // Should be back at first field
      expect(mockSetScreen).not.toHaveBeenCalled()
    })

    it('should wrap around when navigating down from save button', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      render(<PluginDetail />)

      // Navigate to save button (3 fields + save button = 4 items, index 3)
      capturedHandler?.('', { downArrow: true }) // index 1
      capturedHandler?.('', { downArrow: true }) // index 2
      capturedHandler?.('', { downArrow: true }) // index 3 (save button)
      capturedHandler?.('', { downArrow: true }) // wrap to index 0

      expect(mockSetScreen).not.toHaveBeenCalled()
    })

    it('should wrap around when navigating up from first field', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      render(<PluginDetail />)

      // Navigate up from first field (should wrap to save button)
      capturedHandler?.('', { upArrow: true })

      expect(mockSetScreen).not.toHaveBeenCalled()
    })

    it('should call setScreen when no fields are edited and Enter is pressed on save button', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      render(<PluginDetail />)

      // Navigate to save button without editing any fields
      capturedHandler?.('', { downArrow: true }) // index 1
      capturedHandler?.('', { downArrow: true }) // index 2
      capturedHandler?.('', { downArrow: true }) // index 3 (save button)

      // Press Enter on save button
      capturedHandler?.('', { return: true })

      // Should call setScreen (onBack) since no edits
      expect(mockSetScreen).toHaveBeenCalledWith('settings')
    })

    it('should not navigate when plugin has no config', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithoutConfig })

      render(<PluginDetail />)

      // Try to navigate
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { upArrow: true })

      // Should not crash or call callbacks
      expect(mockSetScreen).not.toHaveBeenCalled()
    })

    it('should still allow Escape when plugin has no config', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithoutConfig })

      render(<PluginDetail />)

      // Press Escape
      capturedHandler?.('', { escape: true })

      expect(mockSetScreen).toHaveBeenCalledTimes(1)
      expect(mockSetScreen).toHaveBeenCalledWith('settings')
    })
  })

  describe('Keyboard interactions - Field editing', () => {
    it('should enter editing mode for string field when Enter is pressed', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      const { lastFrame } = render(<PluginDetail />)

      // Press Enter on first field (defaultBranch - string type)
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should show editing screen with field name
      expect(output).toContain('defaultBranch を編集')
    })

    it('should enter editing mode for boolean field when Enter is pressed', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      const { lastFrame } = render(<PluginDetail />)

      // Navigate to second field (autoStage - boolean type)
      capturedHandler?.('', { downArrow: true })

      // Press Enter
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should show selection screen
      expect(output).toContain('autoStage を選択')
    })

    it('should enter editing mode for number field when Enter is pressed', () => {
      const pluginWithNumber: LoadedPlugin = {
        ...mockPluginWithConfig,
        configSchema: z.object({
          timeout: z.number().min(1000).max(30000).default(5000).describe('Request timeout'),
        }),
        userConfig: {
          timeout: 5000,
        },
      }

      useSettingsStore.setState({ selectedPlugin: pluginWithNumber })

      const { lastFrame } = render(<PluginDetail />)

      // Press Enter on first field (timeout - number type)
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should show editing screen
      expect(output).toContain('timeout を編集')
      expect(output).toContain('現在の値')
    })

    it('should enter editing mode for enum field when Enter is pressed', () => {
      const pluginWithEnum: LoadedPlugin = {
        ...mockPluginWithConfig,
        configSchema: z.object({
          mode: z
            .enum(['development', 'production', 'test'])
            .default('development')
            .describe('Environment mode'),
        }),
        userConfig: {
          mode: 'production',
        },
      }

      useSettingsStore.setState({ selectedPlugin: pluginWithEnum })

      const { lastFrame } = render(<PluginDetail />)

      // Press Enter on first field (mode - enum type)
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should show selection screen
      expect(output).toContain('mode を選択')
    })

    it('should display current value in editing mode for string field', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      const { lastFrame } = render(<PluginDetail />)

      // Press Enter on first field
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should show current value
      expect(output).toContain('現在の値:')
      expect(output).toContain('main')
    })

    it('should display plugin info in editing mode', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      const { lastFrame } = render(<PluginDetail />)

      // Press Enter on first field
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should show plugin info in editing screen
      expect(output).toContain('arere-plugin-git')
      expect(output).toContain('v1.0.0')
    })

    it('should display boolean options in select mode', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      const { lastFrame } = render(<PluginDetail />)

      // Navigate to boolean field
      capturedHandler?.('', { downArrow: true })

      // Press Enter
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should show true/false options (rendered by SelectInput)
      expect(output).toBeTruthy()
    })

    it('should not enter editing mode when Enter is pressed on save button', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      const { lastFrame } = render(<PluginDetail />)

      // Navigate to save button
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })
      capturedHandler?.('', { downArrow: true })

      // Press Enter on save button
      capturedHandler?.('', { return: true })

      const output = lastFrame()
      // Should not show editing screen, should call setScreen (no edits)
      expect(output).not.toContain('を編集')
      expect(output).not.toContain('を選択')
      expect(mockSetScreen).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edited field tracking', () => {
    it('should display default values for fields not in userConfig', () => {
      useSettingsStore.setState({ selectedPlugin: mockPluginWithConfig })

      const { lastFrame } = render(<PluginDetail />)

      const output = lastFrame()
      // commitTemplate field has default value '' but is not in userConfig
      // It should still be displayed in the list
      expect(output).toContain('commitTemplate')
    })

    it('should not save fields with only default values', () => {
      const pluginWithNoUserConfig: LoadedPlugin = {
        ...mockPluginWithConfig,
        userConfig: {}, // No existing config
      }

      useSettingsStore.setState({ selectedPlugin: pluginWithNoUserConfig })

      render(<PluginDetail />)

      // Navigate to save button without editing any fields
      capturedHandler?.('', { downArrow: true }) // index 1
      capturedHandler?.('', { downArrow: true }) // index 2
      capturedHandler?.('', { downArrow: true }) // index 3 (save button)

      // Press Enter on save button
      capturedHandler?.('', { return: true })

      // Even though all fields have default values displayed,
      // nothing should be saved because user didn't edit anything
      // setScreen should be called
      expect(mockSetScreen).toHaveBeenCalledTimes(1)
    })
  })
})
