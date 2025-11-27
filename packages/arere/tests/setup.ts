/**
 * Test setup file
 * Initializes i18n for all tests
 */

import { initI18n } from '@/infrastructure/i18n/index.js'
import * as React from 'react'
import { beforeAll } from 'vitest'

// Make React available globally for JSX
globalThis.React = React

beforeAll(async () => {
  // Initialize i18n with Japanese locale to match test expectations
  await initI18n('ja')
})
