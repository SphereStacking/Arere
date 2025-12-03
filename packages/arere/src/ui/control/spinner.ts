/**
 * Spinner control implementation
 */

import type { SpinnerControl, SpinnerOptions, VisualFeedback } from './types'

/**
 * Create a spinner control object
 *
 * @param options - Spinner options
 * @param setVisualFeedback - State setter function from React
 * @returns Spinner control object
 */
export function createSpinnerControl(
  options: SpinnerOptions,
  setVisualFeedback: (
    feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback),
  ) => void,
): SpinnerControl {
  const type = options.type || 'dots'
  const initialMessage = options.message || 'Loading...'

  return {
    start: () => {
      setVisualFeedback({
        type: 'spinner',
        spinner: {
          type,
          message: initialMessage,
          status: 'running',
        },
      })
    },

    stop: () => {
      setVisualFeedback({})
    },

    succeed: (message?: string) => {
      setVisualFeedback((prev) => {
        const prevMessage =
          'type' in prev && prev.type === 'spinner' ? prev.spinner.message : initialMessage
        return {
          type: 'spinner',
          spinner: {
            type,
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
        const prevMessage =
          'type' in prev && prev.type === 'spinner' ? prev.spinner.message : initialMessage
        return {
          type: 'spinner',
          spinner: {
            type,
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

    update: (message: string) => {
      setVisualFeedback((prev) => {
        const prevStatus =
          'type' in prev && prev.type === 'spinner' ? prev.spinner.status : 'running'
        return {
          type: 'spinner',
          spinner: {
            type,
            message,
            status: prevStatus,
          },
        }
      })
    },
  }
}
