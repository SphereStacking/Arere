import { defineAction } from 'arere'

export default defineAction({
  description: 'Clean up merged branches (local and remote tracking)',
  run: async ({ $, tui, prompt }) => {
    // Check if we're in a git repository
    const gitCheck = await $`git rev-parse --is-inside-work-tree`
    if (gitCheck.exitCode !== 0) {
      tui.output.error('Not a git repository')
      return
    }

    // Get current branch
    const currentBranchResult = await $`git branch --show-current`
    const currentBranch = currentBranchResult.stdout.trim()

    // Get default branch (main or master)
    const defaultBranchResult = await $`git symbolic-ref refs/remotes/origin/HEAD`
    let defaultBranch = 'main'
    if (defaultBranchResult.exitCode === 0) {
      defaultBranch = defaultBranchResult.stdout.trim().replace('refs/remotes/origin/', '')
    }

    tui.output.info(`Current branch: ${currentBranch}`)
    tui.output.info(`Default branch: ${defaultBranch}`)
    tui.output.newline()

    // Step 1: Fetch and prune remote tracking branches
    tui.output.section('Fetching and pruning remote tracking branches...')
    const fetchResult = await $`git fetch --prune`
    if (fetchResult.exitCode !== 0) {
      tui.output.warn('Failed to fetch from remote')
    } else {
      tui.output.success('Remote tracking branches updated')
    }
    tui.output.newline()

    // Step 2: Find merged local branches
    tui.output.section('Finding merged local branches...')

    const mergedResult = await $`git branch --merged ${defaultBranch}`
    if (mergedResult.exitCode !== 0) {
      tui.output.error('Failed to get merged branches')
      return
    }

    const mergedBranches = mergedResult.stdout
      .split('\n')
      .map((b) => b.trim().replace(/^\*\s*/, ''))
      .filter(
        (b) => b && b !== defaultBranch && b !== currentBranch && b !== 'main' && b !== 'master',
      )

    if (mergedBranches.length === 0) {
      tui.output.success('No merged branches to clean up')
      return
    }

    tui.output.info(`Found ${mergedBranches.length} merged branch(es):`)
    tui.output.list(mergedBranches)
    tui.output.newline()

    // Ask user to select branches to delete
    const selectedBranches = await prompt.multiSelect('Select branches to delete:', {
      options: mergedBranches.map((branch) => ({
        label: branch,
        value: branch,
      })),
    })

    if (selectedBranches.length === 0) {
      tui.output.info('No branches selected')
      return
    }

    // Confirm deletion
    const confirm = await prompt.confirm(
      `Delete ${selectedBranches.length} branch(es)? This cannot be undone.`,
    )

    if (!confirm) {
      tui.output.info('Cancelled')
      return
    }

    // Delete selected branches
    tui.output.newline()
    for (const branch of selectedBranches) {
      const deleteResult = await $`git branch -d ${branch}`
      if (deleteResult.exitCode === 0) {
        tui.output.success(`Deleted: ${branch}`)
      } else {
        tui.output.error(`Failed to delete: ${branch}`)
      }
    }

    tui.output.newline()
    tui.output.success('Branch cleanup complete!')
  },
})
