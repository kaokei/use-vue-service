# 需求文档：@Computed 装饰器重新设计

## 简介

从零开始重新设计 `@Computed` 装饰器，提供两种实现方案并进行对比。`@Computed` 装饰器用于将类的 getter 属性转换为 Vue `computed` 响应式计算属性，在 `@kaokei/use-vue-service` 依赖注入（DI）系统中使用。两种方案需同时保留代码实现，最终选择其中一种。

## 术语表

- **Computed_Decorator**：`@Computed()` 装饰器，基于 TC39 Stage 3 装饰器语法，用于将类的 getter 属性转换为 Vue computed 响应式计算属性
- **ComputedRef**：Vue 的 `computed()` 函数返回的响应式引用对象，通过 `.value` 访问其内部值
- **Reactive_Proxy**：Vue 的 `reactive()` 函数返回的响应式代理对象，能自动追踪属性的读写操作，并对嵌套的 Ref 对象进行自动解包
- **EffectScope**：Vue 的副作用作用域，用于统一收集和清理 `computed`、`watch` 等响应式副作用
- **DI_Container**：`@kaokei/di` 提供的依赖注入容器，通过 `onActivation` 钩子将服务实例转换为 Reactive_Proxy
- **Getter_Decorator**：TC39 Stage 3 装饰器规范中针对类 getter 属性的装饰器，接收原始 getter 函数和 `ClassGetterDecoratorContext` 上下文
- **Auto_Unwrap**：Vue reactive 系统的自动解包机制，在 Reactive_Proxy 上访问 Ref/ComputedRef 类型的属性时，自动返回其 `.value` 值而非 Ref 对象本身
- **Plan_A**：方案一，在 getter 中直接替换为同名属性（ComputedRef 对象），利用 Reactive_Proxy 的 Auto_Unwrap 机制。包含两种实现策略：Plan_A_Lazy（懒创建）和 Plan_A_Eager（提前创建）
- **Plan_A_Lazy**：方案一的懒创建策略，在首次访问 getter 时才创建同名的 ComputedRef 数据属性替代 getter
- **Plan_A_Eager**：方案一的提前创建策略，在装饰器执行阶段（如 `context.addInitializer` 回调中）就预先创建同名的 ComputedRef 数据属性
- **Plan_B**：方案二，在 getter 函数中返回新的 getter 函数，新 getter 函数内部创建并缓存 ComputedRef 对象

## 需求

### 需求 1：方案一 — getter 中直接替换为同名属性

**用户故事：** 作为开发者，我希望 Computed_Decorator 在 getter 中直接替换为同名的 ComputedRef 属性，以便后续访问直接读取该属性而非调用 getter 函数，从而获得最简洁的实现。方案一包含两种实现策略（懒创建与提前创建），需要分别实现并对比效果。

#### 两种实现策略说明

- **策略 1 — 懒创建（Plan_A_Lazy）**：在首次访问 getter 时，才在实例对象上创建同名的 ComputedRef 数据属性替代 getter。即 ComputedRef 的创建时机是"首次读取属性时"。
- **策略 2 — 提前创建（Plan_A_Eager）**：在装饰器执行阶段（如通过 `context.addInitializer` 回调），就预先在实例对象上创建同名的 ComputedRef 数据属性。即 ComputedRef 的创建时机是"实例初始化时"，无需等待首次访问。

两种策略的核心区别在于 ComputedRef 的创建时机不同，可能在性能、初始化开销、与 Reactive_Proxy 的交互行为等方面存在差异。需要分别实现两种策略，对比后选择更优方案。

#### 验收标准

##### 共同验收标准（两种策略均需满足）

1. THE Plan_A SHALL 在实例对象上创建一个与 getter 同名的 ComputedRef 数据属性，替代原始 getter 的访问路径
2. WHEN 在 Reactive_Proxy 上访问该属性时，THE Plan_A SHALL 直接返回已创建的 ComputedRef 数据属性的值，不再调用原始 getter 函数
3. WHEN 创建 ComputedRef 时，THE Plan_A SHALL 在实例对象关联的 EffectScope.run 回调函数中调用 Vue 的 `computed()` 函数
4. WHEN 在 Reactive_Proxy 上访问该 ComputedRef 属性时，THE Reactive_Proxy SHALL 通过 Auto_Unwrap 机制自动返回 ComputedRef 的内部值，用户无需通过 `.value` 获取数据
5. THE Plan_A SHALL 仅处理 getter 属性的装饰器能力，不处理 setter 属性和 accessor 属性的装饰器能力

