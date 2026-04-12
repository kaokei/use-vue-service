# 需求文档

## 简介

为 `@kaokei/use-vue-service` 库新增 `@EffectScope` 方法装饰器。该装饰器作为 `getEffectScope(this).run(() => {...})` 的语法糖，允许用户在被装饰的方法内部自由使用 Vue 的 `computed`、`watch`、`watchEffect` 等响应式 API，副作用会被自动收集到实例关联的 EffectScope 中。

与现有的 `@Computed` 装饰器不同，`@EffectScope` 装饰的方法不会在实例化时自动执行，而是由用户主动调用，体现"定义与执行分离"的设计理念。同时，`@EffectScope` 会为每个被装饰的方法创建独立的子 scope，支持按方法粒度重置副作用，而不影响 `@Computed` 等使用根 scope 的功能。

## 术语表

- **Root_Scope**：通过 `getEffectScope(obj)` 获取或创建的实例级 EffectScope，挂载在实例的 `SCOPE_KEY` 属性上，生命周期与实例同步。`@Computed` 装饰器使用此 scope。
- **Child_Scope**：在 Root_Scope 内部创建的子 EffectScope，生命周期独立于 Root_Scope，可以单独 stop 而不影响 Root_Scope 及其他 Child_Scope。`@EffectScope` 装饰器为每个被装饰的方法创建独立的 Child_Scope。
- **EffectScope_Decorator**：本需求新增的 `@EffectScope` 方法装饰器，用于将方法体包裹在 Child_Scope 的 `run()` 调用中。
- **DI_Container**：`@kaokei/di` 提供的依赖注入容器，负责实例的创建和生命周期管理。
- **Reactive_Proxy**：通过 Vue 的 `reactive()` 函数创建的响应式代理对象。实例在 DI 容器的 `onActivation` 钩子中被 `reactive()` 包裹。
- **TC39_Stage3_Decorator**：符合 TC39 Stage 3 提案的装饰器语法标准，使用 `ClassMethodDecoratorContext` 作为上下文类型。

## 需求

### 需求 1：方法装饰与副作用收集

**用户故事：** 作为开发者，我希望使用 `@EffectScope` 装饰类的方法，使得方法体内的 Vue 响应式 API（如 `computed`、`watch`、`watchEffect`）产生的副作用被自动收集到实例关联的 EffectScope 中，从而无需手动调用 `getEffectScope(this).run()`。

#### 验收标准

1. WHEN 一个被 `@EffectScope` 装饰的方法被调用时，THE EffectScope_Decorator SHALL 在该方法对应的 Child_Scope 的 `run()` 回调中执行原始方法体。
2. WHEN 方法体内使用了 `computed`、`watch` 或 `watchEffect` 等 Vue 响应式 API 时，THE EffectScope_Decorator SHALL 确保这些 API 产生的副作用被收集到该方法对应的 Child_Scope 中。
3. THE EffectScope_Decorator SHALL 仅装饰类的方法（`context.kind === 'method'`），不适用于 getter、setter、field 或 accessor。

### 需求 2：定义与执行分离

**用户故事：** 作为开发者，我希望 `@EffectScope` 装饰的方法不会在实例化时自动执行，而是由我主动调用，以便精确控制副作用的创建时机。

#### 验收标准

1. WHEN 一个类的实例被创建时，THE EffectScope_Decorator SHALL 不自动执行被装饰的方法。
2. WHEN 用户主动调用被装饰的方法时，THE EffectScope_Decorator SHALL 在该调用时刻执行方法体并收集副作用。

### 需求 3：多次调用的累加语义

**用户故事：** 作为开发者，我希望多次调用同一个被 `@EffectScope` 装饰的方法时，每次调用产生的副作用是累加的，不会清理之前调用产生的副作用。

#### 验收标准

1. WHEN 同一个被 `@EffectScope` 装饰的方法被多次调用时，THE EffectScope_Decorator SHALL 保留之前调用产生的所有副作用，新调用产生的副作用累加到同一个 Child_Scope 中。
2. WHEN 同一个被 `@EffectScope` 装饰的方法被多次调用时，THE EffectScope_Decorator SHALL 不在新调用前停止或清理之前调用产生的副作用。

### 需求 4：返回 Child_Scope 并限制方法返回值

