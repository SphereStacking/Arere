/**
 * useBookmark - Hook for bookmark operations on actions
 *
 * Provides convenient methods to check and toggle bookmarks for actions.
 * Uses settingsStore for state and bookmark utils for ID generation.
 */

import type { Action } from '@/action/types'
import { createBookmarkId, isBookmarked as isBookmarkedUtil } from '@/ui/bookmark/utils'
import { useSettingsStore } from '@/ui/stores/settingsStore'

/**
 * Hook for bookmark operations
 *
 * @example
 * ```tsx
 * const { toggle, isBookmarked, getBookmarks } = useBookmark()
 *
 * // Check if an action is bookmarked
 * if (isBookmarked(action)) {
 *   console.log('Bookmarked!')
 * }
 *
 * // Toggle bookmark
 * toggle(action)
 * ```
 */
export function useBookmark() {
  const toggleBookmark = useSettingsStore((s) => s.toggleBookmark)
  const getBookmarks = useSettingsStore((s) => s.getBookmarks)

  /**
   * Toggle bookmark for an action
   */
  const toggle = (action: Action) => {
    const id = createBookmarkId(action)
    toggleBookmark(id)
  }

  /**
   * Check if an action is bookmarked
   */
  const isBookmarked = (action: Action): boolean => {
    const bookmarks = getBookmarks()
    return isBookmarkedUtil(action, bookmarks)
  }

  return {
    toggle,
    isBookmarked,
    getBookmarks,
  }
}
