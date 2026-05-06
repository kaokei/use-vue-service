import type { Container } from '@kaokei/di'
import type { ContainerInfo, ContainerIdMap, BindingInfo } from './types'

/**
 * 从根容器开始遍历，构建完整的容器树信息。
 * 同时建立 container ↔ id 双向映射，供后续查询使用。
 */
export function buildContainerTree(
  rootContainer: Container,
  idMap?: ContainerIdMap
): ContainerInfo {
  if (!idMap) {
    idMap = { containerToId: new Map(), idToContainer: new Map() }
  }
  return buildNode(rootContainer, 'root', 0, idMap)
}

/**
 * 根据 ID 查找容器实例
 */
export function findContainerById(
  rootContainer: Container,
  id: string
): Container | undefined {
  const idMap = buildIdMap(rootContainer)
  return idMap.idToContainer.get(id)
}

/**
 * 构建容器到 ID 的双向映射
 */
export function buildIdMap(rootContainer: Container): ContainerIdMap {
  const idMap: ContainerIdMap = {
    containerToId: new Map(),
    idToContainer: new Map(),
  }
  // 遍历整棵树以构建映射
  buildNode(rootContainer, 'root', 0, idMap)
  return idMap
}

/**
 * 获取容器的绑定数量（用于标签展示）
 */
export function getBindingCount(container: Container): number {
  return container._bindings.size
}

/**
 * 判断容器的作用域
 * - root：没有 parent
 * - app：parent 是 root（第一层子容器）
 * - component：更深层的容器
 *
 * 注意：这是一个启发式判断。由于 declareAppProviders 创建的容器
 * 和 declareProviders 在根组件创建的容器都是 root 的直接子容器，
 * MVP 阶段统一标记为 'app'，后续可通过 __uvs_scope__ 标记精确区分。
 */
export function getContainerScope(
  container: Container
): ContainerInfo['scope'] {
  if (!container.parent) return 'root'
  if (!container.parent.parent) return 'app'
  return 'component'
}

/**
 * 递归构建容器节点
 */
function buildNode(
  container: Container,
  id: string,
  depth: number,
  idMap: ContainerIdMap
): ContainerInfo {
  idMap.containerToId.set(container, id)
  idMap.idToContainer.set(id, container)

  const scope = getContainerScope(container)
  const label = getNodeLabel(container, scope, id)
  const bindings: BindingInfo[] = [] // 绑定信息由 binding-reader 模块单独构建

  const children: ContainerInfo[] = []
  const childSet = container.getChildren()
  if (childSet) {
    let childIndex = 0
    for (const child of childSet) {
      if (child._destroyed) continue
      const childId = `${id}-${childIndex}`
      children.push(buildNode(child, childId, depth + 1, idMap))
      childIndex++
    }
  }

  return {
    id,
    label,
    scope,
    children,
    bindings,
    destroyed: container._destroyed,
  }
}

/**
 * 生成节点的显示标签
 */
function getNodeLabel(
  container: Container,
  scope: ContainerInfo['scope'],
  _id: string
): string {
  const bindingCount = getBindingCount(container)
  const suffix = bindingCount > 0 ? ` (${bindingCount} services)` : ''

  switch (scope) {
    case 'root':
      return 'Root Container' + suffix
    case 'app':
      return 'App Container' + suffix
    case 'component':
      return 'Component Container' + suffix
  }
}
