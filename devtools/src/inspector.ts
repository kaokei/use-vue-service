/**
 * Vue DevTools Inspector 模块
 *
 * 负责将 @kaokei/use-vue-service 的容器树和绑定/服务状态
 * 映射为 Vue DevTools Inspector API 需要的数据格式。
 */

import type { Container } from '@kaokei/di'
import { __getDevtoolsRootContainer } from '@kaokei/use-vue-service'
import type { ContainerInfo, BindingInfo, ContainerIdMap } from './core/types'
import { buildContainerTree, findContainerById, buildIdMap, getContainerScope, getBindingCount } from './core/container-tree'
import { getBindings, getActivatedBindings } from './core/binding-reader'
import { extractServiceState } from './core/state-extractor'
import { getTokenName } from './core/types'

// ── Inspector 常量 ──────────────────────────────────────────

export const INSPECTOR_ID = 'uvs-services'

// ── Inspector Tree ──────────────────────────────────────────

/**
 * 构建 Inspector 树结构。
 * 对应 @vue/devtools-api 的 on.getInspectorTree 回调。
 */
export function getInspectorTree(): { rootNodes: InspectorTreeNode[] } {
  const rootContainer = __getDevtoolsRootContainer()
  if (!rootContainer) {
    return { rootNodes: [] }
  }

  const idMap: ContainerIdMap = { containerToId: new Map(), idToContainer: new Map() }
  const tree = buildContainerTree(rootContainer, idMap)

  // 缓存 idMap 供 getInspectorState 使用
  ;(getInspectorTree as any).__idMap = idMap

  return {
    rootNodes: [containerInfoToNode(tree)],
  }
}

/**
 * ContainerInfo → InspectorTreeNode 转换
 */
function containerInfoToNode(info: ContainerInfo): InspectorTreeNode {
  const tags: InspectorTreeNodeTag[] = []

  // 作用域标签
  const scopeColors: Record<string, string> = {
    root: '#42b883',
    app: '#35495e',
    component: '#ff8c00',
  }
  tags.push({
    label: info.scope,
    textColor: 0xffffff,
    backgroundColor: hexToRgbInt(scopeColors[info.scope] || '#999'),
  })

  // 销毁标签
  if (info.destroyed) {
    tags.push({
      label: 'destroyed',
      textColor: 0xffffff,
      backgroundColor: 0xcc3333,
    })
  }

  return {
    id: info.id,
    label: info.label,
    tags,
    children: info.children.map(child => containerInfoToNode(child)),
  }
}

// ── Inspector State ─────────────────────────────────────────

/**
 * 构建 Inspector 状态面板。
 * 对应 @vue/devtools-api 的 on.getInspectorState 回调。
 */
export function getInspectorState(nodeId: string): InspectorStateResult {
  const idMap = (getInspectorTree as any).__idMap as ContainerIdMap | undefined
  const rootContainer = __getDevtoolsRootContainer()

  if (!idMap || !rootContainer) {
    return { state: {} }
  }

  const container = findContainerById(rootContainer, nodeId)
  if (!container) {
    return { state: {} }
  }

  // 分组：容器信息 + 绑定列表 + 服务状态
  const state: InspectorStateResult = {
    state: {
      '容器信息': [
        { key: '作用域', value: getContainerScope(container) },
        { key: '绑定数量', value: getBindingCount(container) },
        { key: '子容器数量', value: container.getChildren()?.size ?? 0 },
        { key: '是否已销毁', value: container._destroyed },
      ],
    },
  }

  // 绑定列表
  const bindings = getBindings(container, nodeId)
  if (bindings.length > 0) {
    state.state['绑定列表'] = bindings.map(b => ({
      key: b.tokenName,
      value: {
        _custom: {
          display: formatBindingDisplay(b),
          value: b,
          tooltip: formatBindingTooltip(b),
        },
      },
    }))
  }

  // 已激活的服务状态
  const activated = getActivatedBindings(container)
  if (activated.length > 0) {
    state.state['服务状态'] = activated.map(({ tokenName, binding, token }) => {
      const instance = binding.cache
      const serviceState = extractServiceState(instance)
      return {
        key: tokenName,
        value: Object.keys(serviceState).length > 0
          ? serviceState
          : '(无响应式状态)',
      }
    })
  }

  return state
}

// ── 格式化工具 ──────────────────────────────────────────────

function formatBindingDisplay(b: BindingInfo): string {
  const parts: string[] = [b.bindingType]
  if (b.isTransient) parts.push('transient')
  if (b.hasCache) parts.push('✓ cached')
  parts.push(`[${b.status}]`)
  return parts.join(' · ')
}

function formatBindingTooltip(b: BindingInfo): string {
  return [
    `Token: ${b.tokenName} (${b.tokenType})`,
    `Binding Type: ${b.bindingType}`,
    `Status: ${b.status}`,
    `Transient: ${b.isTransient}`,
    `Has Cache: ${b.hasCache}`,
  ].join('\n')
}

function hexToRgbInt(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 0x999999
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return (r << 16) | (g << 8) | b
}

// ── 类型定义（对齐 @vue/devtools-api 的 Inspector 数据结构）─

interface InspectorTreeNode {
  id: string
  label: string
  tags?: InspectorTreeNodeTag[]
  children?: InspectorTreeNode[]
}

interface InspectorTreeNodeTag {
  label: string
  textColor: number
  backgroundColor: number
}

interface InspectorStateResult {
  state: Record<string, Array<{ key: string; value: any }>>
}
