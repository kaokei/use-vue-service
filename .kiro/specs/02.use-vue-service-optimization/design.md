# 设计文档

## 概述

本设计文档描述 `@kaokei/use-vue-service` 库的优化改进方案。核心变更包括：

1. 将 `@Computed` 装饰器从 Stage 1 语法迁移到 Stage 3 accessor 装饰器
2. 为 `ROOT_CONTAINER` 添加 `resetRootContainer` 重置函数，支持测试隔离
3. 将 `CONTAINER_TOKEN` 从字符串改为 Symbol，消除命名冲突风险
4. 精简 `index.ts` 的 re-export，替换通配符导出为显式命名导出
5. 新增 `@Watch` 和 `@Effect` 方法装饰器
6. 为 `declareProviders` 系列函数添加 `Provider_Config` 对象数组支持
7. 完善 API 文档

所有装饰器变更与 `@kaokei/di`（v5.0.2+）保持一致，后者已全面采用 Stage 3 装饰器 API（`ClassFieldDecoratorContext`、`ClassMethodDecoratorContext` 等）。

## 架构

### 当前架构

```mermaid
graph TD
    A[src/index.ts<br/>统一导出] --> B[src/core.ts<br/>核心 API]
    A --> C[src/computed.ts<br/>@Computed 装饰器]
    A --> D[src/scope.ts<br/>EffectScope 管理]
    A --> E[src/constants.ts<br/>Token 和默认容器]
    B --> F[src/utils.ts<br/>Container 工厂]
    B --> E
    C --> D
    F --> G[src/find-service.ts<br/>子容器查找]
    F --> E
    E --> F
```

### 变更后架构

```mermaid
graph TD
    A[src/index.ts<br/>显式命名导出] --> B[src/core.ts<br/>核心 API + Provider_Config]
    A --> C[src/computed.ts<br/>Stage 3 @Computed]
    A --> D[src/scope.ts<br/>EffectScope 管理]
    A --> E[src/constants.ts<br/>Symbol Token + 可重置容器]
    A --> H[src/watch.ts<br/>@Watch + @Effect]
    B --> F[src/utils.ts<br/>Container 工厂]
    B --> E
    C --> D
    H --> D
    F --> G[src/find-service.ts<br/>子容器查找]
    F --> E
    E --> F
```

主要架构变更：
- 新增 `src/watch.ts` 模块，包含 `@Watch` 和 `@Effect` 装饰器
- `src/constants.ts` 中 `ROOT_CONTAINER` 改为 `let` 声明，支持 `resetRootContainer` 重新赋值
- `src/index.ts` 从通配符导出改为显式命名导出

## 组件与接口

### 1. `src/computed.ts` — Stage 3 @Computed 装饰器

当前实现使用 Stage 1 签名 `(target, key, descriptor)`，需迁移到 Stage 3 accessor 装饰器。


**当前签名（Stage 1）：**
```typescript
function Computed(_: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor
```

**目标签名（Stage 3 accessor）：**
```typescript
function Computed<This, Value>(
  value: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>
): ClassAccessorDecoratorResult<This, Value>
```

**设计决策：**
- Stage 3 accessor 装饰器要求用户使用 `accessor` 关键字声明属性：`@Computed accessor fullName: string`
- `context.name` 提供属性名，用于生成缓存 Symbol
- `value.get` 和 `value.set` 是 Stage 3 accessor 的原始 get/set 方法
- `value.get.call(this)` 获取用户定义的 getter 返回值（即计算逻辑）
- 返回的 `get` 方法中：首次访问时在 EffectScope 内创建 `computed` 引用并缓存；后续访问直接返回缓存值
- 返回的 `set` 方法中：如果存在已缓存的 `computed` 引用（说明 getter 已被访问过），则写入 `computed` 的 setter；否则回退到原始 `value.set`
- 使用 `reactive(this)` 确保 `this` 指向 reactive 代理对象，与 `@kaokei/di` 的 `onActivation` 钩子兼容

