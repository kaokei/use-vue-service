/**
 * Vite 插件模块
 *
 * 提供零业务代码侵入的 DevTools 集成方式。
 * 用户只需在 vite.config.ts 中添加 useVueServiceDevtools() 插件，
 * 即可自动注册 Vue DevTools Inspector，无需修改 main.ts。
 *
 * 使用方式：
 * ```ts
 * // vite.config.ts
 * import VueDevTools from 'vite-plugin-vue-devtools'
 * import { useVueServiceDevtools } from '@kaokei/devtools-use-vue-service/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     vue(),
 *     VueDevTools(),
 *     useVueServiceDevtools(),  // 放在 VueDevTools 之后
 *   ],
 * })
 * ```
 */

import type { PluginOption, IndexHtmlTransformResult } from 'vite'

export interface UseVueServiceDevtoolsOptions {
  /**
   * 指定入口模块文件，将虚拟模块 import 追加到该文件头部。
   * 与 vite-plugin-vue-devtools 的 appendTo 选项类似。
   *
   * - 不设置时，默认通过 transformIndexHtml 注入 script 标签
   * - 设置为字符串时，匹配文件名后缀（如 'src/main.ts'）
   * - 设置为正则时，匹配文件完整路径
   */
  appendTo?: string | RegExp
}

const VIRTUAL_MODULE_ID = 'virtual:use-vue-service-devtools'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

/**
 * 虚拟模块的客户端代码。
 *
 * vite-plugin-vue-devtools v8 架构说明：
 * - v8 使用 @vue/devtools-kit 的 RPC 架构，不再依赖浏览器扩展模型
 * - overlay.js 调用 devtools.init() → initDevTools() 创建全局钩子
 * - initDevTools() 在创建钩子后会回放 __VUE_DEVTOOLS_HOOK_REPLAY__ 中的回调
 * - Vue 3 在 app.mount() 时触发 hook.emit('app:init', app)
 *
 * 我们的注册策略：
 * 1. 如果 __VUE_DEVTOOLS_GLOBAL_HOOK__ 已存在（如 appendTo 场景），
 *    直接监听 app:init 事件
 * 2. 如果不存在（script 标签注入场景），使用 __VUE_DEVTOOLS_HOOK_REPLAY__
 *    机制注册回调，initDevTools() 创建钩子后会回调我们
 * 3. 在 app:init 回调中获取 app 实例，调用 setupDevtools(app)
 *    setupDevToolsPlugin 会将插件添加到 buffer，
 *    随后 vueAppInit → registerDevToolsPlugin 会遍历 buffer 并初始化
 */
const CLIENT_CODE = `
import { setupDevtools } from '@kaokei/devtools-use-vue-service'

function registerUVSDevtools() {
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
  if (hook && hook.id === 'vue-devtools-next') {
    // 场景 1：hook 已存在（appendTo 注入或 script 标签晚于 overlay.js）
    hook.on('app:init', (app) => {
      setupDevtools(app)
    })
    if (hook.apps && hook.apps.length > 0) {
      hook.apps.forEach((app) => setupDevtools(app))
    }
    return
  }

  // 场景 2：hook 尚未创建（script 标签注入，早于 overlay.js）
  // 使用 __VUE_DEVTOOLS_HOOK_REPLAY__ 官方机制：
  // initDevTools() 创建钩子后，会回放此数组中的所有回调并传入钩子对象
  const replay = window.__VUE_DEVTOOLS_HOOK_REPLAY__ = window.__VUE_DEVTOOLS_HOOK_REPLAY__ || []
  replay.push((hook) => {
    hook.on('app:init', (app) => {
      setupDevtools(app)
    })
    if (hook.apps && hook.apps.length > 0) {
      hook.apps.forEach((app) => setupDevtools(app))
    }
  })
}

registerUVSDevtools()
`.trim()

/**
 * Vite 插件：自动注册 @kaokei/use-vue-service 的 Vue DevTools Inspector。
 *
 * 仅在开发模式（serve）下生效，不影响生产构建。
 */
export function useVueServiceDevtools(
  options?: UseVueServiceDevtoolsOptions
): PluginOption {
  return {
    name: 'vite-plugin-use-vue-service-devtools',
    enforce: 'pre',
    apply: 'serve',

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return
      return CLIENT_CODE
    },

    transformIndexHtml(): IndexHtmlTransformResult | void {
      if (options?.appendTo) return

      return [
        {
          tag: 'script',
          injectTo: 'head-prepend',
          attrs: {
            type: 'module',
            src: '/@id/' + VIRTUAL_MODULE_ID,
          },
        },
      ]
    },

    transform(code, id) {
      if (!options?.appendTo) return

      const [filename] = id.split('?', 2)
      const { appendTo } = options

      if (
        (typeof appendTo === 'string' && filename.endsWith(appendTo)) ||
        (appendTo instanceof RegExp && appendTo.test(filename))
      ) {
        return `import '${VIRTUAL_MODULE_ID}';\n${code}`
      }
    },
  }
}
