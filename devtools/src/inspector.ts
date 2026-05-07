/**
 * Vue DevTools Inspector 模块
 *
 * 负责将 @kaokei/use-vue-service 的容器树和绑定/服务状态
 * 映射为 Vue DevTools Inspector API 需要的数据格式。
 *
 * 支持多个 Vue App 实例：所有 app 共享同一个 ROOT_CONTAINER，
 * 每个 app 有独立的容器子树。Inspector 树以 Root Container 为根，
 * 每个 app 的容器作为子树挂载。
 */

import type { App } from 'vue'
import type { Container } from '@kaokei/di'
import { CONTAINER_TOKEN } from '@kaokei/use-vue-service'
import { buildContainerTreeFromComponents, type ContainerTreeNode } from './core/component-walker'
import type { BindingInfo } from './core/types'
import { getBindingCount } from './core/container-tree'
import { getBindings, getActivatedBindings } from './core/binding-reader'
import { extractServiceState } from './core/state-extractor'
import { getRootContainer } from './core/root-container'

// ── Inspector 常量 ──────────────────────────────────────────

export const INSPECTOR_ID = 'uvs-services'

// ── App 引用（多实例支持）──────────────────────────────────

/**
 * 保存所有已注册的 Vue App 引用。
 * key 为 app._uid，value 为 App 实例。
 * 由 setupDevtools() 在每个 app 初始化时添加。
 */
const _apps: Map<number, App> = new Map()

/**
 * 注册 Vue App 引用。重复调用不会覆盖。
 */
export function setDevtoolsApp(app: App): void {
  const uid = (app as any)._uid
  if (uid !== undefined && !_apps.has(uid)) {
    _apps.set(uid, app)
  }
}

/**
 * 获取所有已注册的 Vue App 实例列表。
 */
export function getDevtoolsApps(): App[] {
  return Array.from(_apps.values())
}

/**
 * 移除已注册的 Vue App 引用（app 卸载时调用）。
 */
export function removeDevtoolsApp(app: App): void {
  const uid = (app as any)._uid
  if (uid !== undefined) {
    _apps.delete(uid)
  }
}

// ── 多 App 辅助工具 ────────────────────────────────────────

/**
 * 从指定 app 的 _context.provides 中获取 app 作用域容器。
 */
function getAppContainer(app: App): Container | undefined {
  const provides = (app as any)._context?.provides
  if (!provides) return undefined
  if (Object.hasOwn(provides, CONTAINER_TOKEN)) {
    return provides[CONTAINER_TOKEN] as Container
  }
  return undefined
}

/**
 * 判断容器的作用域（跨所有已注册的 app）。
 * - root：没有 parent 的容器（ROOT_CONTAINER）
 * - app：匹配任一 app 的 app container
 * - component：其余所有有 parent 的容器
 */
function getContainerScopeGlobal(container: Container): 'root' | 'app' | 'component' {
  if (!container.parent) return 'root'
  for (const app of _apps.values()) {
    const appContainer = getAppContainer(app)
    if (appContainer && container === appContainer) return 'app'
  }
  return 'component'
}

/**
 * 为 app 生成人类可读的标签。
 * 优先使用根组件名，否则用序号。
 */
function getAppLabel(app: App, _index: number): string {
  const rootInstance = (app as any)._instance
  const rootComponentName = rootInstance?.type?.name || rootInstance?.type?.__name
  return rootComponentName ?? `App ${_index + 1}`
}

/**
 * 为容器树节点的所有 ID 添加前缀，保证跨 app 的唯一性。
 */
function prefixNodeIds(node: ContainerTreeNode, prefix: string): void {
  node.id = `${prefix}-${node.id}`
  for (const child of node.children) {
    prefixNodeIds(child, prefix)
  }
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
 * 统一树结构：Root Container 为根，每个 app 的容器作为子树。
 * 多 app 的容器树合并展示，体现共享 ROOT_CONTAINER 的关系。
 */
export function getInspectorTree(): { rootNodes: InspectorTreeNode[] } {
  const rootContainer = getRootContainer()
  if (!rootContainer || _apps.size === 0) {
    return { rootNodes: [] }
  }

  // 构建统一树根节点
  const root: ContainerTreeNode = {
    id: 'root',
    label: 'Root Container',
    scope: 'root',
    container: rootContainer,
    children: [],
  }

  _idToContainer = new Map()
  _idToContainer.set(root.id, root.container)

  // 迭代所有 app，各自构建容器子树后合并到根节点下
  let appIndex = 0
  for (const [_uid, app] of _apps) {
    const appLabel = getAppLabel(app, appIndex)
    const appTree = buildContainerTreeFromComponents(app, rootContainer, appLabel)

    // 为所有节点 ID 添加 app 前缀，保证跨 app 唯一
    prefixNodeIds(appTree, `app${appIndex}`)

    // 构建 id→container 映射
    buildIdMap(appTree)

    // 合并：取 appTree 的子节点（跳过 appTree 自身的 root 节点，因为已有统一 root）
    root.children.push(...appTree.children)
    appIndex++
  }

  return {
    rootNodes: [treeNodeToInspectorNode(root)],
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
  return {
    id: node.id,
    label: node.label,
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

  // 跨所有 app 判断作用域
  const scope = getContainerScopeGlobal(container)

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

// ── 类型定义 ──────────────────────────────────────────────

interface InspectorTreeNode {
  id: string
  label: string
  children?: InspectorTreeNode[]
}

interface InspectorStateResult {
  state: Record<string, Array<{ key: string; value: any }>>
}
