/**
 * Wrapper functions to add argument resolution to prompt methods
 */

import type {
  ConfirmOptions,
  MultiSelectOptions,
  NumberOptions,
  PasswordOptions,
  PromptAPI,
  SelectChoice,
  SelectOptions,
  TextOptions,
} from '@/domain/action/types'
import { confirm } from '@/infrastructure/prompt/confirm'
import { form } from '@/infrastructure/prompt/form'
import { multiSelect } from '@/infrastructure/prompt/multiSelect'
import { number } from '@/infrastructure/prompt/number'
import { password } from '@/infrastructure/prompt/password'
import { select } from '@/infrastructure/prompt/select'
import { text } from '@/infrastructure/prompt/text'
import { type ParsedArgs, getArgValue, getFlagValue, hasArgMapping, parseArgs } from './parser'
import {
  convertToBoolean,
  convertToMultiSelectValue,
  convertToNumber,
  convertToSelectValue,
  validateTextValue,
} from './validator'

/**
 * Create a prompt API with argument resolution support
 *
 * When arguments are provided and match the ArgMapping in options,
 * the value is resolved from arguments instead of showing the prompt.
 *
 * @param args - CLI arguments passed to the action
 * @param isInteractive - Whether the terminal is interactive
 * @returns PromptAPI with argument resolution
 */
export function createPromptAPIWithArgs(args: string[], isInteractiveFn: () => boolean): PromptAPI {
  const parsedArgs = parseArgs(args)

  // Helper to format arg name for error messages
  const formatArgForError = (options: {
    arg?: string
    argShort?: string
    argIndex?: number
  }): string => {
    if (options.arg) return `--${options.arg}`
    if (options.argShort) return `-${options.argShort}`
    if (options.argIndex !== undefined) return `argument at position ${options.argIndex}`
    return 'argument'
  }

  // Helper to get raw arg name for validator (without prefix)
  const getArgName = (options: { arg?: string; argShort?: string; argIndex?: number }): string =>
    options.arg || options.argShort || `position ${options.argIndex}`

  // Wrap text prompt
  const wrappedText = async (message: string, options?: TextOptions): Promise<string> => {
    if (options && hasArgMapping(options)) {
      const argValue = getArgValue(parsedArgs, options)
      if (argValue !== undefined) {
        return validateTextValue(argValue, getArgName(options), {
          minLength: options.minLength,
          maxLength: options.maxLength,
          pattern: options.pattern,
        })
      }
      // In non-interactive mode, throw error if required
      if (!isInteractiveFn()) {
        throw new Error(
          `Required argument ${formatArgForError(options)} is missing (non-interactive mode)`,
        )
      }
    }
    return text(message, options)
  }

  // Wrap number prompt
  const wrappedNumber = async (message: string, options?: NumberOptions): Promise<number> => {
    if (options && hasArgMapping(options)) {
      const argValue = getArgValue(parsedArgs, options)
      if (argValue !== undefined) {
        return convertToNumber(argValue, getArgName(options), {
          min: options.min,
          max: options.max,
        })
      }
      if (!isInteractiveFn()) {
        if (options.defaultValue !== undefined) {
          return options.defaultValue
        }
        throw new Error(
          `Required argument ${formatArgForError(options)} is missing (non-interactive mode)`,
        )
      }
    }
    return number(message, options)
  }

  // Wrap password prompt
  const wrappedPassword = async (message: string, options?: PasswordOptions): Promise<string> => {
    if (options && hasArgMapping(options)) {
      const argValue = getArgValue(parsedArgs, options)
      if (argValue !== undefined) {
        return validateTextValue(argValue, getArgName(options), {
          minLength: options.minLength,
        })
      }
      if (!isInteractiveFn()) {
        throw new Error(
          `Required argument ${formatArgForError(options)} is missing (non-interactive mode)`,
        )
      }
    }
    return password(message, options)
  }

  // Wrap select prompt
  const wrappedSelect = async <T>(
    message: string,
    choices: T[] | SelectChoice<T>[],
    options?: SelectOptions<T>,
  ): Promise<T> => {
    if (options && hasArgMapping(options)) {
      const argValue = getArgValue(parsedArgs, options)
      if (argValue !== undefined) {
        return convertToSelectValue(argValue, choices, getArgName(options))
      }
      if (!isInteractiveFn()) {
        if (options.defaultValue !== undefined) {
          return options.defaultValue
        }
        throw new Error(
          `Required argument ${formatArgForError(options)} is missing (non-interactive mode)`,
        )
      }
    }
    return select(message, choices, options)
  }

  // Wrap confirm prompt
  const wrappedConfirm = async (message: string, options?: ConfirmOptions): Promise<boolean> => {
    if (options && hasArgMapping(options)) {
      const flagValue = getFlagValue(parsedArgs, options)
      if (flagValue !== undefined) {
        return flagValue
      }
      const argValue = getArgValue(parsedArgs, options)
      if (argValue !== undefined) {
        return convertToBoolean(argValue, getArgName(options))
      }
      if (!isInteractiveFn()) {
        if (options.defaultValue !== undefined) {
          return options.defaultValue
        }
        throw new Error(
          `Required argument ${formatArgForError(options)} is missing (non-interactive mode)`,
        )
      }
    }
    return confirm(message, options)
  }

  // Wrap multiSelect prompt
  const wrappedMultiSelect = async <T>(
    message: string,
    choices: T[] | SelectChoice<T>[],
    options?: MultiSelectOptions<T>,
  ): Promise<T[]> => {
    if (options && hasArgMapping(options)) {
      const argValue = getArgValue(parsedArgs, options)
      if (argValue !== undefined) {
        return convertToMultiSelectValue(argValue, choices, getArgName(options))
      }
      if (!isInteractiveFn()) {
        if (options.defaultValue !== undefined) {
          return options.defaultValue
        }
        throw new Error(
          `Required argument ${formatArgForError(options)} is missing (non-interactive mode)`,
        )
      }
    }
    return multiSelect(message, choices, options)
  }

  // Create prompt API with wrapped methods
  const promptAPI: PromptAPI = Object.assign(form, {
    text: wrappedText,
    number: wrappedNumber,
    password: wrappedPassword,
    select: wrappedSelect,
    confirm: wrappedConfirm,
    multiSelect: wrappedMultiSelect,
  })

  return promptAPI
}
