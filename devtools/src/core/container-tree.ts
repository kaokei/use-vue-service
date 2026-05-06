import type { Container } from '@kaokei/di'
import type { ContainerInfo, ContainerIdMap, BindingInfo } from './types'
import { isInternalToken } from './types'

/**
 * 从根容器开始遍历，构建完整的容器树信息。
 * 同时建立 container ↔ id 双向映射，供后续查询使用。
 *
 * @param appContainer - 通过 app.provide 注册的容器，用于区分 app/component 作用域
 */
export function buildContainerTree(
  rootContainer: Container,
  idMap?: ContainerIdMap,
  appContainer?: Container
): ContainerInfo {
  if (!idMap) {
    idMap = { containerToId: new Map(), idToContainer: new Map() }
  }
  return buildNode(rootContainer, 'root', 0, idMap, appContainer)
}

/**
 * 根据 ID 查找容器实例
 */
export function findContainerById(
  rootContainer: Container,
  id: string,
  appContainer?: Container
): Container | undefined {
  const idMap = buildIdMap(rootContainer, appContainer)
  return idMap.idToContainer.get(id)
}

/**
 * 构建容器到 ID 的双向映射
 */
export function buildIdMap(rootContainer: Container, appContainer?: Container): ContainerIdMap {
  const idMap: ContainerIdMap = {
    containerToId: new Map(),
    idToContainer: new Map(),
  }
  // 遍历整棵树以构建映射
  buildNode(rootContainer, 'root', 0, idMap, appContainer)
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
 * 基于 provide 机制判断，无需增加私有属性来标记：
 * - root：没有 parent 的容器（ROOT_CONTAINER）
 * - app：通过 app.provide 注册的容器（app._context.provides[CONTAINER_TOKEN]）
 * - component：其余所有有 parent 的容器
 *
 * @param container - 要判断的容器
 * @param appContainer - app.provide 注册的容器引用（可选）
 */
export function getContainerScope(
  container: Container,
  appContainer?: Container
): ContainerInfo['scope'] {
  if (!container.parent) return 'root'
  if (appContainer && container === appContainer) return 'app'
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
  idMap: ContainerIdMap,
  appContainer?: Container
): ContainerInfo {
  idMap.containerToId.set(container, id)
  idMap.idToContainer.set(id, container)

  const scope = getContainerScope(container, appContainer)
  const label = getNodeLabel(container, scope, id)
  const bindings: BindingInfo[] = [] // 绑定信息由 binding-reader 模块单独构建

  const children: ContainerInfo[] = []
  const childSet = container.getChildren()
  if (childSet) {
    let childIndex = 0
    for (const child of childSet) {
      if (child._destroyed) continue
      const childId = `${id}-${childIndex}`
      children.push(buildNode(child, childId, depth + 1, idMap, appContainer))
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
