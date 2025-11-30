import { defineAction } from 'arere'

export default defineAction({
  description: 'Run lint check',
  run: async ({ $, tui }) => {
    tui.output.info('Running lint...')
    const result = await $`npm run lint`
    if (result.exitCode !== 0) {
      throw new Error('Lint failed')
    }
    tui.output.success('Lint passed!')
  },
})
