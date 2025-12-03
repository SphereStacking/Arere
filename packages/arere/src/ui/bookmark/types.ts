/**
 * Bookmark identifier type
 *
 * Format: `{source}:{actionName}`
 * - Plugin action: `arere-plugin-timer:pomodoro`
 * - Local action: `local:my-script`
 */
export type BookmarkId = `${string}:${string}`
