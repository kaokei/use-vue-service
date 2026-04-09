# 实施计划：use-vue-service 优化

## 概述

按需求优先级顺序实施各项优化。从最高优先级的 `@Computed` Stage 3 迁移开始，依次完成容器重置、Token Symbol 化、导出精简、新增装饰器、服务替换支持，最后完善文档。所有任务仅涉及 `src/` 目录下的源码文件和 `docs/` 目录下的文档文件，不修改 examples 和 tests。

## 任务

- [x] 1. 将 @Computed 装饰器迁移到 Stage 3 accessor 语法
  - [x] 1.1 重写 `src/computed.ts`，将函数签名从 Stage 1 `(target, key, descriptor)` 改为 Stage 3 accessor 装饰器 `<This, Value>(value: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>): ClassAccessorDecoratorResult<This, Value>`
    - 使用 `context.name` 获取属性名，生成缓存 Symbol（`Symbol.for(String(context.name))`）
    - 在返回的 `get` 方法中：首次访问时通过 `reactive(this)` 获取 reactive 代理，在 EffectScope 内创建 `computed` 引用并用 `markRaw` 包装后缓存到实例上；后续访问直接返回缓存值
    - 在返回的 `set` 方法中：如果已存在缓存的 `computed` 引用，则写入其 setter；否则回退到原始 `value.set`
    - 保持与 `@kaokei/di` 的 `onActivation` 钩子兼容，确保 `this` 指向 reactive 代理对象
    - _需求：1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 1.2 编写 @Computed Stage 3 装饰器的属性测试
    - **属性 1：Computed getter 幂等性** — 对于任意 getter 返回值，多次访问应返回相同结果，且底层 computed 引用只创建一次
    - **属性 2：Computed set-then-get 一致性** — 对于任意可写 computed 属性，set 后 get 应返回相同值
    - **验证需求：1.3, 1.4, 1.5, 1.7**

- [x] 2. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 3. 实现 DEFAULT_CONTAINER 测试隔离支持
  - [x] 3.1 修改 `src/constants.ts`，将 `DEFAULT_CONTAINER` 的声明从 `const` 改为 `let`
    - _需求：2.2_

  - [x] 3.2 在 `src/constants.ts` 中新增 `resetRootContainer` 函数
    - 调用 `DEFAULT_CONTAINER.destroy()` 销毁当前容器的所有绑定和子容器
    - 调用 `createContainer()` 创建新的容器实例并赋值给 `DEFAULT_CONTAINER`
    - 新容器自动包含默认配置（`onActivation`、`onDeactivation` 钩子以及 `FIND_CHILD_SERVICE`、`FIND_CHILDREN_SERVICES` 绑定）
    - _需求：2.1, 2.2, 2.3_

  - [x] 3.3 在 `src/index.ts` 中导出 `resetRootContainer`
    - _需求：2.4_

  - [ ]* 3.4 编写 resetRootContainer 的属性测试
    - **属性 3：resetRootContainer 隔离性** — 对于任意数量的已注册服务，reset 后请求任何服务都应抛出 BindingNotFoundError
    - **验证需求：2.1, 2.2, 2.5**

- [x] 4. 将 CONTAINER_TOKEN 从字符串改为 Symbol
  - [x] 4.1 修改 `src/constants.ts`，将 `CONTAINER_TOKEN` 从字符串 `'USE_VUE_SERVICE_CONTAINER_TOKEN'` 改为 `Symbol('USE_VUE_SERVICE_CONTAINER_TOKEN')`
    - 导入 Vue 的 `InjectionKey` 类型，声明为 `InjectionKey<Container>` 类型
    - _需求：3.1, 3.2_

  - [x] 4.2 更新 `src/core.ts` 中所有使用 `CONTAINER_TOKEN` 的代码，确保与 Symbol 类型兼容
    - `getCurrentContainer` 函数中 `Object.prototype.hasOwnProperty.call(provides, token)` 需要适配 Symbol key
    - `inject(CONTAINER_TOKEN, ...)` 调用保持兼容
    - _需求：3.3_

- [x] 5. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 6. 精简 index.ts 的 re-export 导出
  - [ ] 6.1 将 `src/index.ts` 中的 `export * from '@kaokei/di'` 替换为显式命名导出
    - 导出核心类和工具：`Container`、`Token`、`LazyToken`、`Binding`、`Injectable`、`Inject`、`Self`、`SkipSelf`、`Optional`、`PostConstruct`、`PreDestroy`、`decorate`、`LazyInject`、`createLazyInject`、`autobind`
    - 导出类型定义：`CommonToken`、`Newable`、`TokenType`、`GenericToken`、`Context`、`Options`
    - 导出错误类：`BaseError`、`BindingNotFoundError`、`BindingNotValidError`、`CircularDependencyError`、`DuplicateBindingError`、`PostConstructError`、`ContainerNotFoundError`
    - _需求：4.1, 4.2, 4.3, 4.4_