### 2. `src/watch.ts` — @Watch 和 @Effect 装饰器

新增模块，提供声明式的响应式副作用装饰器。

**@Watch 装饰器：**
```typescript
function Watch<T>(
  getter: (instance: any) => T
): (value: Function, context: ClassMethodDecoratorContext) => void
```

- 高阶函数，接受一个 getter 参数（数据源函数）
- 返回 Stage 3 方法装饰器
- 通过 `context.addInitializer` 在实例初始化时注册 watch 监听器
- 在实例的 EffectScope 内调用 Vue 的 `watch()`，数据源为 `() => getter(this)`，回调为被装饰的方法

**@Effect 装饰器：**
```typescript
function Effect(value: Function, context: ClassMethodDecoratorContext): void
```

- 直接作为 Stage 3 方法装饰器使用（无参数）
- 通过 `context.addInitializer` 在实例初始化时注册 watchEffect 监听器
- 在实例的 EffectScope 内调用 Vue 的 `watchEffect()`，执行被装饰的方法

**设计决策：**
- `@Watch` 和 `@Effect` 都依赖 `getEffectScope` 获取实例的 EffectScope，确保副作用随容器销毁自动清理
- `context.addInitializer` 是 Stage 3 装饰器提供的实例初始化钩子，在 `new` 操作完成后执行
- 由于 `@kaokei/di` 的 `onActivation` 钩子会将实例转为 `reactive` 对象，`addInitializer` 中的 `this` 是原始对象。需要使用 `reactive(this)` 获取 reactive 代理

### 3. `src/constants.ts` — Token 和可重置容器

**CONTAINER_TOKEN 变更：**
```typescript
// 之前
export const CONTAINER_TOKEN = 'USE_VUE_SERVICE_CONTAINER_TOKEN';

// 之后
export const CONTAINER_TOKEN: InjectionKey<Container> = Symbol('USE_VUE_SERVICE_CONTAINER_TOKEN');
```

**ROOT_CONTAINER 可重置支持：**
```typescript
// 之前
export const ROOT_CONTAINER = createContainer();

// 之后
export let ROOT_CONTAINER = createContainer();

export function resetRootContainer(): void {
  ROOT_CONTAINER.destroy();
  ROOT_CONTAINER = createContainer();
}
```

**设计决策：**
- `CONTAINER_TOKEN` 使用 `Symbol()` 而非 `Symbol.for()`，确保全局唯一性
- 类型声明为 `InjectionKey<Container>` 以获得 Vue `provide/inject` 的类型推导
- `resetRootContainer` 先调用 `destroy()` 清理旧容器的所有绑定和子容器，再创建新容器
- `ROOT_CONTAINER` 改为 `let` 声明以支持重新赋值

### 4. `src/interface.ts` — Provider_Config 类型

新增服务替换配置类型：

```typescript
import type { CommonToken, Newable } from '@kaokei/di';

export interface ProviderConfig<T = any> {
  provide: CommonToken<T>;
  useClass: Newable<T>;
}

export type Provider = NewableProvider | FunctionProvider | ProviderConfig[];
```

**设计决策：**
- `ProviderConfig` 使用泛型 `T` 确保 `provide` 和 `useClass` 的类型一致性
- 扩展现有 `Provider` 联合类型，添加 `ProviderConfig[]` 分支
- `src/core.ts` 中的 `bindProviders` 函数需要增加对 `ProviderConfig[]` 的处理分支

### 5. `src/core.ts` — bindProviders 扩展

```typescript
function bindProviders(container: Container, providers: Provider) {
  if (typeof providers === 'function') {
    providers(container);
  } else if (Array.isArray(providers) && providers.length > 0 && 'provide' in providers[0]) {
    // ProviderConfig[] 分支
    for (const config of providers as ProviderConfig[]) {
      container.bind(config.provide).to(config.useClass);
    }
  } else {
    // NewableProvider 分支
    for (let i = 0; i < (providers as NewableProvider).length; i++) {
      container.bind((providers as NewableProvider)[i]).toSelf();
    }
  }
}
```

