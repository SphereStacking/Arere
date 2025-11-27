/**
 * Config-related custom errors
 *
 * @layer Infrastructure
 */

import type { ZodIssue } from 'zod'
import type { ConfigLayer } from './types'

/**
 * Base error for config operations
 */
export class ConfigError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message)
    this.name = 'ConfigError'
  }
}

/**
 * Config file load error
 */
export class ConfigLoadError extends ConfigError {
  constructor(
    public layer: ConfigLayer | 'merged',
    public path: string,
    cause?: Error,
  ) {
    super(`Failed to load ${layer} config from ${path}`, cause)
    this.name = 'ConfigLoadError'
  }
}

/**
 * Config file write error
 */
export class ConfigWriteError extends ConfigError {
  constructor(
    public layer: ConfigLayer,
    public key: string,
    cause?: Error,
  ) {
    super(`Failed to write ${key} to ${layer} config`, cause)
    this.name = 'ConfigWriteError'
  }
}

/**
 * Schema validation error
 */
export class ConfigValidationError extends ConfigError {
  constructor(
    public errors: ZodIssue[],
    cause?: Error,
  ) {
    super(`Config validation failed: ${errors.map((e) => e.message).join(', ')}`, cause)
    this.name = 'ConfigValidationError'
  }
}

/**
 * Config change error (Use Case level)
 */
export class ConfigChangeError extends ConfigError {
  constructor(
    public key: string,
    public layer: ConfigLayer,
    cause?: Error,
  ) {
    super(`Failed to change config ${key} in ${layer} layer`, cause)
    this.name = 'ConfigChangeError'
  }
}
