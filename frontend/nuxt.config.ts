// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@vueuse/nuxt',
    '@nuxthub/core',
    'nuxt-toast',
    'nuxt-charts'
  ],

  buildModules: [
    '@nuxtjs/pwa',
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  hub: {
    db: 'sqlite'
  },

  colorMode: {
    preference: 'dark'
  },

  routeRules: {
    '/': { ssr: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
