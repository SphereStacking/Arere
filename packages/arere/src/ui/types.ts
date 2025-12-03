/**
 * UI-related type definitions
 */

import type { Action } from '@/action/types'

/**
 * Screen state type
 */
export type ScreenState =
  | 'list'
  | 'search'
  | 'executing'
  | 'input'
  | 'error'
  | 'success'
  | 'help'
  | 'settings'
  | 'plugin-list'
  | 'plugin-detail'

/**
 * App props
 */
export interface AppProps {
  actions: Action[]
  onExit: () => void
}

/**
 * Page metadata
 */
export interface PageMeta {
  breadcrumb?: string[] // e.g. ['home', 'settings', 'plugins']
  hint?: string // e.g. '↑↓/jk: Move • Enter: Select'
}
