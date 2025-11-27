/**
 * Prompt Store - Prompt state management
 */

import type { PromptRequest } from '@/infrastructure/prompt/renderer'
import { create } from 'zustand'

export interface PromptStore {
  // State
  promptRequest: PromptRequest | null
  promptResolver: ((value: unknown) => void) | null

  // Actions
  setPromptRequest: (request: PromptRequest | null) => void
  setPromptResolver: (resolver: ((value: unknown) => void) | null) => void

  // Combined action for showing prompt
  showPrompt: (request: PromptRequest) => Promise<unknown>

  // Submit and cancel
  submitPrompt: (value: unknown) => void
  cancelPrompt: () => void

  // Reset
  resetPrompt: () => void
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  // Initial state
  promptRequest: null,
  promptResolver: null,

  // Actions
  setPromptRequest: (request) => set({ promptRequest: request }),
  setPromptResolver: (resolver) => set({ promptResolver: resolver }),

  // Show prompt and return promise
  showPrompt: (request) => {
    return new Promise((resolve) => {
      set({
        promptRequest: request,
        promptResolver: resolve,
      })
    })
  },

  // Submit prompt value
  submitPrompt: (value) => {
    const { promptResolver } = get()
    if (promptResolver) {
      promptResolver(value)
    }
    set({ promptRequest: null, promptResolver: null })
  },

  // Cancel prompt
  cancelPrompt: () => {
    const { promptResolver } = get()
    if (promptResolver) {
      promptResolver(undefined)
    }
    set({ promptRequest: null, promptResolver: null })
  },

  // Reset
  resetPrompt: () => set({ promptRequest: null, promptResolver: null }),
}))
