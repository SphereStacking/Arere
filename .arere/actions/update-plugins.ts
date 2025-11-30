import { defineAction } from 'arere'

interface PackageInfo {
  name: string
  current: string
  latest: string
  hasUpdate: boolean
}

export default defineAction({
  category: 'arere-dev',
  description: ({ t }) => t('description'),
  tags: ['update', 'plugins', 'npm'],
  translations: {
    en: {
      description: 'Update arere and plugins to latest versions',
      step1: 'Checking installed packages...',
      step2: 'Checking for updates...',
      step3: 'Updating packages...',
      noPackagesFound: 'No arere packages found',
      foundPackages: 'Found {{count}} package(s)',
      packageStatus: 'Package Status:',
      latest: 'latest',
      allUpToDate: 'All packages are up to date!',
      selectPackages: 'Select packages to update:',
      noPackagesSelected: 'No packages selected',
      updated: 'Updated {{name}} to {{version}}',
      updateFailed: 'Failed to update {{name}}',
      updateComplete: 'Update complete!',
    },
    ja: {
      description: 'arere とプラグインを最新バージョンに更新',
      step1: 'インストール済みパッケージを確認中...',
      step2: 'アップデートを確認中...',
      step3: 'パッケージを更新中...',
      noPackagesFound: 'arere パッケージが見つかりません',
      foundPackages: '{{count}} 個のパッケージが見つかりました',
      packageStatus: 'パッケージ状況:',
      latest: '最新',
      allUpToDate: 'すべてのパッケージが最新です！',
      selectPackages: '更新するパッケージを選択:',
      noPackagesSelected: 'パッケージが選択されていません',
      updated: '{{name}} を {{version}} に更新しました',
      updateFailed: '{{name}} の更新に失敗しました',
      updateComplete: '更新完了！',
    },
  },
  run: async ({ $, tui, t }) => {
    const { output, prompt } = tui

    output.step(1, t('step1'))
    output.newline()

    // Get installed arere packages using npm ls
    const lsResult = await $`npm ls --depth=0 --json 2>/dev/null`

    let installedPackages: { name: string; current: string }[] = []

    if (lsResult.exitCode === 0 && lsResult.stdout.trim()) {
      try {
        const lsJson = JSON.parse(lsResult.stdout)
        const deps = lsJson.dependencies || {}

        installedPackages = Object.entries(deps)
          .filter(([name]) => name === 'arere' || name.startsWith('arere-plugin-'))
          .map(([name, info]) => ({
            name,
            current: (info as { version?: string }).version || 'unknown',
          }))
      } catch {
        // JSON parse failed, try fallback
      }
    }

    // Fallback: parse npm ls text output
    if (installedPackages.length === 0) {
      const lsTextResult = await $`npm ls --depth=0 2>/dev/null`
      if (lsTextResult.exitCode === 0) {
        const lines = lsTextResult.stdout.split('\n')
        for (const line of lines) {
          const match = line.match(/(arere(?:-plugin-[\w-]+)?)@([\d.]+)/)
          if (match) {
            installedPackages.push({
              name: match[1],
              current: match[2],
            })
          }
        }
      }
    }

    if (installedPackages.length === 0) {
      output.warn(t('noPackagesFound'))
      return
    }

    output.info(t('foundPackages', { count: installedPackages.length }))
    output.newline()

    // Check latest versions from npm
    output.step(2, t('step2'))
    output.newline()

    const packages: PackageInfo[] = []

    for (const pkg of installedPackages) {
      const result = await $`npm view ${pkg.name} version 2>/dev/null`
      if (result.exitCode === 0) {
        const latest = result.stdout.trim()
        packages.push({
          name: pkg.name,
          current: pkg.current,
          latest,
          hasUpdate: pkg.current !== latest,
        })
      } else {
        // Package might not be published yet (local/workspace package)
        packages.push({
          name: pkg.name,
          current: pkg.current,
          latest: pkg.current,
          hasUpdate: false,
        })
      }
    }

    // Display current status
    output.info(t('packageStatus'))
    output.newline()

    const maxNameLen = Math.max(...packages.map((p) => p.name.length))

    for (const pkg of packages) {
      const name = pkg.name.padEnd(maxNameLen)
      if (pkg.hasUpdate) {
        output.log(`  ${name}  ${pkg.current} → ${pkg.latest}`)
      } else {
        output.log(`  ${name}  ${pkg.current} (${t('latest')})`)
      }
    }
    output.newline()

    // Filter packages with updates
    const updatable = packages.filter((p) => p.hasUpdate)

    if (updatable.length === 0) {
      output.success(t('allUpToDate'))
      return
    }

    // Select packages to update
    const choices = updatable.map((pkg) => ({
      label: `${pkg.name} (${pkg.current} → ${pkg.latest})`,
      value: pkg.name,
    }))

    const selected = await prompt.multiSelect<string>(t('selectPackages'), choices)

    if (selected.length === 0) {
      output.info(t('noPackagesSelected'))
      return
    }

    // Update selected packages
    output.newline()
    output.step(3, t('step3'))
    output.newline()

    for (const pkgName of selected) {
      const pkg = packages.find((p) => p.name === pkgName)
      if (!pkg) continue

      const result = await $`npm install ${pkgName}@latest`
      if (result.exitCode === 0) {
        output.success(t('updated', { name: pkgName, version: pkg.latest }))
      } else {
        output.error(t('updateFailed', { name: pkgName }))
      }
    }

    output.newline()
    output.success(t('updateComplete'))
  },
})
