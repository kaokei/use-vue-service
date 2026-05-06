/**
 * @kaokei/devtools-use-vue-service
 *
 * Vue DevTools 插件，为 @kaokei/use-vue-service 提供：
 * 1. 自定义 Inspector 面板：展示容器树和绑定/服务状态
 * 2. 组件 Inspect 增强：在组件面板中显示容器关联信息
 * 3. 实时更新：服务状态变化时自动推送刷新到 DevTools
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
import { nextTick, watch } from 'vue'
import { setupDevToolsPlugin } from '@vue/devtools-api'
import { INSPECTOR_ID, getInspectorTree, getInspectorState, setDevtoolsApp } from './inspector'
import { registerComponentHooks } from './component-hooks'
import { captureRootContainer, getRootContainer } from './core/root-container'
import { getActivatedBindings } from './core/binding-reader'
import { isInternalToken } from './core/types'

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
      logo: 'i-carbon-tree-view',
      app,
      componentStateTypes: ['UVS 容器'],
    },
    (api: DevtoolsApi) => {
      // 0. 保存 app 引用，供 Inspector 模块识别 app 作用域容器
      setDevtoolsApp(app)

      // 0.1 通过 FunctionProvider 捕获 ROOT_CONTAINER 引用
      captureRootContainer()

      // 1. 注册自定义 Inspector
      api.addInspector({
        id: INSPECTOR_ID,
        label: 'Services',
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

      // 5. 实时更新：监听所有容器中已激活服务的响应式状态
      setupReactiveWatch(api)

      // 6. 初始化后强制刷新组件树，确保 visitComponentTree tag 立即显示
      //    原因：setupDevToolsPlugin 回调注册时，DevTools 组件树可能已渲染完毕，
      //    visitComponentTree 回调尚未被调用过，导致 tag 不显示。
      //    notifyComponentUpdate(instance) 会触发 debounceSendInspectorTree()，
      //    重新遍历组件树并调用所有 visitComponentTree 回调。
      //    注意：无参调用 notifyComponentUpdate() 会因 guard 检查直接 return，
      //    必须传入有效的组件实例才能触发完整的组件树刷新。
      nextTick(() => {
        const rootInstance = (app as any)._instance
        if (rootInstance) {
          api.notifyComponentUpdate(rootInstance)
        }
      })
    },
  )
}

/**
 * 通过 Vue 的 watch 深度监听容器树中所有已激活服务的 reactive 实例，
 * 当状态变化时自动推送刷新到 DevTools Inspector 面板。
 *
 * 原理：
 * - 服务实例被 @kaokei/use-vue-service 的 activationHandle 包裹为 reactive()
 * - watch({ deep: true }) 可以追踪 reactive 对象内部所有属性的变化
 * - 变化时调用 api.sendInspectorState() 会触发 on.getInspectorState 回调重新读取数据
 */
function setupReactiveWatch(api: DevtoolsApi): void {
  // 使用 getter 函数让 watch 每次都比较最新状态
  watch(
    () => collectAllServiceStates(),
    () => {
      api.sendInspectorState(INSPECTOR_ID)
      api.sendInspectorTree(INSPECTOR_ID)
    },
    { deep: true },
  )
}

/**
 * 收集所有容器中已激活服务的 reactive 状态快照，
 * 作为 watch 的监听源。只收集非函数的数据属性。
 */
function collectAllServiceStates(): Record<string, any> {
  const rootContainer = getRootContainer()
  if (!rootContainer) return {}

  const snapshot: Record<string, any> = {}
  let index = 0

  // 递归遍历容器树
  function traverseContainer(container: any): void {
    if (container._destroyed) return

    const bindings = container._bindings
    if (bindings) {
      for (const [token, binding] of bindings) {
        // 跳过内部 token
        if (isInternalToken(token)) continue
        // 只收集已激活且有缓存的服务实例
        if (binding.status === 'activated' && binding.cache !== undefined) {
          const instance = binding.cache
          if (instance && typeof instance === 'object') {
            // 只收集数据属性（排除方法），触发 deep watch
            const dataKeys: Record<string, any> = {}
            for (const key of Object.keys(instance)) {
              if (key.startsWith('_') || key.startsWith('__')) continue
              const value = instance[key]
              if (typeof value !== 'function') {
                dataKeys[key] = value
              }
            }
            snapshot[`s${index}`] = dataKeys
            index++
          }
        }
      }
    }

    // 递归子容器
    const children = container.getChildren?.()
    if (children) {
      for (const child of children) {
        traverseContainer(child)
      }
    }
  }

  traverseContainer(rootContainer)
  return snapshot
}

// 重导出核心类型，方便高级用户使用
export type { ContainerInfo, BindingInfo, ServiceStateInfo } from './core/types'
