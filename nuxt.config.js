import colors from 'vuetify/es5/util/colors'

export default {
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  ssr: true,

  target: 'static',

  head: {
    titleTemplate: '%s - Tedder: Record your presentation',
    title: 'Tedder',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Tedder: Record your presentation' },
      { hid: 'keywords', name: 'keywords', content: 'DJ,playlist,music,club' },
      { hid: 'author', name: 'author', content: 'tedder' },

      { hid: 'og:site_name', property: 'og:site_name', content: 'Tedder' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: 'https://tedder.club' },
      { hid: 'og:title', property: 'og:title', content: 'Tedder' },
      { hid: 'og:description', property: 'og:description', content: 'Tedder: Record your presentation' },
      // { hid: 'og:image', property: 'og:image', content: 'https://tedder.club/ogp.png' },

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

  axios: {
    baseURL: 'https://api.tedder.club/',
  },

  router: {
    extendRoutes(routes, resolve) {
      for (const route of routes) {
        route.alias = resolve(route.path, 'index.html')
      }
    }
  },

  gtm: {
    id: 'GTM-NWT6KMX'
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
