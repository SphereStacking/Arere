/**
 * ScreenRouter - Screen routing component
 *
 * Handles rendering of different screens based on application state.
 * Uses Zustand stores for state management.
 *
 * All screens get their state from Zustand stores directly,
 * so this component only handles routing logic.
 */

import { t } from '@/infrastructure/i18n/index'
import { ErrorScreen } from '@/presentation/ui/screens/execution/ErrorScreen'
import { ExecutingScreen } from '@/presentation/ui/screens/execution/ExecutingScreen'
import { SuccessScreen } from '@/presentation/ui/screens/execution/SuccessScreen'
import { HelpScreen } from '@/presentation/ui/screens/help/HelpScreen'
import { HomeScreen } from '@/presentation/ui/screens/home/HomeScreen'
import { PromptScreen } from '@/presentation/ui/screens/prompt/PromptScreen'
import { SearchScreen } from '@/presentation/ui/screens/search/SearchScreen'
import { SettingsScreen } from '@/presentation/ui/screens/settings/SettingsScreen'
import { PluginDetailScreen } from '@/presentation/ui/screens/settings/plugins/PluginDetailScreen'
import { PluginListScreen } from '@/presentation/ui/screens/settings/plugins/PluginListScreen'
import { useScreenStore } from '@/presentation/ui/stores/screenStore'
import { Text } from 'ink'
import React from 'react'

/**
 * Screen routing component
 *
 * Reads state from Zustand stores and renders the appropriate screen.
 * All screens are self-contained and get their own state from stores.
 *
 * @example
 * ```tsx
 * <ScreenRouter />
 * ```
 */
export const ScreenRouter: React.FC = () => {
  // Get screen state from store
  const screen = useScreenStore((s) => s.screen)

  switch (screen) {
    case 'list':
      return <HomeScreen />

    case 'search':
      return <SearchScreen />

    case 'help':
      return <HelpScreen />

    case 'settings':
      return <SettingsScreen />

    case 'plugin-list':
      return <PluginListScreen />

    case 'plugin-detail':
      return <PluginDetailScreen />

    case 'executing':
      return <ExecutingScreen />

    case 'success':
      return <SuccessScreen />

    case 'error':
      return <ErrorScreen />

    case 'input':
      return <PromptScreen />

    default:
      return <Text>{t('ui:error.unknown_screen')}</Text>
  }
}
