/**
 * Plain text renderer for headless mode
 *
 * Outputs plain text without ANSI colors or Ink rendering.
 * Suitable for CI/CD environments and log files.
 */

import type { OutputAPI } from './types'

/**
 * Plain text renderer implementation
 *
 * Provides all OutputAPI methods with plain text output
 */
export class PlainTextRenderer implements OutputAPI {
  log(...args: unknown[]): void {
    console.log(...args)
  }

  success(message: string): void {
    console.log(`✔ ${message}`)
  }

  error(message: string): void {
    console.error(`✖ ${message}`)
  }

  warn(message: string): void {
    console.warn(`⚠ ${message}`)
  }

  info(message: string): void {
    console.log(`ℹ ${message}`)
  }

  newline(): void {
    console.log()
  }

  code(snippet: string): void {
    console.log(`\`${snippet}\``)
  }

  section(title: string): void {
    console.log(`\n=== ${title} ===\n`)
  }

  list(items: string[]): void {
    for (const item of items) {
      console.log(`  • ${item}`)
    }
  }

  keyValue(data: Record<string, unknown>): void {
    console.log()
    for (const [key, value] of Object.entries(data)) {
      console.log(`  ${key}: ${value}`)
    }
    console.log()
  }

  table(data: Record<string, unknown>[]): void {
    if (data.length === 0) {
      return
    }

    // Get all keys from first object
    const keys = Object.keys(data[0])

    // Print header
    console.log()
    console.log(`  ${keys.join(' | ')}`)
    console.log(`  ${keys.map(() => '---').join(' | ')}`)

    // Print rows
    for (const row of data) {
      const values = keys.map((key) => String(row[key] ?? ''))
      console.log(`  ${values.join(' | ')}`)
    }
    console.log()
  }

  json(data: unknown, indent = 2): void {
    console.log(JSON.stringify(data, null, indent))
  }

  separator(char = '-', length = 40): void {
    console.log(char.repeat(length))
  }

  step(number: number, description: string): void {
    console.log(`\n[${number}] ${description}`)
  }
}
