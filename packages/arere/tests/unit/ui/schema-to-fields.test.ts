/**
 * Schema to fields conversion tests
 */

import { schemaToFields } from '@/ui/utils/schema-to-fields.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('Schema to Fields Conversion', () => {
  it('should convert string field', () => {
    const schema = z.object({
      name: z.string(),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(1)
    expect(fields[0]).toEqual({
      name: 'name',
      type: 'string',
      label: 'name',
      description: undefined,
      defaultValue: undefined,
      required: true,
      choices: undefined,
    })
  })

  it('should convert number field', () => {
    const schema = z.object({
      port: z.number(),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(1)
    expect(fields[0].type).toBe('number')
    expect(fields[0].required).toBe(true)
  })

  it('should convert boolean field', () => {
    const schema = z.object({
      enabled: z.boolean(),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(1)
    expect(fields[0].type).toBe('boolean')
  })

  it('should convert enum field', () => {
    const schema = z.object({
      theme: z.enum(['light', 'dark', 'auto']),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(1)
    expect(fields[0].type).toBe('enum')
    expect(fields[0].choices).toEqual([
      { label: 'light', value: 'light' },
      { label: 'dark', value: 'dark' },
      { label: 'auto', value: 'auto' },
    ])
  })

  it('should handle optional fields', () => {
    const schema = z.object({
      optional: z.string().optional(),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(1)
    expect(fields[0].required).toBe(false)
  })

  it('should extract default values', () => {
    const schema = z.object({
      timeout: z.number().default(5000),
      enabled: z.boolean().default(true),
      theme: z.enum(['light', 'dark']).default('light'),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(3)
    expect(fields[0].defaultValue).toBe(5000)
    expect(fields[0].required).toBe(false) // Has default, so not required
    expect(fields[1].defaultValue).toBe(true)
    expect(fields[2].defaultValue).toBe('light')
  })

  it('should extract descriptions', () => {
    const schema = z.object({
      apiKey: z.string().describe('API key for authentication'),
      timeout: z.number().describe('Request timeout in milliseconds'),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(2)
    expect(fields[0].description).toBe('API key for authentication')
    expect(fields[1].description).toBe('Request timeout in milliseconds')
  })

  it('should handle complex schema', () => {
    const schema = z.object({
      apiKey: z.string().describe('API key'),
      timeout: z.number().default(5000).describe('Timeout'),
      enableDebug: z.boolean().default(false).describe('Enable debug'),
      theme: z.enum(['light', 'dark', 'auto']).default('auto').describe('Theme'),
      optional: z.string().optional().describe('Optional field'),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(5)

    // apiKey - required string
    expect(fields[0].name).toBe('apiKey')
    expect(fields[0].type).toBe('string')
    expect(fields[0].required).toBe(true)
    expect(fields[0].description).toBe('API key')

    // timeout - number with default
    expect(fields[1].name).toBe('timeout')
    expect(fields[1].type).toBe('number')
    expect(fields[1].required).toBe(false)
    expect(fields[1].defaultValue).toBe(5000)

    // enableDebug - boolean with default
    expect(fields[2].name).toBe('enableDebug')
    expect(fields[2].type).toBe('boolean')
    expect(fields[2].defaultValue).toBe(false)

    // theme - enum with default
    expect(fields[3].name).toBe('theme')
    expect(fields[3].type).toBe('enum')
    expect(fields[3].defaultValue).toBe('auto')
    expect(fields[3].choices).toHaveLength(3)

    // optional - optional string
    expect(fields[4].name).toBe('optional')
    expect(fields[4].type).toBe('string')
    expect(fields[4].required).toBe(false)
  })

  it('should handle nullable fields', () => {
    const schema = z.object({
      nullable: z.string().nullable(),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(1)
    expect(fields[0].required).toBe(false)
  })

  it('should handle default + optional combination', () => {
    const schema = z.object({
      field: z.string().optional().default('default-value'),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(1)
    expect(fields[0].required).toBe(false)
    expect(fields[0].defaultValue).toBe('default-value')
  })

  it('should return empty array for empty schema', () => {
    const schema = z.object({})

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(0)
  })

  it('should preserve field order', () => {
    const schema = z.object({
      first: z.string(),
      second: z.number(),
      third: z.boolean(),
    })

    const fields = schemaToFields(schema)

    expect(fields).toHaveLength(3)
    expect(fields[0].name).toBe('first')
    expect(fields[1].name).toBe('second')
    expect(fields[2].name).toBe('third')
  })
})
