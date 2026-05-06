import type { Container } from '@kaokei/di'
import type { ContainerInfo, BindingInfo } from './types'
import { isInternalToken } from './types'

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
 * 基于 provide 存储位置判断，无需增加私有属性来标记：
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
