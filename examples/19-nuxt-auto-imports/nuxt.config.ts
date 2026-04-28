export default defineNuxtConfig({
  modules: ['@kaokei/nuxt-use-vue-service'],

  experimental: {
    decorators: true,
  },

  ssr: false,

  compatibilityDate: '2025-07-01',
});