### 6. `src/index.ts` — 显式命名导出

将 `export * from '@kaokei/di'` 替换为按需导出：

```typescript
// 核心类和工具
export { Container, Token, LazyToken, Binding } from '@kaokei/di';
export { Injectable, Inject, Self, SkipSelf, Optional, PostConstruct, PreDestroy } from '@kaokei/di';
export { decorate, LazyInject, createLazyInject, autobind } from '@kaokei/di';

// 类型定义
export type { CommonToken, Newable, TokenType, GenericToken, Context, Options } from '@kaokei/di';

// 错误类
export { BaseError, BindingNotFoundError, BindingNotValidError } from '@kaokei/di';
export { CircularDependencyError, DuplicateBindingError, PostConstructError, ContainerNotFoundError } from '@kaokei/di';
```


## 数据模型

### 核心类型变更

```typescript
// src/interface.ts — 新增 ProviderConfig
export interface ProviderConfig<T = any> {
  provide: CommonToken<T>;
  useClass: Newable<T>;
}

// Provider 联合类型扩展
export type NewableProvider = Newable[];
export type FunctionProvider = (container: Container) => void;
export type Provider = NewableProvider | FunctionProvider | ProviderConfig[];
```

### CONTAINER_TOKEN 类型变更

```typescript
// src/constants.ts
import type { InjectionKey } from 'vue';
import type { Container } from '@kaokei/di';

// 从 string 变为 InjectionKey<Container>（即 Symbol）
export const CONTAINER_TOKEN: InjectionKey<Container> = Symbol('USE_VUE_SERVICE_CONTAINER_TOKEN');
```

### @Computed 内部缓存结构

Stage 3 accessor 装饰器中，每个实例的 computed 引用缓存使用 Symbol 作为 key：

```typescript
// 缓存 key：Symbol(属性名)
const sym = Symbol.for(String(context.name));

// 缓存值结构（使用 markRaw 避免被 reactive 代理）
interface ComputedCache {
  value: ComputedRef<T>;
}
```

### @Watch/@Effect 无额外数据模型

这两个装饰器不引入新的数据结构，仅在实例的 EffectScope 内注册 Vue 的 `watch`/`watchEffect` 副作用。


## 正确性属性

*属性（Property）是指在系统所有有效执行中都应成立的特征或行为——本质上是对系统应做什么的形式化陈述。属性是人类可读规范与机器可验证正确性保证之间的桥梁。*

### 属性 1：Computed getter 幂等性

*对于任意*服务实例和任意 getter 返回值，多次访问 `@Computed accessor` 属性的 getter 应始终返回相同的计算结果，且底层 `computed` 引用只创建一次（首次访问时在 EffectScope 内创建并缓存，后续访问复用缓存）。

**验证需求：1.3, 1.4, 1.7**

### 属性 2：Computed set-then-get 一致性

*对于任意*可写的 `@Computed accessor` 属性和任意赋值，通过 setter 写入一个值后，立即通过 getter 读取应返回该值（即 `computed` 的 writable 语义保持一致）。

**验证需求：1.5**

### 属性 3：resetRootContainer 隔离性

*对于任意*数量的通过 `declareRootProviders` 注册的服务，调用 `resetRootContainer` 后，`ROOT_CONTAINER` 应是一个全新的容器实例，且请求之前注册的任何服务都应抛出 `BindingNotFoundError`。

**验证需求：2.1, 2.2, 2.5**

### 属性 4：Watch 回调正确性

*对于任意*响应式数据源值变化，`@Watch` 装饰的方法应被调用，且接收到的新值和旧值应与数据源的实际变化一致。

**验证需求：5.2, 5.4**

### 属性 5：Effect 副作用执行

*对于任意*服务实例，`@Effect` 装饰的方法应在实例初始化后自动执行一次，且当方法内访问的响应式依赖变化时应重新执行。