##### 策略 1 特有验收标准（Plan_A_Lazy — 懒创建）

6. WHEN 在 Reactive_Proxy 上首次访问被 Computed_Decorator 装饰的 getter 属性时，THE Plan_A_Lazy SHALL 在该时刻创建同名的 ComputedRef 数据属性
7. WHEN 实例对象创建完成但尚未访问被装饰的 getter 属性时，THE Plan_A_Lazy SHALL 不创建任何 ComputedRef 对象，避免不必要的初始化开销

##### 策略 2 特有验收标准（Plan_A_Eager — 提前创建）

8. WHEN 装饰器的 `addInitializer` 回调被执行时，THE Plan_A_Eager SHALL 在该阶段为实例对象创建同名的 ComputedRef 数据属性
9. WHEN 在 Reactive_Proxy 上首次访问被装饰的 getter 属性时，THE Plan_A_Eager SHALL 直接返回已预先创建的 ComputedRef 数据属性的值，无需额外的初始化逻辑

##### 策略对比验收标准

10. THE 项目 SHALL 同时保留 Plan_A_Lazy 和 Plan_A_Eager 的完整代码实现，分别存放在独立的文件中
11. THE 项目 SHALL 为 Plan_A_Lazy 和 Plan_A_Eager 分别提供独立的测试用例
12. THE 项目 SHALL 在对比文档中记录两种策略在以下方面的差异：初始化开销、首次访问性能、与 Reactive_Proxy 的交互行为、实现复杂度

### 需求 2：方案二 — getter 函数中返回新的 getter 函数

**用户故事：** 作为开发者，我希望 Computed_Decorator 返回一个新的 getter 函数来替换原始 getter，新 getter 内部创建并缓存 ComputedRef 对象，以便在保持 getter 语义的同时实现计算属性的缓存。

#### 验收标准

1. WHEN Computed_Decorator 应用于 getter 属性时，THE Plan_B SHALL 返回一个新的 getter 函数替换原始 getter 函数
2. WHEN 新的 getter 函数被首次调用时，THE Plan_B SHALL 创建一个 ComputedRef 对象并将其缓存到实例上
3. WHEN 新的 getter 函数被后续调用时，THE Plan_B SHALL 返回已缓存的 ComputedRef 对象的值，避免每次访问都生成新的 ComputedRef 对象
4. WHEN 创建 ComputedRef 时，THE Plan_B SHALL 在实例对象关联的 EffectScope.run 回调函数中调用 Vue 的 `computed()` 函数
5. THE Plan_B SHALL 仅处理 getter 属性的装饰器能力，不处理 setter 属性和 accessor 属性的装饰器能力

### 需求 3：响应式能力

**用户故事：** 作为开发者，我希望被 Computed_Decorator 装饰的 getter 属性具备完整的 Vue 响应式能力，以便在组件中能实时响应数据变更。

#### 验收标准

1. WHEN getter 函数的依赖属性值发生变化时，THE Computed_Decorator SHALL 使对应的 ComputedRef 自动重新计算，返回最新的计算结果
2. WHEN 在 Vue 组件模板或 `watchEffect` 中访问被装饰的 getter 属性时，THE Computed_Decorator SHALL 建立正确的响应式依赖追踪，使组件能实时响应 getter 属性的变更
3. WHEN 多个被 Computed_Decorator 装饰的 getter 属性共享同一个依赖属性时，THE Computed_Decorator SHALL 使每个 getter 属性独立维护各自的 ComputedRef 缓存，互不干扰

### 需求 4：DI 系统下的自动解包

**用户故事：** 作为开发者，我希望在 DI 系统下（实例对象已经是 Reactive_Proxy 的场景），无论在组件内还是类内部通过 `this` 访问 getter 属性，都能自动解包，无需通过 `.value` 获取数据。

#### 验收标准

1. WHEN 在 Vue 组件中通过 DI_Container 获取的服务实例上访问被装饰的 getter 属性时，THE Computed_Decorator SHALL 返回自动解包后的值，用户无需使用 `.value`
2. WHEN 在类的内部方法中通过 `this` 访问被装饰的 getter 属性时（`this` 已经是 Reactive_Proxy），THE Computed_Decorator SHALL 返回自动解包后的值，用户无需使用 `.value`
3. WHEN Plan_A 的 ComputedRef 属性的类型被 TypeScript 编辑器推断时，THE Plan_A SHALL 显示为自动解包后的类型（非 ComputedRef 类型），此行为符合预期

### 需求 5：EffectScope 副作用管理

