/**
 * Search screen component
 *
 * Displays the fuzzy search interface for actions.
 * Uses Zustand stores for state and useActionExecution hook for selection.
 */

import { createActionContext } from '@/domain/action/context'
import { defaultConfig } from '@/infrastructure/config/schema'
import { t } from '@/infrastructure/i18n/index'
import { ActionList, type ActionListScrollInfo } from '@/presentation/ui/components/ActionList'
import { HEADER_HEIGHT } from '@/presentation/ui/components/Header'
import { ScrollArea } from '@/presentation/ui/components/ScrollArea'
import { TextInput } from '@/presentation/ui/components/inputs'
import { useActionExecution } from '@/presentation/ui/hooks/useActionExecution'
import { useTerminalSize } from '@/presentation/ui/hooks/useTerminalSize'
import { useTheme } from '@/presentation/ui/hooks/useTheme'
import { useScreenStore } from '@/presentation/ui/stores/screenStore'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'
import { evaluateDescription } from '@/presentation/ui/utils/action'
import fuzzysort from 'fuzzysort'
import { Box, Text, useInput } from 'ink'
import React, { useState } from 'react'

/** Height of search input area (input line + marginBottom) */
const SEARCH_INPUT_HEIGHT = 2

/**
 * Search screen component
 *
 * @example
 * ```tsx
 * <SearchScreen />
 * ```
 */
export const SearchScreen: React.FC = () => {
  const actions = useSettingsStore((s) => s.currentActions)
  const setScreen = useScreenStore((s) => s.setScreen)
  const { runAction } = useActionExecution()
  const [query, setQuery] = useState('')
  const [isFocusedOnInput, setIsFocusedOnInput] = useState(true)
  const { primaryColor } = useTheme()
  const { rows } = useTerminalSize()
  const [scrollInfo, setScrollInfo] = useState<ActionListScrollInfo>({
    selectedIndex: 0,
    itemHeight: 1,
  })

  // Prepare searchable items with all metadata
  const searchableItems = React.useMemo(
    () =>
      actions.map((action) => {
        // Create context to evaluate description function (requires config parameter)
        const { context } = createActionContext({
          actionName: action.meta.name,
          config: defaultConfig,
          pluginNamespace: action.pluginNamespace,
        })
        const description = evaluateDescription(action.meta.description, context, action.meta.name)

        // Build searchable text from all metadata:
        // - name: Action name
        // - description: Description text (evaluated if function)
        // - category: Category (e.g., "plugin:arere-plugin-tutorial")
        // - tags: Tag array (e.g., ["demo", "output", "api"])
        const searchText = [
          action.meta.name,
          description,
          action.meta.category || '',
          ...(action.meta.tags || []),
        ]
          .filter(Boolean) // Exclude empty strings
          .join(' ')

        return {
          action,
          searchText,
        }
      }),
    [actions],
  )

  // Perform fuzzy search
  const results = query
    ? fuzzysort
        .go(query, searchableItems, {
          key: 'searchText',
        })
        .map((result) => result.obj.action)
    : actions

  // Handle keyboard input
  useInput(
    (input, key) => {
      if (key.escape) {
        setScreen('list')
        return
      }

      // Tab to toggle focus between input and results
      if (key.tab) {
        setIsFocusedOnInput((prev) => !prev)
        return
      }

      // Any character input should focus on the input field
      if (!key.upArrow && !key.downArrow && !key.return && !key.escape && !key.tab && input) {
        setIsFocusedOnInput(true)
      }
    },
    { isActive: isFocusedOnInput },
  )

  // Calculate visible height for ActionList
  const listHeight = rows - HEADER_HEIGHT - SEARCH_INPUT_HEIGHT

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={primaryColor}>{t('ui:search.label')} </Text>
        <TextInput
          mode="form"
          value={query}
          onChange={(value) => {
            setQuery(value)
            setIsFocusedOnInput(true)
          }}
          placeholder={t('ui:search.placeholder')}
          onSubmit={() => {
            if (results.length > 0) {
              setIsFocusedOnInput(false)
            }
          }}
          isFocused={isFocusedOnInput}
        />
        <Box flexGrow={1} />
        <Text dimColor>{t('ui:search.count', { count: results.length })}</Text>
      </Box>

      {query && results.length === 0 && (
        <Box>
          <Text dimColor>{t('ui:search.no_results')}</Text>
        </Box>
      )}

      {results.length > 0 && (
        <ScrollArea
          height={listHeight}
          followIndex={scrollInfo.selectedIndex}
          itemHeight={scrollInfo.itemHeight}
          showScrollbar
        >
          <ActionList actions={results} onSelect={runAction} onScrollInfoChange={setScrollInfo} />
        </ScrollArea>
      )}
    </Box>
  )
}
