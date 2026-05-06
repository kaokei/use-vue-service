import type { Container, Binding, CommonToken } from '@kaokei/di'
import type { BindingInfo } from './types'
import { getTokenName, getTokenType, getBindingTypeName, getBindingStatusName } from './types'

/**
 * 读取容器中所有绑定，转换为 BindingInfo 列表。
 * 过滤掉内部特殊 token（FIND_CHILD_SERVICE、FIND_CHILDREN_SERVICES）。
 */
export function getBindings(container: Container, prefix: string = ''): BindingInfo[] {
  const result: BindingInfo[] = []
  let index = 0

  for (const [token, binding] of container._bindings) {
    // 跳过内部 token
    if (isInternalToken(token)) continue

    const tokenName = getTokenName(token)
    const id = prefix ? `${prefix}-binding-${index}` : `binding-${index}`

    result.push({
      id,
      tokenName,
      tokenType: getTokenType(token),
      bindingType: getBindingTypeName(binding),
      status: getBindingStatusName(binding),
      hasCache: binding.status === 'activated' && binding.cache !== undefined,
      isTransient: binding.transient,
    })
    index++
  }

  return result
}

/**
 * 获取容器中已激活的绑定（即已解析的服务实例）
 */
export function getActivatedBindings(container: Container): Array<{
  token: CommonToken
  binding: Binding
  tokenName: string
}> {
  const result: Array<{
    token: CommonToken
    binding: Binding
    tokenName: string
  }> = []

  for (const [token, binding] of container._bindings) {
    if (isInternalToken(token)) continue
    if (binding.status === 'activated' && binding.cache !== undefined) {
      result.push({
        token,
        binding,
        tokenName: getTokenName(token),
      })
    }
  }

  return result
}

/**
 * 判断是否为内部 token（不应对用户展示）
 */
function isInternalToken(token: CommonToken): boolean {
  if (typeof token === 'function') return false
  // Token 实例的 name 属性
  const name = (token as any).name
  return name === 'FIND_CHILD_SERVICE' || name === 'FIND_CHILDREN_SERVICES'
}
