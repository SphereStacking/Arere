/**
 * Benchmark tests for fuzzy search performance
 */

import type { Action } from '@/action/types.js'
import fuzzysort from 'fuzzysort'
import { bench, describe } from 'vitest'

// Generate mock actions for testing
function generateMockActions(count: number): Action[] {
  const actions: Action[] = []
  const prefixes = ['test', 'build', 'deploy', 'run', 'start', 'dev', 'prod', 'lint', 'format']
  const suffixes = ['server', 'client', 'api', 'db', 'cache', 'queue', 'worker', 'task']

  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i % prefixes.length]
    const suffix = suffixes[Math.floor(i / prefixes.length) % suffixes.length]
    actions.push({
      meta: {
        name: `${prefix}-${suffix}-${i}`,
        description: `Description for ${prefix} ${suffix} action number ${i}`,
      },
      filePath: `/fake/path/action-${i}.ts`,
      run: async () => {},
    })
  }
  return actions
}

describe('Fuzzy Search Performance', () => {
  const datasets = {
    small: generateMockActions(10),
    medium: generateMockActions(100),
    large: generateMockActions(1000),
    xlarge: generateMockActions(5000),
  }

  // Prepare searchable items
  const prepareSearchableItems = (actions: Action[]) =>
    actions.map((action) => ({
      action,
      searchText: `${action.meta.name} ${action.meta.description}`,
    }))

  describe('Search with 10 actions', () => {
    const items = prepareSearchableItems(datasets.small)

    bench('exact match', () => {
      fuzzysort.go('test-server-0', items, { key: 'searchText', limit: 10 })
    })

    bench('partial match', () => {
      fuzzysort.go('test serv', items, { key: 'searchText', limit: 10 })
    })

    bench('fuzzy match', () => {
      fuzzysort.go('ts sv', items, { key: 'searchText', limit: 10 })
    })
  })

  describe('Search with 100 actions', () => {
    const items = prepareSearchableItems(datasets.medium)

    bench('exact match', () => {
      fuzzysort.go('test-server-50', items, { key: 'searchText', limit: 10 })
    })

    bench('partial match', () => {
      fuzzysort.go('test serv', items, { key: 'searchText', limit: 10 })
    })

    bench('fuzzy match', () => {
      fuzzysort.go('ts sv', items, { key: 'searchText', limit: 10 })
    })
  })

  describe('Search with 1000 actions', () => {
    const items = prepareSearchableItems(datasets.large)

    bench('exact match', () => {
      fuzzysort.go('test-server-500', items, { key: 'searchText', limit: 10 })
    })

    bench('partial match', () => {
      fuzzysort.go('test serv', items, { key: 'searchText', limit: 10 })
    })

    bench('fuzzy match', () => {
      fuzzysort.go('ts sv', items, { key: 'searchText', limit: 10 })
    })
  })

  describe('Search with 5000 actions', () => {
    const items = prepareSearchableItems(datasets.xlarge)

    bench('exact match', () => {
      fuzzysort.go('test-server-2500', items, { key: 'searchText', limit: 10 })
    })

    bench('partial match', () => {
      fuzzysort.go('test serv', items, { key: 'searchText', limit: 10 })
    })

    bench('fuzzy match', () => {
      fuzzysort.go('ts sv', items, { key: 'searchText', limit: 10 })
    })
  })

  describe('Dataset preparation overhead', () => {
    bench('prepare 10 actions', () => {
      prepareSearchableItems(datasets.small)
    })

    bench('prepare 100 actions', () => {
      prepareSearchableItems(datasets.medium)
    })

    bench('prepare 1000 actions', () => {
      prepareSearchableItems(datasets.large)
    })

    bench('prepare 5000 actions', () => {
      prepareSearchableItems(datasets.xlarge)
    })
  })
})
