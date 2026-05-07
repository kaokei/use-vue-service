# @kaokei/devtools-use-vue-service

Vue DevTools 插件，为 `@kaokei/use-vue-service` 提供调试面板。

## 功能

1. **组件审查增强**：在 DevTools Components 面板中，为声明了容器的组件添加 `container` 标签，并在右侧面板展示 `Services` 分组（含服务实例响应式状态）。
2. **自定义 Services 面板**：展示全局容器树（Root Container → App Container → Component Container）以及每个容器的绑定详情。

## 架构

```
devtools/src/
├── index.ts              # 主入口，setupDevtools() 注册 Inspector 和组件钩子
├── vite-plugin.ts        # Vite 插件，零侵入自动注册方案
├── nuxt-plugin.ts        # Nuxt DevTools 集成辅助（postMessage 桥接 + Inspector ID）
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
| `./nuxt` | `dist/nuxt-plugin.js` | `initNuxtDevtoolsBridge()` + `INSPECTOR_ID` |

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

Vite 插件通过虚拟模块注入客户端代码，利用 `__VUE_DEVTOOLS_GLOBAL_HOOK__` 或 `__VUE_DEVTOOLS_HOOK_REPLAY__` 自动在 Vue app 初始化时注册 Inspector。**支持 Vite DevTools 的自定义 Inspector Tab**。

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
- Nuxt DevTools 中的 Services 自定义 Tab

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
    devtools: false, // 禁用 DevTools 集成
  },
})
```

---

## Nuxt DevTools 实现细节

### 核心问题：自定义 Inspector Tab 不可见

Nuxt DevTools（`@nuxt/devtools@3.2.4`）内嵌的 Vue DevTools 客户端是**精简版**（`vue-devtools-fdei7bct.js`，约 782KB）。

经过对 `@vue/devtools-kit@8.1.1` 源码的深入分析（2026-05-07），该精简版**不包含**以下自定义 Inspector API：

| API | 作用 | Nuxt 状态下 |
|-----|------|------------|
| `getCustomInspector()` | 拉取自定义 Inspector 列表 | 不存在 |
| `INSPECTOR_UPDATED` 事件 | 监听 Inspector 更新事件 | 不支持 |
| `initDevToolsServerListener()` | 桥接服务端消息钩子到 RPC | 未调用 |
| `toggleClientConnected()` | 标记客户端连接状态 | 未调用 |

**结论**：通过 `@vue/devtools-api` 的 `api.addInspector()` 注册的自定义 Inspector Tab **不会被 Nuxt DevTools 识别**。以下功能不受影响：

- ✅ 组件审查增强（container 标签、Services 分组）——走 `api.on.inspectComponent` 钩子，不经过 Inspector 列表
- ✅ Vite 模式下的自定义 Services 面板——Vite DevTools 是完整版，包含全量 API

### 解决方案：addCustomTab + addServerHandler + postMessage

改用 `@nuxt/devtools-kit` 的 `addCustomTab` API，在 Nuxt DevTools 主界面注册自定义 Tab，通过 iframe 内嵌面板 + postMessage 桥接实现数据通信。

### addCustomTab 与 addServerHandler 的区别和配合

这两个 API 分别负责 UI 注册和内容服务，二者共同构成完整的自定义 Tab：

#### `addCustomTab(options)` — 注册 Tab 入口

来自 `@nuxt/devtools-kit`，在 Nuxt DevTools 主界面的左侧导航栏中添加一个 Tab 入口。

```ts
addCustomTab({
  name: 'use-vue-service',           // Tab 唯一标识
  title: 'Services',                  // 显示标题
  icon: 'i-carbon-container-services', // Iconify 图标
  view: {
    type: 'iframe',                   // 视图类型：iframe 内嵌
    src: '/__nuxt_devtools__/use-vue-service/panel', // iframe 加载的 URL
    persistent: false,                // 切出 Tab 时卸载 iframe（每次进入重新加载）
  },
})
```

主要参数说明：

| 参数 | 说明 |
|------|------|
| `name` | Tab 唯一标识，用于路由 `/modules/use-vue-service` |
| `title` | Tab 标题，显示在左侧导航栏 |
| `icon` | Iconify 图标名（如 `i-carbon-xxx`、`i-mdi-xxx`） |
| `view.type` | 视图类型：`'iframe'`（内嵌网页）、`'vnode'`（Vue VNode）、`'launch'`（启动操作） |
| `view.src` | 若 type 为 iframe，指定加载的 URL |
| `view.persistent` | 切出 Tab 时是否保持 iframe 实例。`false` 时每次进入 Tab 都会重新加载 |
| `category` | Tab 分类：`'app'`、`'server'`、`'analyze'`、`'advanced'` 等 |
| `requireAuth` | 是否需要本地认证才能访问（敏感 Tab 推荐启用） |