**用户故事：** 作为开发者，我希望调用被 `@EffectScope` 装饰的方法时直接返回该方法对应的 Child_Scope 实例，以便我可以通过 `scope.stop()` 快速重置该方法产生的副作用。同时，由于 `@EffectScope` 内部主要使用 `watch`/`watchEffect`（computed 应使用 `@Computed` 装饰器），方法本身不需要返回值。

#### 验收标准

1. WHEN 被 `@EffectScope` 装饰的方法被调用时，THE EffectScope_Decorator SHALL 返回该方法对应的 Child_Scope 实例（Vue 的 `EffectScope` 对象）。
2. THE EffectScope_Decorator SHALL 通过 TypeScript 类型约束，限制被装饰的方法返回类型为 `void`，在编译期阻止用户在方法体内返回值。
3. WHEN 用户尝试装饰一个返回类型不为 `void` 的方法时，THE TypeScript 编译器 SHALL 报告类型错误。

### 需求 5：子 scope 重置能力

**用户故事：** 作为开发者，我希望能够重置某个 `@EffectScope` 方法产生的所有副作用，而不影响 `@Computed` 等其他装饰器产生的副作用，也不影响其他 `@EffectScope` 方法产生的副作用。

#### 验收标准

1. THE EffectScope_Decorator SHALL 为每个被装饰的方法创建一个独立的 Child_Scope，该 Child_Scope 是 Root_Scope 的子 scope。
2. WHEN 用户对方法调用返回的 Child_Scope 调用 `stop()` 时，THE EffectScope_Decorator SHALL 仅清理该方法产生的副作用，Root_Scope 和其他 Child_Scope 不受影响。
3. WHEN 某个方法的 Child_Scope 被 `stop()` 后，用户再次调用该方法时，THE EffectScope_Decorator SHALL 创建一个新的 Child_Scope 并在其中执行方法体，恢复副作用收集能力，并返回新的 Child_Scope。

### 需求 6：装饰器调用风格兼容

**用户故事：** 作为开发者，我希望 `@EffectScope` 装饰器同时支持 `@EffectScope` 和 `@EffectScope()` 两种调用风格，与现有的 `@Computed` 和 `@Raw` 装饰器保持一致。

#### 验收标准

1. WHEN 使用 `@EffectScope`（不带括号）装饰方法时，THE EffectScope_Decorator SHALL 正确装饰该方法。
2. WHEN 使用 `@EffectScope()`（带括号）装饰方法时，THE EffectScope_Decorator SHALL 正确装饰该方法。
3. THE EffectScope_Decorator SHALL 使用 TC39_Stage3_Decorator 标准，上下文类型为 `ClassMethodDecoratorContext`。

### 需求 7：与实例生命周期集成

**用户故事：** 作为开发者，我希望当实例被 DI 容器销毁时，`@EffectScope` 创建的所有 Child_Scope 也被自动清理，无需手动管理。

#### 验收标准

1. WHEN DI_Container 的 `onDeactivation` 钩子触发 `removeScope(obj)` 时，THE Root_Scope 的 `stop()` SHALL 自动停止所有 Child_Scope，清理所有 `@EffectScope` 方法产生的副作用。
2. THE EffectScope_Decorator SHALL 不需要额外的清理逻辑，依赖 Vue EffectScope 的父子关系自动级联清理。

### 需求 8：与 @Computed 装饰器的隔离

**用户故事：** 作为开发者，我希望 `@EffectScope` 的子 scope 重置操作不会影响 `@Computed` 装饰器创建的 computed 属性。

#### 验收标准

1. THE Computed 装饰器 SHALL 继续使用 Root_Scope 创建 computed 属性，不受 EffectScope_Decorator 的影响。
2. WHEN 某个 `@EffectScope` 方法的 Child_Scope 被 `stop()` 时，THE Computed 装饰器创建的 computed 属性 SHALL 继续正常工作。

### 需求 9：公共 API 导出

**用户故事：** 作为开发者，我希望 `@EffectScope` 装饰器从库的入口文件导出，方便引入使用。同时，`getEffectScope` 函数不再需要从入口文件导出，因为 `@EffectScope` 装饰器已经提供了更好的替代方案。

#### 验收标准

1. THE 库的入口文件（`index.ts`） SHALL 导出 `EffectScope` 装饰器。
2. THE 库的入口文件（`index.ts`） SHALL 不再导出 `getEffectScope` 函数。
3. THE `getEffectScope` 函数 SHALL 保留在 `scope.ts` 模块中供内部使用（如 `@Computed` 装饰器），但不作为公共 API 导出。
