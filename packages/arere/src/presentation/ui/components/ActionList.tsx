/**
 * Action list component with jk navigation support
 *
 * Uses Zustand stores for state and useActionExecution hook for selection.
 * ScrollArea is handled by parent Screen component.
 * Uses ArereRender for customizable display format.
 */

import { createActionContext } from '@/domain/action/context'
import type { Action } from '@/domain/action/types'
import { parseFormat } from '@/domain/arereRender/parser'
import { createBookmarkId, isBookmarked } from '@/domain/bookmark/utils'
import { useActionExecution } from '@/presentation/ui/hooks/useActionExecution'
import { useConfigManagement } from '@/presentation/ui/hooks/useConfigManagement'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import { actionToRenderData } from '@/presentation/ui/utils/action'
import { Box, useInput } from 'ink'
import React, { useEffect, useMemo, useState } from 'react'
import { ArereRender, calculateMaxWidths } from './ArereRender'

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
 * Layout margin for terminal (scrollbar + safety)
 */
const LAYOUT_MARGIN = 2

export const ActionList: React.FC<ActionListProps> = ({
  actions: propActions,
  onSelect,
  onScrollInfoChange,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { primaryColor } = useTheme()
  const storeActions = useSettingsStore((s) => s.currentActions)
  const getBookmarks = useSettingsStore((s) => s.getBookmarks)
  const toggleBookmark = useSettingsStore((s) => s.toggleBookmark)
  const currentLayer = useSettingsStore((s) => s.currentLayer)
  const currentConfig = useSettingsStore((s) => s.currentConfig)
  // currentConfig is already merged with defaultConfig via loadMerged()
  // So ui.bookmarkIcon and ui.actionListFormat are guaranteed to exist
  const bookmarkIcon = currentConfig.ui?.bookmarkIcon ?? '🔖'
  const format = currentConfig.ui?.actionListFormat ?? '${name}'
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

  // Parse format string once (memoized)
  const tokens = useMemo(() => parseFormat(format), [format])

  // Calculate available width
  const availableWidth = columns - LAYOUT_MARGIN

  // Prepare render data for all actions (for maxWidths calculation)
  const allRenderData = useMemo(() => {
    return actions.map((action) => {
      const { context } = createActionContext({
        actionName: action.meta.name,
        config: currentConfig,
        pluginNamespace: action.pluginNamespace,
      })
      const bookmarked = isBookmarked(action, bookmarks)

      return actionToRenderData({
        action,
        context,
        isSelected: false, // Selection state doesn't affect maxWidths
        isBookmarked: bookmarked,
        bookmarkIcon,
      })
    })
  }, [actions, bookmarks, bookmarkIcon, currentConfig])

  // Calculate max widths for :max tokens
  const maxWidths = useMemo(
    () => calculateMaxWidths(tokens, allRenderData),
    [tokens, allRenderData],
  )

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
        if (actions[selectedIndex]) {
          handleSelect(actions[selectedIndex])
        }
        return
      }

      // Toggle bookmark
      if (kb.list.bookmark(input, key)) {
        if (actions[selectedIndex]) {
          const bookmarkId = createBookmarkId(actions[selectedIndex])
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

  return (
    <Box flexDirection="column" flexGrow={1}>
      {actions.map((action, index) => {
        const isSelected = index === selectedIndex
        const bookmarked = isBookmarked(action, bookmarks)
        const { context } = createActionContext({
          actionName: action.meta.name,
          config: currentConfig,
          pluginNamespace: action.pluginNamespace,
        })

        const data = actionToRenderData({
          action,
          context,
          isSelected,
          isBookmarked: bookmarked,
          bookmarkIcon,
        })

        return (
          <ArereRender
            key={action.meta.name}
            format={format}
            data={data}
            width={availableWidth}
            maxWidths={maxWidths}
            isSelected={isSelected}
            primaryColor={primaryColor}
          />
        )
      })}
    </Box>
  )
}
