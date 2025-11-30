import { defineAction } from 'arere'

export default defineAction({
  description: 'plugin:actions.git-branch-clean.description',
  run: async ({ $, tui, t }) => {
    // Check if we're in a git repository
    const gitCheck = await $`git rev-parse --is-inside-work-tree`
    if (gitCheck.exitCode !== 0) {
      tui.output.error(t('plugin:notGitRepository'))
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

    tui.output.info(t('plugin:branchClean.currentBranch', { branch: currentBranch }))
    tui.output.info(t('plugin:branchClean.defaultBranch', { branch: defaultBranch }))
    tui.output.newline()

    // Step 1: Fetch and prune remote tracking branches
    tui.output.section(t('plugin:branchClean.fetchingPruning'))
    const fetchResult = await $`git fetch --prune`
    if (fetchResult.exitCode !== 0) {
      tui.output.warn(t('plugin:branchClean.fetchFailed'))
    } else {
      tui.output.success(t('plugin:branchClean.fetchSuccess'))
    }
    tui.output.newline()

    // Step 2: Find merged local branches
    tui.output.section(t('plugin:branchClean.findingMerged'))

    const mergedResult = await $`git branch --merged ${defaultBranch}`
    if (mergedResult.exitCode !== 0) {
      tui.output.error(t('plugin:branchClean.getMergedFailed'))
      return
    }

    const mergedBranches = mergedResult.stdout
      .split('\n')
      .map((b) => b.trim().replace(/^\*\s*/, ''))
      .filter(
        (b) => b && b !== defaultBranch && b !== currentBranch && b !== 'main' && b !== 'master',
      )

    if (mergedBranches.length === 0) {
      tui.output.success(t('plugin:branchClean.noMergedBranches'))
      return
    }

    tui.output.info(t('plugin:branchClean.foundBranches', { count: mergedBranches.length }))
    tui.output.list(mergedBranches)
    tui.output.newline()

    // Ask user to select branches to delete
    const selectedBranches = await tui.prompt.multiSelect(
      t('plugin:branchClean.selectBranches'),
      mergedBranches.map((branch) => ({
        label: branch,
        value: branch,
      })),
    )

    if (selectedBranches.length === 0) {
      tui.output.info(t('plugin:branchClean.noBranchesSelected'))
      return
    }

    // Confirm deletion
    const confirm = await tui.prompt.confirm(
      t('plugin:branchClean.confirmDelete', { count: selectedBranches.length }),
    )

    if (!confirm) {
      tui.output.info(t('plugin:cancelled'))
      return
    }

    // Delete selected branches
    tui.output.newline()
    for (const branch of selectedBranches) {
      const deleteResult = await $`git branch -d ${branch}`
      if (deleteResult.exitCode === 0) {
        tui.output.success(t('plugin:branchClean.deleted', { branch }))
      } else {
        tui.output.error(t('plugin:branchClean.deleteFailed', { branch }))
      }
    }

    tui.output.newline()
    tui.output.success(t('plugin:branchClean.complete'))
  },
})
