import type { Action } from '@/action/types'
import type { BookmarkId } from './types'

/**
 * Creates a bookmark ID from an action
 *
 * @param action - The action to create a bookmark ID for
 * @returns The bookmark ID in format `{source}:{name}`
 */
export function createBookmarkId(action: Action): BookmarkId {
  const { location, meta } = action
  const name = meta.name

  // Plugin action
  if (location && typeof location === 'object' && 'plugin' in location) {
    return `${location.plugin}:${name}` as BookmarkId
  }

  // Local action (project, global, or undefined)
  return `local:${name}` as BookmarkId
}

/**
 * Parses a bookmark ID into its components
 *
 * @param id - The bookmark ID to parse
 * @returns Object with plugin (null for local) and name
 */
export function parseBookmarkId(id: BookmarkId): {
  plugin: string | null
  name: string
} {
  const colonIndex = id.indexOf(':')

  if (colonIndex === -1) {
    return { plugin: null, name: id }
  }

  const source = id.slice(0, colonIndex)
  const name = id.slice(colonIndex + 1)

  if (source === 'local') {
    return { plugin: null, name }
  }

  return { plugin: source, name }
}

/**
 * Checks if an action is bookmarked
 *
 * @param action - The action to check
 * @param bookmarks - Array of bookmark IDs
 * @returns True if the action is bookmarked
 */
export function isBookmarked(action: Action, bookmarks: BookmarkId[]): boolean {
  const id = createBookmarkId(action)
  return bookmarks.includes(id)
}
