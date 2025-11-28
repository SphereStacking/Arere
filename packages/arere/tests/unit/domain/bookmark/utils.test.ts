import { describe, expect, it } from 'vitest'
import {
  createBookmarkId,
  isBookmarked,
  parseBookmarkId,
} from '@/domain/bookmark/utils'
import type { Action, ActionLocation } from '@/domain/action/types'
import type { BookmarkId } from '@/domain/bookmark/types'

// Helper to create mock action
function createMockAction(
  name: string,
  location: ActionLocation | undefined
): Action {
  return {
    meta: { name, description: 'Test action' },
    filePath: `/test/${name}.ts`,
    location,
    run: async () => {},
  }
}

describe('createBookmarkId', () => {
  it('creates bookmark ID for project action', () => {
    const action = createMockAction('my-script', 'project')
    expect(createBookmarkId(action)).toBe('local:my-script')
  })

  it('creates bookmark ID for global action', () => {
    const action = createMockAction('global-script', 'global')
    expect(createBookmarkId(action)).toBe('local:global-script')
  })

  it('creates bookmark ID for plugin action', () => {
    const action = createMockAction('pomodoro', { plugin: 'arere-plugin-timer' })
    expect(createBookmarkId(action)).toBe('arere-plugin-timer:pomodoro')
  })

  it('creates bookmark ID for action without location (defaults to local)', () => {
    const action = createMockAction('unknown', undefined)
    expect(createBookmarkId(action)).toBe('local:unknown')
  })
})

describe('parseBookmarkId', () => {
  it('parses local bookmark ID', () => {
    const result = parseBookmarkId('local:my-script')
    expect(result).toEqual({ plugin: null, name: 'my-script' })
  })

  it('parses plugin bookmark ID', () => {
    const result = parseBookmarkId('arere-plugin-timer:pomodoro')
    expect(result).toEqual({ plugin: 'arere-plugin-timer', name: 'pomodoro' })
  })

  it('handles action name with colon', () => {
    const result = parseBookmarkId('local:my:script:name')
    expect(result).toEqual({ plugin: null, name: 'my:script:name' })
  })

  it('handles plugin name with colon', () => {
    const result = parseBookmarkId('arere-plugin-timer:action:name')
    expect(result).toEqual({ plugin: 'arere-plugin-timer', name: 'action:name' })
  })
})

describe('isBookmarked', () => {
  const bookmarks: BookmarkId[] = [
    'local:my-script',
    'arere-plugin-timer:pomodoro',
    'local:another-script',
  ]

  it('returns true for bookmarked project action', () => {
    const action = createMockAction('my-script', 'project')
    expect(isBookmarked(action, bookmarks)).toBe(true)
  })

  it('returns true for bookmarked global action', () => {
    const action = createMockAction('my-script', 'global')
    expect(isBookmarked(action, bookmarks)).toBe(true)
  })

  it('returns true for bookmarked plugin action', () => {
    const action = createMockAction('pomodoro', { plugin: 'arere-plugin-timer' })
    expect(isBookmarked(action, bookmarks)).toBe(true)
  })

  it('returns false for non-bookmarked action', () => {
    const action = createMockAction('not-bookmarked', 'project')
    expect(isBookmarked(action, bookmarks)).toBe(false)
  })

  it('returns false for empty bookmarks array', () => {
    const action = createMockAction('my-script', 'project')
    expect(isBookmarked(action, [])).toBe(false)
  })

  it('distinguishes between local and plugin actions with same name', () => {
    const localAction = createMockAction('pomodoro', 'project')
    const pluginAction = createMockAction('pomodoro', {
      plugin: 'arere-plugin-timer',
    })

    // Only plugin action is bookmarked
    expect(isBookmarked(localAction, bookmarks)).toBe(false)
    expect(isBookmarked(pluginAction, bookmarks)).toBe(true)
  })
})
