/**
 * Output message collector
 * Captures all output messages during action execution for later rendering
 */

import type { OutputAPI, OutputMessage } from './types'

/**
 * Callback for real-time output streaming
 */
export type OutputCallback = (message: OutputMessage) => void

/**
 * Output message collector
 */
export class OutputCollector {
  private messages: OutputMessage[] = []
  private onMessage?: OutputCallback

  constructor(onMessage?: OutputCallback) {
    this.onMessage = onMessage
  }

  /**
   * Get all collected messages
   */
  getMessages(): OutputMessage[] {
    return this.messages
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = []
  }

  /**
   * Add a message to the collection
   */
  private addMessage(
    type: OutputMessage['type'],
    content: OutputMessage['content'],
    meta?: OutputMessage['meta'],
  ): void {
    const message: OutputMessage = {
      type,
      content,
      timestamp: Date.now(),
      meta,
    }
    this.messages.push(message)
    // Stream message in real-time if callback is provided
    this.onMessage?.(message)
  }

  /**
   * Basic log message
   */
  log(...args: unknown[]): void {
    const content = args
      .map((arg) => {
        if (typeof arg === 'string') return arg
        if (arg === null) return 'null'
        if (arg === undefined) return 'undefined'
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      })
      .join(' ')
    this.addMessage('log', content)
  }

  /**
   * Success message (green with ✅)
   */
  success(message: string): void {
    this.addMessage('success', message)
  }

  /**
   * Error message (red with ❌)
   */
  error(message: string): void {
    this.addMessage('error', message)
  }

  /**
   * Warning message (yellow with ⚠️)
   */
  warn(message: string): void {
    this.addMessage('warn', message)
  }

  /**
   * Info message (blue with ℹ️)
   */
  info(message: string): void {
    this.addMessage('info', message)
  }

  /**
   * Insert empty line
   */
  newline(): void {
    this.addMessage('newline', '')
  }

  /**
   * Code snippet display
   */
  code(snippet: string): void {
    this.addMessage('code', snippet)
  }

  /**
   * Section header with separator
   */
  section(title: string): void {
    this.addMessage('section', title)
  }

  /**
   * Bullet list
   */
  list(items: string[]): void {
    this.addMessage('list', items)
  }

  /**
   * Key-value pairs
   */
  keyValue(data: Record<string, unknown>): void {
    this.addMessage('keyValue', data)
  }

  /**
   * Table display
   */
  table(data: Record<string, unknown>[]): void {
    this.addMessage('table', data)
  }

  /**
   * JSON formatted output
   */
  json(data: unknown, indent = 2): void {
    this.addMessage('json', data, { indent })
  }

  /**
   * Horizontal separator line
   */
  separator(char = '─', length = 50): void {
    this.addMessage('separator', '', { char, length })
  }

  /**
   * Numbered step
   */
  step(number: number, description: string): void {
    this.addMessage('step', description, { number })
  }
}

/**
 * Create output API and collector
 * Returns both the API (for actions to use) and collector (for UI to read)
 *
 * @param onMessage - Optional callback for real-time message streaming
 */
export function createOutputAPI(onMessage?: OutputCallback): {
  api: OutputAPI
  collector: OutputCollector
} {
  const collector = new OutputCollector(onMessage)

  const api: OutputAPI = {
    log: (...args: unknown[]) => collector.log(...args),
    success: (message: string) => collector.success(message),
    error: (message: string) => collector.error(message),
    warn: (message: string) => collector.warn(message),
    info: (message: string) => collector.info(message),
    newline: () => collector.newline(),
    code: (snippet: string) => collector.code(snippet),
    section: (title: string) => collector.section(title),
    list: (items: string[]) => collector.list(items),
    keyValue: (data: Record<string, unknown>) => collector.keyValue(data),
    table: (data: Record<string, unknown>[]) => collector.table(data),
    json: (data: unknown, indent?: number) => collector.json(data, indent),
    separator: (char?: string, length?: number) => collector.separator(char, length),
    step: (number: number, description: string) => collector.step(number, description),
  }

  return { api, collector }
}
