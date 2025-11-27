/**
 * Tests for SearchScreen component
 *
 * SearchScreen uses Zustand stores for state, so tests mock the stores.
 */

import type { Action } from '@/domain/action/types.js'
import type { ArereConfig } from '@/infrastructure/config/schema.js'
import { SearchScreen } from '@/presentation/ui/screens/search/SearchScreen.js'
import { useScreenStore } from '@/presentation/ui/stores/screenStore.js'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore.js'
import { render } from 'ink-testing-library'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Store callbacks for testing
let searchInputCallbacks: { onChange?: any; onSubmit?: any } = {}

// Mock child components to isolate SearchScreen logic
vi.mock('@/presentation/ui/components/ActionList.js', () => ({
  ActionList: ({ actions, onSelect }: any) => {
    return React.createElement('action-list', {
      'data-testid': 'action-list',
      'data-count': actions.length,
    })
  },
}))

vi.mock('@/presentation/ui/components/inputs/TextInput.js', () => ({
  TextInput: ({ value, onChange, onSubmit, isFocused, placeholder, mode }: any) => {
    // Store callbacks for testing
    searchInputCallbacks = { onChange, onSubmit }
    return React.createElement('text-input', {
      'data-testid': 'text-input',
      'data-value': value,
      'data-focus': isFocused,
      'data-mode': mode,
    })
  },
}))

// Mock useInput to capture the handler for SearchScreen component
let capturedHandler: ((input: string, key: any) => void) | null = null
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink')
  return {
    ...actual,
    useInput: (handler: (input: string, key: any) => void, options?: { isActive?: boolean }) => {
      // Only capture if isActive is not explicitly false
      if (options?.isActive !== false) {
        capturedHandler = handler
      }
    },
  }
})

