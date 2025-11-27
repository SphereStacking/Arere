/**
 * Git Utilities
 * Extract author information from git config
 */

import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export interface GitConfig {
  name: string | null
  email: string | null
}

/**
 * Get git config value
 */
async function getGitConfig(key: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`git config --get ${key}`)
    return stdout.trim() || null
  } catch {
    return null
  }
}

/**
 * Get author information from git config
 */
export async function getGitAuthorInfo(): Promise<GitConfig> {
  const [name, email] = await Promise.all([getGitConfig('user.name'), getGitConfig('user.email')])

  return {
    name,
    email,
  }
}

/**
 * Get author name with fallback
 */
export async function getAuthorName(fallback = 'Anonymous'): Promise<string> {
  const { name } = await getGitAuthorInfo()
  return name || fallback
}

/**
 * Get author email with fallback
 */
export async function getAuthorEmail(fallback = 'noreply@example.com'): Promise<string> {
  const { email } = await getGitAuthorInfo()
  return email || fallback
}
