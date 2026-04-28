# Monorepo 子包架构设计

**日期**：2026-04-28  
**状态**：已确认，待实施

---

## 背景

`@kaokei/use-vue-service` 是一个 Vue 3 依赖注入状态管理库。本次在现有 monorepo 基础上新增两个子项目：

1. **Nuxt 插件**：为 Nuxt 项目提供零配置、自动导入 API 的集成
2. **DevTools 工具**：基于 Vite 插件 + 悬浮面板的开发调试工具

---

## 目录结构

采用扁平目录方案，两个子包直接放在根目录下：

```
use-vue-service/
├── src/                          # 主库代码（@kaokei/use-vue-service，不变）
├── nuxt-plugin/                  # @kaokei/nuxt-use-vue-service
│   ├── src/
│   │   └── module.ts
│   └── package.json
├── devtools/                     # @kaokei/devtools-use-vue-service
│   ├── src/
│   │   └── index.ts
│   └── package.json
├── examples/                     # 现有示例（不变）
├── package.json                  # 主库根包（不变）
└── pnpm-workspace.yaml           # 扩展为包含 nuxt-plugin、devtools
```

`pnpm-workspace.yaml` 更新为：

```yaml
packages:
  - 'examples/*'
  - 'nuxt-plugin'
  - 'devtools'
```

---

## 子包一：nuxt-plugin

### 基本信息

- **包名**：`@kaokei/nuxt-use-vue-service`
- **目录**：`nuxt-plugin/`
- **定位**：Nuxt 模块，零配置，自动导入主库所有 API

### 用户使用方式

```bash
npm install @kaokei/nuxt-use-vue-service
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@kaokei/nuxt-use-vue-service']
})
```

安装后，以下所有 API 在 Nuxt 项目中自动可用，无需任何 `import`。

### 依赖关系

- `dependencies`：`@kaokei/di`、`@kaokei/use-vue-service`（打包进去，用户只需安装本包）
- `devDependencies`：`@nuxt/kit`、`@nuxt/schema`

### 自动导入 API 清单

所有 API 统一从 `@kaokei/use-vue-service` 导入（该包已通过 `export * from '@kaokei/di'` 重新导出 di 的所有 API）。

**值（Value imports）**：

| API | 说明 |
|-----|------|
| `useService` | 在组件中获取 Service 实例 |
| `declareProviders` | 在组件中声明 Service 容器 |
| `useRootService` | 获取根级 Service 实例 |
| `declareRootProviders` | 声明根级 Service 容器 |
| `useAppService` | 获取 App 级 Service 实例 |
| `declareAppProviders` | 声明 App 级 Service 容器 |
| `declareAppProvidersPlugin` | Vue 插件形式声明 App 容器 |
| `FIND_CHILD_SERVICE` | Token：查找子级单个 Service |
| `FIND_CHILDREN_SERVICES` | Token：查找子级所有 Service |
| `Computed` | 装饰器：声明计算属性 |
| `Raw` | 装饰器：声明非响应式属性 |
| `RunInScope` | 装饰器：在 effect scope 中运行 |
| `Token` | 创建注入 Token |
| `LazyToken` | 创建懒加载 Token |
| `Inject` | 装饰器：注入依赖 |
| `Self` | 装饰器：仅在当前容器查找 |
| `SkipSelf` | 装饰器：跳过当前容器查找 |
| `Optional` | 装饰器：可选注入 |
| `PostConstruct` | 装饰器：实例化后回调 |
| `PreDestroy` | 装饰器：销毁前回调 |
| `Injectable` | 装饰器：标记可注入类 |
| `decorate` | 函数式装饰器 |
| `LazyInject` | 装饰器：懒注入 |
| `createLazyInject` | 创建懒注入工厂 |
| `autobind` | 装饰器：自动绑定 this |
| `Container` | 容器类 |
| `Binding` | 绑定类 |

**类型（Type imports，`type: true`）**：

| 类型 | 说明 |
|------|------|
| `TokenType` | Token 类型 |
| `FindChildService` | 查找子级单个 Service 的类型 |
| `FindChildrenServices` | 查找子级所有 Service 的类型 |

### 内部实现

使用 `@nuxt/kit` 的 `defineNuxtModule` + `addImports` 实现：

```ts
// nuxt-plugin/src/module.ts
import { defineNuxtModule, addImports } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'use-vue-service',
    configKey: 'useVueService',
  },
  setup() {
    const from = '@kaokei/use-vue-service'
    addImports([
      // 值导入
      { from, name: 'useService' },
      // ...其余 API
      // 类型导入
      { from, name: 'TokenType', type: true },
      { from, name: 'FindChildService', type: true },
      { from, name: 'FindChildrenServices', type: true },
    ])
  },
})
```

### 未来扩展（2 期）

devtools 开发完成后，在此模块中增加 `ModuleOptions` 配置项，允许用户开启/关闭 devtools 面板。

---

## 子包二：devtools

### 基本信息

- **包名**：`@kaokei/devtools-use-vue-service`
- **目录**：`devtools/`
- **定位**：Vite 插件，开发时在页面注入悬浮调试面板，生产环境自动禁用

### 用户使用方式

```bash
npm install -D @kaokei/devtools-use-vue-service
```

```ts
// vite.config.ts
import devtools from '@kaokei/devtools-use-vue-service/vite'
export default defineConfig({
  plugins: [devtools()]
})
```

开发时页面右下角出现悬浮按钮，点击展开调试面板。

### 面板功能（1 期）

- **容器树**：展示所有 scope 容器的层级关系
- **组件关联**：每个容器对应哪个 Vue 组件（容器树与组件树的对应关系）
- **服务列表**：每个容器内注入了哪些 Service 实例
- **Service 状态**：展示 Service 实例内部的响应式数据当前值

### 技术方案

- Vite 插件负责在开发模式下向页面注入悬浮 UI
- 主库（`@kaokei/use-vue-service`）需暴露调试 API，供 devtools 读取容器树数据
- 悬浮面板本身用 Vue 3 开发，以 iframe 或 Shadow DOM 方式隔离样式

### 依赖关系

- `peerDependencies`：`vite`、`@kaokei/use-vue-service`

---

## pnpm-workspace.yaml 变更

```yaml
packages:
  - 'examples/*'
  - 'nuxt-plugin'
  - 'devtools'
```

---

## 实施顺序

1. 更新 `pnpm-workspace.yaml`
2. 搭建 `nuxt-plugin/` 骨架（`package.json` + `src/module.ts`）
3. 搭建 `devtools/` 骨架（`package.json` + `src/index.ts`）
4. 运行 `pnpm install` 验证 monorepo 链接正确
