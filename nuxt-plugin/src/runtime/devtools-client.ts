/**
 * Nuxt DevTools 客户端插件。
 * 由 @kaokei/nuxt-use-vue-service 模块自动注入，无需手动配置。
 *
 * 职责：
 * 1. 调用 setupDevtools() 注册 Vue DevTools 插件（组件标签、审查增强）
 * 2. 调用 initNuxtDevtoolsBridge() 建立 postMessage 桥接，
 *    响应 DevTools iframe 中 Services Tab 的数据请求
 */

import { setupDevtools, initNuxtDevtoolsBridge } from '@kaokei/devtools-use-vue-service/nuxt'

export default defineNuxtPlugin((nuxtApp) => {
  setupDevtools(nuxtApp.vueApp)
  initNuxtDevtoolsBridge()
})
