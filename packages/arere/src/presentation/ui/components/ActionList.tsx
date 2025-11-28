/**
 * Action list component with jk navigation support
 *
 * Uses Zustand stores for state and useActionExecution hook for selection.
 * ScrollArea is handled by parent Screen component.
 */

import { createActionContext } from '@/domain/action/context'
import type { Action } from '@/domain/action/types'
import { createBookmarkId, isBookmarked } from '@/domain/bookmark/utils'
import { defaultConfig } from '@/infrastructure/config/schema'
import { useActionExecution } from '@/presentation/ui/hooks/useActionExecution'
import { useConfigManagement } from '@/presentation/ui/hooks/useConfigManagement'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import { evaluateDescription, formatCategoryLabel } from '@/presentation/ui/utils/action'
import { Box, Text, useInput } from 'ink'
import React, { useEffect, useState } from 'react'
import stringWidth from 'string-width'

/** Scroll info for parent ScrollArea */
export interface ActionListScrollInfo {
  selectedIndex: number
  itemHeight: number
}

export interface ActionListProps {
  /** Optional actions to display. If not provided, uses store. */
  actions?: Action[]
  /** Optional custom select handler. If not provided, uses useActionExecution. */
  onSelect?: (action: Action) => void
  /** Callback to notify parent of scroll-related state changes */
  onScrollInfoChange?: (info: ActionListScrollInfo) => void
}

/**
 * Layout constants for ActionList
 */
const LAYOUT = {
  prefix: 2, // "❯ " or "  "
  categoryBrackets: 2, // "[]"
  categoryPadding: 2, // "  " after category
  margin: 4, // Safety margin for terminal
}

/**
 * Format tags for display (with # prefix)
 */
function formatTags(tags?: string[]): string {
  if (!tags || tags.length === 0) return ''
  return tags.map((tag) => `#${tag}`).join(' ')
}

/**
 * Truncate text to fit within maxWidth, adding ellipsis if needed
 */
function truncateText(text: string, maxWidth: number): string {
  if (maxWidth <= 0) return ''
  if (text.length <= maxWidth) return text
  if (maxWidth <= 1) return '…'
  return `${text.slice(0, maxWidth - 1)}…`
}

/** Prepared item data for rendering */
interface ActionItem {
  action: Action
  categoryLabel: string
  maxCategoryLength: number
  maxNameLength: number
  description: string
  tagsText: string
  isBookmarked: boolean
}

