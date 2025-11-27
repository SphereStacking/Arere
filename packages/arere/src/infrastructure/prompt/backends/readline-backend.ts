/**
 * ReadLine-based prompt backend for headless mode
 */

import readline from 'node:readline/promises'
import type { SelectChoice } from '@/domain/action/types'
import type { PromptRequest } from '@/infrastructure/prompt/renderer'

/**
 * Create ReadLine prompt backend
 * Returns a prompt handler for headless mode execution
 */
export function createReadLineBackend() {
  /**
   * Handle prompt request using readline
   */
  return async function handlePrompt(request: PromptRequest): Promise<unknown> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    try {
      switch (request.type) {
        case 'text':
          return await handleText(rl, request.message, request.options)

        case 'number':
          return await handleNumber(rl, request.message, request.options)

        case 'password':
          return await handlePassword(rl, request.message, request.options)

        case 'confirm':
          return await handleConfirm(rl, request.message, request.options)

        case 'select':
          return await handleSelect(rl, request.message, request.choices, request.options)

        case 'multiSelect':
          return await handleMultiSelect(rl, request.message, request.choices, request.options)

        case 'waitForEnter':
          return await handleWaitForEnter(rl, request.message)

        case 'waitForKey':
          return await handleWaitForKey(rl, request.message, request.keys, request.caseInsensitive)

        default:
          throw new Error(`Unknown prompt type: ${(request as any).type}`)
      }
    } finally {
      rl.close()
    }
  }
}

/**
 * Handle text input
 */
async function handleText(
  rl: readline.Interface,
  message: string,
  options?: {
    defaultValue?: string
    placeholder?: string
    validate?: (value: string) => boolean | string
  },
): Promise<string> {
  const defaultHint = options?.defaultValue ? ` (default: ${options.defaultValue})` : ''
  const placeholderHint = options?.placeholder ? ` [${options.placeholder}]` : ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = await rl.question(`${message}${defaultHint}${placeholderHint}: `)
    const value = answer.trim() || options?.defaultValue || ''

    // Validate
    if (options?.validate) {
      const result = options.validate(value)
      if (result === true) {
        return value
      }
      if (typeof result === 'string') {
        console.error(`✗ ${result}`)
        continue
      }
      return value
    }

    return value
  }
}

/**
 * Handle number input
 */
async function handleNumber(
  rl: readline.Interface,
  message: string,
  options?: { defaultValue?: number; min?: number; max?: number; integer?: boolean },
): Promise<number> {
  const defaultHint =
    options?.defaultValue !== undefined ? ` (default: ${options.defaultValue})` : ''
  const rangeHint =
    options?.min !== undefined || options?.max !== undefined
      ? ` [${options.min ?? ''}..${options.max ?? ''}]`
      : ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = await rl.question(`${message}${defaultHint}${rangeHint}: `)
    const value = answer.trim() ? Number(answer.trim()) : options?.defaultValue

    if (value === undefined) {
      console.error('✗ Number is required')
      continue
    }

    if (Number.isNaN(value)) {
      console.error('✗ Invalid number')
      continue
    }

    if (options?.integer && !Number.isInteger(value)) {
      console.error('✗ Integer required')
      continue
    }

    if (options?.min !== undefined && value < options.min) {
      console.error(`✗ Must be >= ${options.min}`)
      continue
    }

    if (options?.max !== undefined && value > options.max) {
      console.error(`✗ Must be <= ${options.max}`)
      continue
    }

    return value
  }
}

/**
 * Handle password input (masked)
 */
async function handlePassword(
  rl: readline.Interface,
  message: string,
  options?: { minLength?: number },
): Promise<string> {
  // Note: readline doesn't support masking, so we'll just hide input
  const minHint = options?.minLength ? ` (min: ${options.minLength} chars)` : ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Simple approach: just read normally (readline can't mask in terminal)
    // In production, consider using a package like 'read' for proper masking
    const answer = await rl.question(`${message}${minHint}: `)

    if (options?.minLength && answer.length < options.minLength) {
      console.error(`✗ Password must be at least ${options.minLength} characters`)
      continue
    }

    return answer
  }
}

/**
 * Handle confirm (y/n)
 */