#### `addServerHandler(handler)` — 服务端路由

来自 `@nuxt/kit`，为 Nuxt 的 Nitro 服务器添加 HTTP 路由。此处用于**提供 iframe 面板的 HTML 页面**。

```ts
addServerHandler({
  route: '/__nuxt_devtools__/use-vue-service/panel', // 路由路径
  handler: resolve(runtimeDir, 'panel-handler'),       // 处理函数文件
})
```

路由约定：自定义 DevTools Tab 的面板路由一般放在 `/__nuxt_devtools__/` 路径下，这是 Nuxt DevTools 为模块预留的命名空间。

#### 配合关系

```
用户点击 Tab → addCustomTab                           addServerHandler
                (告诉 DevTools 有                     (提供 iframe
                 一个 Tab 存在，                       加载的 HTML
                 并指定 src URL)                       页面内容)
                          │                                │
                          └──────────┬─────────────────────┘
                                     │
                                     ▼
              Nuxt DevTools iframe 加载
              /__nuxt_devtools__/use-vue-service/panel
                          │
                          │ postMessage 通信
                          ▼
              App 页面 (initNuxtDevtoolsBridge)
              提供容器树 + 绑定状态数据
```

1. **`addCustomTab`** 向 DevTools UI 注册 Tab 入口，指定点击后打开哪个 iframe（`src`）。
2. **`addServerHandler`** 为 `src` URL 提供实际的 HTML 页面内容（包含 Vue + 渲染逻辑）。
3. iframe 内的 Vue 应用通过 **`postMessage`** 与主 App 页面的 `initNuxtDevtoolsBridge()` 通信，获取容器数据。

> **为什么用 postMessage 而非 extendServerRpc？**
>
> `extendServerRpc` 注册的函数运行在 Nuxt **服务端**（dev server 进程），而容器数据存在于**客户端**（浏览器内存）。RPC 调用会经过 WebSocket → dev server → 响应，无法直接访问浏览器中的容器实例。postMessage 直接在同一个浏览器进程的两个 frame 之间通信，无需服务端中转。

### 完整数据流

```
┌──────────────────────────────────────────────────────────────────┐
│                       浏览器进程                                  │
│                                                                  │
│  ┌──────────────────────┐          ┌───────────────────────────┐ │
│  │ Nuxt DevTools iframe │ postMsg  │       App 页面 (主窗口)     │ │
│  │                      │ ←──────→ │                           │ │
│  │ ┌────────────────┐   │          │ setupDevtools(vueApp)      │ │
│  │ │ Services Tab   │   │          │   → 收集容器树 + 绑定信息   │ │
│  │ │                │   │          │                           │ │
│  │ │ iframe 加载     │   │          │ initNuxtDevtoolsBridge()   │ │
│  │ │ panel-handler  │   │          │   → 监听 postMessage       │ │
│  │ │ 返回的 HTML     │   │          │   → 响应容器数据查询        │ │
│  │ │                │   │          │                           │ │
│  │ │ Vue 3 (CDN)    │   │          │ getInspectorTree()         │ │
│  │ │ 渲染容器树       │   │          │ getInspectorState(nodeId)  │ │
│  │ └────────────────┘   │          └───────────────────────────┘ │
│  └──────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────┘
```

### Tab 视图技术选型对比

| 方案 | 优点 | 缺点 | 采用 |
|------|------|------|------|
| `vnode` 视图 | 可直接用 Vue 组件；无需服务端路由 | 组件需静态可序列化；不支持异步 imports；无法使用复杂响应式 | ❌ |
| `iframe` 视图 | 完整独立页面；可用 CDN 加载 Vue；完全的响应式支持 | 需要 `addServerHandler` 提供 HTML；数据通信需 postMessage | ✅ |
| `launch` 视图 | 可启动外部工具/URL | 不适合数据展示场景 | ❌ |

### Nuxt 模块自动注入流程

用户配置 `nuxt.config.ts` → `modules: ['@kaokei/nuxt-use-vue-service']` 后，模块自动完成：

1. **`addImports`** — 所有 use-vue-service API 自动导入
2. **`addCustomTab`** — 注册 Services Tab 到 Nuxt DevTools
3. **`addServerHandler`** — 注册 `/__nuxt_devtools__/use-vue-service/panel` 路由
4. **`addPlugin`** — 自动注入客户端插件（`devtools-client.ts`），该插件：
   - 调用 `setupDevtools(nuxtApp.vueApp)` → 启用组件审查增强
   - 调用 `initNuxtDevtoolsBridge()` → 建立 postMessage 桥接

用户无需手动创建任何插件文件，零配置即可使用。

## 开发

```bash
pnpm build    # 构建（vite build，3 个入口：index、vite-plugin、nuxt-plugin）
pnpm dev      # 开发模式（vite build --watch）
```
