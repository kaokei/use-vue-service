# @kaokei/devtools-use-vue-service

Vue DevTools 插件，为 `@kaokei/use-vue-service` 提供调试支持。

## 功能

- **组件审查增强**：在 Vue DevTools 的 Components 面板中，为声明了容器的组件添加 `container` 标签，并在右侧面板展示 `Services` 分组，显示该容器内各服务实例的响应式状态。
- **自定义 Services 面板**（仅 Vite DevTools 模式）：提供独立的 `Services` Inspector Tab，展示全局容器树（Root Container → App Container → Component Container）以及每个容器的绑定详情和服务实例状态。
- **多 App 实例支持**：同一页面存在多个 Vue App 实例时，各 App 的容器均可正常展示。

## 安装

```bash
npm install @kaokei/devtools-use-vue-service
# 或
pnpm add @kaokei/devtools-use-vue-service
```

## 集成方式

### 方式一：Vite 插件（推荐）

在 `vite.config.ts` 中添加插件，零业务代码侵入，无需修改 `main.ts`：

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import { useVueServiceDevtools } from '@kaokei/devtools-use-vue-service/vite'

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(),
    useVueServiceDevtools(), // 放在 VueDevTools() 之后
  ],
})
```

此方式通过虚拟模块自动注入客户端代码，支持 Vite DevTools 的自定义 Services Inspector Tab。

### 方式二：手动调用

在 `main.ts` 中手动注册，适合不使用 Vite DevTools 或需要精确控制时机的场景：

```ts
// main.ts
import { createApp } from 'vue'
import { setupDevtools } from '@kaokei/devtools-use-vue-service'
import App from './App.vue'

const app = createApp(App)
setupDevtools(app)
app.mount('#app')
```

多 App 实例场景，每个 App 各调用一次：

```ts
const app1 = createApp(App1)
const app2 = createApp(App2)
setupDevtools(app1)
setupDevtools(app2)
app1.mount('#app1')
app2.mount('#app2')
```

### 方式三：Nuxt 项目（零配置）

在 Nuxt 项目中使用 `@kaokei/nuxt-use-vue-service` 模块，DevTools 集成会自动启用，无需单独安装或配置本包。详见 [Nuxt 插件](./nuxt-plugin)。

## Vite 插件选项

`useVueServiceDevtools()` 接受可选的配置对象：

| 选项 | 类型 | 说明 |
|------|------|------|
| `appendTo` | `string \| RegExp` | 指定入口模块文件，将虚拟模块 import 追加到该文件头部，而非通过 `transformIndexHtml` 注入 script 标签。适合 SSR 等不依赖 HTML 注入的场景。 |

示例：

```ts
useVueServiceDevtools({ appendTo: 'src/main.ts' })
```

## 已知限制

**Nuxt DevTools**（`@nuxt/devtools`）页面内嵌的 Vue DevTools 客户端是精简版，**不支持**第三方模块通过 `addCustomTab` 添加自定义 Inspector Tab（Pinia 的 Tab 是 Nuxt DevTools 内部硬编码的，非通用 API）。因此自定义 Services Inspector Tab **不会出现在页面内的 Nuxt DevTools 面板中**。

但通过**浏览器扩展**（Vue DevTools 浏览器插件）仍可正常查看 Services Inspector Tab，不受此限制影响。

在 Nuxt 项目中，以下功能始终正常（含页面内 Nuxt DevTools）：

- ✅ 组件审查增强（`container` 标签、`Services` 状态分组）
- ✅ `devtools: false` 配置项

以下功能在页面内 Nuxt DevTools 中不可用，但可通过浏览器扩展查看：

- ✅ 自定义 Services Inspector Tab（浏览器扩展可用）

## 在线示例

- [20-devtools-demo](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/20-devtools-demo)：在 Vite 项目中集成 DevTools，展示 Services Inspector Tab 和组件审查增强
- [21-nuxt-devtools-demo](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/21-nuxt-devtools-demo)：在 Nuxt 项目中通过 `@kaokei/nuxt-use-vue-service` 自动获得 DevTools 支持