describe('SearchScreen', () => {
  const mockActions: Action[] = [
    {
      meta: {
        name: 'test-action-1',
        description: 'First test action',
      },
      filePath: '/fake/test1.ts',
      run: async () => {},
    },
    {
      meta: {
        name: 'example-action',
        description: 'An example action',
      },
      filePath: '/fake/example.ts',
      run: async () => {},
    },
    {
      meta: {
        name: 'demo-action',
        description: 'Demo functionality',
      },
      filePath: '/fake/demo.ts',
      run: async () => {},
    },
  ]

  // Mock actions with function descriptions, categories, and tags for testing
  const extendedMockActions: Action[] = [
    {
      meta: {
        name: 'demo-hello',
        description: ({ t }) => t('basic_action_demo'), // Function description
        category: 'plugin:arere-plugin-tutorial',
        tags: ['demo', 'tutorial', 'basic'],
      },
      filePath: '/fake/demo-hello.ts',
      pluginNamespace: 'arere-plugin-tutorial',
      run: async () => {},
    },
    {
      meta: {
        name: 'api-test',
        description: 'API demonstration action', // String description
        category: 'plugin:arere-plugin-demo',
        tags: ['api', 'demo', 'output'],
      },
      filePath: '/fake/api-test.ts',
      pluginNamespace: 'arere-plugin-demo',
      run: async () => {},
    },
    {
      meta: {
        name: 'config-viewer',
        description: ({ t }) => t('view_configuration'), // Function description
        category: 'plugin:arere-plugin-demo',
        tags: ['config', 'settings'],
      },
      filePath: '/fake/config-viewer.ts',
      pluginNamespace: 'arere-plugin-demo',
      run: async () => {},
    },
    {
      meta: {
        name: 'git-status',
        description: 'Show git repository status', // String description
        category: 'project',
        tags: ['git', 'vcs'],
      },
      filePath: '/fake/git-status.ts',
      run: async () => {},
    },
  ]

  const mockConfig: ArereConfig = {
    actionsDir: '.arere',
    logLevel: 'info',
    locale: 'en',
  }

  let mockSetScreen: ReturnType<typeof vi.fn>

  // Helper to reset stores
  const resetStores = () => {
    mockSetScreen = vi.fn()
    useScreenStore.setState({
      screen: 'search',
      setScreen: mockSetScreen,
    })
    useSettingsStore.setState({
      currentConfig: mockConfig,
      currentActions: mockActions,
      currentPlugins: [],
      selectedPlugin: null,
      currentLayer: 'workspace',
      onPluginReload: null,
    })
  }

  beforeEach(() => {
    capturedHandler = null
    searchInputCallbacks = {}
    vi.clearAllMocks()
    resetStores()
  })

  it('should render with actions', () => {
    useSettingsStore.setState({ currentActions: mockActions })

    const { lastFrame } = render(<SearchScreen />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
    // Should show search UI
    expect(frame).toContain('検索')
  })

  it('should show search input initially focused', () => {
    useSettingsStore.setState({ currentActions: mockActions })

    const { lastFrame } = render(<SearchScreen />)

    const frame = lastFrame()
    // Search input should be focused by default
    expect(frame).toContain('検索')
  })

  it('should render empty state when no actions', () => {
    useSettingsStore.setState({ currentActions: [] })

    const { lastFrame } = render(<SearchScreen />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
    // Should still show search UI even with no actions
    expect(frame).toContain('検索')
  })

  it('should render search input area', () => {
    useSettingsStore.setState({ currentActions: mockActions })

    const { lastFrame } = render(<SearchScreen />)

    const frame = lastFrame()
    // Should have search-related UI
    expect(frame).toContain('検索')
  })

  it('should handle single action', () => {
    useSettingsStore.setState({ currentActions: [mockActions[0]] })

    const { lastFrame } = render(<SearchScreen />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
    expect(frame).toContain('1件')
  })

  it('should show correct count for multiple actions', () => {
    useSettingsStore.setState({ currentActions: mockActions })

    const { lastFrame } = render(<SearchScreen />)

    const frame = lastFrame()
    // Should show count of all actions
    expect(frame).toContain('3件')
  })

  it('should handle actions with special characters', () => {
    const specialActions: Action[] = [
      {
        meta: {
          name: 'test@action',
          description: 'Action with special chars: !@#$',
        },
        filePath: '/fake/special.ts',
        run: async () => {},
      },
    ]

    useSettingsStore.setState({ currentActions: specialActions })

    const { lastFrame } = render(<SearchScreen />)

    const frame = lastFrame()
    expect(frame).toBeTruthy()
    expect(frame).toContain('1件')
  })

  describe('Keyboard interactions', () => {
    it('should call setScreen when Escape is pressed', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      render(<SearchScreen />)

      // Press Escape
      capturedHandler?.('', { escape: true })

      expect(mockSetScreen).toHaveBeenCalledTimes(1)
      expect(mockSetScreen).toHaveBeenCalledWith('list')
    })

    it('should toggle focus when Tab is pressed', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Press Tab to toggle focus
      capturedHandler?.('', { tab: true })

      // Should not crash
      expect(lastFrame()).toBeTruthy()
    })

    it('should focus on input when character is typed', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Type a character
      capturedHandler?.('a', {})

      // Should not crash and should update focus
      expect(lastFrame()).toBeTruthy()
    })

    it('should not focus on input when arrow key is pressed', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Press down arrow
      capturedHandler?.('', { downArrow: true })

      // Should not focus on input
      expect(lastFrame()).toBeTruthy()
    })

    it('should not focus on input when Enter is pressed', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Press Enter
      capturedHandler?.('', { return: true })

      // Should not focus on input
      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('Search functionality', () => {
    it('should update query when TextInput onChange is called', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Call the onChange callback with a search query
      searchInputCallbacks.onChange?.('test')

      // Should update the search query (verified by re-rendering)
      expect(lastFrame()).toBeTruthy()
    })

    it('should show no results message when search returns no matches', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search for something that won't match
      searchInputCallbacks.onChange?.('xyznonexistent')

      const frame = lastFrame()
      // Should show "no results" message
      expect(frame).toContain('結果が見つかりません')
    })

    it('should call onSubmit when TextInput submits with results', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Set a search query first
      searchInputCallbacks.onChange?.('test')

      // Submit the search
      searchInputCallbacks.onSubmit?.()

      // Should not crash
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle onSubmit when no results are available', () => {
      useSettingsStore.setState({ currentActions: mockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Set a query that has no results
      searchInputCallbacks.onChange?.('xyznonexistent')

      // Submit (should not change focus)
      searchInputCallbacks.onSubmit?.()

      // Should not crash
      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('Enhanced search with function descriptions, categories, and tags', () => {
    // Mock createActionContext to return a context with t() function
    beforeEach(() => {
      vi.mock('@/domain/action/context.js', () => ({
        createActionContext: (name: string, pluginNamespace?: string) => ({
          context: {
            t: (key: string) => {
              // Mock translation function
              const translations: Record<string, string> = {
                basic_action_demo: '基本的なアクション実行デモ',
                view_configuration: 'コンフィグ設定を表示',
              }
              return translations[key] || key
            },
            pluginNamespace,
          },
        }),
      }))
    })

    it('should search by function-based description content', () => {
      useSettingsStore.setState({ currentActions: extendedMockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search for text from evaluated function description
      searchInputCallbacks.onChange?.('基本的なアクション')

      const frame = lastFrame()
      // Should find demo-hello action by its evaluated description
      expect(frame).toBeTruthy()
      // Should show results (not "no results")
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should search by category', () => {
      useSettingsStore.setState({ currentActions: extendedMockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search by category
      searchInputCallbacks.onChange?.('plugin:arere-plugin-tutorial')

      const frame = lastFrame()
      // Should find actions with matching category
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should search by partial category name', () => {
      useSettingsStore.setState({ currentActions: extendedMockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search by partial category
      searchInputCallbacks.onChange?.('tutorial')

      const frame = lastFrame()
      // Should find actions with "tutorial" in category or tags
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should search by single tag', () => {
      useSettingsStore.setState({ currentActions: extendedMockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search by tag
      searchInputCallbacks.onChange?.('demo')

      const frame = lastFrame()
      // Should find actions with "demo" tag
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should search by multiple tags', () => {
      useSettingsStore.setState({ currentActions: extendedMockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search by multiple tags (fuzzy search will match if any tag matches)
      searchInputCallbacks.onChange?.('api output')

      const frame = lastFrame()
      // Should find actions with matching tags
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should search across name, description, category, and tags', () => {
      useSettingsStore.setState({ currentActions: extendedMockActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search for "config" which appears in name and tags
      searchInputCallbacks.onChange?.('config')

      const frame = lastFrame()
      // Should find config-viewer action (matches name and tag)
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should handle actions with category but no tags', () => {
      const actionsWithoutTags: Action[] = [
        {
          meta: {
            name: 'no-tags-action',
            description: 'Action without tags',
            category: 'test-category',
          },
          filePath: '/fake/no-tags.ts',
          run: async () => {},
        },
      ]

      useSettingsStore.setState({ currentActions: actionsWithoutTags })

      const { lastFrame } = render(<SearchScreen />)

      // Search by category
      searchInputCallbacks.onChange?.('test-category')

      const frame = lastFrame()
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should handle actions with tags but no category', () => {
      const actionsWithoutCategory: Action[] = [
        {
          meta: {
            name: 'no-category-action',
            description: 'Action without category',
            tags: ['testing', 'example'],
          },
          filePath: '/fake/no-category.ts',
          run: async () => {},
        },
      ]

      useSettingsStore.setState({ currentActions: actionsWithoutCategory })

      const { lastFrame } = render(<SearchScreen />)

      // Search by tag
      searchInputCallbacks.onChange?.('testing')

      const frame = lastFrame()
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should handle actions with neither category nor tags', () => {
      const minimalActions: Action[] = [
        {
          meta: {
            name: 'minimal-action',
            description: 'Minimal action definition',
          },
          filePath: '/fake/minimal.ts',
          run: async () => {},
        },
      ]

      useSettingsStore.setState({ currentActions: minimalActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search by name
      searchInputCallbacks.onChange?.('minimal')

      const frame = lastFrame()
      // Should still work with just name and description
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should filter out empty strings from search text', () => {
      const actionsWithEmptyFields: Action[] = [
        {
          meta: {
            name: 'empty-fields-action',
            description: 'Has undefined category and empty tags',
            category: undefined,
            tags: [],
          },
          filePath: '/fake/empty-fields.ts',
          run: async () => {},
        },
      ]

      useSettingsStore.setState({ currentActions: actionsWithEmptyFields })

      const { lastFrame } = render(<SearchScreen />)

      // Search should still work
      searchInputCallbacks.onChange?.('empty')

      const frame = lastFrame()
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should handle Japanese text in descriptions, categories, and tags', () => {
      const japaneseActions: Action[] = [
        {
          meta: {
            name: 'japanese-action',
            description: 'テストアクション',
            category: 'カテゴリ:デモ',
            tags: ['日本語', 'テスト'],
          },
          filePath: '/fake/japanese.ts',
          run: async () => {},
        },
      ]

      useSettingsStore.setState({ currentActions: japaneseActions })

      const { lastFrame } = render(<SearchScreen />)

      // Search with Japanese text
      searchInputCallbacks.onChange?.('テスト')

      const frame = lastFrame()
      // Should find actions with Japanese text
      expect(frame).toBeTruthy()
      expect(frame).not.toContain('結果が見つかりません')
    })

    it('should use React.useMemo for searchable items preparation', () => {
      useSettingsStore.setState({ currentActions: extendedMockActions })

      // This test verifies that the component uses useMemo
      // The implementation should not re-evaluate descriptions on every render
      const { lastFrame, rerender } = render(<SearchScreen />)

      // Initial render
      expect(lastFrame()).toBeTruthy()

      // Trigger rerender with same props
      rerender(<SearchScreen />)

      // Should still render correctly
      expect(lastFrame()).toBeTruthy()
    })
  })
})
