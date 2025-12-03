/**
 * Simple logger utility
 *
 * A lightweight logging utility with:
 * - Log level management
 * - CI/TTY detection
 * - Colored output (TTY only)
 */

import type { LogLevel } from '@/lib/types'

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
}

/**
 * Log level to numeric value mapping
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 3,
  warn: 4,
  error: 5,
  fatal: 5,
}

/**
 * Simple logger class
 */
class SimpleLogger {
  public level: number = LOG_LEVELS.info
  private isCI: boolean = !process.stdout.isTTY || !!process.env.CI

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = LOG_LEVELS[level]
  }

  /**
   * Log trace message
   */
  trace(msg: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.trace) {
      this.log('trace', colors.gray, msg, ...args)
    }
  }

  /**
   * Log debug message
   */
  debug(msg: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.debug) {
      this.log('debug', colors.gray, msg, ...args)
    }
  }

  /**
   * Log info message
   */
  info(msg: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.info) {
      this.log('info', colors.blue, msg, ...args)
    }
  }

  /**
   * Log warning message
   */
  warn(msg: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.warn) {
      this.log('warn', colors.yellow, msg, ...args)
    }
  }

  /**
   * Log error message
   */
  error(msg: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.error) {
      this.log('error', colors.red, msg, ...args)
    }
  }

  /**
   * Log fatal error message
   */
  fatal(msg: string, ...args: unknown[]): void {
    if (this.level <= LOG_LEVELS.fatal) {
      this.log('fatal', colors.red, msg, ...args)
    }
  }

  /**
   * Internal log method
   */
  private log(level: string, color: string, msg: string, ...args: unknown[]): void {
    const prefix = this.isCI
      ? `[${level}]` // CI: plain text
      : `${color}[${level}]${colors.reset}` // TTY: colored

    console.log(prefix, msg, ...args)
  }
}

/**
 * Logger instance
 */
export const logger = new SimpleLogger()

/**
 * Set log level from environment variable or parameter
 */
export function setLogLevel(level?: LogLevel): void {
  const logLevel: LogLevel = level || (process.env.ARERE_LOG_LEVEL as LogLevel) || 'info'
  logger.setLevel(logLevel)
}

// Initialize log level on module load
setLogLevel()
