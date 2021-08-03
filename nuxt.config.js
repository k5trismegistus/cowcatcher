import colors from 'vuetify/es5/util/colors'

export default {
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  ssr: true,

  target: 'static',

  head: {
    titleTemplate: '%s - cowcatcher: Record your presentation',
    title: 'cowcatcher',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'cowcatcher: Record your presentation' },
      { hid: 'keywords', name: 'keywords', content: 'presentation' },
      { hid: 'author', name: 'author', content: 'cowcatcher' },

      { hid: 'og:site_name', property: 'og:site_name', content: 'cowcatcher' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: 'https://cowcatcher.biz' },
      { hid: 'og:title', property: 'og:title', content: 'cowcatcher' },
      { hid: 'og:description', property: 'og:description', content: 'cowcatcher: Record your presentation' },
      // { hid: 'og:image', property: 'og:image', content: 'https://cowcatcher.biz/ogp.png' },

      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_imae' },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' }
    ]
  },

  css: [],

  plugins: [],

  components: true,

  buildModules: [
    '@nuxtjs/vuetify',
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/gtm',
  ],

  router: {
    extendRoutes(routes, resolve) {
      for (const route of routes) {
        route.alias = resolve(route.path, 'index.html')
      }
    }
  },

  gtm: {
    id: 'GTM-K5XW8TX'
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: colors.purple,
          secondary: colors.grey.darken1,
          accent: colors.shades.black,
          error: colors.red.accent3,
        },
      }
    }
  },

  build: {}
}
