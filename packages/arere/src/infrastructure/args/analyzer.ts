/**
 * Static analyzer for extracting argument metadata from action files
 * Uses ts-morph to parse TypeScript AST and extract prompt argument mappings
 */

import { Project, SyntaxKind } from 'ts-morph'

/**
 * Metadata for a single argument extracted from prompt calls
 */
export interface ArgMeta {
  /** Long argument name (--name) */
  name?: string
  /** Short argument name (-n) */
  short?: string
  /** Positional argument index */
  index?: number
  /** Prompt type (text, number, select, confirm, multiSelect, password) */
  type: 'text' | 'number' | 'select' | 'confirm' | 'multiSelect' | 'password'
  /** Description for --help */
  description?: string
  /** Available choices for select/multiSelect (if statically defined) */
  choices?: string[] | null
  /** Prompt message */
  message?: string
}

/**
 * Action metadata extracted from static analysis
 */
export interface ActionArgsMeta {
  /** Action name */
  name?: string
  /** Action description */
  description?: string
  /** Extracted arguments */
  args: ArgMeta[]
}

/**
 * Analyze an action file and extract argument metadata
 *
 * @param filePath - Path to the action TypeScript file
 * @returns Extracted metadata or null if parsing fails
 *
 * @example
 * ```typescript
 * const meta = analyzeActionArgs('/path/to/action.ts')
 * // meta.args contains all prompt calls with arg mappings
 * ```
 */
export function analyzeActionArgs(filePath: string): ActionArgsMeta | null {
  try {
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
      skipFileDependencyResolution: true,
    })

    const sourceFile = project.addSourceFileAtPath(filePath)

    const args: ArgMeta[] = []

    // Find all call expressions
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)

    for (const call of callExpressions) {
      const expression = call.getExpression().getText()

      // Check if it's a tui.prompt.* call
      const promptMatch = expression.match(
        /tui\.prompt\.(text|number|select|confirm|multiSelect|password)/,
      )
      if (!promptMatch) continue

      const promptType = promptMatch[1] as ArgMeta['type']
      const callArgs = call.getArguments()

      if (callArgs.length === 0) continue

      // Extract message (first argument)
      const messageArg = callArgs[0]
      const message =
        messageArg.getKind() === SyntaxKind.StringLiteral
          ? messageArg
              .getText()
              .slice(1, -1) // Remove quotes
          : undefined

      // Extract options (last argument if it's an object)
      const lastArg = callArgs[callArgs.length - 1]
      if (lastArg.getKind() !== SyntaxKind.ObjectLiteralExpression) continue

      const optionsObj = lastArg.asKind(SyntaxKind.ObjectLiteralExpression)
      if (!optionsObj) continue

      // Check if arg mapping exists
      const argProp = optionsObj.getProperty('arg')
      const argShortProp = optionsObj.getProperty('argShort')
      const argIndexProp = optionsObj.getProperty('argIndex')

      if (!argProp && !argShortProp && argIndexProp === undefined) continue

      // Extract arg values
      const argMeta: ArgMeta = {
        type: promptType,
        message,
      }

      // Extract arg name
      if (argProp) {
        const initializer = argProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
        if (initializer?.getKind() === SyntaxKind.StringLiteral) {
          argMeta.name = initializer.getText().slice(1, -1)
        }
      }

      // Extract argShort
      if (argShortProp) {
        const initializer = argShortProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
        if (initializer?.getKind() === SyntaxKind.StringLiteral) {
          argMeta.short = initializer.getText().slice(1, -1)
        }
      }

      // Extract argIndex
      if (argIndexProp) {
        const initializer = argIndexProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
        if (initializer?.getKind() === SyntaxKind.NumericLiteral) {
          argMeta.index = Number(initializer.getText())
        }
      }

      // Extract description
      const descProp = optionsObj.getProperty('description')
      if (descProp) {
        const initializer = descProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
        if (initializer?.getKind() === SyntaxKind.StringLiteral) {
          argMeta.description = initializer.getText().slice(1, -1)
        }
      }

      // Extract choices for select/multiSelect
      if (promptType === 'select' || promptType === 'multiSelect') {
        const choicesArg = callArgs[1] // Second argument is choices
        if (choicesArg?.getKind() === SyntaxKind.ArrayLiteralExpression) {
          const arrayExpr = choicesArg.asKind(SyntaxKind.ArrayLiteralExpression)
          if (arrayExpr) {
            const choices: string[] = []
            for (const element of arrayExpr.getElements()) {
              if (element.getKind() === SyntaxKind.StringLiteral) {
                choices.push(element.getText().slice(1, -1))
              } else {
                // Non-string element, mark as dynamic
                argMeta.choices = null
                break
              }
            }
            if (argMeta.choices !== null) {
              argMeta.choices = choices
            }
          }
        } else {
          // Dynamic choices (variable reference)
          argMeta.choices = null
        }
      }

      args.push(argMeta)
    }

    // Extract action name and description from defineAction call
    let actionName: string | undefined
    let actionDescription: string | undefined

    const defineActionCall = callExpressions.find(
      (call) => call.getExpression().getText() === 'defineAction',
    )

    if (defineActionCall) {
      const defineArg = defineActionCall.getArguments()[0]
      if (defineArg?.getKind() === SyntaxKind.ObjectLiteralExpression) {
        const obj = defineArg.asKind(SyntaxKind.ObjectLiteralExpression)

        // Get name
        const nameProp = obj?.getProperty('name')
        if (nameProp) {
          const init = nameProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
          if (init?.getKind() === SyntaxKind.StringLiteral) {
            actionName = init.getText().slice(1, -1)
          }
        }

        // Get description (if string literal)
        const descProp = obj?.getProperty('description')
        if (descProp) {
          const init = descProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
          if (init?.getKind() === SyntaxKind.StringLiteral) {
            actionDescription = init.getText().slice(1, -1)
          }
        }
      }
    }

    return {
      name: actionName,
      description: actionDescription,
      args,
    }
  } catch {
    return null
  }
}

