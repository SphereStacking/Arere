/**
 * Tutorial plugin for 'arere' launcher
 *
 * 13 step-by-step tutorials covering:
 * - Level Basic (01-04): Hello World, Output API, Prompt API, Shell Executor
 * - Level Intermediate (05-08): i18n, Config, Error Handling
 * - Level Advanced (09-13): Visual Feedback, Timing, Headless Mode, External SDK, Form API
 */

import { definePlugin } from 'arere'
import { z } from 'zod'

export default definePlugin({
  meta: {
    name: 'arere-plugin-tutorial',
    version: '2.0.0',
    description: 'Official tutorial plugin - 13 step-by-step tutorials for learning arere',
    author: 'arere team',
    i18nNamespace: 'plugin-tutorial',
  },
  actions: [
    // Level Basic
    'actions/01-hello-world.ts',
    'actions/02-output-api.ts',
    'actions/03-prompt-basics.ts',
    'actions/04-prompt-form.ts',
    'actions/05-shell-executor.ts',
    // Level Intermediate
    'actions/06-i18n-inline.ts',
    'actions/07-i18n-locales.ts',
    'actions/08-config-usage.ts',
    'actions/09-error-handling.ts',
    // Level Advanced
    'actions/10-visual-feedback.ts',
    'actions/11-timing-control.ts',
    'actions/12-headless-mode.ts',
    'actions/13-external-sdk.ts',
  ],
  locales: 'locales',
  configSchema: z.object({
    greeting: z.string().default('Hello').describe('Greeting message to use'),
    enableDebug: z.boolean().default(false).describe('Enable debug logging'),
    theme: z.enum(['light', 'dark', 'auto']).default('auto').describe('UI theme preference'),
    maxRetries: z.number().default(3).describe('Maximum number of retries for operations'),
    // Demo plugin config (from arere-plugin-demo)
    apiKey: z.string().default('demo-key-12345').describe('API key for external service'),
    timeout: z
      .number()
      .min(1000)
      .max(30000)
      .default(5000)
      .describe('Request timeout in milliseconds'),
    mode: z
      .enum(['development', 'production', 'test'])
      .default('development')
      .describe('Execution mode'),
    verbose: z.boolean().default(false).describe('Enable verbose logging'),
    // GitHub authentication
    githubToken: z
      .string()
      .optional()
      .describe('GitHub Personal Access Token (for authenticated API calls)'),
  }),
})
