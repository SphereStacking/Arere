/**
 * Deploy action - demonstrates args usage
 *
 * Usage:
 *   arere run deploy                    # Deploy to staging
 *   arere run deploy production         # Deploy to production
 *   arere run deploy production --force # Force deploy to production
 */

import { defineAction } from 'arere'

export default defineAction({
  name: 'deploy',
  description: 'Deploy to target environment',
  run: async ({ args, tui }) => {
    const target = args[0] || 'staging'
    const force = args.includes('--force')

    tui.output.info(`Target: ${target}`)
    tui.output.info(`Force: ${force}`)
    tui.output.info(`All args: ${JSON.stringify(args)}`)

    if (force) {
      tui.output.warn('Force mode enabled - skipping confirmations')
    }

    tui.output.success(`Deployed to ${target}!`)
  },
})
