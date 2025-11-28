/**
 * Configuration schema using Zod
 */

import { z } from 'zod'

/**
 * Configuration schema
 *
 * Note: keyBindings has been moved to a separate file (keybindings.json)
 * See: src/infrastructure/keybindings/manager.ts
 */
export const configSchema = z.object({
  /** Actions directory (defaults to ./.arere) */
  actionsDir: z.string().optional(),

  /** Log level */
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),

  /** Language/locale (en, ja, etc.) */
  locale: z.enum(['en', 'ja']).optional(),

  /** Theme configuration */
  theme: z
    .object({
      /** Primary color for UI */
      primaryColor: z.string().optional(),
    })
    .optional(),

  /** UI configuration */
  ui: z
    .object({
      /** Enable dynamic kaomoji that changes based on app state */
      dynamicKaomoji: z.boolean().optional(),
      /** Bookmark icon displayed in action list */
      bookmarkIcon: z.string().optional(),
    })
    .optional(),

  /** Plugin configuration */
  plugins: z
    .record(
      z.union([
        z.boolean(), // Simple: true (enabled) or false (disabled)
        z.object({
          enabled: z.boolean().default(true),
          config: z.record(z.unknown()).optional(),
        }),
      ]),
    )
    .optional(),

  /** Bookmarked actions (stored as BookmarkId strings) */
  bookmarks: z.array(z.string()).optional(),
})

/**
 * Configuration type
 */
export type ArereConfig = z.infer<typeof configSchema>

/**
 * Default configuration values
 */
export const defaultConfig: ArereConfig = {
  actionsDir: './.arere',
  logLevel: 'info',
  theme: {
    primaryColor: 'green',
  },
  ui: {
    bookmarkIcon: '🔖',
  },
}
