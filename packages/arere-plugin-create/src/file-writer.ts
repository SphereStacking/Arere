/**
 * File writing utilities
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export type Scope = 'workspace' | 'global'

/**
 * Resolve action directory path based on scope
 */
export function resolveActionDir(scope: Scope, cwd: string): string {
  if (scope === 'workspace') {
    return join(cwd, '.arere', 'actions')
  }
  return join(homedir(), '.arere', 'actions')
}

/**
 * Ensure directory exists (create if not)
 */
export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath)
}

/**
 * Write action file
 */
export function writeActionFile(options: {
  scope: Scope
  name: string
  content: string
  cwd: string
}): string {
  const { scope, name, content, cwd } = options

  // Resolve directory path
  const actionDir = resolveActionDir(scope, cwd)

  // Ensure directory exists
  ensureDir(actionDir)

  // Write file
  const filePath = join(actionDir, `${name}.ts`)
  writeFileSync(filePath, content, 'utf-8')

  return filePath
}
