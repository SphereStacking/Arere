/**
 * Hook for dynamic kaomoji display
 */

import { getFallbackFace, getRandomFace } from '@/ui/kaomoji'
import type { FaceCategory } from '@/ui/kaomoji'
import { useScreenStore } from '@/ui/stores/screenStore'
import { useSettingsStore } from '@/ui/stores/settingsStore'
import { useEffect, useState } from 'react'

/**
 * Map screen state to face category
 */
const screenToCategory = (screen: string): FaceCategory => {
  switch (screen) {
    case 'list':
      return 'idle'
    case 'search':
      return 'searching'
    case 'executing':
      return 'loading'
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'idle'
  }
}

/**
 * Hook that returns a kaomoji face based on app state
 * Returns fallback face if dynamicKaomoji is disabled
 */
export const useKaomoji = (): string => {
  const screen = useScreenStore((s) => s.screen)
  const config = useSettingsStore((s) => s.currentConfig)

  // Check if dynamic kaomoji is enabled (default: true)
  const dynamicKaomoji = config.ui?.dynamicKaomoji ?? true

  // Track previous screen to detect changes
  const [prevScreen, setPrevScreen] = useState<string | null>(null)

  // Initialize with startup face
  const [face, setFace] = useState(() => getRandomFace('startup'))

  useEffect(() => {
    if (!dynamicKaomoji) {
      setFace(getFallbackFace())
      return
    }

    // Only update face when screen actually changes
    if (screen !== prevScreen) {
      setPrevScreen(screen)

      // Skip if this is the initial render (prevScreen is null)
      // to keep the startup face
      if (prevScreen === null) {
        return
      }

      const category = screenToCategory(screen)
      setFace(getRandomFace(category))
    }
  }, [screen, dynamicKaomoji, prevScreen])

  return face
}
