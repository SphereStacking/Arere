/**
 * Progress control implementation
 */

import type { ProgressControl, ProgressOptions, VisualFeedback } from './types'

/**
 * Create a progress control object
 *
 * @param options - Progress options
 * @param setVisualFeedback - State setter function from React
 * @returns Progress control object
 */
export function createProgressControl(
  options: ProgressOptions,
  setVisualFeedback: (
    feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback),
  ) => void,
): ProgressControl {
  const total = options.total || 100
  const initialValue = options.value || 0
  const initialMessage = options.message || 'Processing...'

  return {
    start: () => {
      setVisualFeedback({
        type: 'progress',
        progress: {
          value: initialValue,
          total,
          message: initialMessage,
          status: 'running',
        },
      })
    },

    update: (value: number) => {
      setVisualFeedback((prev) => {
        const prevMessage =
          'type' in prev && prev.type === 'progress' ? prev.progress.message : initialMessage
        return {
          type: 'progress',
          progress: {
            value: Math.min(value, total), // Clamp to total
            total,
            message: prevMessage,
            status: 'running',
          },
        }
      })
    },

    increment: (delta = 1) => {
      setVisualFeedback((prev) => {
        const currentValue =
          'type' in prev && prev.type === 'progress' ? prev.progress.value : initialValue
        const prevMessage =
          'type' in prev && prev.type === 'progress' ? prev.progress.message : initialMessage
        const newValue = Math.min(currentValue + delta, total)

        return {
          type: 'progress',
          progress: {
            value: newValue,
            total,
            message: prevMessage,
            status: 'running',
          },
        }
      })
    },

    stop: () => {
      setVisualFeedback({})
    },

    succeed: (message?: string) => {
      setVisualFeedback((prev) => {
        const prevMessage =
          'type' in prev && prev.type === 'progress' ? prev.progress.message : initialMessage
        return {
          type: 'progress',
          progress: {
            value: total, // Complete
            total,
            message: message || prevMessage,
            status: 'success',
          },
        }
      })

      // Auto-clear after showing success state briefly
      setTimeout(() => {
        setVisualFeedback({})
      }, 1000)
    },

    fail: (message?: string) => {
      setVisualFeedback((prev) => {
        const prevValue =
          'type' in prev && prev.type === 'progress' ? prev.progress.value : initialValue
        const prevMessage =
          'type' in prev && prev.type === 'progress' ? prev.progress.message : initialMessage
        return {
          type: 'progress',
          progress: {
            value: prevValue,
            total,
            message: message || prevMessage,
            status: 'error',
          },
        }
      })

      // Auto-clear after showing error state briefly
      setTimeout(() => {
        setVisualFeedback({})
      }, 1000)
    },
  }
}
