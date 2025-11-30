import { definePlugin } from 'arere'

export default definePlugin({
  meta: {
    name: 'arere-plugin-git-utility',
    version: '0.1.0',
    description: 'Git utility actions for arere',
    i18nNamespace: 'git-utility',
  },
  actions: ['actions/git-hooks-path.ts', 'actions/git-hooks-init.ts'],
  locales: 'locales',
})
