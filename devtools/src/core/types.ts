import type { Container, Binding, CommonToken } from '@kaokei/di'

/**
 * DevTools 中的容器信息
 */
export interface ContainerInfo {
  /** 唯一标识，用于 DevTools Inspector 节点 ID */
  id: string
  /** 人类可读标签 */
  label: string
  /** 容器作用域 */
  scope: 'root' | 'app' | 'component'
  /** 子容器列表 */
  children: ContainerInfo[]
  /** 绑定列表 */
  bindings: BindingInfo[]
  /** 容器是否已销毁 */
  destroyed: boolean
  /** 组件名称（仅 scope === 'component' 时有值） */
  componentLabel?: string
}

/**
 * DevTools 中的绑定信息
 */
export interface BindingInfo {
  /** 唯一标识 */
  id: string
  /** Token 名称 */
  tokenName: string
  /** Token 类型 */
  tokenType: 'class' | 'token'
  /** 绑定类型 */
  bindingType: 'Instance' | 'ConstantValue' | 'DynamicValue' | 'Invalid'
  /** 绑定状态 */
  status: 'default' | 'initing' | 'activated'
  /** 是否有已解析的缓存实例 */
  hasCache: boolean
  /** 是否为 transient 作用域 */
  isTransient: boolean
}

/**
 * DevTools 中的服务状态信息
 */
export interface ServiceStateInfo {
  /** Token 名称 */
  tokenName: string
  /** 绑定类型 */
  bindingType: string
  /** 服务实例的响应式状态快照 */
  state: Record<string, any>
}

/**
 * 内部用于遍历时跟踪容器到 ID 的映射
 */
export interface ContainerIdMap {
  containerToId: Map<Container, string>
  idToContainer: Map<string, Container>
}

/**
 * Token 类型判断
 * Token 实例有 name 属性且不是函数；类构造函数是函数
 */
export function getTokenName(token: CommonToken): string {
  if (typeof token === 'function') {
    return token.name || 'Anonymous'
  }
  return (token as any).name || 'Unknown'
}

export function getTokenType(token: CommonToken): 'class' | 'token' {
  return typeof token === 'function' ? 'class' : 'token'
}

/**
 * 获取 Binding 的绑定类型字符串
 */
export function getBindingTypeName(binding: Binding): BindingInfo['bindingType'] {
  return binding.type as BindingInfo['bindingType']
}

/**
 * 获取 Binding 的状态字符串
 */
export function getBindingStatusName(binding: Binding): BindingInfo['status'] {
  return binding.status as BindingInfo['status']
}
