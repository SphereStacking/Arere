/**
 * useKeyboardInput - Global keyboard input handler
 *
 * Handles application-wide keyboard shortcuts.
 */

import type { Action } from '@/action/types'
import type { LoadedPlugin } from '@/plugin/types'
import type { ScreenState } from '@/ui/types'
import { useInput } from 'ink'
import { useKeyBindings } from '../useKeyBindings'

export interface UseKeyboardInputProps {
  screen: ScreenState
  setScreen: (screen: ScreenState) => void
  setSelectedAction: (action: Action | null) => void
  setSelectedPlugin: (plugin: LoadedPlugin | null) => void
  setExecutionError: (error: Error | null) => void
  onExit: () => void
}

/**
 * Global keyboard input handler hook
 *
 * @param props - Keyboard input configuration
 *
 * @example
 * ```tsx
 * useKeyboardInput({
 *   screen,
 *   setScreen,
 *   setSelectedAction,
 *   setSelectedPlugin,
 *   setExecutionError,
 *   onExit,
 * })
 * ```
 */
export function useKeyboardInput({
  screen,
  setScreen,
  setSelectedAction,
  setSelectedPlugin,
  setExecutionError,
  onExit,
}: UseKeyboardInputProps): void {
  const kb = useKeyBindings()

  useInput(
    (input, key) => {
      // Exit
      if (kb.global.exit(input, key)) {
        onExit()
        return
      }

      // Search
      if (kb.global.search(input, key) && screen === 'list') {
        setScreen('search')
        return
      }

      // Confirm (Enter) to return to list from success/error screens
      if (kb.global.confirm(input, key) && (screen === 'success' || screen === 'error')) {
        setScreen('list')
        setSelectedAction(null)
        setExecutionError(null)
        return
      }

      // Back (Escape)
      if (kb.global.back(input, key)) {
        if (screen === 'plugin-list') {
          setScreen('settings')
        } else if (
          screen === 'help' ||
          screen === 'error' ||
          screen === 'success' ||
          screen === 'search'
        ) {
          setScreen('list')
          setSelectedAction(null)
          setExecutionError(null)
        }
        // Note: 'settings' and 'plugin-detail' screens handle their own Escape key internally
      }

      // Help
      if (kb.global.help(input, key) && screen === 'list') {
        setScreen('help')
      }

      // Settings
      if (kb.global.settings(input, key) && screen === 'list') {
        setScreen('settings')
      }
    },
    { isActive: screen !== 'input' && screen !== 'search' },
  )
}
