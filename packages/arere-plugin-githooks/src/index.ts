/**
 * Git Hooks plugin for 'arere' launcher
 *
 * Run the same TypeScript actions locally (UI), in git hooks (pre-commit, pre-push),
 * and in CI/CD (GitHub Actions). No code duplication!
 *
 * Features:
 * - githooks:install - Install git hooks
 * - githooks:uninstall - Uninstall git hooks
 * - githooks:run - Run hook actions (called by git hooks)
 * - githooks:status - Show current hook status
 */

import { definePlugin } from 'arere'
import { z } from 'zod'

/**
 * Hook configuration schema
 */
const hookConfigSchema = z.object({
  actions: z.array(z.string()).describe('Actions to run for this hook'),
  enabled: z.boolean().default(true).describe('Whether this hook is enabled'),
})

/**
 * Plugin configuration schema
 */
const configSchema = z.object({
  hooks: z
    .record(
      z.enum([
        'pre-commit',
        'prepare-commit-msg',
        'commit-msg',
        'post-commit',
        'pre-push',
        'pre-rebase',
        'post-checkout',
        'post-merge',
      ]),
      hookConfigSchema,
    )
    .default({})
    .describe('Git hooks configuration'),
})

export type HookConfig = z.infer<typeof hookConfigSchema>
export type PluginConfig = z.infer<typeof configSchema>

export default definePlugin({
  meta: {
    name: 'arere-plugin-githooks',
    version: '0.1.0',
    description:
      'Git hooks plugin - run the same TypeScript actions locally, in git hooks, and in CI/CD',
    author: 'arere team',
  },
  actions: [
    'actions/githooks-install.ts',
    'actions/githooks-uninstall.ts',
    'actions/githooks-run.ts',
    'actions/githooks-status.ts',
  ],
  configSchema,
})
