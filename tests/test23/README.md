## 测试场景-computed 自动解包行为研究

### 测试目的

研究 Vue 的 `computed` 在不同场景下是否会被自动解包（unwrap），以及原始对象与 `reactive` 对象之间的行为差异。为后续优化 `@Computed` 装饰器提供参考依据。

### 测试维度

1. 外部访问 vs 类内部 `this` 访问
2. 普通对象 vs `reactive` 对象
3. `computed` 作为属性赋值（`computedX`）vs getter 返回（`getComputedX`）vs 普通 getter（`getX`）

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

#### 响应式更新行为

| 场景 | 是否响应式更新 | 原因 |
|------|--------------|------|
| 普通对象修改 `t.x` 后访问 `t.computedX` | 否 | `this.x` 非响应式依赖，computed 返回缓存旧值 |
| reactive 对象修改 `rt.x` 后访问 `rt.computedX` | 是 | reactive 代理的属性修改触发响应式更新 |
| DI 注入后 `service.increaseX()` 后访问 `service.computedX` | 否 | computedX 构造时 `this` 指向原始对象，闭包中的 `this.x` 不是响应式依赖 |
| DI 注入后 `service.increaseX()` 后访问 `service.getComputedX` | 是 | getter 调用时 `this` 是 reactive 代理，每次创建新 computed 读取最新值 |

#### 核心结论

1. `reactive` 会自动解包属性上的 `ref`/`computed`，无论是外部访问还是类内部 `this` 访问
2. 类属性中直接赋值 `computedX = computed(() => this.x)` 在 DI 场景下有陷阱：构造时 `this` 指向原始对象，`increaseX` 通过 reactive 代理调用时修改的是代理上的属性，但 `computedX` 闭包中的 `this.x` 仍然读取原始对象（非响应式），导致不更新
3. getter 中返回 `computed(() => this.x)` 虽然每次创建新实例（性能浪费），但因为 getter 调用时 `this` 已是 reactive 代理，所以能正确响应更新
