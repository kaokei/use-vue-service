# 设计文档：test19 补充测试 — FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES 全场景覆盖

## 背景

`FIND_CHILD_SERVICE` 和 `FIND_CHILDREN_SERVICES` 是框架提供的两个全局 Token，每个 DI 容器在创建时（`createContainer`）都会自动绑定这两个 Token，对应的查找函数以当前容器的子容器树为搜索范围，**不包含当前容器本身**。

现有 test19 只覆盖了 `useRootService` 这一种获取方式，缺少以下场景：

- 通过 `useAppService` 获取（App 级作用域）
- 通过 `useService` 获取（组件级作用域）
- 通过 `@Inject` 装饰器注入（Service 内部使用）
- 隔离性验证（不同容器层级各自查自己子树）
- 边界场景（无子组件、查不存在的 Token）

---

## 核心语义

```
findChildService(token)      → 从当前容器的 children 开始 DFS，返回第一个匹配实例（不含当前容器）
findChildrenServices(token)  → 从当前容器的 children 开始 DFS，返回所有匹配实例列表（不含当前容器）
```

关键约束：**查找不包含当前组件自身的容器**，仅向下遍历子孙容器。

---

## 新增文件清单

### 测试辅助文件

| 文件 | 用途 |
|---|---|
| `DemoServiceWithInject.ts` | 带 `@Inject(FIND_CHILD_SERVICE)` 和 `@Inject(FIND_CHILDREN_SERVICES)` 的 DemoService |
| `DemoCompWithInject.vue` | 使用 DemoServiceWithInject 的父组件（含 3 个 ChildComp） |
| `EmptyDemoComp.vue` | 不含任何 ChildComp 的空父组件（边界场景使用） |
| `ChildCompWithExpose.vue` | ChildComp 变体，额外 expose 出 `useService(FIND_CHILD_SERVICE)` 的结果（供组件级测试访问） |

### 测试文件

| 文件 | 描述 |
|---|---|
| `demo.app.test.ts` | App 级作用域测试 |
| `demo.comp.test.ts` | 组件级 useService 测试 |
| `demo.inject.test.ts` | @Inject 装饰器注入测试 |
| `demo.isolation.test.ts` | 容器隔离性验证测试 |

---

## 各文件详细设计

### demo.app.test.ts — App 级作用域

**使用方式**：`useAppService(FIND_CHILD_SERVICE, app)`

**测试用例**：

1. **基础查找**：App 容器中取出 `FIND_CHILD_SERVICE`，调用后返回 ChildService 实例（类型正确）
2. **批量查找**：App 容器中取出 `FIND_CHILDREN_SERVICES`，调用后返回 3 个 ChildService 实例
3. **实例一致性**：`FIND_CHILD_SERVICE` 返回的实例与 `FIND_CHILDREN_SERVICES[0]` 是同一对象（`toBe`）
4. **边界 - 空树**：mount EmptyDemoComp（无 ChildComp），`FIND_CHILD_SERVICE(ChildService)` 返回 `undefined`
5. **边界 - 空树批量**：mount EmptyDemoComp，`FIND_CHILDREN_SERVICES(ChildService)` 返回 `[]`
6. **边界 - 查不存在的 Token**：mount DemoComp，查 DemoService（未在子组件注册）返回 `undefined`

---

### demo.comp.test.ts — 组件级 useService 作用域

**使用方式**：在 DemoComp 的 setup 中调用 `useService(FIND_CHILD_SERVICE)`

> 需要修改/新增 ChildCompWithExpose.vue：在 ChildComp 内部通过 setup expose 出 `findChildService` 和 `findChildrenServices`，以便测试访问组件内的查找函数。

**测试用例**：

1. **基础查找**：DemoComp 通过 `useService(FIND_CHILD_SERVICE)` 取函数，查到 ChildService 实例（类型正确）
2. **批量查找**：DemoComp 通过 `useService(FIND_CHILDREN_SERVICES)` 取函数，返回 3 个实例
3. **与 useRootService 结果一致**：组件级取到的函数查到的实例，与 `useRootService(FIND_CHILD_SERVICE)(ChildService)` 是同一对象 — 因为 DemoComp 是 ROOT 的直接子容器，两者遍历同一棵子树
4. **不含自身**（关键边界）：ChildCompWithExpose 内部通过 `useService(FIND_CHILD_SERVICE)` 取到的函数，去查 ChildService，返回 `undefined` — ChildService 注册在当前容器，查找不含自身

