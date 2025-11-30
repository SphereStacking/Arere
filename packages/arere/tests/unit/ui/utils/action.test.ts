import type { Action, ActionContext, TuiAPI } from '@/domain/action/types'
import { actionToRenderData, formatTags } from '@/presentation/ui/utils/action'
import { describe, expect, it } from 'vitest'

describe('formatTags', () => {
  it('formats tags with # prefix', () => {
    expect(formatTags(['git', 'dev'])).toBe('#git #dev')
  })

  it('returns empty string for empty array', () => {
    expect(formatTags([])).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatTags(undefined)).toBe('')
  })

  it('formats single tag', () => {
    expect(formatTags(['single'])).toBe('#single')
  })
})

describe('actionToRenderData', () => {
  const createMockAction = (overrides: Partial<Action> = {}): Action => ({
    meta: {
      name: 'test-action',
      description: 'Test description',
      category: 'project',
      tags: ['test', 'dev'],
      ...overrides.meta,
    },
    filePath: '/test/action.ts',
    run: async () => {},
    ...overrides,
  })

  const createMockContext = (): ActionContext => ({
    t: (key: string) => key,
    $: async () => ({ stdout: '', stderr: '', exitCode: 0 }),
    tui: {} as TuiAPI,
    env: {},
    cwd: '/test',
    config: {},
    pluginConfig: {},
    args: [],
  })

  it('creates RenderData with selectIcon for selected item', () => {
    const action = createMockAction()
    const context = createMockContext()

    const result = actionToRenderData({
      action,
      context,
      isSelected: true,
    })

    expect(result.selectIcon).toBe('❯')
  })

  it('creates RenderData with empty selectIcon for non-selected item', () => {
    const action = createMockAction()
    const context = createMockContext()

    const result = actionToRenderData({
      action,
      context,
      isSelected: false,
    })

    expect(result.selectIcon).toBe('')
  })

  it('includes bookmark icon when bookmarked', () => {
    const action = createMockAction()
    const context = createMockContext()

    const result = actionToRenderData({
      action,
      context,
      isBookmarked: true,
      bookmarkIcon: '⭐',
    })

    expect(result.bookmark).toBe('⭐')
  })

  it('excludes bookmark icon when not bookmarked', () => {
    const action = createMockAction()
    const context = createMockContext()

    const result = actionToRenderData({
      action,
      context,
      isBookmarked: false,
    })

    expect(result.bookmark).toBe('')
  })

  it('formats category label for project actions', () => {
    const action = createMockAction({ meta: { name: 'test', description: 'Test', category: 'project' } })
    const context = createMockContext()

    const result = actionToRenderData({ action, context })

    expect(result.category).toBe('Project')
    expect(result.source).toBe('project')
  })

  it('formats category label for global actions', () => {
    const action = createMockAction({ meta: { name: 'test', description: 'Test', category: 'global' } })
    const context = createMockContext()

    const result = actionToRenderData({ action, context })

    expect(result.category).toBe('Global')
    expect(result.source).toBe('global')
  })

  it('formats category label for plugin actions', () => {
    const action = createMockAction({
      meta: { name: 'test', description: 'Test', category: 'plugin:arere-plugin-demo' },
      pluginMeta: { name: 'Demo Plugin', description: 'Demo' },
    })
    const context = createMockContext()

    const result = actionToRenderData({ action, context })

    expect(result.category).toBe('Demo Plugin')
    expect(result.source).toBe('plugin')
    expect(result.plugin).toBe('Demo Plugin')
  })

  it('includes action name', () => {
    const action = createMockAction({ meta: { name: 'my-action', description: 'Test' } })
    const context = createMockContext()

    const result = actionToRenderData({ action, context })

    expect(result.name).toBe('my-action')
  })

  it('includes description', () => {
    const action = createMockAction({ meta: { name: 'test', description: 'My description' } })
    const context = createMockContext()

    const result = actionToRenderData({ action, context })

    expect(result.description).toBe('My description')
  })

  it('formats tags with # prefix', () => {
    const action = createMockAction({ meta: { name: 'test', description: 'Test', tags: ['git', 'dev'] } })
    const context = createMockContext()

    const result = actionToRenderData({ action, context })

    expect(result.tags).toBe('#git #dev')
  })

  it('handles action with no tags', () => {
    const action = createMockAction({ meta: { name: 'test', description: 'Test', tags: undefined } })
    const context = createMockContext()

    const result = actionToRenderData({ action, context })

    expect(result.tags).toBe('')
  })
})