/**
 * Format argument metadata as help text
 *
 * @param meta - Action metadata
 * @returns Formatted help string
 */
export function formatArgsHelp(meta: ActionArgsMeta): string {
  const lines: string[] = []

  if (meta.name) {
    lines.push(meta.name)
    if (meta.description) {
      lines.push(`  ${meta.description}`)
    }
    lines.push('')
  }

  if (meta.args.length === 0) {
    lines.push('No CLI arguments available for this action.')
    return lines.join('\n')
  }

  lines.push('Options:')

  for (const arg of meta.args) {
    const parts: string[] = []

    // Build option string
    if (arg.short) {
      parts.push(`-${arg.short}`)
    }
    if (arg.name) {
      parts.push(`--${arg.name}`)
    }
    if (arg.index !== undefined) {
      parts.push(`[position ${arg.index}]`)
    }

    // Add type hint
    let typeHint = ''
    if (arg.type === 'confirm') {
      typeHint = '' // Flags don't need type hint
    } else if (arg.choices) {
      typeHint = ` <${arg.choices.join('|')}>`
    } else if (arg.choices === null) {
      typeHint = ' <value>' // Dynamic choices
    } else if (arg.type === 'number') {
      typeHint = ' <number>'
    } else if (arg.type === 'multiSelect') {
      typeHint = ' <value,...>'
    } else {
      typeHint = ' <value>'
    }

    const optionStr = `  ${parts.join(', ')}${typeHint}`

    // Add description
    const desc = arg.description || arg.message || ''
    if (desc) {
      lines.push(`${optionStr.padEnd(40)} ${desc}`)
    } else {
      lines.push(optionStr)
    }
  }

  return lines.join('\n')
}
