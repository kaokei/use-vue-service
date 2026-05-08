# @kaokei/nuxt-use-vue-service

Nuxt 模块，为 `@kaokei/use-vue-service` 提供零配置的 API 自动导入和 DevTools 集成。

## 功能

- **API 自动导入**：所有 `@kaokei/use-vue-service` 的 API（函数、装饰器、Token 类、类型）均可在 Nuxt 项目中直接使用，无需手动 `import`。
- **DevTools 集成**：自动引入 `@kaokei/devtools-use-vue-service`，在组件审查面板中展示容器标签和服务实例状态，无需单独配置。

## 安装

```bash
npm install @kaokei/nuxt-use-vue-service
# 或
pnpm add @kaokei/nuxt-use-vue-service
```

## 使用

在 `nuxt.config.ts` 的 `modules` 数组中添加模块即可：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@kaokei/nuxt-use-vue-service'],
})
```

添加后无需任何额外配置，即可在组件和 composable 中直接使用所有 API：

```vue
<script setup lang="ts">
// 无需 import，直接使用
const counterService = useService(CounterService)
</script>
```

## 自动导入的 API 列表

以下所有 API 均自动导入，可在项目中直接使用：

| 类型 | API |
|------|-----|
| **Composable** | `useService`、`useRootService`、`useAppService` |
| **声明函数** | `declareProviders`、`declareRootProviders`、`declareAppProviders`、`declareAppProvidersPlugin` |
| **特殊 Token** | `FIND_CHILD_SERVICE`、`FIND_CHILDREN_SERVICES` |
| **装饰器** | `Computed`、`Raw`、`RunInScope`、`Inject`、`Self`、`SkipSelf`、`Optional`、`PostConstruct`、`PreDestroy`、`Injectable`、`LazyInject`、`createLazyInject` |
| **Token 类** | `Token`、`LazyToken` |
| **工具函数** | `autobind` |
| **类型** | `TokenType`、`FindChildService`、`FindChildrenServices` |

## 配置项

通过 `nuxt.config.ts` 中的 `useVueService` 字段进行配置：

```ts
export default defineNuxtConfig({
  modules: ['@kaokei/nuxt-use-vue-service'],
  useVueService: {
    devtools: false, // 禁用 DevTools 集成，默认为 true
  },
})
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `devtools` | `boolean` | `true` | 是否启用 DevTools 集成（组件审查增强） |

## Nuxt 版本兼容性

| Nuxt 版本 | 支持状态 |
|-----------|---------|
| Nuxt 3.x | ✅ |
| Nuxt 4.x | ✅ |
| Nuxt 5.x | ✅ |

## DevTools 支持说明

本模块内置了 `@kaokei/devtools-use-vue-service` 的 Nuxt 客户端插件，无需单独安装 DevTools 包。启用后支持以下功能：

- ✅ 在 Components 面板中显示 `container` 标签
- ✅ 在组件审查面板右侧展示 `Services` 分组（服务实例的响应式状态）

由于 Nuxt DevTools 页面内嵌的 Vue DevTools 客户端为精简版，**自定义 Services Inspector Tab 不会出现在页面内的 Nuxt DevTools 面板中**。但通过浏览器扩展（Vue DevTools 浏览器插件）仍可正常查看 Services Inspector Tab。

## 在线示例

- [13-nuxt-decorators](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/13-nuxt-decorators)：在 Nuxt 4 项目中使用 TC39 Stage 3 装饰器
- [19-nuxt-auto-imports](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/19-nuxt-auto-imports)：通过本模块实现所有 API 零 import 自动注入
- [21-nuxt-devtools-demo](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/21-nuxt-devtools-demo)：Nuxt 项目中的 DevTools 组件审查增强效果
