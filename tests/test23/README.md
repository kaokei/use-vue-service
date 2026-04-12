## 测试场景-computed 自动解包行为研究

### 测试目的

研究 Vue 的 `computed` 在不同场景下是否会被自动解包（unwrap），以及原始对象与 `reactive` 对象之间的行为差异。为后续优化 `@Computed` 装饰器提供参考依据。

### 测试维度

1. 外部访问 vs 类内部 `this` 访问
2. 普通对象 vs `reactive` 对象
3. `computed` 作为属性赋值（`computedX`）vs getter 返回（`getComputedX`）vs 普通 getter（`getX`）
4. 组件模板是否渲染了 `computedX` 对更新行为的影响

### 关键发现

#### 自动解包行为

| 访问方式 | 普通对象 | reactive 对象 |
|---------|---------|--------------|
| 外部 `obj.computedX` | ComputedRef（不解包） | 原始值（自动解包） |
| 外部 `obj.getComputedX` | ComputedRef（不解包） | 原始值（自动解包） |
| 外部 `obj.getX` | 原始值 | 原始值 |
| 内部 `this.computedX` | ComputedRef（不解包） | 原始值（自动解包） |
| 内部 `this.getComputedX` | ComputedRef（不解包） | 原始值（自动解包） |
| 内部 `this.getX` | 原始值 | 原始值 |

#### 响应式更新行为（重要发现）

| 场景 | 是否更新 | 原因 |
|------|---------|------|
| 普通对象：修改 `t.x` 后访问 `t.computedX.value` | 否 | `this.x` 非响应式依赖，computed 返回缓存旧值 |
| reactive 对象（无组件）：`rt.increaseX()` 后访问 `rt.computedX` | 是 | computed 未被 effect 订阅，走 globalVersion 检查路径 |
| 组件模板渲染了 computedX：`service.increaseX()` 后访问 `service.computedX` | 否 | computed 被渲染 effect 订阅后，走 dep 版本号检查路径，而 dep 版本号不会递增 |
| 组件模板未渲染 computedX：`service.increaseX()` 后访问 `service.computedX` | 是 | computed 未被 effect 订阅，走 globalVersion 检查路径 |

#### 核心结论

1. `reactive` 会自动解包属性上的 `ref`/`computed`，无论是外部访问还是类内部 `this` 访问。

2. `computedX = computed(() => this.x)` 在类属性中直接赋值时，`this.x` 不是响应式依赖。但在纯 reactive 场景（无组件渲染）下，由于 computed 没有被任何 effect 订阅，Vue 会通过 `globalVersion` 检查路径来判断是否需要重新计算，因此仍然能获取到最新值。

3. 一旦组件模板渲染了 `computedX`（触发了 computed 被渲染 effect 订阅），Vue 会切换到 dep 版本号检查路径。由于 `this.x` 不是响应式依赖，dep 版本号永远不会递增，computed 认为自己是"干净的"，直接返回缓存值，导致不再更新。

4. 这个问题与 DI 框架无关，纯粹是 Vue computed 的缓存机制导致的。不使用 DI，直接 `new + reactive` 在组件中渲染 `computedX` 也会出现同样的问题。
