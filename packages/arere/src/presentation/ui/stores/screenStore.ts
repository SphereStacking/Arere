/**
 * Screen Store - Navigation state management
 */

import type { ScreenState } from '@/presentation/ui/types'
import { create } from 'zustand'

export interface ScreenStore {
  // State
  screen: ScreenState

  // Actions
  setScreen: (screen: ScreenState) => void
  goToList: () => void
  goToSearch: () => void
  goToHelp: () => void
  goToSettings: () => void
}

export const useScreenStore = create<ScreenStore>((set) => ({
  // Initial state
  screen: 'list',

  // Actions
  setScreen: (screen) => set({ screen }),
  goToList: () => set({ screen: 'list' }),
  goToSearch: () => set({ screen: 'search' }),
  goToHelp: () => set({ screen: 'help' }),
  goToSettings: () => set({ screen: 'settings' }),
}))
