import type { Container } from '@kaokei/di'
import type { ContainerInfo, ContainerIdMap, BindingInfo } from './types'
import { isInternalToken } from './types'

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
 * 获取容器的用户可见绑定数量（过滤内部 token）。
 * 仅统计当前容器直接绑定的服务，不包含子容器的绑定。
 */
export function getBindingCount(container: Container): number {
  let count = 0
  for (const [token] of container._bindings) {
    if (!isInternalToken(token)) count++
  }
  return count
}

/**
 * 判断容器的作用域。
 *
 * 优先读取容器上的 __uvs_scope__ 标记（由 declareProviders/declareAppProviders 设置），
 * 回退到基于层级的启发式判断。
 *
 * - root：ROOT_CONTAINER，没有 parent
 * - app：declareAppProviders 创建的容器（__uvs_scope__ === 'app'）
 * - component：declareProviders 在组件中创建的容器（__uvs_scope__ === 'component'）
 */
export function getContainerScope(
  container: Container
): ContainerInfo['scope'] {
  // 优先使用显式标记
  const explicitScope = (container as any).__uvs_scope__
  if (explicitScope === 'root' || explicitScope === 'app' || explicitScope === 'component') {
    return explicitScope
  }
  // 回退：启发式判断
  if (!container.parent) return 'root'
  return 'component'
}

/**
 * 获取容器关联的组件名（仅 component 作用域有值）
 */
export function getComponentName(container: Container): string | undefined {
  return (container as any).__uvs_component_name__
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
 *
 * - root → "Root Container"
 * - app → "App Container"
 * - component → "<ComponentName> Container"（如果知道组件名）或 "Component Container"
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
    case 'app': {
      return 'App Container' + suffix
    }
    case 'component': {
      const componentName = getComponentName(container)
      return componentName
        ? `<${componentName}> Container` + suffix
        : 'Component Container' + suffix
    }
  }
}