---

### demo.inject.test.ts — @Inject 装饰器注入

**使用方式**：DemoServiceWithInject 类内用 `@Inject(FIND_CHILD_SERVICE)` 注入查找函数

**DemoServiceWithInject 结构**：

```ts
@Injectable()
class DemoServiceWithInject {
  @Inject(FIND_CHILD_SERVICE)
  findChild!: FindChildService;

  @Inject(FIND_CHILDREN_SERVICES)
  findChildren!: FindChildrenServices;
}
```

**测试用例**：

1. **注入类型**：`demoService.findChild` 是 Function 类型
2. **注入类型**：`demoService.findChildren` 是 Function 类型
3. **基础查找**：`demoService.findChild(ChildService)` 返回 ChildService 实例（类型正确）
4. **批量查找**：`demoService.findChildren(ChildService)` 返回 3 个 ChildService 实例
5. **实例一致性**：注入的 `findChild(ChildService)` 与 `useRootService(FIND_CHILD_SERVICE)(ChildService)` 是同一对象
6. **边界 - 查不存在**：`demoService.findChild(SomeOtherService)` 返回 `undefined`
7. **边界 - 批量查不存在**：`demoService.findChildren(SomeOtherService)` 返回 `[]`

---

### demo.isolation.test.ts — 容器隔离性验证

**核心命题**：不同容器层级的查找函数只遍历自己的子树。

**测试用例**：

1. **Root vs Component 对比**（核心）：挂载两个 DemoComp（各含 3 个 ChildComp）
   - `useRootService(FIND_CHILDREN_SERVICES)(ChildService)` → 6 个实例
   - DemoComp A 内 `useService(FIND_CHILDREN_SERVICES)(ChildService)` → 3 个实例
   - DemoComp B 内 `useService(FIND_CHILDREN_SERVICES)(ChildService)` → 3 个实例

2. **多 App 实例隔离**：mount 两个独立 App（各含 DemoComp + 3 个 ChildComp）
   - `useAppService(FIND_CHILDREN_SERVICES, appA)(ChildService)` → 3 个
   - `useAppService(FIND_CHILDREN_SERVICES, appB)(ChildService)` → 3 个
   - 两个列表无交集（实例两两不相同）

3. **卸载后数量减少**：先挂载两个 DemoComp（Root 查到 6 个），卸载其中一个后，Root 查到 3 个

4. **App 卸载后隔离**：App A unmount 后，`useRootService(FIND_CHILDREN_SERVICES)(ChildService)` 不再包含 App A 的子服务

---

## 组件结构图

```
ROOT_CONTAINER
├── DemoComp A 容器 (declareProviders([DemoService]))
│   ├── ChildComp 1 容器 (declareProviders([ChildService]))
│   ├── ChildComp 2 容器 (declareProviders([ChildService]))
│   └── ChildComp 3 容器 (declareProviders([ChildService]))
└── DemoComp B 容器 (同上)
    ├── ChildComp 4 容器
    ├── ChildComp 5 容器
    └── ChildComp 6 容器
```

- ROOT 的 `FIND_CHILDREN_SERVICES(ChildService)` → 6 个
- DemoComp A 的 `FIND_CHILDREN_SERVICES(ChildService)` → 3 个（只有 1/2/3）
- ChildComp 1 的 `FIND_CHILD_SERVICE(ChildService)` → `undefined`（不含自身）

---

## 文件依赖关系

```
demo.app.test.ts       → DemoComp.vue, EmptyDemoComp.vue, ChildService
demo.comp.test.ts      → DemoComp.vue, ChildCompWithExpose.vue, ChildService
demo.inject.test.ts    → DemoCompWithInject.vue, DemoServiceWithInject, ChildService
demo.isolation.test.ts → DemoComp.vue, DemoService, ChildService
```

每个测试文件独立组件，互不共享 mount 状态，每个 `it` 块独立 mount/unmount。
