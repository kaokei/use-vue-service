/**
 * Vue DevTools Inspector 模块
 *
 * 负责将 @kaokei/use-vue-service 的容器树和绑定/服务状态
 * 映射为 Vue DevTools Inspector API 需要的数据格式。
 *
 * 容器树数据来源：从 Vue 组件树遍历获取（而非 ROOT_CONTAINER 的 parent/children 关系）。
 * 只保留关联了容器的组件节点，形成容器视图树。
 */

import type { App } from 'vue'
import type { Container } from '@kaokei/di'
import { CONTAINER_TOKEN } from '@kaokei/use-vue-service'
import { buildContainerTreeFromComponents, type ContainerTreeNode } from './core/component-walker'
import type { BindingInfo } from './core/types'
import { getBindingCount, getContainerScope } from './core/container-tree'
import { getBindings, getActivatedBindings } from './core/binding-reader'
import { extractServiceState } from './core/state-extractor'
import { getRootContainer } from './core/root-container'

// ── Inspector 常量 ──────────────────────────────────────────

export const INSPECTOR_ID = 'uvs-services'

// ── App 引用 ──────────────────────────────────────────────

/**
 * 保存 Vue App 引用，供 Inspector 模块遍历组件树。
 * 由 setupDevtools() 在插件初始化时设置。
 */
let _app: App | null = null

export function setDevtoolsApp(app: App): void {
  _app = app
}

/**
 * 从 app._context.provides 中获取 app 作用域容器
 */
function getAppContainer(): Container | undefined {
  if (!_app) return undefined
  const provides = (_app as any)._context?.provides
  if (!provides) return undefined
  if (Object.hasOwn(provides, CONTAINER_TOKEN)) {
    return provides[CONTAINER_TOKEN] as Container
  }
  return undefined
}

// ── 容器 ID 映射 ──────────────────────────────────────────

/**
 * nodeId → Container 映射，由 getInspectorTree() 构建并缓存，
 * 供 getInspectorState() 使用。
 */
let _idToContainer: Map<string, Container> = new Map()

// ── Inspector Tree ──────────────────────────────────────────

/**
 * 构建 Inspector 树结构。
 * 对应 @vue/devtools-api 的 on.getInspectorTree 回调。
 *
 * 从 Vue 组件树遍历，只保留关联了容器的组件。
 */
export function getInspectorTree(): { rootNodes: InspectorTreeNode[] } {
  const rootContainer = getRootContainer()
  if (!rootContainer || !_app) {
    return { rootNodes: [] }
  }

  const tree = buildContainerTreeFromComponents(_app, rootContainer)

  // 重建 id→container 映射
  _idToContainer = new Map()
  buildIdMap(tree)

  return {
    rootNodes: [treeNodeToInspectorNode(tree)],
  }
}

/**
 * 递归建立 nodeId → Container 映射
 */
function buildIdMap(node: ContainerTreeNode): void {
  _idToContainer.set(node.id, node.container)
  for (const child of node.children) {
    buildIdMap(child)
  }
}

/**
 * ContainerTreeNode → InspectorTreeNode 转换
 */
function treeNodeToInspectorNode(node: ContainerTreeNode): InspectorTreeNode {
  const tags: InspectorTreeNodeTag[] = []

  // 作用域标签
  const scopeColors: Record<string, string> = {
    root: '#42b883',
    app: '#35495e',
    component: '#ff8c00',
  }
  tags.push({
    label: node.scope,
    textColor: 0xffffff,
    backgroundColor: hexToRgbInt(scopeColors[node.scope] || '#999'),
  })

  // 绑定数量标签（有绑定时显示）
  const bindingCount = getBindingCount(node.container)
  if (bindingCount > 0) {
    tags.push({
      label: `${bindingCount} services`,
      textColor: 0xffffff,
      backgroundColor: 0x666666,
    })
  }

  // 标签：追加绑定数量后缀
  const bindingSuffix = bindingCount > 0 ? ` (${bindingCount} services)` : ''

  return {
    id: node.id,
    label: node.label + bindingSuffix,
    tags,
    children: node.children.map(child => treeNodeToInspectorNode(child)),
  }
}

// ── Inspector State ─────────────────────────────────────────

/**
 * 构建 Inspector 状态面板。
 * 对应 @vue/devtools-api 的 on.getInspectorState 回调。
 */
export function getInspectorState(nodeId: string): InspectorStateResult {
  const container = _idToContainer.get(nodeId)
  if (!container) {
    return { state: {} }
  }

  const appContainer = getAppContainer()
  const scope = getContainerScope(container, appContainer)

  // 分组：容器信息 + Services
  const containerInfo: Array<{ key: string; value: any }> = [
    { key: '作用域', value: scope },
  ]
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

  // Services 分组
  const bindings = getBindings(container, nodeId)
  if (bindings.length > 0) {
    const activatedMap = new Map<string, any>()
    for (const { tokenName, binding } of getActivatedBindings(container)) {
      activatedMap.set(tokenName, binding.cache)
    }

    state.state['Services'] = bindings.map(b => {
      const instance = activatedMap.get(b.tokenName)
      const serviceState = instance ? extractServiceState(instance) : null

      const display = formatServiceDisplay(b)
      const expandValue: Record<string, any> = serviceState && Object.keys(serviceState).length > 0
        ? { ...serviceState }
        : {}

      return {
        key: b.tokenName,
        value: {
          _custom: {
            display,
            value: Object.keys(expandValue).length > 0 ? expandValue : undefined,
            tooltip: formatServiceTooltip(b),
          },
        },
      }
    })
  }

  return state
}

// ── 格式化工具 ──────────────────────────────────────────────

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

function hexToRgbInt(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 0x999999
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return (r << 16) | (g << 8) | b
}

// ── 类型定义 ──────────────────────────────────────────────

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
