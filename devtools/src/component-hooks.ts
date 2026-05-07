/**
 * 组件钩子模块
 *
 * 在 Vue DevTools Components 面板中增强组件展示：
 * 1. visitComponentTree：在组件树节点上添加 tag 标签（如 "Container"）
 * 2. inspectComponent：在组件 state 中追加 Services 分组，
 *    展示该组件容器中所有绑定的服务实例状态
 *
 * 容器关联方式：
 * 通过 componentInstance.provides 上的 CONTAINER_TOKEN 查找容器，
 * 与主库 getCurrentContainer() 使用相同机制。
 * 使用 hasOwn 检查确保只匹配组件自身声明的容器，而非从父组件继承的。
 */

import type { Container } from '@kaokei/di'
import { CONTAINER_TOKEN } from '@kaokei/use-vue-service'
import { getBindingCount } from './core/container-tree'
import { getBindings, getActivatedBindings } from './core/binding-reader'
import { extractServiceState } from './core/state-extractor'
import type { BindingInfo } from './core/types'

/**
 * 从组件实例的 provides 中获取该组件自身声明的容器。
 *
 * 原理与主库 getCurrentContainer() 一致：
 * - Vue 的 provide 机制使用 Object.create(parentProvides) 创建子 provides
 * - hasOwn 检查可以精确区分"自己声明的容器"和"从父组件继承的容器"
 * - 这正是 DevTools 组件面板 "provided" 区域中显示的 Symbol(CONTAINER_TOKEN)
 */
function getOwnContainer(instance: any): Container | undefined {
  const provides = instance?.provides
  if (!provides) return undefined
  // hasOwn 确保只匹配组件自己 provide 的容器，不含原型链继承的
  if (Object.hasOwn(provides, CONTAINER_TOKEN)) {
    return provides[CONTAINER_TOKEN] as Container
  }
  return undefined
}

/**
 * container tag 的背景色标识，用于在 visitComponentTree 回调中
 * 识别并清除之前添加的 tag，防止多 App 切换时 tag 累积。
 */
const CONTAINER_TAG_BG_COLOR = 0x42b883

/**
 * 注册组件相关钩子。
 */
export function registerComponentHooks(
  api: DevtoolsApi
): void {
  // 1. 组件树 tag：有容器的组件标记 "Container" 标签
  api.on.visitComponentTree((payload: VisitComponentTreePayload) => {
    const instance = payload.componentInstance
    if (!instance) return

    // 先清除之前添加的 container tag，防止切换 App 时 tag 累积
    const tags = payload.treeNode.tags
    for (let i = tags.length - 1; i >= 0; i--) {
      if (tags[i].backgroundColor === CONTAINER_TAG_BG_COLOR) {
        tags.splice(i, 1)
      }
    }

    const container = getOwnContainer(instance)
    if (!container) return

    const bindingCount = getBindingCount(container)
    tags.push({
      label: bindingCount > 0 ? `container (${bindingCount})` : 'container',
      textColor: 0xffffff,    // 白色文字
      backgroundColor: CONTAINER_TAG_BG_COLOR, // Vue 绿
      tooltip: `该组件声明了 ${bindingCount} 个服务`,
    })
  })

  // 2. 组件 state：选中组件时追加 Services 分组
  api.on.inspectComponent((payload) => {
    const instance = payload.componentInstance
    if (!instance) return

    const container = getOwnContainer(instance)
    if (!container) return

    const bindings = getBindings(container)
    if (bindings.length === 0) return

    const activatedMap = new Map<string, any>()
    for (const { tokenName, binding } of getActivatedBindings(container)) {
      activatedMap.set(tokenName, binding.cache)
    }

    for (const b of bindings) {
      const instance = activatedMap.get(b.tokenName)
      const serviceState = instance ? extractServiceState(instance) : null

      const display = formatServiceDisplay(b)
      const expandValue: Record<string, any> = serviceState && Object.keys(serviceState).length > 0
        ? { ...serviceState }
        : {}

      payload.instanceData.state.push({
        type: 'Services',
        key: b.tokenName,
        value: {
          _custom: {
            display,
            value: Object.keys(expandValue).length > 0 ? expandValue : undefined,
            tooltip: formatServiceTooltip(b),
          },
        },
      })
    }
  })
}

function formatServiceDisplay(b: BindingInfo): string {
  const parts: string[] = [b.bindingType]
  if (b.isTransient) parts.push('transient')
  if (b.hasCache) parts.push('✓ cached')
  parts.push(`[${b.status}]`)
  return parts.join(' · ')
}

function formatServiceTooltip(b: BindingInfo): string {
  return [
    `绑定类型: ${b.bindingType}`,
    `状态: ${b.status}`,
    `Transient: ${b.isTransient}`,
    `已缓存: ${b.hasCache}`,
  ].join('\n')
}

// ── 类型定义 ──────────────────────────────────────────────

interface VisitComponentTreePayload {
  app: any
  componentInstance: any
  treeNode: {
    tags: InspectorNodeTag[]
    [key: string]: any
  }
  filter: string
}

interface InspectorNodeTag {
  label: string
  textColor: number
  backgroundColor: number
  tooltip?: string
}

interface DevtoolsApi {
  on: {
    visitComponentTree: (cb: (payload: VisitComponentTreePayload) => void) => void
    inspectComponent: (cb: (payload: any) => void) => void
  }
  addInspector: (options: any) => void
}