export const ActionList: React.FC<ActionListProps> = ({
  actions: propActions,
  onSelect,
  onScrollInfoChange,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { primaryColor, inactiveColor } = useTheme()
  const storeActions = useSettingsStore((s) => s.currentActions)
  const getBookmarks = useSettingsStore((s) => s.getBookmarks)
  const toggleBookmark = useSettingsStore((s) => s.toggleBookmark)
  const currentLayer = useSettingsStore((s) => s.currentLayer)
  const currentConfig = useSettingsStore((s) => s.currentConfig)
  const bookmarkIcon = currentConfig.ui?.bookmarkIcon ?? defaultConfig.ui?.bookmarkIcon ?? '⭐'
  const { runAction } = useActionExecution()
  const { saveConfig } = useConfigManagement()
  const { columns } = useTerminalSize()

  // Use prop actions if provided, otherwise use store
  const rawActions = propActions ?? storeActions
  const handleSelect = onSelect ?? runAction

  // Get current bookmarks
  const bookmarks = getBookmarks()

  // Use actions directly without sorting
  const actions = rawActions

  // Calculate items with memoization to avoid re-evaluation on every render
  const items = React.useMemo((): ActionItem[] => {
    // Calculate the maximum category label length for padding
    const categoryLabels = actions.map((action) =>
      formatCategoryLabel(action.meta.category, action.pluginMeta),
    )
    const maxCategoryLength = Math.max(0, ...categoryLabels.map((label) => label.length))

    // Calculate the maximum name length for padding
    const maxNameLength = Math.max(0, ...actions.map((action) => action.meta.name.length))

    // Available width for content (minus scrollbar width of 1)
    const SCROLLBAR_WIDTH = 1
    // Bookmark icon width: space + icon (auto-calculated)
    const bookmarkIconWidth = 1 + stringWidth(bookmarkIcon)
    const availableWidth = columns - LAYOUT.margin - SCROLLBAR_WIDTH

    // Calculate fixed widths
    // Category width: "[label]" + 2 spaces, or 0 if no categories
    const categoryWidth =
      maxCategoryLength > 0
        ? maxCategoryLength + LAYOUT.categoryBrackets + LAYOUT.categoryPadding
        : 0

    // Line fixed width: prefix + category + name + space before description + bookmark icon
    const fixedWidth = LAYOUT.prefix + categoryWidth + maxNameLength + 1 + bookmarkIconWidth

    // Space available for description + tags
    const descriptionSpace = availableWidth - fixedWidth

    return actions.map((action, index) => {
      const { context } = createActionContext({
        actionName: action.meta.name,
        config: defaultConfig,
        pluginNamespace: action.pluginNamespace,
      })
      const categoryLabel = categoryLabels[index]
      const description = evaluateDescription(action.meta.description, context, action.meta.name)
      const tagsText = formatTags(action.meta.tags)
      const bookmarked = isBookmarked(action, bookmarks)

      // Truncate description and tags to fit available space
      const tagsWidth = tagsText ? tagsText.length + 1 : 0 // +1 for space before tags
      const descriptionMaxWidth = Math.max(0, descriptionSpace - tagsWidth)
      const truncatedDescription = truncateText(description, descriptionMaxWidth)

      return {
        action,
        categoryLabel,
        maxCategoryLength,
        maxNameLength,
        description: truncatedDescription,
        tagsText,
        isBookmarked: bookmarked,
      }
    })
  }, [actions, columns, bookmarks, bookmarkIcon])

  const kb = useKeyBindings()

  useInput(
    (input, key) => {
      // Navigation: up (with wrap-around)
      if (kb.list.up(input, key)) {
        setSelectedIndex((prev) => (prev - 1 + actions.length) % actions.length)
        return
      }

      // Navigation: down (with wrap-around)
      if (kb.list.down(input, key)) {
        setSelectedIndex((prev) => (prev + 1) % actions.length)
        return
      }

      // Select
      if (kb.list.select(input, key)) {
        if (items[selectedIndex]) {
          handleSelect(items[selectedIndex].action)
        }
        return
      }

      // Toggle bookmark
      if (kb.list.bookmark(input, key)) {
        if (items[selectedIndex]) {
          const bookmarkId = createBookmarkId(items[selectedIndex].action)
          const currentBookmarks = getBookmarks()
          const newBookmarks = currentBookmarks.includes(bookmarkId)
            ? currentBookmarks.filter((b) => b !== bookmarkId)
            : [...currentBookmarks, bookmarkId]

          // Update local state
          toggleBookmark(bookmarkId)

          // Persist to config file
          saveConfig('bookmarks', newBookmarks, currentLayer)
        }
        return
      }
    },
    { isActive: true },
  )

  // Item height is always 1 (single line layout)
  const itemHeight = 1

  // Notify parent of scroll info changes
  useEffect(() => {
    onScrollInfoChange?.({ selectedIndex, itemHeight })
  }, [selectedIndex, itemHeight, onScrollInfoChange])

  // Render a single action item (always 1 line)
  const renderItem = (item: ActionItem, index: number) => {
    const isSelected = index === selectedIndex
    const categoryPadding =
      item.maxCategoryLength > 0 ? item.maxCategoryLength - item.categoryLabel.length : 0

    const renderPrefix = () => (
      <Text color={isSelected ? primaryColor : undefined} bold={isSelected}>
        {isSelected ? '❯ ' : '  '}
      </Text>
    )

    const renderCategory = () => {
      if (item.categoryLabel) {
        return (
          <>
            <Text color={isSelected ? primaryColor : undefined} bold={isSelected}>
              [{item.categoryLabel}]
            </Text>
            <Text>{' '.repeat(categoryPadding + LAYOUT.categoryPadding)}</Text>
          </>
        )
      }
      if (item.maxCategoryLength > 0) {
        return (
          <Text>
            {' '.repeat(item.maxCategoryLength + LAYOUT.categoryBrackets + LAYOUT.categoryPadding)}
          </Text>
        )
      }
      return null
    }

    const renderName = () => {
      const paddedName = item.action.meta.name.padEnd(item.maxNameLength, ' ')
      return (
        <Text color={isSelected ? primaryColor : undefined} bold={isSelected}>
          {paddedName}
        </Text>
      )
    }

    return (
      <Box key={item.action.meta.name}>
        {renderPrefix()}
        {renderCategory()}
        {renderName()}
        <Box flexGrow={1}>
          <Text color={isSelected ? primaryColor : undefined}> {item.description}</Text>
        </Box>
        {item.tagsText && (
          <Text color={isSelected ? primaryColor : inactiveColor} dimColor={!isSelected}>
            {' '}
            {item.tagsText}
          </Text>
        )}
        <Text color={primaryColor}>{item.isBookmarked ? ` ${bookmarkIcon}` : '  '}</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      {items.map((item, index) => renderItem(item, index))}
    </Box>
  )
}
