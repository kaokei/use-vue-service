# 需求文档

## 简介

本文档定义了 `@kaokei/use-vue-service` 库的优化改进需求。该库是基于 `@kaokei/di` 依赖注入容器的 Vue 3 状态管理方案。本次优化涵盖三个层面：装饰器语法迁移（最高优先级）、核心功能增强、文档完善。不包含 examples 示例代码和 tests 单元测试的修改。

## 术语表

- **Computed_Decorator**：`@Computed` 装饰器，用于将类的 getter 属性转换为 Vue 的 `computed` 响应式计算属性
- **Stage_1_Decorator**：TypeScript 旧版实验性装饰器语法（需开启 `experimentalDecorators`），函数签名为 `(target, key, descriptor)`
- **Stage_3_Decorator**：TC39 Stage 3 提案的标准装饰器语法，TypeScript 5.0+ 原生支持，无需额外编译器选项
- **DI_Container**：`@kaokei/di` 提供的依赖注入容器，负责服务的注册、解析和生命周期管理
- **ROOT_CONTAINER**：模块级单例容器，用于 `declareRootProviders` / `useRootService` 的全局服务注册
- **CONTAINER_TOKEN**：Vue `provide/inject` 机制中用于传递 DI_Container 实例的注入键
- **EffectScope**：Vue 的副作用作用域，用于管理 `computed`、`watch` 等响应式副作用的生命周期
- **Watch_Decorator**：`@Watch` 装饰器，用于在服务类中声明式地监听响应式属性变化并执行副作用
- **Effect_Decorator**：`@Effect` 装饰器，用于在服务类中声明式地执行响应式副作用（类似 `watchEffect`）
- **Provider_Config**：服务提供者配置，支持 `{ provide: TokenA, useClass: ClassB }` 形式的服务替换声明

## 需求

### 需求 1：@Computed 装饰器迁移到 Stage 3 语法

**用户故事：** 作为开发者，我希望 `@Computed` 装饰器使用 Stage 3 标准语法，以便在不开启 `experimentalDecorators` 的 TypeScript 5.0+ 项目中直接使用。

#### 验收标准

1. THE Computed_Decorator SHALL 使用 Stage 3 accessor 装饰器签名 `(value: ClassAccessorDecoratorTarget, context: ClassAccessorDecoratorContext)` 替代当前的 Stage_1_Decorator 签名 `(target, key, descriptor)`
2. WHEN 开发者在类中使用 `@Computed accessor propertyName` 语法声明计算属性时，THE Computed_Decorator SHALL 返回一个包含 `get` 和 `set` 方法的 `ClassAccessorDecoratorResult` 对象
3. WHEN 计算属性的 getter 被首次访问时，THE Computed_Decorator SHALL 在该服务实例的 EffectScope 内创建一个 Vue `computed` 引用，并缓存到实例上
4. WHEN 计算属性的 getter 被后续访问时，THE Computed_Decorator SHALL 直接返回已缓存的 `computed` 引用的当前值，不重复创建
5. WHEN 计算属性定义了 setter 且被赋值时，THE Computed_Decorator SHALL 将赋值操作委托给底层 `computed` 引用的 setter
6. WHEN 计算属性未定义 setter 且被赋值时，THE Computed_Decorator SHALL 调用原始的 `set` 方法（即 Stage 3 accessor 的默认 set 行为）
7. THE Computed_Decorator SHALL 保持与 `@kaokei/di` 的 `onActivation` 钩子（将实例转为 `reactive` 对象）的兼容性，确保 `this` 指向 reactive 代理对象

### 需求 2：ROOT_CONTAINER 测试隔离支持

**用户故事：** 作为开发者，我希望能够在测试之间重置全局容器状态，以便每个测试用例在干净的环境中运行，避免服务注册污染。

#### 验收标准

1. THE resetRootContainer SHALL 销毁当前 ROOT_CONTAINER 中的所有绑定和子容器
2. WHEN resetRootContainer 被调用后，THE resetRootContainer SHALL 创建一个新的 DI_Container 实例替换原有的 ROOT_CONTAINER
3. WHEN resetRootContainer 被调用后，新的 ROOT_CONTAINER SHALL 包含与初始状态相同的默认配置（`onActivation`、`onDeactivation` 钩子以及 `FIND_CHILD_SERVICE`、`FIND_CHILDREN_SERVICES` 绑定）
4. THE resetRootContainer SHALL 从 `src/index.ts` 导出，供外部使用
5. WHEN 之前通过 `declareRootProviders` 注册的服务在 resetRootContainer 调用后被请求时，THE ROOT_CONTAINER SHALL 抛出绑定未找到异常

### 需求 3：CONTAINER_TOKEN 使用 Symbol 替代字符串

**用户故事：** 作为开发者，我希望 CONTAINER_TOKEN 使用 Symbol 类型，以便消除与其他库或用户代码的命名冲突风险。

#### 验收标准

