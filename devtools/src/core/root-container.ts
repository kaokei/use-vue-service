/**
 * Root Container 获取模块
 *
 * 通过 declareRootProviders + FunctionProvider 机制获取 ROOT_CONTAINER 引用，
 * 无需主库暴露任何专用 API。
 *
 * 原理：
 * declareRootProviders(providers) → bindProviders(ROOT_CONTAINER, providers)
 * 当 providers 为函数（FunctionProvider）时 → providers(ROOT_CONTAINER)
 * 因此在回调中即可捕获 ROOT_CONTAINER 引用。
 */

import type { Container } from '@kaokei/di'
import { declareRootProviders } from '@kaokei/use-vue-service'

let _rootContainer: Container | null = null

/**
 * 通过 FunctionProvider 回调捕获 ROOT_CONTAINER 引用。
 * 应在 devtools 初始化时调用一次。
 */
export function captureRootContainer(): void {
  declareRootProviders((container) => {
    _rootContainer = container
  })
}

/**
 * 获取已捕获的 ROOT_CONTAINER 引用。
 * 必须在 captureRootContainer() 之后调用。
 */
export function getRootContainer(): Container | null {
  return _rootContainer
}
