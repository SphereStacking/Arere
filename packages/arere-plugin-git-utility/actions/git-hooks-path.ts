import { defineAction } from 'arere'

export default defineAction({
  description: 'Configure git hooks path (core.hooksPath)',
  run: async ({ $, tui, prompt }) => {
    // Check if we're in a git repository
    const gitCheck = await $`git rev-parse --is-inside-work-tree`
    if (gitCheck.exitCode !== 0) {
      tui.output.error('Not a git repository')
      return
    }

    // Get current setting
    const current = await $`git config --get core.hooksPath`
    const currentPath = current.stdout.trim() || '.git/hooks (default)'
    tui.output.info(`Current hooks path: ${currentPath}`)
    tui.output.newline()

    // Select hooks directory
    const selected = await prompt.select('Select hooks directory:', {
      options: [
        { label: './githooks', value: './githooks' },
        { label: './.githooks', value: './.githooks' },
        { label: './.husky', value: './.husky' },
        { label: 'Reset to default (.git/hooks)', value: '__reset__' },
        { label: 'Enter custom path...', value: '__custom__' },
      ],
    })

    let finalPath: string

    if (selected === '__custom__') {
      finalPath = await prompt.text('Enter custom hooks path:')
    } else if (selected === '__reset__') {
      finalPath = ''
    } else {
      finalPath = selected
    }

    // Apply setting
    if (finalPath) {
      const result = await $`git config core.hooksPath ${finalPath}`
      if (result.exitCode !== 0) {
        tui.output.error('Failed to set core.hooksPath')
        return
      }
      tui.output.success(`Set core.hooksPath to: ${finalPath}`)
      tui.output.newline()
      tui.output.info(`Now create your hooks in ${finalPath}/`)
      tui.output.info('Example: pre-commit, pre-push, commit-msg')
    } else {
      const result = await $`git config --unset core.hooksPath`
      // --unset returns 5 if the key doesn't exist, which is fine
      if (result.exitCode !== 0 && result.exitCode !== 5) {
        tui.output.error('Failed to unset core.hooksPath')
        return
      }
      tui.output.success('Reset hooks path to default (.git/hooks)')
    }
  },
})
