/**
 * Home screen component
 *
 * Displays the action list or empty state based on available actions.
 * Manages ScrollArea for ActionList.
 */

import { ActionList, type ActionListScrollInfo } from '@/ui/components/ActionList'
import { EmptyState } from '@/ui/components/EmptyState'
import { HEADER_HEIGHT } from '@/ui/components/Header'
import { ScrollArea } from '@/ui/components/ScrollArea'
import { useTerminalSize } from '@/ui/hooks/useTerminalSize'
import { useSettingsStore } from '@/ui/stores/settingsStore'
import React from 'react'
import { useState } from 'react'

/**
 * Home screen component
 *
 * @example
 * ```tsx
 * <HomeScreen />
 * ```
 */
export const HomeScreen: React.FC = () => {
  const currentActions = useSettingsStore((s) => s.currentActions)
  const { rows } = useTerminalSize()
  const [scrollInfo, setScrollInfo] = useState<ActionListScrollInfo>({
    selectedIndex: 0,
    itemHeight: 1,
  })

  if (currentActions.length === 0) {
    return <EmptyState />
  }

  const visibleHeight = rows - HEADER_HEIGHT

  return (
    <ScrollArea
      height={visibleHeight}
      followIndex={scrollInfo.selectedIndex}
      itemHeight={scrollInfo.itemHeight}
      showScrollbar
    >
      <ActionList onScrollInfoChange={setScrollInfo} />
    </ScrollArea>
  )
}
