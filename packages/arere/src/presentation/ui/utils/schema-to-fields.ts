/**
 * Convert Zod schema to UI form fields
 */

import type { z } from 'zod'

/**
 * Form field types
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'enum'

/**
 * Form field definition
 */
export interface FormField {
  /** Field name (key in the schema) */
  name: string
  /** Field type */
  type: FieldType
  /** Field label (defaults to name) */
  label: string
  /** Field description (from schema description if available) */
  description?: string
  /** Default value */
  defaultValue?: unknown
  /** Required field */
  required: boolean
  /** For enum type: available choices */
  choices?: Array<{ label: string; value: string | number }>
}

/**
 * Convert a Zod schema object to form fields
 *
 * @param schema - Zod object schema
 * @returns Array of form field definitions
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   apiKey: z.string().describe('API Key for authentication'),
 *   timeout: z.number().default(5000).describe('Request timeout in ms'),
 *   enabled: z.boolean().default(true),
 * })
 *
 * const fields = schemaToFields(schema)
 * // [
 * //   { name: 'apiKey', type: 'string', label: 'apiKey', description: 'API Key...', required: true },
 * //   { name: 'timeout', type: 'number', label: 'timeout', defaultValue: 5000, ... },
 * //   { name: 'enabled', type: 'boolean', label: 'enabled', defaultValue: true, ... },
 * // ]
 * ```
 */
export function schemaToFields(schema: z.ZodObject<any>): FormField[] {
  const fields: FormField[] = []
  const shape = schema.shape

  for (const [key, value] of Object.entries(shape)) {
    const fieldDef = value as z.ZodTypeAny
    const field = parseFieldDefinition(key, fieldDef)
    if (field) {
      fields.push(field)
    }
  }

  return fields
}

/**
 * Parse a single field definition from Zod type
 */
function parseFieldDefinition(name: string, def: z.ZodTypeAny): FormField | null {
  let type: FieldType | null = null
  let defaultValue: unknown = undefined
  let description: string | undefined = undefined
  let required = true
  let choices: Array<{ label: string; value: string | number }> | undefined = undefined

  // Unwrap optional/default/nullable
  let current = def
  while (true) {
    const typeName = current._def.typeName

    if (typeName === 'ZodOptional') {
      required = false
      current = current._def.innerType
      continue
    }

    if (typeName === 'ZodDefault') {
      defaultValue = current._def.defaultValue()
      required = false
      current = current._def.innerType
      continue
    }

    if (typeName === 'ZodNullable') {
      required = false
      current = current._def.innerType
      continue
    }

    break
  }

  // Extract description if available
  if (current._def.description) {
    description = current._def.description
  }

  // Determine field type
  const typeName = current._def.typeName

  if (typeName === 'ZodString') {
    type = 'string'
  } else if (typeName === 'ZodNumber') {
    type = 'number'
  } else if (typeName === 'ZodBoolean') {
    type = 'boolean'
  } else if (typeName === 'ZodEnum') {
    type = 'enum'
    const values = current._def.values as Array<string | number>
    choices = values.map((v) => ({ label: String(v), value: v }))
  } else if (typeName === 'ZodNativeEnum') {
    type = 'enum'
    const enumObj = current._def.values as Record<string, string | number>
    choices = Object.entries(enumObj)
      .filter(([_, value]) => typeof value === 'string' || typeof value === 'number')
      .map(([key, value]) => ({ label: key, value }))
  } else {
    // Unsupported type, skip
    return null
  }

  return {
    name,
    type,
    label: name,
    description,
    defaultValue,
    required,
    choices,
  }
}
