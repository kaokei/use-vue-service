import { defineNuxtModule, addImports } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

const MODULE_NAME = 'use-vue-service'
const FROM = '@kaokei/use-vue-service'

const module: NuxtModule = defineNuxtModule({
  meta: {
    name: MODULE_NAME,
    configKey: 'useVueService',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0',
    },
  },
  setup() {
    addImports([
      // --- @kaokei/use-vue-service 核心 API ---
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
      // --- @kaokei/di 重导出 API ---
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
      // --- 类型导入 ---
      { from: FROM, name: 'TokenType', type: true },
      { from: FROM, name: 'FindChildService', type: true },
      { from: FROM, name: 'FindChildrenServices', type: true },
    ])
  },
})

export default module