**用户故事：** 作为开发者，我希望 Computed_Decorator 创建的所有 computed 副作用都被 EffectScope 统一管理，以便在服务实例销毁时自动清理，避免内存泄漏。

#### 验收标准

1. WHEN Computed_Decorator 调用 Vue 的 `computed()` 函数时，THE Computed_Decorator SHALL 在实例对象关联的 EffectScope.run 回调函数中执行该调用
2. WHEN 实例对象尚未关联 EffectScope 时，THE Computed_Decorator SHALL 通过 `getEffectScope` 函数自动创建一个新的 EffectScope 并关联到实例对象
3. WHEN DI_Container 销毁服务实例时（触发 `onDeactivation` 钩子），THE EffectScope SHALL 被停止（调用 `scope.stop()`），自动清理所有关联的 computed 副作用

### 需求 6：多实例隔离

**用户故事：** 作为开发者，我希望同一个类的不同实例之间的 computed 缓存完全独立，以便每个实例的计算属性互不干扰。

#### 验收标准

1. WHEN 同一个类创建多个实例时，THE Computed_Decorator SHALL 为每个实例独立创建和维护各自的 ComputedRef 缓存
2. WHEN 修改某个实例的依赖属性时，THE Computed_Decorator SHALL 仅触发该实例对应的 ComputedRef 重新计算，不影响其他实例的 ComputedRef

### 需求 7：TypeScript 类型安全

**用户故事：** 作为开发者，我希望 Computed_Decorator 具备正确的 TypeScript 类型签名，以便在使用装饰器时获得编辑器的类型检查和自动补全支持。

#### 验收标准

1. THE Computed_Decorator SHALL 提供符合 TC39 Stage 3 装饰器规范的 TypeScript 类型签名，使 `@Computed()` 应用于 getter 属性时不产生类型错误
2. WHEN Computed_Decorator 应用于非 getter 属性（如普通方法或普通属性）时，THE TypeScript 编译器 SHALL 报告类型错误

### 需求 8：两种方案的对比与共存

**用户故事：** 作为开发者，我希望两种方案的代码实现同时保留在项目中，并附有清晰的优缺点对比文档，以便最终选择最合适的方案。

#### 验收标准

1. THE 项目 SHALL 同时保留 Plan_A 和 Plan_B 的完整代码实现，分别存放在独立的文件中
2. THE 项目 SHALL 为 Plan_A 和 Plan_B 分别提供独立的测试用例，覆盖所有共同需求的验收标准
3. THE 项目 SHALL 提供一份对比文档，列出 Plan_A 和 Plan_B 各自的优点和缺点，包括但不限于：实现复杂度、运行时性能、内存占用、类型推断表现、与 Vue reactive 系统的兼容性

### 需求 9：非 reactive 场景下的行为（研究性需求）

> **⚠️ 研究性需求声明：** 本需求为研究性需求，仅用于探索和记录非 reactive 场景下的行为表现。本库在实际使用中不会在非 reactive 场景下运行（DI_Container 始终通过 `onActivation` 钩子将服务实例转换为 Reactive_Proxy）。因此，本需求的研究结论仅供参考，不影响 @Computed 装饰器的最终实现方案选择。

**用户故事：** 作为开发者，我希望通过研究了解在实例对象未被 `reactive()` 包装的场景下，Computed_Decorator 的行为表现，以便完善技术文档，但该研究结论不作为实现方案的选择依据。

#### 验收标准

1. WHEN 在非 Reactive_Proxy 的实例对象上访问被 Computed_Decorator 装饰的 getter 属性时，THE Computed_Decorator SHALL 具有明确定义的行为（缓存但不响应式更新，或者内部自动获取 reactive 引用）
2. THE 两种方案 SHALL 在各自的测试用例中明确记录非 reactive 场景下的行为差异
3. THE 研究结论 SHALL 记录在对比文档中，并明确标注为"研究性结论，不影响实现方案选择"

### 需求 10：继承场景下的行为

**用户故事：** 作为开发者，我希望当子类继承父类中被 Computed_Decorator 装饰的 getter 属性时，装饰器的行为是正确且可预测的。

#### 验收标准

1. WHEN 子类继承父类中被 Computed_Decorator 装饰的 getter 属性且未覆盖该 getter 时，THE Computed_Decorator SHALL 在子类实例上正确创建独立的 ComputedRef 缓存
2. WHEN 子类覆盖父类中被 Computed_Decorator 装饰的 getter 属性时，THE Computed_Decorator SHALL 使用子类的 getter 实现创建 ComputedRef，不受父类实现的影响
