/**
 * Tests for ScreenRouter component
 *
 * ScreenRouter uses Zustand stores for state, so tests mock the stores.
 * ScreenRouter no longer takes props - all screens get their state from stores.
 */

import type { Action } from '@/action/types.js'
import type { LoadedPlugin } from '@/plugin/types.js'
import { defaultConfig, type ArereConfig } from '@/config/schema.js'
import type { PromptRequest } from '@/ui/prompts/renderer.js'
import { ScreenRouter } from '@/ui/routing/ScreenRouter.js'
import { useExecutionStore } from '@/ui/stores/executionStore.js'
import { usePromptStore } from '@/ui/stores/promptStore.js'
import { useScreenStore } from '@/ui/stores/screenStore.js'
import { useSettingsStore } from '@/ui/stores/settingsStore.js'
import type { ScreenState } from '@/ui/types.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('ScreenRouter', () => {
  const mockAction: Action = {
    meta: {
      name: 'test-action',
      description: 'Test action',
    },
    filePath: '/fake/test.ts',
    run: async () => {},
  }

  const mockConfig: ArereConfig = {
    ...defaultConfig,
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
    enabled: true,
    path: '/fake/plugin',
    actionPaths: [],
    i18nNamespace: 'test-plugin',
  }

  // Helper to reset stores to default state
  const resetStores = () => {
    useScreenStore.setState({
      screen: 'list',
      setScreen: vi.fn(),
    })

    useSettingsStore.setState({
      currentConfig: mockConfig,
      currentPlugins: [mockPlugin],
      currentActions: [mockAction],
      selectedPlugin: null,
      currentLayer: 'workspace',
      setCurrentLayer: vi.fn(),
      userLayerConfig: null,
      workspaceLayerConfig: null,
      onPluginReload: null,
    })

    useExecutionStore.setState({
      selectedAction: null,
      executionError: null,
      executionDuration: 0,
      outputMessages: [],
      visualFeedback: {},
    })

    usePromptStore.setState({
      promptRequest: null,
      promptResolver: null,
      submitPrompt: vi.fn(),
      cancelPrompt: vi.fn(),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
  })

  it('should render ActionList for list screen with actions', () => {
    useScreenStore.setState({ screen: 'list' })
    useSettingsStore.setState({ currentActions: [mockAction] })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toContain('test-action')
  })

  it('should render EmptyState for list screen with no actions', () => {
    useScreenStore.setState({ screen: 'list' })
    useSettingsStore.setState({ currentActions: [] })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render FuzzySearch for search screen', () => {
    useScreenStore.setState({ screen: 'search' })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render Help for help screen', () => {
    useScreenStore.setState({ screen: 'help' })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render Settings for settings screen', () => {
    useScreenStore.setState({ screen: 'settings' })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render PluginList for plugin-list screen', () => {
    useScreenStore.setState({ screen: 'plugin-list' })
    useSettingsStore.setState({ currentPlugins: [mockPlugin] })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toContain('test-plugin')
  })

  it('should render PluginDetail for plugin-detail screen with selected plugin', () => {
    useScreenStore.setState({ screen: 'plugin-detail' })
    useSettingsStore.setState({ selectedPlugin: mockPlugin })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should redirect to settings when plugin-detail screen has no selected plugin', () => {
    const setScreen = vi.fn()
    useScreenStore.setState({ screen: 'plugin-detail', setScreen })
    useSettingsStore.setState({ selectedPlugin: null })

    render(<ScreenRouter />)

    // The component should redirect to settings when no plugin is selected
    expect(setScreen).toHaveBeenCalledWith('settings')
  })

  it('should render Executing for executing screen', () => {
    useScreenStore.setState({ screen: 'executing' })
    useExecutionStore.setState({ selectedAction: mockAction })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render Executing with Unknown for executing screen without selected action', () => {
    useScreenStore.setState({ screen: 'executing' })
    useExecutionStore.setState({ selectedAction: null })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render Success for success screen', () => {
    useScreenStore.setState({ screen: 'success' })
    useExecutionStore.setState({
      selectedAction: mockAction,
      executionDuration: 123,
    })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render Error for error screen with error', () => {
    useScreenStore.setState({ screen: 'error' })
    useExecutionStore.setState({ executionError: new Error('Test error') })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render Error for error screen without error', () => {
    useScreenStore.setState({ screen: 'error' })
    useExecutionStore.setState({ executionError: null })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should render PromptRenderer for input screen', () => {
    const promptRequest: PromptRequest = {
      type: 'text',
      message: 'Enter value',
    }
    useScreenStore.setState({ screen: 'input' })
    usePromptStore.setState({ promptRequest })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toContain('Enter value')
  })

  it('should render unknown screen error for invalid screen', () => {
    useScreenStore.setState({ screen: 'invalid' as ScreenState })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
  })

  it('should handle multiple plugins', () => {
    const plugins: LoadedPlugin[] = [
      mockPlugin,
      { ...mockPlugin, meta: { ...mockPlugin.meta, name: 'plugin-2' } },
    ]
    useScreenStore.setState({ screen: 'plugin-list' })
    useSettingsStore.setState({ currentPlugins: plugins })

    const { lastFrame } = render(<ScreenRouter />)

    const frame = lastFrame()
    expect(frame).toContain('test-plugin')
  })
})
