# @kaokei/devtools-use-vue-service

Vue DevTools 插件，为 `@kaokei/use-vue-service` 提供调试面板。

## 功能

1. **组件审查增强**：在 DevTools Components 面板中，为声明了容器的组件添加 `container` 标签，并在右侧面板展示 `Services` 分组（含服务实例响应式状态）。
2. **自定义 Services 面板**（仅 Vite 模式）：提供独立的 `Services` 面板，展示全局容器树（Root Container → App Container → Component Container）以及每个容器的绑定详情。

## 架构

```
devtools/src/
├── index.ts              # 主入口，setupDevtools() 注册 Inspector 和组件钩子
├── vite-plugin.ts        # Vite 插件，零侵入自动注册方案
├── inspector.ts          # Inspector 树/状态构建逻辑，多 App 管理
├── component-hooks.ts    # 组件树 tag 和组件 Inspect 增强
└── core/                 # 核心数据层
    ├── container-tree.ts   # 容器作用域判断、绑定计数
    ├── component-walker.ts # 组件树遍历，构建容器视图树
    ├── root-container.ts   # 捕获 ROOT_CONTAINER
    ├── binding-reader.ts   # 读取容器绑定信息
    ├── state-extractor.ts  # 从服务实例提取响应式状态
    └── types.ts            # 核心类型定义和工具函数
```

## 导出路径

| 路径 | 文件 | 用途 |
|------|------|------|
| `.` | `dist/index.js` | `setupDevtools()` 主函数 |
| `./vite` | `dist/vite-plugin.js` | `useVueServiceDevtools()` Vite 插件 |

## 集成方式

### 方式一：Vite 插件（零业务侵入）

```ts
// vite.config.ts
import VueDevTools from 'vite-plugin-vue-devtools'
import { useVueServiceDevtools } from '@kaokei/devtools-use-vue-service/vite'

export default defineConfig({
  plugins: [vue(), VueDevTools(), useVueServiceDevtools()],
})
```

Vite 插件通过虚拟模块注入客户端代码，利用 `__VUE_DEVTOOLS_GLOBAL_HOOK__` 或 `__VUE_DEVTOOLS_HOOK_REPLAY__` 自动注册。**支持 Vite DevTools 的自定义 Services Inspector Tab**。

### 方式二：手动调用（向后兼容）

```ts
import { setupDevtools } from '@kaokei/devtools-use-vue-service'
const app = createApp(App)
setupDevtools(app)
```

### 方式三：Nuxt 项目（零配置）

只需在 `nuxt.config.ts` 的 `modules` 中添加 `@kaokei/nuxt-use-vue-service`，即可自动获得：

- API 自动导入
- 组件审查增强（container 标签 + Services 分组）

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@kaokei/nuxt-use-vue-service'],
})
```

如需禁用 DevTools 功能：

```ts
export default defineNuxtConfig({
  modules: ['@kaokei/nuxt-use-vue-service'],
  useVueService: {
    devtools: false,
  },
})
```

## Nuxt DevTools 中的已知限制

Nuxt DevTools（`@nuxt/devtools@3.2.4`）内嵌的 Vue DevTools 客户端是**精简版**（`vue-devtools-fdei7bct.js`），不支持第三方模块通过 `addCustomTab` 添加原生的自定义 Inspector Tab（Pinia 的 Tab 是 Nuxt DevTools 内部硬编码的，不是泛用 API）。

**以下功能在 Nuxt 中仍然正常工作**：

- ✅ 组件审查增强（container 标签、Services 分组）——走 `api.on.inspectComponent` 钩子
- ✅ `devtools: false` 配置项——禁用 DevTools 集成

以下功能仅在 Vite 模式可用：

- ✅ 自定义 Services Inspector Tab——Vite DevTools 是完整版

## 开发

```bash
pnpm build    # 构建（vite build）
pnpm dev      # 开发模式（vite build --watch）
```
