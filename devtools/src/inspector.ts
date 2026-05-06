/**
 * Vue DevTools Inspector 模块
 *
 * 负责将 @kaokei/use-vue-service 的容器树和绑定/服务状态
 * 映射为 Vue DevTools Inspector API 需要的数据格式。
 */

import type { Container } from '@kaokei/di'
import { __getDevtoolsRootContainer } from '@kaokei/use-vue-service'
import type { ContainerInfo, BindingInfo, ContainerIdMap } from './core/types'
import { buildContainerTree, findContainerById, buildIdMap, getContainerScope, getBindingCount, getComponentName } from './core/container-tree'
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

  const scope = getContainerScope(container)
  const componentName = getComponentName(container)

  // 分组：容器信息 + Services
  const containerInfo: Array<{ key: string; value: any }> = [
    { key: '作用域', value: scope },
  ]
  if (componentName) {
    containerInfo.push({ key: '组件', value: componentName })
  }
  containerInfo.push(
    { key: '绑定数量', value: getBindingCount(container) },
    { key: '子容器数量', value: container.getChildren()?.size ?? 0 },
    { key: '是否已销毁', value: container._destroyed },
  )

  const state: InspectorStateResult = {
    state: {
      '容器信息': containerInfo,
    },
  }

  // 合并展示：绑定列表 + 服务状态 → 统一的 Services 分组
  const bindings = getBindings(container, nodeId)
  if (bindings.length > 0) {
    // 获取已激活服务的实例映射
    const activatedMap = new Map<string, any>()
    for (const { tokenName, binding } of getActivatedBindings(container)) {
      activatedMap.set(tokenName, binding.cache)
    }

    state.state['Services'] = bindings.map(b => {
      const instance = activatedMap.get(b.tokenName)
      const serviceState = instance ? extractServiceState(instance) : null

      // 构建合并展示值
      const display = formatServiceDisplay(b, serviceState)
      return {
        key: b.tokenName,
        value: {
          _custom: {
            display,
            value: {
              绑定类型: b.bindingType,
              状态: b.status,
              ...(b.isTransient ? { 作用域: 'transient' } : {}),
              ...(serviceState && Object.keys(serviceState).length > 0
                ? { 响应式状态: serviceState }
                : {}),
            },
            tooltip: formatServiceTooltip(b),
          },
        },
      }
    })
  }

  return state
}

// ── 格式化工具 ──────────────────────────────────────────────

function formatServiceDisplay(b: BindingInfo, serviceState: Record<string, any> | null): string {
  const parts: string[] = [b.bindingType]
  if (b.isTransient) parts.push('transient')
  if (b.hasCache) parts.push('✓ cached')
  parts.push(`[${b.status}]`)
  if (serviceState && Object.keys(serviceState).length > 0) {
    const keys = Object.keys(serviceState).join(', ')
    parts.push(`{ ${keys} }`)
  }
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
