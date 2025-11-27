/**
 * Action-related utility functions for UI components
 */

import type { ActionContext } from '@/domain/action/types'
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

  // plugin:xxx → Use plugin.meta.name
  if (category.startsWith('plugin:')) {
    const pluginName = category.replace('plugin:', '')
    // Get from pluginMeta (if provided)
    if (pluginMeta?.name) {
      return pluginMeta.name
    }
    // Fallback: Infer from plugin name
    return pluginName
      .replace('arere-plugin-', '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
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
