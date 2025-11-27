/**
 * usePageMeta hook - allows pages to set their metadata
 */

import type { PageMeta } from '@/presentation/ui/types'
import { useContext, useEffect } from 'react'
import { PageMetaContext } from './PageMetaContext'

/**
 * Hook to set page metadata (breadcrumb, hint)
 *
 * @example
 * ```tsx
 * export function Settings() {
 *   usePageMeta({
 *     breadcrumb: ['home', 'settings'],
 *     hint: '↑↓/jk: Move • Enter: Select • q/Esc: Back'
 *   })
 *
 *   return <Box>...</Box>
 * }
 * ```
 */
export function usePageMeta(meta: PageMeta): void {
  const { setMeta } = useContext(PageMetaContext)

  useEffect(() => {
    // Only set meta if it's not empty (avoid overriding child component's meta)
    const isEmpty = meta.breadcrumb === undefined && meta.hint === undefined
    if (!isEmpty) {
      setMeta(meta)
    }

    // Cleanup: reset meta when component unmounts
    return () => {
      setMeta({})
    }
  }, [JSON.stringify(meta), setMeta])
}
