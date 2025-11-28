export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n', '@nuxt/fonts'],
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: '/custom.css' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  fonts: {
    families: [{ name: 'Press Start 2P', provider: 'google', global: true }],
  },
  llms: {
    domain: 'https://www.spherestacking.com/',
    title: 'Arere - docs',
    description: 'A brief description of your site',
    full: {
      title: 'Arere - doc',
      description: 'A brief description of your site',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
      },
      {
        code: 'ja',
        name: '日本語',
      },
    ],
  },
})
