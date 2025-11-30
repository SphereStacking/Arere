import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineAction } from 'arere'

interface PackageInfo {
  name: string
  version: string
  path: string
}

const translations = {
  en: {
    description: 'Trigger GitHub Actions release workflow',
    selectPackages: 'Select packages to release:',
    noPackagesSelected: 'No packages selected. Aborting.',
    selectVersionType: 'Select version bump type:',
    releasePreview: 'Release preview:',
    dryRunConfirm: 'Dry run? (skip actual publish)',
    triggeringWorkflow: 'Triggering release workflow...',
    packages: 'Packages',
    version: 'Version',
    dryRun: 'Dry run',
    workflowTriggered: 'Workflow triggered successfully!',
    watchConfirm: 'Watch workflow progress?',
    watchingWorkflow: 'Watching workflow progress...',
    workflowFailed: 'Failed to trigger workflow',
  },
  ja: {
    description: 'GitHub Actions のリリースワークフローを実行',
    selectPackages: 'リリースするパッケージを選択:',
    noPackagesSelected: 'パッケージが選択されていません。中止します。',
    selectVersionType: 'バージョンの種類を選択:',
    releasePreview: 'リリースプレビュー:',
    dryRunConfirm: 'ドライラン？（実際の公開をスキップ）',
    triggeringWorkflow: 'リリースワークフローを実行中...',
    packages: 'パッケージ',
    version: 'バージョン',
    dryRun: 'ドライラン',
    workflowTriggered: 'ワークフローが正常に開始されました！',
    watchConfirm: 'ワークフローの進捗を監視しますか？',
    watchingWorkflow: 'ワークフローの進捗を監視中...',
    workflowFailed: 'ワークフローの実行に失敗しました',
  },
}

function getPackages(cwd: string): PackageInfo[] {
  const packagesDir = join(cwd, 'packages')
  const dirs = readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  return dirs.map((dir) => {
    const pkgPath = join(packagesDir, dir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return {
      name: pkg.name,
      version: pkg.version,
      path: `packages/${dir}`,
    }
  })
}

function bumpVersion(version: string, type: 'patch' | 'minor' | 'major'): string {
  const [major, minor, patch] = version.split('.').map(Number)
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
  }
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'dev',
  translations,
  async run({ tui, $, t }) {
    const cwd = process.cwd()
    const packages = getPackages(cwd)

    // Select packages to release
    const selectedPackages = await tui.prompt.multiSelect(
      t('selectPackages'),
      packages.map((pkg) => `${pkg.name} (v${pkg.version})`),
    )

    if (selectedPackages.length === 0) {
      tui.output.warn(t('noPackagesSelected'))
      return
    }

    // Map selected labels back to PackageInfo
    const selectedPackageInfos = packages.filter((pkg) =>
      selectedPackages.includes(`${pkg.name} (v${pkg.version})`),
    )

    // Select version type
    const versionType = await tui.prompt.select<'patch' | 'minor' | 'major'>(
      t('selectVersionType'),
      ['patch', 'minor', 'major'],
    )

    // Show preview
    tui.output.newline()
    tui.output.section(t('releasePreview'))
    for (const pkg of selectedPackageInfos) {
      const newVersion = bumpVersion(pkg.version, versionType)
      tui.output.info(`${pkg.name}: ${pkg.version} → ${newVersion}`)
    }
    tui.output.newline()

    // Confirm
    const dryRun = await tui.prompt.confirm(t('dryRunConfirm'), { defaultValue: false })

    // Package names for workflow
    const packageNames = selectedPackageInfos.map((p) => p.name).join(',')

    tui.output.newline()
    tui.output.section(t('triggeringWorkflow'))
    tui.output.info(`${t('packages')}: ${packageNames}`)
    tui.output.info(`${t('version')}: ${versionType}`)
    tui.output.info(`${t('dryRun')}: ${dryRun}`)
    tui.output.newline()

    // Trigger GitHub Actions workflow
    const result =
      await $`gh workflow run release.yml -f version=${versionType} -f dry_run=${dryRun} -f packages=${packageNames}`

    if (result.exitCode === 0) {
      tui.output.success(t('workflowTriggered'))
      tui.output.newline()

      // Watch workflow progress
      const watchConfirm = await tui.prompt.confirm(t('watchConfirm'), { defaultValue: true })

      if (watchConfirm) {
        tui.output.info(t('watchingWorkflow'))
        tui.output.newline()

        // Wait a bit for the run to be created
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Get latest run ID
        const listResult =
          await $`gh run list --workflow=release.yml --limit=1 --json databaseId --jq '.[0].databaseId'`
        if (listResult.exitCode === 0 && listResult.stdout.trim()) {
          const runId = listResult.stdout.trim()
          // Watch the run (this will stream output)
          await $`gh run watch ${runId}`
        }
      }
    } else {
      tui.output.error(t('workflowFailed'))
      tui.output.error(result.stderr)
    }
  },
})
