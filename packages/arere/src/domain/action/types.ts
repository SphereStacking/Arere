/**
 * Action-related type definitions
 */

/**
 * Action metadata (for loaded actions - name is always present)
 */
export interface ActionMeta {
  /** Action name (unique identifier) */
  name: string
  /** Action description (can be a plain string or function) */
  description: string | ((context: ActionContext) => string)
  /** Optional category for grouping */
  category?: string
  /** Optional tags for classification */
  tags?: string[]
}

/**
 * Base prompt options (common properties)
 */
export interface BasePromptOptions<T> {
  /** Placeholder text */
  placeholder?: string
  /** Default value */
  defaultValue?: T
  /** Validation function */
  validate?: (value: T) => boolean | string
}

/**
 * Text input options
 */
export interface TextOptions extends BasePromptOptions<string> {
  /** Enable multiline input */
  multiline?: boolean

  /** Prefix text (read-only, always prepended to input) */
  prefix?: string

  /** Suffix text (read-only, always appended to input) */
  suffix?: string

  /** Maximum length (including prefix/suffix) */
  maxLength?: number

  /** Minimum length (including prefix/suffix) */
  minLength?: number

  /** Input pattern restriction (blocks non-matching characters) */
  pattern?: RegExp

  /** Format transformation (applied on submit) */
  format?: 'lowercase' | 'uppercase' | 'trim' | 'kebab-case' | ((value: string) => string)
}

/**
 * Number input options
 */
export interface NumberOptions extends BasePromptOptions<number> {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
}

/**
 * Password input options
 */
export interface PasswordOptions extends Omit<BasePromptOptions<string>, 'defaultValue'> {
  /** Minimum length */
  minLength?: number
}

/**
 * Select options
 */
export interface SelectOptions<T> extends Pick<BasePromptOptions<T>, 'defaultValue'> {}

/**
 * Confirm options
 */
export interface ConfirmOptions extends Pick<BasePromptOptions<boolean>, 'defaultValue'> {}

/**
 * Multiple select options
 */
export interface MultiSelectOptions<T> extends Pick<BasePromptOptions<T[]>, 'defaultValue'> {
  /** Minimum selection count */
  min?: number
  /** Maximum selection count */
  max?: number
}

/**
 * Select choice
 */
export interface SelectChoice<T> {
  /** Display label */
  label: string
  /** Actual value */
  value: T
  /** Optional description */
  description?: string
}

/**
 * Shell execution result
 */
export interface ShellResult {
  /** Standard output */
  stdout: string
  /** Standard error */
  stderr: string
  /** Exit code */
  exitCode: number
}

/**
 * Shell executor function type (tagged template literal)
 */
export type ShellExecutor = (
  command: TemplateStringsArray,
  ...args: unknown[]
) => Promise<ShellResult>

/**
 * Form types re-export
 */
export type {
  FormField,
  FormFields,
  FormFieldBase,
  FormPage,
  FormResult,
  TextFormField,
  NumberFormField,
  PasswordFormField,
  SelectFormField,
  ConfirmFormField,
  MultiSelectFormField,
  StepFormOptions,
  MergedFormResult,
} from '@/infrastructure/prompt/form/types'

import type {
  FormFields,
  FormPage,
  FormResult,
  StepFormOptions,
} from '@/infrastructure/prompt/form/types'

/**
 * Prompt API shorthand methods
 */
export interface PromptAPIMethods {
  /** Text input */
  text(message: string, options?: TextOptions): Promise<string>
  /** Number input */
  number(message: string, options?: NumberOptions): Promise<number>
  /** Password input (masked) */
  password(message: string, options?: PasswordOptions): Promise<string>
  /** Single selection */
  select<T>(
    message: string,
    choices: T[] | SelectChoice<T>[],
    options?: SelectOptions<T>,
  ): Promise<T>
  /** Yes/No confirmation */
  confirm(message: string, options?: ConfirmOptions): Promise<boolean>
  /** Multiple selection */
  multiSelect<T>(
    message: string,
    choices: T[] | SelectChoice<T>[],
    options?: MultiSelectOptions<T>,
  ): Promise<T[]>
}

/**
 * Prompt API callable signature (for form prompts)
 */
export interface PromptAPICallable {
  /**
   * Display a form with multiple fields
   *
   * @param form - Form definition with fields
   * @returns Promise resolving to form result
   *
   * @example
   * ```typescript
   * const result = await tui.prompt({
   *   title: 'User Registration',
   *   fields: {
   *     name: { type: 'text', message: 'Name' },
   *     age: { type: 'number', message: 'Age' },
   *   },
   * })
   * // result: { name: string, age: number }
   * ```
   */
  <T extends FormFields>(form: FormPage<T>): Promise<FormResult<T>>

