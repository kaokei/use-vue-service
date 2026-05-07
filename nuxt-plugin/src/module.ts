import { defineNuxtModule, addImports, addPlugin, addServerHandler } from '@nuxt/kit'
import { addCustomTab } from '@nuxt/devtools-kit'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import type { NuxtModule } from '@nuxt/schema'

// ── 模块配置项 ──────────────────────────────────────────────

export interface ModuleOptions {
  /**
   * 是否启用 Nuxt DevTools 集成（Services Tab + 组件审查增强）。
   * @default true
   */
  devtools?: boolean
}

const MODULE_NAME = 'use-vue-service'
const FROM = '@kaokei/use-vue-service'

// ── 模块定义 ────────────────────────────────────────────────

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'useVueService',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0 || ^5.0.0',
    },
  },
  defaults: {
    devtools: true,
  },
  async setup(options, _nuxt) {
    // 1. 自动导入 API（始终启用）
    addImports([
      { from: FROM, name: 'useService' },
      { from: FROM, name: 'declareProviders' },
      { from: FROM, name: 'useRootService' },
      { from: FROM, name: 'declareRootProviders' },
      { from: FROM, name: 'useAppService' },
      { from: FROM, name: 'declareAppProviders' },
      { from: FROM, name: 'declareAppProvidersPlugin' },
      { from: FROM, name: 'FIND_CHILD_SERVICE' },
      { from: FROM, name: 'FIND_CHILDREN_SERVICES' },
      { from: FROM, name: 'Computed' },
      { from: FROM, name: 'Raw' },
      { from: FROM, name: 'RunInScope' },
      { from: FROM, name: 'Token' },
      { from: FROM, name: 'LazyToken' },
      { from: FROM, name: 'Inject' },
      { from: FROM, name: 'Self' },
      { from: FROM, name: 'SkipSelf' },
      { from: FROM, name: 'Optional' },
      { from: FROM, name: 'PostConstruct' },
      { from: FROM, name: 'PreDestroy' },
      { from: FROM, name: 'Injectable' },
      { from: FROM, name: 'LazyInject' },
      { from: FROM, name: 'createLazyInject' },
      { from: FROM, name: 'autobind' },
      { from: FROM, name: 'TokenType', type: true },
      { from: FROM, name: 'FindChildService', type: true },
      { from: FROM, name: 'FindChildrenServices', type: true },
    ])

    // 2. DevTools 集成（可通过 devtools: false 禁用）
    if (options.devtools !== false) {
      const __dirname = dirname(fileURLToPath(import.meta.url))
      const runtimeDir = resolve(__dirname, 'runtime')

      // 2a. 注册客户端插件：初始化 setupDevtools + postMessage 桥接
      addPlugin({
        src: resolve(runtimeDir, 'devtools-client'),
        mode: 'client',
      })

      // 2b. Nuxt DevTools 自定义 Tab + 面板路由
      try {
        addCustomTab({
          name: 'use-vue-service',
          title: 'Services',
          icon: 'i-carbon-container-services',
          view: {
            type: 'iframe',
            src: '/__nuxt_devtools__/use-vue-service/panel',
            persistent: false,
          },
        })

        addServerHandler({
          route: '/__nuxt_devtools__/use-vue-service/panel',
          handler: resolve(runtimeDir, 'panel-handler'),
        })
      } catch {
        // @nuxt/devtools 未安装时静默忽略
      }
    }
  },
})

export default module
