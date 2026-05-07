/**
 * Nuxt DevTools 客户端插件。
 * 由 @kaokei/nuxt-use-vue-service 模块自动注入，无需手动配置。
 *
 * 职责：调用 setupDevtools() 注册 Vue DevTools 插件，
 * 启用组件审查增强（container 标签 + Services 状态面板）。
 */

import { setupDevtools } from '@kaokei/devtools-use-vue-service'

export default defineNuxtPlugin((nuxtApp) => {
  setupDevtools(nuxtApp.vueApp)
})
