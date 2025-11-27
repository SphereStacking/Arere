/**
 * useActionExecution - Hook for running actions
 *
 * Encapsulates action execution logic, including state management
 * and error handling.
 */

import type { Action } from '@/domain/action/types'
import { useExecutionStore } from '@/presentation/ui/stores/executionStore'
import { useScreenStore } from '@/presentation/ui/stores/screenStore'
import { useSettingsStore } from '@/presentation/ui/stores/settingsStore'

/**
 * Hook for running actions
 *
 * @example
 * ```tsx
 * const { runAction } = useActionExecution()
 *
 * const handleSelect = (action: Action) => {
 *   runAction(action)
 * }
 * ```
 */
export function useActionExecution() {
  const setScreen = useScreenStore((s) => s.setScreen)
  const {
    setSelectedAction,
    setExecutionError,
    setExecutionDuration,
    addOutputMessage,
    setVisualFeedback,
    resetExecution,
  } = useExecutionStore()
  const currentPlugins = useSettingsStore((s) => s.currentPlugins)
  const currentConfig = useSettingsStore((s) => s.currentConfig)

  const runAction = async (action: Action) => {
    setSelectedAction(action)
    resetExecution()
    setScreen('executing')

    const startTime = Date.now()

    try {
      // Import dynamically to avoid circular dependencies
      const { runAction: run } = await import('@/domain/action/executor')

      await run(action, {
        plugins: currentPlugins,
        config: currentConfig,
        onOutput: addOutputMessage,
        onVisualFeedback: setVisualFeedback,
      })

      setExecutionDuration(Date.now() - startTime)
      setScreen('success')
    } catch (error) {
      setExecutionDuration(Date.now() - startTime)
      setExecutionError(error instanceof Error ? error : new Error(String(error)))
      setScreen('error')
    }
  }

  return { runAction }
}
