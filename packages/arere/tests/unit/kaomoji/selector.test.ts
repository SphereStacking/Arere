/**
 * Tests for kaomoji selector
 */

import { faces } from '@/ui/kaomoji/faces'
import {
  getFacesByCategory,
  getFallbackFace,
  getRandomFace,
} from '@/ui/kaomoji/selector'
import { describe, expect, it } from 'vitest'

describe('kaomoji selector', () => {
  describe('getFacesByCategory', () => {
    it('should return faces for startup category', () => {
      const startupFaces = getFacesByCategory('startup')
      expect(startupFaces.length).toBeGreaterThan(0)
      expect(startupFaces.every((f) => f.category === 'startup')).toBe(true)
    })

    it('should return faces for idle category', () => {
      const idleFaces = getFacesByCategory('idle')
      expect(idleFaces.length).toBeGreaterThan(0)
      expect(idleFaces.every((f) => f.category === 'idle')).toBe(true)
    })

    it('should return faces for error category', () => {
      const errorFaces = getFacesByCategory('error')
      expect(errorFaces.length).toBeGreaterThan(0)
      expect(errorFaces.every((f) => f.category === 'error')).toBe(true)
    })

    it('should exclude fallback faces', () => {
      const idleFaces = getFacesByCategory('idle')
      expect(idleFaces.every((f) => !f.fallback)).toBe(true)
    })
  })

  describe('getFallbackFace', () => {
    it('should return the fallback face', () => {
      const fallback = getFallbackFace()
      expect(typeof fallback).toBe('string')
      expect(fallback.length).toBeGreaterThan(0)
    })

    it('should match a face with fallback: true', () => {
      const fallback = getFallbackFace()
      const fallbackFace = faces.find((f) => f.fallback)
      expect(fallbackFace).toBeDefined()
      expect(fallback).toBe(fallbackFace?.face)
    })
  })

  describe('getRandomFace', () => {
    it('should return a face string for startup', () => {
      const face = getRandomFace('startup')
      expect(typeof face).toBe('string')
      expect(face.length).toBeGreaterThan(0)
    })

    it('should return a face string for idle', () => {
      const face = getRandomFace('idle')
      expect(typeof face).toBe('string')
      expect(face.length).toBeGreaterThan(0)
    })

    it('should return a face string for success', () => {
      const face = getRandomFace('success')
      expect(typeof face).toBe('string')
      expect(face.length).toBeGreaterThan(0)
    })

    it('should return a face string for error', () => {
      const face = getRandomFace('error')
      expect(typeof face).toBe('string')
      expect(face.length).toBeGreaterThan(0)
    })

    it('should return faces from the correct category', () => {
      // Run multiple times to test randomness
      for (let i = 0; i < 10; i++) {
        const face = getRandomFace('startup')
        const startupFaces = getFacesByCategory('startup')
        expect(startupFaces.some((f) => f.face === face)).toBe(true)
      }
    })

    it('should return fallback face for empty category', () => {
      // Cast to test with a category that doesn't exist
      const face = getRandomFace('nonexistent' as any)
      expect(face).toBe(getFallbackFace())
    })
  })

  describe('faces data', () => {
    it('should have exactly one fallback face', () => {
      const fallbackFaces = faces.filter((f) => f.fallback)
      expect(fallbackFaces.length).toBe(1)
    })

    it('should have faces for all basic categories', () => {
      const categories = [
        'startup',
        'idle',
        'searching',
        'loading',
        'found',
        'notFound',
        'success',
        'error',
      ]
      for (const category of categories) {
        const categoryFaces = getFacesByCategory(category as any)
        expect(categoryFaces.length).toBeGreaterThan(0)
      }
    })
  })
})
