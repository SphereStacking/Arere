/**
 * Action-related utility functions for UI components
 */

import type { Action, ActionContext } from '@/domain/action/types'
import type { RenderData } from '@/domain/arereRender/types'
import type { PluginMeta } from '@/domain/plugin/types'
import { logger } from '@/shared/utils/logger'

/**
 * Evaluate action description (string or function)
 *
 * @param description - Action description (can be string or function)
 * @param context - Action context for function evaluation
 * @param actionName - Action name for error logging
 * @returns Evaluated description string
 *
 * @example
 * ```typescript
 * // String description
 * const desc1 = evaluateDescription('Simple description', context, 'my-action')
 * // → 'Simple description'
 *
 * // Function description
 * const desc2 = evaluateDescription(({ t }) => t('description'), context, 'my-action')
 * // → Translated description
 * ```
 */
export function evaluateDescription(
  description: string | ((context: ActionContext) => string),
  context: ActionContext,
  actionName: string,
): string {
  try {
    return typeof description === 'function' ? description(context) : description
  } catch (error) {
    logger.warn(`Failed to evaluate description for action "${actionName}":`, error)
    return actionName // Fallback to action name
  }
}

/**
 * Format category label for display
 *
 * @param category - Action category string
 * @param pluginMeta - Optional plugin metadata
 * @returns Formatted category label
 *
 * @example
 * ```typescript
 * formatCategoryLabel('project', undefined)
 * // → 'Project'
 *
 * formatCategoryLabel('plugin:arere-plugin-tutorial', { name: 'Tutorial Plugin' })
 * // → 'Tutorial Plugin'
 *
 * formatCategoryLabel('plugin:arere-plugin-tutorial', undefined)
 * // → 'Tutorial' (fallback)
 * ```
 */
export function formatCategoryLabel(category: string | undefined, pluginMeta?: PluginMeta): string {
  if (!category) return ''

  // project/global
  if (category === 'project') return 'Project'
  if (category === 'global') return 'Global'

  // plugin:xxx → Use plugin.meta.name (with arere-plugin- prefix removed)
  if (category.startsWith('plugin:')) {
    const pluginName = category.replace('plugin:', '')
    // Get display name: prefer pluginMeta.name, fallback to pluginName
    const displayName = pluginMeta?.name ?? pluginName
    // Remove arere-plugin- prefix for cleaner display
    return displayName.replace(/^arere-plugin-/, '')
  }

  return category
}

/**
 * Get category color (uniform for all categories)
 *
 * @returns Background and foreground color names
 *
 * @example
 * ```typescript
 * const { bg, fg } = getCategoryColor()
 * // → { bg: 'bgCyan', fg: 'black' }
 * ```
 */
export function getCategoryColor(): {
  bg: string
  fg: string
} {
  // Uniform color for all categories
  return { bg: 'bgCyan', fg: 'black' }
}

/**
 * Format tags for display (with # prefix)
 */
export function formatTags(tags?: string[]): string {
  if (!tags || tags.length === 0) return ''
  return tags.map((tag) => `#${tag}`).join(' ')
}

/**
 * Options for creating RenderData from an Action
 */
export interface ActionToRenderDataOptions {
  /** Action to convert */
  action: Action
  /** Action context for description evaluation */
  context: ActionContext
  /** Whether the action is selected */
  isSelected?: boolean
  /** Whether the action is bookmarked */
  isBookmarked?: boolean
  /** Bookmark icon to display */
  bookmarkIcon?: string
}

/**
 * Create RenderData from an Action for use with ArereRender
 *
 * @param options - Conversion options
 * @returns RenderData object for ArereRender
 *
 * @example
 * ```typescript
 * const data = actionToRenderData({
 *   action,
 *   context,
 *   isSelected: true,
 *   isBookmarked: false,
 *   bookmarkIcon: '🔖',
 * })
 * // → { selectIcon: '❯ ', name: 'my-action', description: '...', ... }
 * ```
 */
export function actionToRenderData(options: ActionToRenderDataOptions): RenderData {
  const { action, context, isSelected = false, isBookmarked = false, bookmarkIcon = '🔖' } = options

  const description = evaluateDescription(action.meta.description, context, action.meta.name)
  const categoryLabel = formatCategoryLabel(action.meta.category, action.pluginMeta)
  const tagsText = formatTags(action.meta.tags)

  // Determine source type
  let source = ''
  if (action.meta.category?.startsWith('plugin:')) {
    source = 'plugin'
  } else if (action.meta.category === 'global') {
    source = 'global'
  } else if (action.meta.category === 'project') {
    source = 'project'
  }

  return {
    selectIcon: isSelected ? '❯' : '',
    bookmark: isBookmarked ? bookmarkIcon : '',
    category: categoryLabel,
    name: action.meta.name,
    description,
    tags: tagsText,
    plugin: action.pluginMeta?.name ?? '',
    source,
  }
}
