/**
 * @kaokei/devtools-use-vue-service
 *
 * Vue DevTools 插件，为 @kaokei/use-vue-service 提供：
 * 1. 自定义 Inspector 面板：展示容器树和绑定/服务状态
 * 2. 组件 Inspect 增强：在组件面板中显示服务实例状态
 * 3. 按需响应式 watch：仅追踪当前选中容器的 reactive 服务实例
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
import { nextTick, watch, isReactive, effectScope, type EffectScope } from 'vue'
import { setupDevToolsPlugin } from '@vue/devtools-api'
import { INSPECTOR_ID, getInspectorTree, getInspectorState, setDevtoolsApp, getContainerByNodeId } from './inspector'
import { registerComponentHooks } from './component-hooks'
import { captureRootContainer } from './core/root-container'
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

// ── 按需 watch 管理 ─────────────────────────────────────────

/**
 * Inspector 面板（Services tab）选中容器的响应式 watch。
 * 用户选中新容器时切换 watch，仅追踪当前选中容器的 reactive 服务实例。
 * 容器销毁时自动停止，防止内存泄漏。
 */
let _inspectorScope: EffectScope | null = null
let _inspectorContainer: any = null

/**
 * Components 面板选中组件关联容器的响应式 watch。
 * 用户选中新组件时切换 watch，仅追踪当前组件容器的 reactive 服务实例。
 */
let _componentScope: EffectScope | null = null
let _componentContainer: any = null
let _componentInstance: any = null

/**
 * 停止 Inspector 面板的响应式 watch。
 */
function stopInspectorWatch() {
  if (_inspectorScope) {
    _inspectorScope.stop()
    _inspectorScope = null
    _inspectorContainer = null
  }
}

/**
 * 为 Inspector 面板选中的容器的所有 reactive 服务实例设置 watch。
 * 仅追踪 isReactive() 返回 true 的实例（跳过 markRaw 包裹的非响应式对象）。
 * 同一容器不重复设置；容器销毁时自动停止 watch，防止内存泄漏。
 */
function startInspectorWatch(container: any, api: DevtoolsApi) {
  if (container === _inspectorContainer) return

  stopInspectorWatch()
  _inspectorContainer = container

  const scope = effectScope()
  _inspectorScope = scope

  scope.run(() => {
    for (const [token, binding] of container._bindings) {
      if (isInternalToken(token)) continue
      if (binding.status === 'activated' && binding.cache !== undefined) {
        const instance = binding.cache
        if (instance && typeof instance === 'object' && isReactive(instance)) {
          watch(instance, () => {
            if (container._destroyed) {
              stopInspectorWatch()
              return
            }
            api.sendInspectorState(INSPECTOR_ID)
          }, { deep: true, flush: 'post' })
        }
      }
    }
  })
}

/**
 * 停止 Components 面板的响应式 watch。
 */
function stopComponentWatch() {
  if (_componentScope) {
    _componentScope.stop()
    _componentScope = null
    _componentContainer = null
    _componentInstance = null
  }
}

/**
 * 为 Components 面板选中组件关联的容器的所有 reactive 服务实例设置 watch。
 * 仅追踪 isReactive() 返回 true 的实例。
 * 同一容器不重复设置；容器销毁时自动停止 watch，防止内存泄漏。
 */
function startComponentWatch(container: any, componentInstance: any, api: DevtoolsApi) {
  if (container === _componentContainer) return

  stopComponentWatch()
  _componentContainer = container
  _componentInstance = componentInstance

  const scope = effectScope()
  _componentScope = scope

  scope.run(() => {
    for (const [token, binding] of container._bindings) {
      if (isInternalToken(token)) continue
      if (binding.status === 'activated' && binding.cache !== undefined) {
        const instance = binding.cache
        if (instance && typeof instance === 'object' && isReactive(instance)) {
          watch(instance, () => {
            if (container._destroyed) {
              stopComponentWatch()
              return
            }
            if (_componentInstance) {
              api.notifyComponentUpdate(_componentInstance)
            }
          }, { deep: true, flush: 'post' })
        }
      }
    }
  })
}

/**
 * 安装 Vue DevTools 插件。
 *
 * 支持多 App 实例：每个 Vue App 调用一次即可。
 * 内部通过守卫机制确保 hooks 只注册一次，
 * 而 addInspector 为每个 app 注册。
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
      componentStateTypes: ['Services'],
    },
    (api: DevtoolsApi) => {
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

          // 按需 watch：选中容器时切换 Inspector 面板的追踪
          const container = getContainerByNodeId(payload.nodeId)
          if (container && !container._destroyed) {
            startInspectorWatch(container, api)
          } else {
            stopInspectorWatch()
          }
        })

        // 组件 Inspect 增强（回调不依赖 per-app api，全局注册一次即可）
        registerComponentHooks(api as any, {
          onSelectContainer: (container, instance) => {
            if (container && !container._destroyed) {
              startComponentWatch(container, instance, api)
            } else {
              stopComponentWatch()
            }
          },
        })
      }

      // 3. 初始化后刷新当前 app 的组件树 + inspector 树
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

// 重导出核心类型，方便高级用户使用
export type { ContainerInfo, BindingInfo, ServiceStateInfo } from './core/types'