/**
 * Custom error classes for the 'arere' launcher
 */

import { t } from '@/i18n/index'

/**
 * Base error class for all 'arere' errors
 */
export class ArereError extends Error {
  public cause?: Error

  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ArereError'
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error thrown when an action is not found
 */
export class ActionNotFoundError extends ArereError {
  constructor(actionName: string) {
    super(t('errors:action_not_found', { name: actionName }), 'ACTION_NOT_FOUND')
    this.name = 'ActionNotFoundError'
  }
}

/**
 * Error thrown when an action fails to load
 */
export class ActionLoadError extends ArereError {
  constructor(filePath: string, cause?: Error) {
    super(t('errors:action_load_error', { path: filePath }), 'ACTION_LOAD_ERROR')
    this.name = 'ActionLoadError'
    if (cause) {
      this.cause = cause
    }
  }
}

/**
 * Error thrown when an action execution fails
 */
export class ActionExecutionError extends ArereError {
  constructor(actionName: string, cause?: Error) {
    super(t('errors:action_execution_error', { name: actionName }), 'ACTION_EXECUTION_ERROR')
    this.name = 'ActionExecutionError'
    if (cause) {
      this.cause = cause
    }
  }
}

/**
 * Error thrown when a plugin fails to load
 */
export class PluginLoadError extends ArereError {
  constructor(pluginName: string, cause?: Error) {
    super(t('errors:plugin_load_error', { name: pluginName }), 'PLUGIN_LOAD_ERROR')
    this.name = 'PluginLoadError'
    if (cause) {
      this.cause = cause
    }
  }
}

/**
 * Format error for display
 */
export function formatError(error: unknown): string {
  if (error instanceof ArereError) {
    let result = error.message
    if (error.code) {
      result = `[${error.code}] ${result}`
    }
    if (error.cause) {
      result += `\n${t('errors:caused_by', { message: formatError(error.cause) })}`
    }
    return result
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}
