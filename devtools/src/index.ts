/**
 * @kaokei/devtools-use-vue-service
 *
 * Vue DevTools 插件，为 @kaokei/use-vue-service 提供：
 * 1. 自定义 Inspector 面板：展示容器树和绑定/服务状态
 * 2. 组件 Inspect 增强：在组件面板中显示容器关联信息
 *
 * 使用方式一（推荐，零业务侵入）：
 * ```ts
 * // vite.config.ts
 * import VueDevTools from 'vite-plugin-vue-devtools'
 * import { useVueServiceDevtools } from '@kaokei/devtools-use-vue-service/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     vue(),
 *     VueDevTools(),
 *     useVueServiceDevtools(),
 *   ],
 * })
 * ```
 *
 * 使用方式二（手动调用，向后兼容）：
 * ```ts
 * // main.ts
 * import { setupDevtools } from '@kaokei/devtools-use-vue-service'
 * const app = createApp(App)
 * setupDevtools(app)
 * ```
 */

import type { App } from 'vue'
import { setupDevToolsPlugin } from '@vue/devtools-api'
import { INSPECTOR_ID, getInspectorTree, getInspectorState } from './inspector'
import { registerComponentHooks } from './component-hooks'

/**
 * DevTools API 类型（从 setupDevToolsPlugin 回调参数推断）
 */
type DevtoolsApi = Parameters<Parameters<typeof setupDevToolsPlugin>[1]>[0]

/**
 * 安装 Vue DevTools 插件。
 *
 * @param app - Vue App 实例
 */
export function setupDevtools(app: App): void {
  setupDevToolsPlugin(
    {
      id: 'kaokei-use-vue-service',
      label: 'use-vue-service',
      packageName: '@kaokei/devtools-use-vue-service',
      homepage: 'https://github.com/kaokei/use-vue-service',
      app,
      componentStateTypes: ['UVS 容器'],
    },
    (api: DevtoolsApi) => {
      // 1. 注册自定义 Inspector
      api.addInspector({
        id: INSPECTOR_ID,
        label: 'Services',
        icon: 'storage',
      })

      // 2. Inspector 树数据
      api.on.getInspectorTree((payload) => {
        if (payload.inspectorId !== INSPECTOR_ID) return
        const result = getInspectorTree()
        payload.rootNodes = result.rootNodes
      })

      // 3. Inspector 状态数据
      api.on.getInspectorState((payload) => {
        if (payload.inspectorId !== INSPECTOR_ID) return
        const result = getInspectorState(payload.nodeId)
        payload.state = result.state
      })

      // 4. 组件 Inspect 增强
      registerComponentHooks(api as any)
    },
  )
}

// 重导出核心类型，方便高级用户使用
export type { ContainerInfo, BindingInfo, ServiceStateInfo } from './core/types'
