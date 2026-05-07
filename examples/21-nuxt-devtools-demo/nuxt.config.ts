export default defineNuxtConfig({
  modules: ['@kaokei/nuxt-use-vue-service', '@pinia/nuxt'],

  experimental: {
    decorators: true,
    // 修复 Nuxt 4.4.4 中 ssr:false 时 "Vite Node IPC socket path not configured" 的问题
    // 参考: https://github.com/nuxt/nuxt/issues/34957
    viteEnvironmentApi: true,
  },

  ssr: false,

  compatibilityDate: '2025-07-01',
})
