/**
 * Test helper to wrap components with AppContext
 */

import type { ArereConfig } from '@/infrastructure/config/schema.js'
import { defaultKeyBindings } from '@/infrastructure/keybindings/index.js'
import { AppContext } from '@/presentation/ui/AppContext.js'
import React from 'react'

export function AppContextWrapper({ children }: { children: React.ReactNode }) {
  const config = { theme: { primaryColor: 'green' } } as ArereConfig
  return (
    <AppContext.Provider value={{ config, keyBindings: defaultKeyBindings }}>
      {children}
    </AppContext.Provider>
  )
}
