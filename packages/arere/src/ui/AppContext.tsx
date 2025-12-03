/**
 * Application context
 */

import type { ArereConfig } from '@/config/schema'
import type { KeyBindingsConfig } from '@/ui/keybindings'
import { defaultKeyBindings } from '@/ui/keybindings'
import { createContext } from 'react'

export interface AppContextValue {
  config: ArereConfig
  keyBindings: KeyBindingsConfig
}

export const AppContext = createContext<AppContextValue>({
  config: {} as ArereConfig,
  keyBindings: defaultKeyBindings,
})
