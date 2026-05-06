import type { ServiceStateInfo } from './types'

/**
 * 从服务实例中提取响应式状态。
 *
 * 服务实例被 @kaokei/use-vue-service 的 activationHandle 包裹为 reactive()，
 * 所以其属性已经是响应式的。直接提取自身可枚举属性即可。
 */
export function extractServiceState(instance: any): Record<string, any> {
  if (!instance || typeof instance !== 'object') {
    return {}
  }

  const state: Record<string, any> = {}

  // 获取自身可枚举属性
  for (const key of Object.keys(instance)) {
    // 跳过内部属性和方法
    if (isInternalKey(key)) continue

    const value = instance[key]
    // 跳过函数方法（只展示数据状态）
    if (typeof value === 'function') continue

    state[key] = value
  }

  return state
}

/**
 * 从多个服务实例中提取状态，返回 ServiceStateInfo 列表
 */
export function extractAllServiceStates(
  services: Array<{ tokenName: string; bindingType: string; instance: any }>
): ServiceStateInfo[] {
  return services.map(({ tokenName, bindingType, instance }) => ({
    tokenName,
    bindingType,
    state: extractServiceState(instance),
  }))
}

/**
 * 判断是否为内部 key，不应对用户展示
 */
function isInternalKey(key: string): boolean {
  return key.startsWith('__') || key.startsWith('_') || key === 'constructor'
}
