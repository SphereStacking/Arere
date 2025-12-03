/**
 * Benchmark tests for plugin loading performance
 */

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { detectPlugins } from '@/plugin/detector.js'
import { beforeEach, bench, describe } from 'vitest'
// Note: resolvePluginPackage has been removed from plugin/resolver.js
// import { resolvePluginPackage } from '@/plugin/resolver.js'

describe('Plugin Loading Performance', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'arere-plugin-bench-'))
  })

  describe('Plugin detection', () => {
    bench('detect plugins in empty directory', () => {
      detectPlugins(tempDir)
    })

    bench('detect plugins with 1 plugin', () => {
      const nodeModulesDir = join(tempDir, 'node_modules')
      mkdirSync(nodeModulesDir, { recursive: true })
      const pluginDir = join(nodeModulesDir, 'arere-plugin-test')
      mkdirSync(pluginDir, { recursive: true })
      writeFileSync(
        join(pluginDir, 'package.json'),
        JSON.stringify({
          name: 'arere-plugin-test',
          version: '1.0.0',
          keywords: ['arere-plugin'],
        }),
      )
      detectPlugins(tempDir)
    })

    bench('detect plugins with 5 plugins', () => {
      const nodeModulesDir = join(tempDir, 'node_modules')
      mkdirSync(nodeModulesDir, { recursive: true })
      for (let i = 0; i < 5; i++) {
        const pluginDir = join(nodeModulesDir, `arere-plugin-test-${i}`)
        mkdirSync(pluginDir, { recursive: true })
        writeFileSync(
          join(pluginDir, 'package.json'),
          JSON.stringify({
            name: `arere-plugin-test-${i}`,
            version: '1.0.0',
            keywords: ['arere-plugin'],
          }),
        )
      }
      detectPlugins(tempDir)
    })

    bench('detect plugins with 10 plugins', () => {
      const nodeModulesDir = join(tempDir, 'node_modules')
      mkdirSync(nodeModulesDir, { recursive: true })
      for (let i = 0; i < 10; i++) {
        const pluginDir = join(nodeModulesDir, `arere-plugin-test-${i}`)
        mkdirSync(pluginDir, { recursive: true })
        writeFileSync(
          join(pluginDir, 'package.json'),
          JSON.stringify({
            name: `arere-plugin-test-${i}`,
            version: '1.0.0',
            keywords: ['arere-plugin'],
          }),
        )
      }
      detectPlugins(tempDir)
    })
  })

  // Note: These benchmarks are commented out because resolvePluginPackage was removed
  // describe('Plugin package resolution', () => {
  //   beforeEach(() => {
  //     const nodeModulesDir = join(tempDir, 'node_modules')
  //     mkdirSync(nodeModulesDir, { recursive: true })
  //     const pluginDir = join(nodeModulesDir, 'arere-plugin-bench')
  //     mkdirSync(pluginDir, { recursive: true })
  //     writeFileSync(
  //       join(pluginDir, 'package.json'),
  //       JSON.stringify({
  //         name: 'arere-plugin-bench',
  //         version: '1.0.0',
  //         keywords: ['arere-plugin'],
  //         main: './index.js',
  //       }),
  //     )
  //     writeFileSync(join(pluginDir, 'index.js'), 'module.exports = { actions: [] }')
  //   })

  //   bench('resolve plugin package by name', () => {
  //     resolvePluginPackage('arere-plugin-bench', tempDir)
  //   })

  //   bench('resolve non-existent plugin', () => {
  //     try {
  //       resolvePluginPackage('arere-plugin-nonexistent', tempDir)
  //     } catch {
  //       // Expected to fail
  //     }
  //   })
  // })

  // describe('Multiple plugin operations', () => {
  //   bench('detect and resolve 5 plugins', () => {
  //     const nodeModulesDir = join(tempDir, 'node_modules')
  //     mkdirSync(nodeModulesDir, { recursive: true })
  //     for (let i = 0; i < 5; i++) {
  //       const pluginDir = join(nodeModulesDir, `arere-plugin-multi-${i}`)
  //       mkdirSync(pluginDir, { recursive: true })
  //       writeFileSync(
  //         join(pluginDir, 'package.json'),
  //         JSON.stringify({
  //           name: `arere-plugin-multi-${i}`,
  //           version: '1.0.0',
  //           keywords: ['arere-plugin'],
  //           main: './index.js',
  //         }),
  //       )
  //       writeFileSync(join(pluginDir, 'index.js'), 'module.exports = { actions: [] }')
  //     }

  //     const plugins = detectPlugins(tempDir)
  //     for (const plugin of plugins) {
  //       resolvePluginPackage(plugin.name, tempDir)
  //     }
  //   })
  // })
})
