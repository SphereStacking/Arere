/**
 * Shell command executor using tagged template literals
 */

import { spawn } from 'node:child_process'
import type { ShellExecutor, ShellResult } from '@/action/types'
import { logger } from '@/lib/logger'

/**
 * Escape shell argument for safe execution
 */
function escapeShellArg(arg: unknown): string {
  const str = String(arg)

  // If the argument is already quoted or contains no special characters, return as-is
  if (/^[a-zA-Z0-9_\-./]+$/.test(str)) {
    return str
  }

  // Otherwise, wrap in single quotes and escape any single quotes
  return `'${str.replace(/'/g, "'\\''")}'`
}

/**
 * Create a shell executor function
 *
 * @returns Shell executor function that accepts tagged template literals
 *
 * @example
 * ```typescript
 * const $ = createShellExecutor()
 * const name = 'world'
 * const result = await $`echo Hello, ${name}!`
 * console.log(result.stdout) // "Hello, world!"
 * ```
 */
export function createShellExecutor(): ShellExecutor {
  return async (command: TemplateStringsArray, ...args: unknown[]): Promise<ShellResult> => {
    // Build the command string by interleaving template strings and arguments
    let commandString = command[0]
    for (let i = 0; i < args.length; i++) {
      commandString += escapeShellArg(args[i])
      commandString += command[i + 1]
    }

    logger.debug(`Executing shell command: ${commandString}`)

    return new Promise((resolve, reject) => {
      // Use /bin/sh to run the command
      const child = spawn('/bin/sh', ['-c', commandString], {
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      // Capture stdout
      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      // Capture stderr
      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      // Handle process exit
      child.on('close', (exitCode) => {
        const result: ShellResult = {
          stdout: stdout.trimEnd(),
          stderr: stderr.trimEnd(),
          exitCode: exitCode ?? 0,
        }

        if (exitCode === 0) {
          logger.debug('Command completed successfully')
          resolve(result)
        } else {
          logger.debug(`Command failed with exit code ${exitCode}`)
          logger.debug(`stderr: ${stderr}`)
          // Still resolve with the result (not reject), so actions can handle errors
          resolve(result)
        }
      })

      // Handle process errors
      child.on('error', (error) => {
        logger.error(`Failed to run command: ${error.message}`)
        reject(error)
      })
    })
  }
}
