/**
 * Page meta context - allows pages to set breadcrumb and hint
 */

import type { PageMeta } from '@/presentation/ui/types'
import React from 'react'
import { createContext, useState } from 'react'

/**
 * Page meta context value
 */
interface PageMetaContextValue {
  meta: PageMeta
  setMeta: (meta: PageMeta) => void
}

/**
 * Page meta context
 */
export const PageMetaContext = createContext<PageMetaContextValue>({
  meta: {},
  setMeta: () => {},
})

/**
 * Page meta provider
 */
export const PageMetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meta, setMeta] = useState<PageMeta>({})

  return <PageMetaContext.Provider value={{ meta, setMeta }}>{children}</PageMetaContext.Provider>
}
