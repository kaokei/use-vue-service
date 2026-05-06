# DevTools 实现设计

**日期**：2026-04-29
**状态**：Phase 1-2 已实施

---

## 背景

为 `@kaokei/use-vue-service` 开发 DevTools 调试工具，帮助开发者在 Vue DevTools 中查看：
- 容器树结构（Root → App → Component 层级）
- 每个容器的绑定列表和服务实例
- 组件与容器的映射关系
- 服务实例的响应式状态

---

## 技术路线决策

### Route A vs Route B

| 维度 | Route A: `@vue/devtools-api` | Route B: 独立 Vite 插件 + 自定义 UI |
|------|------|------|
| 集成方式 | 注册 Inspector，复用 Vue DevTools 面板 | 独立 Vite 插件 + 浮动面板/iframe |
| 用户体验 | 零额外配置，原生 DevTools 体验 | 需要独立配置，单独的 UI 面板 |
| 代表产品 | Pinia, Vuex, Vue Router, VueUse, Harlem (186+ npm dependents) | TanStack Query Vue, UnoCSS Inspector, Nuxt DevTools |
| Nuxt 兼容 | 通过 `vite-plugin-vue-devtools`（Nuxt DevTools 内置）间接兼容 | 需要单独适配 |

**决策**：Route A 为主，Phase 4 额外提供 Nuxt DevTools Tab。

### Nuxt DevTools 兼容性

Nuxt DevTools 与 `@vue/devtools-api` 完全独立，但内置了 `vite-plugin-vue-devtools`，因此 Route A 的 Inspector 在 Nuxt DevTools 中自动可用。后续 Phase 4 可通过 `@nuxt/devtools-kit` 的 `addCustomTab()` 提供增强体验。

---

## 核心架构

### 数据流

```
主库 (@kaokei/use-vue-service)         DevTools (@kaokei/devtools-use-vue-service)
─────────────────────────────         ────────────────────────────────────────────
declareProviders()                     
  └→ instance.__uvs_container__ ──────→ component-hooks.ts (组件↔容器映射)
                                        inspector.ts (容器树 + 状态面板)
ROOT_CONTAINER                          
  └→ __getDevtoolsRootContainer() ────→ container-tree.ts (遍历容器树)
                                        binding-reader.ts (读取绑定)
                                        state-extractor.ts (提取服务状态)
```

### 模块职责

| 模块 | 职责 |
|------|------|
| `core/types.ts` | 类型定义（ContainerInfo, BindingInfo, ServiceStateInfo）+ Token 辅助函数 |
| `core/container-tree.ts` | 从 ROOT_CONTAINER 递归遍历，构建容器树和 ID 映射 |
| `core/binding-reader.ts` | 读取 Container._bindings，过滤内部 Token |
| `core/state-extractor.ts` | 从服务实例中提取响应式状态快照 |
| `inspector.ts` | Vue DevTools Inspector 树/状态数据适配 |
| `component-hooks.ts` | 组件 Inspect 增强：显示组件关联的容器信息 |
| `index.ts` | 插件入口，注册 Inspector + 组件钩子 |

---

## 依赖关系

```json
{
  "dependencies": {
    "@kaokei/di": "^5.0.8",
    "@kaokei/use-vue-service": "workspace:*",
    "@vue/devtools-api": "^8.1.1"
  }
}
```

- `@kaokei/di`：指定最新版本，用于访问 Container/Binding 内部属性
- `@kaokei/use-vue-service`：使用 workspace 协议，引用主库源码
- `@vue/devtools-api`：Route A 核心 API

构建时以上三者均作为 `external`，不打包进产物。

---

## 关键实现细节

### 1. 组件→容器映射（Pinia `_pStores` 模式）

**问题**：`declareProviders` 创建容器后，DevTools 无法知道哪个组件拥有哪个容器。

**方案**：在 `declareProviders` 的 else 分支（新建容器时），将容器引用写入组件实例：
```ts
const instance = getCurrentInstance() as any
if (instance) instance.__uvs_container__ = container
```

读取时在 `inspectComponent` 钩子中读取 `instance.__uvs_container__`。

这是单向映射（组件→容器），与 Pinia 的 `_pStores` 模式一致。

### 2. 容器树遍历

通过 `__getDevtoolsRootContainer()` 获取 ROOT_CONTAINER，递归调用 `getChildren()` 构建树。每个节点分配唯一 ID（如 `0`, `0-0`, `0-1`, `0-0-0`）。

### 3. 容器作用域启发式判断

```ts
function getContainerScope(container): 'root' | 'app' | 'component' {
  if (!container.parent) return 'root'
  if (!container.parent.parent) return 'app'
  return 'component'
}
```

MVP 阶段使用启发式判断，后续可通过 `__uvs_scope__` 标记精确区分。

### 4. 内部 Token 过滤

`FIND_CHILD_SERVICE` 和 `FIND_CHILDREN_SERVICES` 是库内部使用的 Token，不应展示给用户，在 `binding-reader.ts` 中过滤。

### 5. 服务状态提取

服务实例被 `reactive()` 包裹，直接提取自身可枚举属性即可。跳过 `_`/`__` 前缀的内部属性和函数方法。

---

## 实施阶段

### Phase 1: 主库改造 ✅
- [x] `declareProviders` 写入 `__uvs_container__`
- [x] 导出 `__getDevtoolsRootContainer()`
- [x] 创建 devtools 核心数据层（types, container-tree, binding-reader, state-extractor）
- [x] 主库 build 验证通过

### Phase 2: Vue DevTools Inspector MVP ✅
- [x] 创建 `inspector.ts`（Inspector 树 + 状态面板）
- [x] 创建 `component-hooks.ts`（组件→容器映射）
- [x] 重写 `index.ts` 插件入口
- [x] 更新 package.json 依赖 + vite.config.ts external
- [x] 构建验证通过
- [x] Example 20 验证运行

### Phase 3: 交互增强（待实施）
- [ ] Inspector 节点点击刷新（重新遍历容器树）
- [ ] 时间线事件（容器创建/销毁）
- [ ] 设置面板

### Phase 4: Nuxt DevTools Tab（待实施）
- [ ] 通过 `@nuxt/devtools-kit` 的 `addCustomTab()` 注册
- [ ] Example 21 验证

---

## 测试 Demo

- **Example 20** (`20-devtools-demo`)：标准 Vue + Vite 项目，使用 `vite-plugin-vue-devtools` 集成
- **Example 21** (`21-nuxt-devtools-demo`)：Nuxt 项目，Phase 4 验证用

---

## 参考

- Pinia DevTools 实现：`_pStores` 模式，单向映射（组件→store）
- `@vue/devtools-api` 文档：https://devtools.vuejs.org/plugin/plugins-guide.html
- Nuxt DevTools：独立于 `@vue/devtools-api`，使用 iframe + RPC