async function handleConfirm(
  rl: readline.Interface,
  message: string,
  options?: { defaultValue?: boolean },
): Promise<boolean> {
  const defaultHint =
    options?.defaultValue !== undefined ? ` (${options.defaultValue ? 'Y/n' : 'y/N'})` : ' (y/n)'

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = await rl.question(`${message}${defaultHint}: `)
    const normalized = answer.trim().toLowerCase()

    if (!normalized && options?.defaultValue !== undefined) {
      return options.defaultValue
    }

    if (normalized === 'y' || normalized === 'yes') {
      return true
    }

    if (normalized === 'n' || normalized === 'no') {
      return false
    }

    console.error('✗ Please answer y or n')
  }
}

/**
 * Handle select (single choice)
 */
async function handleSelect<T>(
  rl: readline.Interface,
  message: string,
  choices: SelectChoice<T>[],
  options?: { defaultValue?: T },
): Promise<T> {
  // Display choices
  console.log(`${message}`)
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]
    const desc = choice.description ? ` - ${choice.description}` : ''
    const defaultMark =
      options?.defaultValue !== undefined && choice.value === options.defaultValue
        ? ' (default)'
        : ''
    console.log(`  ${i + 1}. ${choice.label}${desc}${defaultMark}`)
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = await rl.question('Enter choice number: ')

    // Handle default
    if (!answer.trim() && options?.defaultValue !== undefined) {
      return options.defaultValue
    }

    const index = Number(answer.trim()) - 1

    if (Number.isNaN(index) || index < 0 || index >= choices.length) {
      console.error(`✗ Invalid choice. Enter 1-${choices.length}`)
      continue
    }

    return choices[index].value
  }
}

/**
 * Handle multi-select (multiple choices)
 */
async function handleMultiSelect<T>(
  rl: readline.Interface,
  message: string,
  choices: SelectChoice<T>[],
  options?: { defaultValue?: T[]; min?: number; max?: number },
): Promise<T[]> {
  // Display choices
  console.log(`${message}`)
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i]
    const desc = choice.description ? ` - ${choice.description}` : ''
    console.log(`  ${i + 1}. ${choice.label}${desc}`)
  }

  const minHint = options?.min ? ` (min: ${options.min})` : ''
  const maxHint = options?.max ? ` (max: ${options.max})` : ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = await rl.question(`Enter choice numbers (comma-separated)${minHint}${maxHint}: `)

    // Handle default
    if (!answer.trim() && options?.defaultValue) {
      return options.defaultValue
    }

    const indices = answer
      .split(',')
      .map((s) => Number(s.trim()) - 1)
      .filter((i) => !Number.isNaN(i))

    // Validate indices
    const invalidIndices = indices.filter((i) => i < 0 || i >= choices.length)
    if (invalidIndices.length > 0) {
      console.error(`✗ Invalid choices. Enter 1-${choices.length}`)
      continue
    }

    // Validate min/max
    if (options?.min && indices.length < options.min) {
      console.error(`✗ Select at least ${options.min} choices`)
      continue
    }

    if (options?.max && indices.length > options.max) {
      console.error(`✗ Select at most ${options.max} choices`)
      continue
    }

    return indices.map((i) => choices[i].value)
  }
}

/**
 * Handle wait for enter
 */
async function handleWaitForEnter(rl: readline.Interface, message?: string): Promise<void> {
  await rl.question(message ? `${message} (press Enter)` : 'Press Enter to continue...')
}

/**
 * Handle wait for specific key
 */
async function handleWaitForKey(
  rl: readline.Interface,
  message?: string,
  keys?: string[],
  caseInsensitive?: boolean,
): Promise<string> {
  const keysHint = keys ? ` [${keys.join('/')}]` : ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const answer = await rl.question(`${message || 'Press a key'}${keysHint}: `)

    if (!keys) {
      return answer
    }

    const normalized = caseInsensitive ? answer.toLowerCase() : answer
    const normalizedKeys = caseInsensitive ? keys.map((k) => k.toLowerCase()) : keys

    if (normalizedKeys.includes(normalized)) {
      return answer
    }

    console.error(`✗ Invalid key. Expected: ${keys.join(', ')}`)
  }
}
