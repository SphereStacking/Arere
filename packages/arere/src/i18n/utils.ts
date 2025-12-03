/**
 * Type utilities for translation system
 */

/**
 * Extract all nested keys from an object type as dot-notation string literals
 *
 * @example
 * ```typescript
 * type Obj = { user: { name: string, age: number }, status: string }
 * type Keys = NestedKeyOf<Obj>
 * // 'user' | 'user.name' | 'user.age' | 'status'
 * ```
 */
export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: K extends string
        ? T[K] extends object
          ? K | `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never
    }[keyof T & string]
  : never

/**
 * Get value type from object using dot-notation key
 *
 * @example
 * ```typescript
 * type Obj = { user: { name: string } }
 * type Value = GetByPath<Obj, 'user.name'>  // string
 * ```
 */
export type GetByPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? GetByPath<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

/**
 * Get nested value from object using dot-notation path
 */
export function getByPath<T extends Record<string, unknown>>(obj: T, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * Simple variable interpolation for translation strings
 * Replaces {{key}} with corresponding value from variables object
 *
 * @example
 * ```typescript
 * interpolate('Hello {{name}}!', { name: 'World' })
 * // => 'Hello World!'
 * ```
 */
export function interpolate(str: string, variables?: Record<string, unknown>): string {
  if (!variables) {
    return str
  }

  return str.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key]
    return value === undefined || value === null ? '' : String(value)
  })
}
