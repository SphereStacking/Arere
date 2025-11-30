import { definePlugin } from 'arere'

export default definePlugin({
  meta: {
    name: 'arere-plugin-git-utility',
    description: 'Git utility actions for arere',
    i18nNamespace: 'git-utility',
  },
  actions: ['actions/git-hooks-setup.ts', 'actions/git-branch-clean.ts'],
  locales: 'locales',
})
