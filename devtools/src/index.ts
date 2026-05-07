/**
 * @kaokei/devtools-use-vue-service
 *
 * Vue DevTools 插件，为 @kaokei/use-vue-service 提供：
 * 1. 自定义 Inspector 面板：展示容器树和绑定/服务状态
 * 2. 组件 Inspect 增强：在组件面板中显示容器关联信息
 * 3. 实时更新：服务状态变化时自动推送刷新到 DevTools
 * 4. 多 App 实例支持：同一页面多个 Vue 实例共享 ROOT_CONTAINER
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
 *
 * 多 App 场景：
 * ```ts
 * const app1 = createApp(App1)
 * const app2 = createApp(App2)
 * setupDevtools(app1)  // 每个 app 调用一次
 * setupDevtools(app2)
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

// ── 一次性注册守卫 ─────────────────────────────────────────

/**
 * Inspector 树/状态 hooks 是共享的，只需注册一次。
 * 多 app 时 setupDevToolsPlugin 会被多次调用，但 hooks 不应重复注册。
 */
let _inspectorHooksRegistered = false

/**
 * 响应式 watch 只需设置一次，因为它遍历 ROOT_CONTAINER 覆盖所有 app。
 */
let _watchRegistered = false

/**
 * 保存第一个 api 引用，用于响应式 watch 推送更新。
 */
let _firstApi: DevtoolsApi | null = null

/**
 * 安装 Vue DevTools 插件。
 *
 * 支持多 App 实例：每个 Vue App 调用一次即可。
 * 内部通过守卫机制确保 hooks 和 watch 只注册一次，
 * 而 addInspector 和 registerComponentHooks 为每个 app 注册。
 *
 * @param app - Vue App 实例
 */
export function setupDevtools(app: App): void {
  // 始终：保存 app 引用 + 捕获 ROOT_CONTAINER
  setDevtoolsApp(app)
  captureRootContainer()

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
      // 保存第一个 api 引用
      if (!_firstApi) _firstApi = api

      // 1. 注册自定义 Inspector（每个 app 必须注册，
      //    因为 getActiveInspectors 按 app 过滤）
      api.addInspector({
        id: INSPECTOR_ID,
        label: 'Services',
        icon: 'device-hub',
      })

      // 2. Inspector 树/状态 + 组件增强 hooks（仅注册一次，共享 hooks）
      if (!_inspectorHooksRegistered) {
        _inspectorHooksRegistered = true

        api.on.getInspectorTree((payload) => {
          if (payload.inspectorId !== INSPECTOR_ID) return
          const result = getInspectorTree()
          payload.rootNodes = result.rootNodes
        })

        api.on.getInspectorState((payload) => {
          if (payload.inspectorId !== INSPECTOR_ID) return
          const result = getInspectorState(payload.nodeId)
          payload.state = result.state
        })

        // 组件 Inspect 增强（回调不依赖 per-app api，全局注册一次即可）
        registerComponentHooks(api as any)
      }

      // 4. 响应式 watch（仅设置一次，遍历 ROOT_CONTAINER 覆盖所有 app）
      if (!_watchRegistered) {
        _watchRegistered = true
        setupReactiveWatch(api)
      }

      // 5. 初始化后刷新当前 app 的组件树 + inspector 树
      nextTick(() => {
        const rootInstance = (app as any)._instance
        if (rootInstance) {
          api.notifyComponentUpdate(rootInstance)
        }
        api.sendInspectorTree(INSPECTOR_ID)
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
 *
 * 遍历 ROOT_CONTAINER 的整棵容器树，自然覆盖所有 app 的容器。
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