**验证需求：5.6**

### 属性 6：ProviderConfig 绑定正确性

*对于任意* `{ provide: TokenA, useClass: ClassB }` 配置，通过 `declareProviders` 注册后，`container.get(TokenA)` 应返回 `ClassB` 的实例。

**验证需求：6.1, 6.2**

## 错误处理

### 容器相关错误

| 场景 | 错误类型 | 处理方式 |
|------|---------|---------|
| 在 setup 外调用 `getProvideContainer` | `Error` | 抛出 "getProvideContainer 只能在 setup 中使用" |
| `resetRootContainer` 后请求已注销的服务 | `BindingNotFoundError` | 由 `@kaokei/di` 容器抛出 |
| `ProviderConfig` 中 `useClass` 无法实例化 | `BindingNotValidError` | 由 `@kaokei/di` 容器抛出 |

### 装饰器相关错误

| 场景 | 错误类型 | 处理方式 |
|------|---------|---------|
| `@Computed` 用于非 accessor 属性 | TypeScript 编译错误 | Stage 3 类型系统在编译时阻止 |
| `@Watch`/`@Effect` 用于非方法成员 | TypeScript 编译错误 | `ClassMethodDecoratorContext` 类型约束 |
| `@Watch` 的 getter 函数抛出异常 | Vue 运行时警告 | Vue 的 `watch` 内部处理 |

### EffectScope 相关

- 当容器 `destroy()` 时，`onDeactivation` 钩子调用 `removeScope`，停止所有 `computed`、`watch`、`watchEffect` 副作用
- 如果实例尚未创建 EffectScope（未访问过 `@Computed` 或 `@Watch`/`@Effect`），`removeScope` 安全地跳过

## 测试策略

### 测试框架

- 单元测试：Vitest（项目已配置）
- 属性测试：fast-check（项目 devDependencies 已包含 `fast-check@^4.6.0`）
- 组件测试：`@vue/test-utils`（项目已配置）

### 双重测试方法

**单元测试**（示例驱动）：
- `@Computed` Stage 3 装饰器基本功能：getter 返回计算值、setter 写入值、无 setter 时回退
- `resetRootContainer` 基本流程：reset 后旧服务不可用、新容器有默认配置
- `CONTAINER_TOKEN` 类型验证：`typeof CONTAINER_TOKEN === 'symbol'`
- 显式导出验证：所有指定的 API 可从 `index.ts` 导入
- `@Watch`/`@Effect` 基本功能：数据变化触发回调、副作用自动执行
- `ProviderConfig` 基本功能：`{ provide, useClass }` 正确绑定

**属性测试**（通用属性验证）：
- 每个属性测试最少运行 100 次迭代
- 每个测试标注对应的设计属性引用
- 标注格式：**Feature: use-vue-service-optimization, Property {number}: {property_text}**

| 属性 | 测试描述 | 生成策略 |
|------|---------|---------|
| 属性 1 | Computed getter 幂等性 | 生成随机 getter 返回值（数字、字符串），验证多次访问结果一致 |
| 属性 2 | Computed set-then-get 一致性 | 生成随机值，验证 set 后 get 返回相同值 |
| 属性 3 | resetRootContainer 隔离性 | 生成随机数量（1-10）的服务类，注册后 reset，验证全部不可访问 |
| 属性 4 | Watch 回调正确性 | 生成随机值变化序列，验证回调参数匹配 |
| 属性 5 | Effect 副作用执行 | 生成随机响应式初始值，验证 effect 自动执行 |
| 属性 6 | ProviderConfig 绑定正确性 | 生成随机 token-class 配置对，验证 get 返回正确实例 |

### 集成测试

- Vue 组件中 `provide`/`inject` 使用 Symbol 类型 `CONTAINER_TOKEN` 的兼容性
- `declareProviders` + `useService` 端到端流程
- `declareAppProviders` + `useAppService` 端到端流程
- 容器销毁时 EffectScope 自动清理

