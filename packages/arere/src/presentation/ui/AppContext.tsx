/**
 * Application context
 */

import type { ArereConfig } from '@/infrastructure/config/schema'
import type { KeyBindingsConfig } from '@/domain/keybindings'
import { defaultKeyBindings } from '@/infrastructure/keybindings'
import { createContext } from 'react'

export interface AppContextValue {
  config: ArereConfig
  keyBindings: KeyBindingsConfig
}

export const AppContext = createContext<AppContextValue>({
  config: {} as ArereConfig,
  keyBindings: defaultKeyBindings,
})
