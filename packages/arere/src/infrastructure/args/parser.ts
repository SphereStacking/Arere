/**
 * CLI argument parser for headless mode support
 */

import type { ArgMapping } from '@/domain/action/types'

/**
 * Parsed arguments result
 */
export interface ParsedArgs {
  /** Named arguments (--key=value, -k value) */
  named: Map<string, string>
  /** Positional arguments */
  positional: string[]
  /** Flags (--flag, -f without value) */
  flags: Set<string>
}

/**
 * Parse CLI arguments into structured format
 *
 * Supports:
 * - Long arguments: --key=value, --key value
 * - Short arguments: -k=value, -k value
 * - Flags: --flag, -f (boolean flags without value)
 * - Negated flags: --no-flag (sets flag to false)
 * - Positional arguments
 *
 * @param args - Raw CLI arguments
 * @returns Parsed arguments
 *
 * @example
 * ```typescript
 * const result = parseArgs(['--target=production', '-y', 'file.txt'])
 * // result.named: Map { 'target' => 'production' }
 * // result.flags: Set { 'y' }
 * // result.positional: ['file.txt']
 * ```
 */
export function parseArgs(args: string[]): ParsedArgs {
  const named = new Map<string, string>()
  const positional: string[] = []
  const flags = new Set<string>()

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg.startsWith('--')) {
      // Long argument
      const withoutDashes = arg.slice(2)

      // Check for --no-flag pattern
      if (withoutDashes.startsWith('no-')) {
        const flagName = withoutDashes.slice(3)
        named.set(flagName, 'false')
        i++
        continue
      }

      if (withoutDashes.includes('=')) {
        // --key=value
        const [key, ...valueParts] = withoutDashes.split('=')
        named.set(key, valueParts.join('='))
      } else {
        // --key value or --flag
        const nextArg = args[i + 1]
        if (nextArg && !nextArg.startsWith('-')) {
          named.set(withoutDashes, nextArg)
          i++
        } else {
          // It's a flag
          flags.add(withoutDashes)
        }
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      // Short argument (single character like -t, -y)
      const key = arg.slice(1)

      const nextArg = args[i + 1]
      // If next arg exists and doesn't look like a flag, treat it as the value
      if (nextArg && !nextArg.startsWith('-')) {
        named.set(key, nextArg)
        i++ // Skip the value argument
      } else {
        // It's a flag (no value follows)
        flags.add(key)
      }
    } else if (arg.startsWith('-') && arg.length > 2) {
      // Short argument with value (-k=value or combined like -abc)
      const rest = arg.slice(1)

      if (rest.includes('=')) {
        // -k=value
        const [k, ...valueParts] = rest.split('=')
        named.set(k, valueParts.join('='))
      } else {
        // -k value format - key is first char, rest might be value
        const key = rest[0]
        const inlineValue = rest.slice(1)
        if (inlineValue) {
          // -kvalue format (no space)
          named.set(key, inlineValue)
        } else {
          // Single char, treat as flag
          flags.add(key)
        }
      }
    } else {
      // Positional argument
      positional.push(arg)
    }

    i++
  }

  return { named, positional, flags }
}

/**
 * Get argument value from parsed args based on ArgMapping
 *
 * @param parsedArgs - Parsed CLI arguments
 * @param mapping - Argument mapping configuration
 * @returns The argument value if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const parsed = parseArgs(['--target=production'])
 * const value = getArgValue(parsed, { arg: 'target', argShort: 't' })
 * // value: 'production'
 * ```
 */
export function getArgValue(parsedArgs: ParsedArgs, mapping: ArgMapping): string | undefined {
  // Check long argument name
  if (mapping.arg && parsedArgs.named.has(mapping.arg)) {
    return parsedArgs.named.get(mapping.arg)
  }

  // Check short argument name
  if (mapping.argShort && parsedArgs.named.has(mapping.argShort)) {
    return parsedArgs.named.get(mapping.argShort)
  }

  // Check positional argument
  if (mapping.argIndex !== undefined && parsedArgs.positional[mapping.argIndex]) {
    return parsedArgs.positional[mapping.argIndex]
  }

  return undefined
}

/**
 * Check if a flag is set in parsed args
 *
 * @param parsedArgs - Parsed CLI arguments
 * @param mapping - Argument mapping configuration
 * @returns true if flag is set, false if negated, undefined if not present
 *
 * @example
 * ```typescript
 * const parsed = parseArgs(['--yes'])
 * const value = getFlagValue(parsed, { arg: 'yes', argShort: 'y' })
 * // value: true
 * ```
 */
export function getFlagValue(parsedArgs: ParsedArgs, mapping: ArgMapping): boolean | undefined {
  // Check if explicitly set to 'true' or 'false' via --flag=value or --no-flag
  if (mapping.arg && parsedArgs.named.has(mapping.arg)) {
    const value = parsedArgs.named.get(mapping.arg)
    return value !== 'false'
  }

  // Check long flag
  if (mapping.arg && parsedArgs.flags.has(mapping.arg)) {
    return true
  }

  // Check short flag
  if (mapping.argShort && parsedArgs.flags.has(mapping.argShort)) {
    return true
  }

  return undefined
}

/**
 * Check if any argument mapping is defined
 */
export function hasArgMapping(mapping?: ArgMapping): boolean {
  if (!mapping) return false
  return !!(mapping.arg || mapping.argShort || mapping.argIndex !== undefined)
}