- [ ] 7. 新增 @Watch 和 @Effect 装饰器
  - [ ] 7.1 创建 `src/watch.ts` 模块，实现 `@Watch` 高阶装饰器
    - 使用 Stage 3 方法装饰器签名 `(value: Function, context: ClassMethodDecoratorContext)`
    - `Watch` 为高阶函数，接受 getter 参数（数据源函数），返回方法装饰器
    - 通过 `context.addInitializer` 在实例初始化时，使用 `reactive(this)` 获取 reactive 代理，在 EffectScope 内创建 Vue `watch` 监听器
    - _需求：5.1, 5.2, 5.3, 5.4_

  - [ ] 7.2 在 `src/watch.ts` 中实现 `@Effect` 装饰器
    - 使用 Stage 3 方法装饰器签名，直接作为装饰器使用（无参数）
    - 通过 `context.addInitializer` 在实例初始化时，使用 `reactive(this)` 获取 reactive 代理，在 EffectScope 内创建 Vue `watchEffect` 监听器
    - _需求：5.5, 5.6_

  - [ ] 7.3 在 `src/index.ts` 中导出 `Watch` 和 `Effect`
    - _需求：5.7_

  - [ ]* 7.4 编写 @Watch 和 @Effect 的属性测试
    - **属性 4：Watch 回调正确性** — 对于任意响应式数据源值变化，回调应接收到正确的新值和旧值
    - **属性 5：Effect 副作用执行** — 对于任意服务实例，effect 方法应在初始化后自动执行，依赖变化时重新执行
    - **验证需求：5.2, 5.4, 5.6**

- [ ] 8. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 9. 实现服务替换/Mock 支持
  - [ ] 9.1 在 `src/interface.ts` 中新增 `ProviderConfig` 接口和更新 `Provider` 类型
    - 定义 `ProviderConfig<T>` 接口，包含 `provide: CommonToken<T>` 和 `useClass: Newable<T>` 属性
    - 扩展 `Provider` 联合类型，添加 `ProviderConfig[]` 分支
    - _需求：6.4_

  - [ ] 9.2 修改 `src/core.ts` 中的 `bindProviders` 函数，增加对 `ProviderConfig[]` 的处理分支
    - 通过检测数组元素是否包含 `provide` 属性来区分 `ProviderConfig[]` 和 `NewableProvider`
    - 遍历配置数组，对每个 `{ provide, useClass }` 调用 `container.bind(provide).to(useClass)`
    - 更新 `declareProviders`、`declareRootProviders`、`declareAppProviders` 的重载签名以支持 `ProviderConfig[]`
    - _需求：6.1, 6.2, 6.3_

  - [ ] 9.3 在 `src/index.ts` 中导出 `ProviderConfig` 类型
    - _需求：6.4_

  - [ ]* 9.4 编写 ProviderConfig 绑定的属性测试
    - **属性 6：ProviderConfig 绑定正确性** — 对于任意 `{ provide: TokenA, useClass: ClassB }` 配置，`container.get(TokenA)` 应返回 ClassB 的实例
    - **验证需求：6.1, 6.2**

- [ ] 10. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 11. 完善 API 文档
  - [ ] 11.1 更新 `docs/api/index.md`，添加 `@Computed` Stage 3 装饰器的使用说明
    - 说明 `accessor` 关键字的使用方式
    - 说明服务实例需通过 `onActivation` 钩子转为 reactive 对象的前提条件
    - _需求：7.1_

  - [ ] 11.2 在 `docs/api/index.md` 中添加异步服务初始化指南
    - 说明 `@PostConstruct` 装饰器与异步操作的配合方式
    - _需求：7.2_

  - [ ] 11.3 在 `docs/api/index.md` 中为所有公开导出的函数和类型添加中文说明、参数描述和使用示例
    - 包括 `resetRootContainer`、`@Watch`、`@Effect`、`ProviderConfig` 等新增 API
    - _需求：7.3, 7.4_

- [ ] 12. 最终检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的子任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务确保增量验证
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
- 不包含 examples 示例代码和 tests 单元测试的修改任务
