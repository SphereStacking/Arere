/**
 * Prompt renderer - bridges prompt API with UI components
 */

import type { FormFields, FormPage, StepFormOptions } from './form/types'
import type {
  ConfirmOptions,
  MultiSelectOptions,
  NumberOptions,
  PasswordOptions,
  SelectChoice,
  SelectOptions,
  TextOptions,
} from './types'

/**
 * Prompt request types
 */
export type PromptRequest =
  | {
      type: 'text'
      message: string
      options?: TextOptions
    }
  | {
      type: 'number'
      message: string
      options?: NumberOptions
    }
  | {
      type: 'password'
      message: string
      options?: PasswordOptions
    }
  | {
      type: 'select'
      message: string
      choices: SelectChoice<unknown>[]
      options?: SelectOptions<unknown>
    }
  | {
      type: 'confirm'
      message: string
      options?: ConfirmOptions
    }
  | {
      type: 'multiSelect'
      message: string
      choices: SelectChoice<unknown>[]
      options?: MultiSelectOptions<unknown>
    }
  | {
      type: 'waitForEnter'
      message?: string
    }
  | {
      type: 'waitForKey'
      message?: string
      keys?: string[]
      caseInsensitive?: boolean
    }
  | {
      type: 'form'
      form: FormPage<FormFields>
    }
  | {
      type: 'stepForm'
      steps: FormPage<FormFields>[]
      options?: StepFormOptions<FormFields[]>
    }

/**
 * Prompt handler function type
 */
export type PromptHandler = (request: PromptRequest) => Promise<unknown>

/**
 * Global prompt handler (set by UI layer)
 */
let globalPromptHandler: PromptHandler | null = null

/**
 * Set the global prompt handler
 * This should be called by the UI layer (App component) on initialization
 */
export function setPromptHandler(handler: PromptHandler): void {
  globalPromptHandler = handler
}

/**
 * Clear the global prompt handler
 */
export function clearPromptHandler(): void {
  globalPromptHandler = null
}

/**
 * Render a prompt request
 * This is called by prompt API functions
 */
export async function renderPrompt(request: PromptRequest): Promise<unknown> {
  if (!globalPromptHandler) {
    throw new Error('Prompt handler not set. Make sure the UI layer is initialized.')
  }

  return globalPromptHandler(request)
}
