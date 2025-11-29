import { defineAction } from 'arere'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface PackageInfo {
  name: string
  version: string
  path: string
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
  name: 'release',
  description: 'Trigger GitHub Actions release workflow',
  category: 'dev',
  async run({ tui, $ }) {
    const cwd = process.cwd()
    const packages = getPackages(cwd)

    // Select packages to release
    const selectedPackages = await tui.prompt.multiSelect<PackageInfo>(
      'Select packages to release:',
      packages.map((pkg) => ({
        label: `${pkg.name} (v${pkg.version})`,
        value: pkg,
      })),
    )

    if (selectedPackages.length === 0) {
      console.log('No packages selected. Aborting.')
      return
    }

    // Select version type
    const version = await tui.prompt.select('Select version bump type:', [
      { label: 'patch', value: 'patch' as const },
      { label: 'minor', value: 'minor' as const },
      { label: 'major', value: 'major' as const },
    ])

    // Show preview
    console.log('')
    console.log('📦 Release preview:')
    for (const pkg of selectedPackages) {
      const newVersion = bumpVersion(pkg.version, version)
      console.log(`   ${pkg.name}: ${pkg.version} → ${newVersion}`)
    }
    console.log('')

    // Confirm
    const dryRun = await tui.prompt.confirm('Dry run? (skip actual publish)', false)

    // Package names for workflow
    const packageNames = selectedPackages.map((p: PackageInfo) => p.name).join(',')

    console.log('')
    console.log(`🚀 Triggering release workflow...`)
    console.log(`   Packages: ${packageNames}`)
    console.log(`   Version: ${version}`)
    console.log(`   Dry run: ${dryRun}`)
    console.log('')

    // Trigger GitHub Actions workflow
    const result =
      await $`gh workflow run release.yml -f version=${version} -f dry_run=${dryRun} -f packages=${packageNames}`

    if (result.exitCode === 0) {
      console.log('✅ Workflow triggered successfully!')
      console.log('')
      console.log('👀 Watch progress:')
      console.log('   gh run watch')
      console.log('')
      console.log('🔗 Or open in browser:')
      console.log('   gh run list --workflow=release.yml')
    } else {
      console.error('❌ Failed to trigger workflow')
      console.error(result.stderr)
    }
  },
})
