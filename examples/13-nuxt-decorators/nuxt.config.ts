// https://nuxt.com/docs/4.x/guide/going-further/experimental-features#decorators
export default defineNuxtConfig({
  experimental: {
    // 启用 TC39 Stage 3 装饰器支持
    decorators: true,
  },

  // 关闭 SSR，方便本地演示
  ssr: false,

  compatibilityDate: '2025-07-01',
});
