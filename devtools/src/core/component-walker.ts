/**
 * 组件树遍历模块
 *
 * 从 Vue 组件树中提取关联了容器的组件，构建容器视图树。
 * 替代原先基于 ROOT_CONTAINER parent/children 的遍历方式。
 *
 * 遍历方式与 Vue DevTools 的 ComponentWalker 相同：
 * app._instance → instance.subTree → walk vnodes
 */

import type { App } from 'vue'
import type { Container } from '@kaokei/di'
import { CONTAINER_TOKEN } from '@kaokei/use-vue-service'

/**
 * 容器视图树节点
 */
export interface ContainerTreeNode {
  /** 唯一标识，用于 DevTools Inspector 节点 ID */
  id: string
  /** 人类可读标签 */
  label: string
  /** 容器作用域 */
  scope: 'root' | 'app' | 'component'
  /** 容器实例引用 */
  container: Container
  /** 子节点 */
  children: ContainerTreeNode[]
  /** 可选的 app 标签，用于区分多 app 场景 */
  appLabel?: string
}

/**
 * 从 Vue App 实例遍历组件树，构建容器视图树。
 *
 * 构建逻辑：
 * 1. Root Container：通过 declareRootProviders + FunctionProvider 获取，始终作为根节点
 * 2. App Container：从 app._context.provides[CONTAINER_TOKEN] 获取（declareAppProviders 创建），作为 Root 的子节点
 * 3. App Component Container：从 app._instance.provides[CONTAINER_TOKEN] 获取（declareProviders 创建），作为上一层的子节点
 * 4. 其他 Component Container：遍历组件树，找到 hasOwn(provides, CONTAINER_TOKEN) 的组件
 *
 * @param app - Vue App 实例
 * @param rootContainer - ROOT_CONTAINER 引用
 * @param appLabel - 可选的 app 标签，用于区分多 app 场景中的 App Container 节点
 */
export function buildContainerTreeFromComponents(
  app: App,
  rootContainer: Container,
  appLabel?: string
): ContainerTreeNode {
  const appContainer = getAppContainer(app)

  // 根节点：Root Container
  const root: ContainerTreeNode = {
    id: 'root',
    label: 'Root Container',
    scope: 'root',
    container: rootContainer,
    children: [],
  }

  // 当前容器挂载的父节点（后续组件容器按层挂载）
  let currentParent: ContainerTreeNode = root

  // App 容器：如果存在（declareAppProviders），作为 Root 的直接子节点
  if (appContainer) {
    const label = appLabel ? `${appLabel} Container` : 'App Container'
    const appNode: ContainerTreeNode = {
      id: 'app',
      label,
      scope: 'app',
      container: appContainer,
      children: [],
      appLabel,
    }
    root.children.push(appNode)
    currentParent = appNode
  }

  // 检查 App 组件自身是否有关联容器（declareProviders 创建）
  const rootInstance = (app as any)._instance
  if (rootInstance) {
    const rootOwnContainer = getOwnContainer(rootInstance)
    if (rootOwnContainer) {
      const componentName = getComponentNameFromInstance(rootInstance)
      const appCompNode: ContainerTreeNode = {
        id: 'app-component',
        label: componentName
          ? `<${componentName}> Container`
          : '<App> Container',
        scope: 'component',
        container: rootOwnContainer,
        children: [],
      }
      currentParent.children.push(appCompNode)
      currentParent = appCompNode
    }

    // 遍历 App 组件的子组件树
    walkComponentTree(rootInstance, currentParent)
  }

  return root
}

/**
 * 从 app._context.provides 中获取 app 作用域容器
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
 * 递归遍历组件树，将关联了容器的组件添加到父节点下。
 *
 * 遍历方式与 Vue DevTools ComponentWalker 相同：
 * instance.subTree → walk vnodes → subTree.component
 */
function walkComponentTree(
  instance: any,
  parentNode: ContainerTreeNode
): void {
  const children = getVNodeChildren(instance.subTree)
  for (const childInstance of children) {
    // 检查该组件是否有自己的容器
    const container = getOwnContainer(childInstance)
    if (container) {
      const componentName = getComponentNameFromInstance(childInstance)
      const nodeId = `${parentNode.id}-${parentNode.children.length}`
      const node: ContainerTreeNode = {
        id: nodeId,
        label: componentName
          ? `<${componentName}> Container`
          : 'Component Container',
        scope: 'component',
        container,
        children: [],
      }
      parentNode.children.push(node)
      // 递归遍历子组件，容器节点挂在当前容器下
      walkComponentTree(childInstance, node)
    } else {
      // 该组件没有容器，但子组件可能有，继续向下遍历
      // 子容器仍然挂在父容器节点下（跳过没有容器的中间组件）
      walkComponentTree(childInstance, parentNode)
    }
  }
}

/**
 * 从组件实例的 provides 中获取该组件自身声明的容器。
 */
function getOwnContainer(instance: any): Container | undefined {
  const provides = instance?.provides
  if (!provides) return undefined
  if (Object.hasOwn(provides, CONTAINER_TOKEN)) {
    return provides[CONTAINER_TOKEN] as Container
  }
  return undefined
}

/**
 * 从组件实例获取组件名。
 * 直接读取 instance.type.name
 */
function getComponentNameFromInstance(instance: any): string | undefined {
  if (!instance?.type) return undefined
  return instance.type.name || instance.type.__name || undefined
}

/**
 * 从 vnode 的 subTree 中提取子组件实例列表。
 * 与 Vue DevTools ComponentWalker 的遍历方式一致。
 */
function getVNodeChildren(subTree: any): any[] {
  const list: any[] = []
  if (!subTree) return list

  if (subTree.component) {
    // 直接子组件
    if (!subTree.component.isUnmounted && !subTree.component._isBeingDestroyed) {
      list.push(subTree.component)
    }
  } else if (subTree.suspense) {
    // Suspense 边界：跟随活跃分支
    list.push(...getVNodeChildren(subTree.suspense.activeBranch))
  } else if (Array.isArray(subTree.children)) {
    // Fragment 或多子节点
    for (const child of subTree.children) {
      if (child && typeof child === 'object') {
        if (child.component) {
          if (!child.component.isUnmounted && !child.component._isBeingDestroyed) {
            list.push(child.component)
          }
        } else {
          list.push(...getVNodeChildren(child))
        }
      }
    }
  }

  return list
}
