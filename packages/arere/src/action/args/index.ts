/**
 * CLI argument handling for headless mode
 */

export {
  parseArgs,
  getArgValue,
  getFlagValue,
  hasArgMapping,
  type ParsedArgs,
} from './parser'

export {
  ArgValidationError,
  convertToNumber,
  convertToBoolean,
  convertToSelectValue,
  convertToMultiSelectValue,
  validateTextValue,
} from './validator'

export { createPromptAPIWithArgs } from './prompt-wrapper'

export {
  analyzeActionArgs,
  formatArgsHelp,
  type ArgMeta,
  type ActionArgsMeta,
} from './analyzer'
