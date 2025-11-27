/**
 * Tests for defineAction function
 */

import { defineAction } from '@/domain/action/defineAction.js'
import { describe, expect, it } from 'vitest'

describe('defineAction', () => {
  it('should create a action with valid config', () => {
    const action = defineAction({
      name: 'test-action',
      description: 'Test action description',
      async run() {
        // Test run function
      },
    })

    expect(action.meta.name).toBe('test-action')
    expect(action.meta.description).toBe('Test action description')
    expect(action.filePath).toBe('')
    expect(typeof action.run).toBe('function')
  })

  it('should include optional fields', () => {
    const action = defineAction({
      name: 'test-action',
      description: 'Test action',
      category: 'test-category',
      async run() {},
    })

    expect(action.meta.category).toBe('test-category')
  })

  it('should allow empty name (will be derived from filename)', () => {
    const action = defineAction({
      name: '',
      description: 'Test',
      async run() {},
    })
    // Empty name is allowed, will be derived from filename by loader
    expect(action.meta.name).toBe('')
  })

  it('should throw error if description is missing', () => {
    expect(() => {
      defineAction({
        name: 'test',
        description: '',
        async run() {},
      })
    }).toThrow('Action description is required')
  })

  it('should throw error if run is not a function', () => {
    expect(() => {
      defineAction({
        name: 'test',
        description: 'Test',
        run: null as any,
      })
    }).toThrow('Action run function is required')
  })

  it('should throw error if name contains invalid characters', () => {
    expect(() => {
      defineAction({
        name: 'test action!',
        description: 'Test',
        async run() {},
      })
    }).toThrow('must contain only alphanumeric characters')
  })

  it('should accept valid name formats', () => {
    const validNames = ['test', 'test-action', 'my_action', 'test123', 'TEST']

    for (const name of validNames) {
      expect(() => {
        defineAction({
          name,
          description: 'Test',
          async run() {},
        })
      }).not.toThrow()
    }
  })
})
