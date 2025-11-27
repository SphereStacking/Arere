/**
 * Execution Store - Action execution state management
 */

import type { Action } from '@/domain/action/types'
import type { VisualFeedback } from '@/domain/types/control'
import type { OutputMessage } from '@/infrastructure/output/types'
import { create } from 'zustand'

export interface ExecutionStore {
  // State
  selectedAction: Action | null
  executionError: Error | null
  executionDuration: number
  outputMessages: OutputMessage[]
  visualFeedback: VisualFeedback

  // Actions
  setSelectedAction: (action: Action | null) => void
  setExecutionError: (error: Error | null) => void
  setExecutionDuration: (duration: number) => void
  setOutputMessages: (messages: OutputMessage[]) => void
  addOutputMessage: (message: OutputMessage) => void
  setVisualFeedback: (feedback: VisualFeedback | ((prev: VisualFeedback) => VisualFeedback)) => void
  resetExecution: () => void
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  // Initial state
  selectedAction: null,
  executionError: null,
  executionDuration: 0,
  outputMessages: [],
  visualFeedback: {},

  // Actions
  setSelectedAction: (action) => set({ selectedAction: action }),
  setExecutionError: (error) => set({ executionError: error }),
  setExecutionDuration: (duration) => set({ executionDuration: duration }),
  setOutputMessages: (messages) => set({ outputMessages: messages }),
  addOutputMessage: (message) =>
    set((state) => ({ outputMessages: [...state.outputMessages, message] })),
  setVisualFeedback: (feedback) =>
    set((state) => ({
      visualFeedback: typeof feedback === 'function' ? feedback(state.visualFeedback) : feedback,
    })),
  resetExecution: () =>
    set({
      executionError: null,
      executionDuration: 0,
      outputMessages: [],
      visualFeedback: {},
    }),
}))
