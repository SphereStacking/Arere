/**
 * Arere Plugin Generator
 *
 * Provides interactive action creation with templates
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { definePlugin } from 'arere'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default definePlugin({
  meta: {
    name: 'arere-plugin-generator',
    version: '1.0.0',
    description: 'Action generator plugin for Arere - Create new actions interactively',
    author: 'Arere Contributors',
    i18nNamespace: 'plugin-generator',
  },
  actions: [
    join(__dirname, '../actions/create-action.ts'),
    join(__dirname, '../actions/create-plugin.ts'),
  ],
  locales: 'locales',
})