  /**
   * Display a step form (wizard) with multiple pages
   *
   * @param steps - Array of form pages
   * @param options - Optional step form options (e.g., cross-step validation)
   * @returns Promise resolving to merged form results from all steps
   *
   * @example
   * ```typescript
   * const result = await tui.prompt([
   *   { title: 'Step 1', fields: { name: { type: 'text', message: 'Name' } } },
   *   { title: 'Step 2', fields: { email: { type: 'text', message: 'Email' } } },
   * ])
   * // result: { name: string, email: string }
   * ```
   */
  (
    steps: FormPage<FormFields>[],
    options?: StepFormOptions<FormFields[]>,
  ): Promise<Record<string, unknown>>
}

/**
 * Prompt API interface
 *
 * Can be called directly with a form definition, or use shorthand methods.
 *
 * @example Form mode
 * ```typescript
 * const result = await tui.prompt({
 *   title: 'Settings',
 *   fields: {
 *     theme: { type: 'select', message: 'Theme', choices: ['light', 'dark'] },
 *   },
 * })
 * ```
 *
 * @example Shorthand mode
 * ```typescript
 * const name = await tui.prompt.text('Enter name')
 * const confirmed = await tui.prompt.confirm('Are you sure?')
 * ```
 */
export type PromptAPI = PromptAPICallable & PromptAPIMethods

/**
 * TUI API interface (combines prompt, output, and control)
 */
export interface TuiAPI {
  /** Prompt API for user interaction */
  prompt: PromptAPI
  /** Output API for displaying messages */
  output: import('@/infrastructure/output/types').OutputAPI
  /** Control API for timing and visual feedback */
  control: import('@/presentation/ui/control/types').ControlAPI
}

/**
 * Action execution context
 *
 * @template TKeys - Translation keys (string literal union for type safety)
 */
export interface ActionContext<TKeys extends string = string> {
  /** TUI API (prompt + output + control) */
  tui: TuiAPI
  /** Shell executor for running commands */
  $: ShellExecutor
  /**
   * Translation function (scoped to action's namespace)
   * Type-safe when TKeys is specified
   */
  t: (key: TKeys, options?: { [key: string]: unknown }) => string
  /** Current working directory */
  cwd: string
  /** Environment variables */
  env: Record<string, string | undefined>
  /** Plugin configuration (available only for plugin actions) */
  pluginConfig?: Record<string, unknown>

  /**
   * Current application configuration (merged result)
   *
   * Priority: workspace > user > defaults
   *
   * @remarks
   * - Read-only access to application configuration
   * - To modify configuration, use Settings UI or ConfigService
   * - For diagnostic purposes requiring layer-specific config, use `FileConfigManager.loadLayer()` directly
   *
   * @example Basic usage
   * ```typescript
   * export default defineAction({
   *   name: 'check-theme',
   *   description: 'Display current theme color',
   *   async run({ config, tui }) {
   *     const color = config.theme.primaryColor
   *     tui.output.info(`Primary color: ${color}`)
   *   }
   * })
   * ```
   *
   * @example Conditional behavior based on config
   * ```typescript
   * export default defineAction({
   *   name: 'smart-logger',
   *   description: 'Log with current log level',
   *   async run({ config, tui }) {
   *     if (config.logLevel === 'debug') {
   *       tui.output.log('[DEBUG] Detailed information...')
   *     } else {
   *       tui.output.log('[INFO] Summary information...')
   *     }
   *   }
   * })
   * ```
   */
  config: import('@/infrastructure/config/schema').ArereConfig
}

/**
 * Action location types
 */
export type ActionLocation =
  | 'project' // Project action (./.arere/)
  | 'global' // Global action (~/.arere/)
  | { plugin: string } // Plugin action (plugin:plugin-name)

/**
 * Action definition
 *
 * @template TKeys - Translation keys (for type-safe translations)
 */
export interface Action<TKeys extends string = string> {
  /** Action metadata */
  meta: ActionMeta
  /** File path of the action */
  filePath: string
  /** Action location (automatically set by loader) */
  location?: ActionLocation
  /** Run function */
  run: (context: ActionContext<TKeys>) => Promise<void>
  /** Optional translations for this action */
  translations?: Record<string, Record<string, unknown>>
  /** Plugin namespace (automatically set for plugin actions) */
  pluginNamespace?: string
  /** Plugin metadata (automatically set for plugin actions) */
  pluginMeta?: import('@/domain/plugin/types').PluginMeta
}

/**
 * Action definition function parameter
 *
 * @template TKeys - Translation keys (for type-safe translations)
 */
export interface ActionDefinition<TKeys extends string = string> {
  /** Action name (optional - if omitted, derived from filename) */
  name?: string
  /** Action description (can be a plain string or function) */
  description: string | ((context: ActionContext<TKeys>) => string)
  /** Optional category */
  category?: string
  /** Optional tags for classification */
  tags?: string[]
  /** Run function */
  run: (context: ActionContext<TKeys>) => Promise<void>
  /** Optional translations for this action */
  translations?: Record<string, Record<string, unknown>>
}
