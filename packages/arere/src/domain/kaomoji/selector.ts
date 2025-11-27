/**
 * Kaomoji selector logic
 */

import { faces } from './faces'
import type { Face, FaceCategory } from './types'

/**
 * Get faces by category (excluding fallback faces)
 */
export const getFacesByCategory = (category: FaceCategory): Face[] => {
  return faces.filter((f) => f.category === category && !f.fallback)
}

/**
 * Get the fallback face (used when dynamicKaomoji is disabled)
 */
export const getFallbackFace = (): string => {
  const fallbackFace = faces.find((f) => f.fallback)
  return fallbackFace?.face ?? '( ˙-˙ )'
}

/**
 * Get a random face for the given category
 * Considers weight for probability control
 */
export const getRandomFace = (category: FaceCategory): string => {
  const pool = getFacesByCategory(category)
  if (pool.length === 0) return getFallbackFace()

  // Filter by weight (faces with lower weight have lower chance of appearing)
  const weighted = pool.filter((f) => Math.random() < (f.weight ?? 1))
  const target = weighted.length > 0 ? weighted : pool

  return target[Math.floor(Math.random() * target.length)].face
}