1. THE CONTAINER_TOKEN SHALL 使用 `Symbol('USE_VUE_SERVICE_CONTAINER_TOKEN')` 替代当前的字符串值 `'USE_VUE_SERVICE_CONTAINER_TOKEN'`
2. WHEN CONTAINER_TOKEN 被用于 Vue 的 `provide` 和 `inject` 调用时，THE CONTAINER_TOKEN SHALL 作为 `InjectionKey<Container>` 类型使用
3. THE CONTAINER_TOKEN 的类型变更 SHALL 保持所有现有 `provide`/`inject` 调用的兼容性，无需修改调用方代码

### 需求 4：精简 re-export 导出

**用户故事：** 作为开发者，我希望库只导出用户实际需要的 API，以便减小 API 表面积，降低意外依赖和命名冲突的风险。

#### 验收标准

1. THE index.ts SHALL 将 `export * from '@kaokei/di'` 替换为显式的命名导出
2. THE index.ts SHALL 导出以下来自 `@kaokei/di` 的核心类型和工具：`Container`、`Token`、`LazyToken`、`Binding`、`Injectable`、`Inject`、`Self`、`SkipSelf`、`Optional`、`PostConstruct`、`PreDestroy`、`decorate`、`LazyInject`、`createLazyInject`、`autobind`
3. THE index.ts SHALL 导出以下来自 `@kaokei/di` 的类型定义：`CommonToken`、`Newable`、`TokenType`、`GenericToken`、`Context`、`Options`
4. THE index.ts SHALL 导出以下来自 `@kaokei/di` 的错误类：`BaseError`、`BindingNotFoundError`、`BindingNotValidError`、`CircularDependencyError`、`DuplicateBindingError`、`PostConstructError`、`ContainerNotFoundError`

### 需求 5：新增 @Watch 和 @Effect 装饰器

**用户故事：** 作为开发者，我希望能够在服务类中使用装饰器声明式地监听属性变化和执行副作用，以便无需手动获取 EffectScope 即可实现响应式副作用逻辑。

#### 验收标准

1. THE Watch_Decorator SHALL 使用 Stage 3 方法装饰器签名 `(value: Function, context: ClassMethodDecoratorContext)`
2. WHEN 服务实例被创建并转为 reactive 对象后，被 `@Watch` 装饰的方法首次被调用时，THE Watch_Decorator SHALL 在该实例的 EffectScope 内创建一个 Vue `watch` 监听器
3. THE Watch_Decorator SHALL 接受一个参数，该参数为返回被监听值的 getter 函数（以 `this` 为上下文），用于指定监听的数据源
4. WHEN 监听的数据源发生变化时，THE Watch_Decorator SHALL 调用被装饰的方法，并传入新值和旧值作为参数
5. THE Effect_Decorator SHALL 使用 Stage 3 方法装饰器签名 `(value: Function, context: ClassMethodDecoratorContext)`
6. WHEN 服务实例被创建并转为 reactive 对象后，被 `@Effect` 装饰的方法首次被调用时，THE Effect_Decorator SHALL 在该实例的 EffectScope 内创建一个 Vue `watchEffect` 监听器
7. THE Watch_Decorator 和 Effect_Decorator SHALL 从 `src/index.ts` 导出，供外部使用

### 需求 6：服务替换/Mock 支持

**用户故事：** 作为开发者，我希望能够使用声明式配置替换服务实现，以便在测试中方便地注入 Mock 服务，以及在生产环境中灵活切换实现。

#### 验收标准

1. THE declareProviders SHALL 支持接受 Provider_Config 对象数组，每个对象包含 `provide`（token）和 `useClass`（替换类）属性
2. WHEN Provider_Config 包含 `{ provide: TokenA, useClass: ClassB }` 时，THE DI_Container SHALL 将 TokenA 绑定到 ClassB 的实例
3. THE declareRootProviders 和 declareAppProviders SHALL 同样支持 Provider_Config 对象数组格式
4. THE Provider_Config 类型定义 SHALL 在 `src/interface.ts` 中声明，并从 `src/index.ts` 导出

### 需求 7：文档优化

**用户故事：** 作为开发者，我希望文档能够清晰说明关键使用约束和高级用法，以便减少使用中的困惑和错误。

#### 验收标准

1. THE API 文档 SHALL 说明 `@Computed` 装饰器的使用前提：服务实例需通过 DI_Container 的 `onActivation` 钩子转为 `reactive` 对象后，计算属性才能正确追踪依赖
2. THE API 文档 SHALL 提供异步服务初始化的使用指南，包括 `@PostConstruct` 装饰器与异步操作的配合方式
3. THE API 文档 SHALL 为所有公开导出的函数和类型提供中文说明、参数描述和使用示例
4. WHEN 新增 `resetRootContainer`、`@Watch`、`@Effect` 等 API 时，THE API 文档 SHALL 同步更新，包含对应的使用说明和代码示例
