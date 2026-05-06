/**
 * 组件钩子模块
 *
 * 在 Vue DevTools 的组件 Inspector 中追加容器信息，
 * 实现组件→容器的映射展示。
 *
 * 实现方式参照 Pinia 的 _pStores 模式：
 * declareProviders 在组件实例上写入 __uvs_container__，
 * 此模块在 inspectComponent 钩子中读取该属性。
 */

import type { Container } from '@kaokei/di'
import { getTokenName } from './core/types'
import { getBindingCount, getContainerScope } from './core/container-tree'
import { getBindings } from './core/binding-reader'

/**
 * 注册组件 Inspect 钩子。
 * 当用户在 Vue DevTools 组件面板中选中某个组件时，
 * 在该组件的 state 中追加「UVS 容器」分组。
 */
export function registerComponentHooks(
  api: DevtoolsApi
): void {
  api.on.inspectComponent((payload) => {
    const instance = payload.componentInstance
    if (!instance) return

    const container: Container | undefined = (instance as any).__uvs_container__
    if (!container) return

    // 容器基本信息
    const scope = getContainerScope(container)
    const bindingCount = getBindingCount(container)
    const bindings = getBindings(container)

    payload.instanceData.state.push({
      type: 'UVS 容器',
      key: '__uvs_container__',
      value: {
        作用域: scope,
        绑定数量: bindingCount,
        子容器数量: container.getChildren()?.size ?? 0,
        已声明服务: bindings.map(b => b.tokenName),
      },
    } as any)
  })
}

/**
 * 类型：与 @vue/devtools-api 的 setupDevToolsPlugin 回调参数对齐
 */
interface DevtoolsApi {
  on: {
    inspectComponent: (cb: (payload: any) => void) => void
  }
  addInspector: (options: any) => void
}
