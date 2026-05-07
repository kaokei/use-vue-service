/**
 * Nuxt DevTools 集成辅助模块
 *
 * 提供与 Nuxt DevTools 自定义 Tab 集成的辅助函数。
 * 主要集成逻辑位于 @kaokei/nuxt-use-vue-service 模块中。
 *
 * 这里不直接依赖 @nuxt/devtools-kit 或 @nuxt/kit，
 * 而是导出纯数据函数供 Nuxt 模块使用。
 */

import { INSPECTOR_ID, getInspectorTree, getInspectorState } from './inspector'

// ── postMessage 协议常量 ────────────────────────────────────

const MSG_PREFIX = 'use-vue-service:'
const MSG_GET_TREE = `${MSG_PREFIX}getInspectorTree`
const MSG_GET_STATE = `${MSG_PREFIX}getInspectorState`
const MSG_TREE_RESPONSE = `${MSG_PREFIX}inspectorTree`
const MSG_STATE_RESPONSE = `${MSG_PREFIX}inspectorState`

/**
 * 在 App 页面初始化 postMessage 桥接。
 * 在 Nuxt 客户端插件中调用，接收 DevTools iframe 中 Services Tab 的请求，
 * 返回容器树和绑定状态数据。
 */
export function initNuxtDevtoolsBridge(): void {
  window.addEventListener('message', (event) => {
    if (event.data?.source !== 'use-vue-service-tab') return

    const { type, payload } = event.data

    if (type === MSG_GET_TREE) {
      try {
        const result = getInspectorTree()
        window.postMessage(
          { source: 'use-vue-service-app', type: MSG_TREE_RESPONSE, payload: result },
          '*',
        )
      } catch (e: any) {
        window.postMessage(
          { source: 'use-vue-service-app', type: MSG_TREE_RESPONSE, payload: { rootNodes: [], error: e?.message } },
          '*',
        )
      }
    } else if (type === MSG_GET_STATE) {
      try {
        const result = getInspectorState(payload)
        window.postMessage(
          { source: 'use-vue-service-app', type: MSG_STATE_RESPONSE, payload: result },
          '*',
        )
      } catch (e: any) {
        window.postMessage(
          { source: 'use-vue-service-app', type: MSG_STATE_RESPONSE, payload: { state: {}, error: e?.message } },
          '*',
        )
      }
    }
  })
}

// 重导出 Inspector ID，供 Nuxt 模块使用
export { INSPECTOR_ID }
