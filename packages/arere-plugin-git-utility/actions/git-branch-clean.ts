import { defineAction } from 'arere'

export default defineAction({
  description: 'plugin:actions.git-branch-clean.description',
  run: async ({ $, tui, t }) => {
    const { prompt, output } = tui

    // Check if we're in a git repository
    const gitCheck = await $`git rev-parse --is-inside-work-tree`
    if (gitCheck.exitCode !== 0) {
      output.error(t('plugin:notGitRepository'))
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

    output.info(t('plugin:branchClean.currentBranch', { branch: currentBranch }))
    output.info(t('plugin:branchClean.defaultBranch', { branch: defaultBranch }))
    output.newline()

    // Step 1: Fetch and prune remote tracking branches
    output.section(t('plugin:branchClean.fetchingPruning'))
    const fetchResult = await $`git fetch --prune`
    if (fetchResult.exitCode !== 0) {
      output.warn(t('plugin:branchClean.fetchFailed'))
    } else {
      output.success(t('plugin:branchClean.fetchSuccess'))
    }
    output.newline()

    // Step 2: Find merged local branches
    output.section(t('plugin:branchClean.findingMerged'))

    const mergedResult = await $`git branch --merged ${defaultBranch}`
    if (mergedResult.exitCode !== 0) {
      output.error(t('plugin:branchClean.getMergedFailed'))
      return
    }

    const mergedBranches = mergedResult.stdout
      .split('\n')
      .map((b) => b.trim().replace(/^\*\s*/, ''))
      .filter(
        (b) => b && b !== defaultBranch && b !== currentBranch && b !== 'main' && b !== 'master',
      )

    if (mergedBranches.length === 0) {
      output.success(t('plugin:branchClean.noMergedBranches'))
      return
    }

    output.info(t('plugin:branchClean.foundBranches', { count: mergedBranches.length }))
    output.list(mergedBranches)
    output.newline()

    // Ask user to select branches to delete
    const selectedBranches = await prompt.multiSelect(
      t('plugin:branchClean.selectBranches'),
      mergedBranches.map((branch) => ({
        label: branch,
        value: branch,
      })),
    )

    if (selectedBranches.length === 0) {
      output.info(t('plugin:branchClean.noBranchesSelected'))
      return
    }

    // Confirm deletion
    const confirm = await prompt.confirm(
      t('plugin:branchClean.confirmDelete', { count: selectedBranches.length }),
    )

    if (!confirm) {
      output.info(t('plugin:cancelled'))
      return
    }

    // Delete selected branches
    output.newline()
    for (const branch of selectedBranches) {
      const deleteResult = await $`git branch -d ${branch}`
      if (deleteResult.exitCode === 0) {
        output.success(t('plugin:branchClean.deleted', { branch }))
      } else {
        output.error(t('plugin:branchClean.deleteFailed', { branch }))
      }
    }

    output.newline()
    output.success(t('plugin:branchClean.complete'))
  },
})
