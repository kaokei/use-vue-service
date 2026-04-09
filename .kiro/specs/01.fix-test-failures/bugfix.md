# Bugfix 需求文档

## 简介

`@kaokei/di` 已升级到 TC39 Stage 3 标准装饰器，但 `@kaokei/use-vue-service` 中的 `Computed` 装饰器仍使用 legacy 签名，且部分测试中的 Service 类缺少 `@Injectable()` 类装饰器导致 `@Inject`/`@PostConstruct` 元数据无法关联到类构造函数。此外，部分测试中的错误信息断言与 `@kaokei/di` 新版本的实际错误信息不匹配。共导致 13 个测试文件中 17 个测试用例失败。

## 核心原则

1. 本库的所有装饰器必须且仅支持 TC39 Stage 3 装饰器语法，不需要兼容 legacy（Stage 1）装饰器
2. `@Computed()` 只需要支持 Stage 3 getter decorator 签名，不需要同时支持 Stage 1 和 Stage 3
3. 本库的所有装饰器必须采用小括号调用的方式（如 `@Computed()`），不支持省略小括号的写法（如 `@Computed`）
4. `@kaokei/di` 新版本中 `@Injectable()` 类装饰器是必须的，凡是使用了 `@Inject()`、`@PostConstruct()` 等成员装饰器的 Service 类，都必须添加 `@Injectable()` 类装饰器

## Bug 分析

### 当前行为（缺陷）

**类别 1：`Computed` 装饰器不兼容 TC39 Stage 3 装饰器**

1.1 WHEN 在 getter 属性上使用 `@Computed()` 装饰器 THEN 系统抛出 `TypeError: Cannot read properties of undefined (reading 'get')`，因为 `Computed` 使用 legacy 签名 `(target, propertyKey, descriptor)` 而运行时传入的是 TC39 Stage 3 的 `(value, context)` 格式，`descriptor` 参数实际是 `context` 对象，没有 `.get` 属性

1.2 WHEN TypeScript 编译器检查 `@Computed()` 装饰器类型 THEN 报告类型错误 `Unable to resolve signature of method decorator when called as an expression`，因为 tsconfig 中没有 `experimentalDecorators: true`，编译器期望 TC39 Stage 3 装饰器签名

**类别 2：`@Inject` 注入的属性为 undefined（缺少 `@Injectable()`）**

1.3 WHEN Service 类使用了 `@Inject()` 字段装饰器但没有使用 `@Injectable()` 类装饰器 THEN DI 容器无法找到注入元数据，`@Inject` 装饰的属性值为 `undefined`，访问其属性时抛出 `TypeError: Cannot read properties of undefined`

1.4 WHEN 多层继承链中基类使用了 `@Inject()` 但整个继承链都没有 `@Injectable()` THEN 基类的注入属性同样为 `undefined`

**类别 3：`@PostConstruct` 未执行（缺少 `@Injectable()`）**

1.5 WHEN Service 类使用了 `@PostConstruct()` 方法装饰器但没有使用 `@Injectable()` 类装饰器 THEN `@PostConstruct` 标记的方法不会被 DI 容器调用，导致在 `init()` 中通过 `computed()` 创建的响应式属性（如 `computedName`）未被初始化，值为空字符串

**类别 4：`@PostConstruct` 错误信息不匹配**

1.6 WHEN 测试断言 `@PostConstruct` 重复使用的错误信息为 `'Cannot apply @PostConstruct decorator multiple times in the same class'` THEN 断言失败，因为 `@kaokei/di` 新版本的实际错误信息是 `'Multiple @PostConstruct decorators are not allowed in a single class.'`

1.7 WHEN 测试期望 `mount(DemoComp)` 抛出 `'something wrong'` 错误（由 `@PostConstruct` 方法中的 `throw new Error('something wrong')` 触发）THEN 实际没有抛出错误，因为 `DemoService` 缺少 `@Injectable()` 导致 `@PostConstruct` 方法未被执行

### 期望行为（正确）

**类别 1：`Computed` 装饰器兼容 TC39 Stage 3 装饰器**

2.1 WHEN 在 getter 属性上使用 `@Computed()` 装饰器 THEN 系统 SHALL 正确将 getter 转换为 Vue `computed` 响应式计算属性，支持缓存和依赖追踪，不抛出任何错误

2.2 WHEN TypeScript 编译器检查 `@Computed()` 装饰器类型 THEN 系统 SHALL 不报告任何类型错误，`Computed` 的类型签名符合 TC39 Stage 3 getter decorator 规范

**类别 2：`@Inject` 注入的属性正确解析**

2.3 WHEN Service 类使用了 `@Inject()` 字段装饰器 THEN 系统 SHALL 确保该类具有 `@Injectable()` 类装饰器（或在测试中添加），使 DI 容器能正确解析注入元数据，属性值为对应的服务实例

2.4 WHEN 多层继承链中基类使用了 `@Inject()` THEN 系统 SHALL 确保使用了 `@Inject` 的类具有 `@Injectable()` 类装饰器，使继承链中的注入属性正确解析

**类别 3：`@PostConstruct` 正确执行**

2.5 WHEN Service 类使用了 `@PostConstruct()` 方法装饰器 THEN 系统 SHALL 确保该类具有 `@Injectable()` 类装饰器（或在测试中添加），使 DI 容器在实例化后正确调用 `@PostConstruct` 标记的方法

**类别 4：`@PostConstruct` 错误信息匹配**

2.6 WHEN 测试断言 `@PostConstruct` 重复使用的错误信息 THEN 系统 SHALL 使用 `@kaokei/di` 导出的 `ERRORS` 常量（通过 `import { ERRORS } from '@kaokei/di/dist/constants'`）引用 `ERRORS.POST_CONSTRUCT`，而不是在测试中写死具体的错误信息字符串

2.7 WHEN `DemoService` 的 `@PostConstruct` 方法中抛出错误且 `DemoService` 具有 `@Injectable()` 类装饰器 THEN 系统 SHALL 在 `mount(DemoComp)` 时正确传播该错误

### 不变行为（回归预防）

3.1 WHEN 使用不带 `@Inject` 或 `@PostConstruct` 的普通 Service 类 THEN 系统 SHALL CONTINUE TO 正常实例化和使用该服务，无需 `@Injectable()` 装饰器

3.2 WHEN 使用 `declareProviders` 和 `useService` 在 Vue 组件中注入服务 THEN 系统 SHALL CONTINUE TO 通过 Vue 的 provide/inject 机制正确管理 DI 容器层级

3.3 WHEN 使用 `@Computed()` 装饰的 getter 属性配合 Vue `reactive()` THEN 系统 SHALL CONTINUE TO 提供响应式缓存行为：依赖未变时不重新计算，依赖变化时自动更新

3.4 WHEN 使用 `@Computed()` 装饰的 getter/setter 属性 THEN 系统 SHALL CONTINUE TO 支持通过 setter 设置值并触发 getter 重新计算

3.5 WHEN 多个 `@Computed()` 装饰器应用于同一个类的不同 getter 属性 THEN 系统 SHALL CONTINUE TO 每个 getter 独立缓存和追踪依赖

3.6 WHEN 已通过测试的 11 个测试文件（test7-test10、test12-test14、test16-test19）THEN 系统 SHALL CONTINUE TO 全部通过，行为不变

3.7 WHEN 组件卸载时 THEN 系统 SHALL CONTINUE TO 正确停止 EffectScope 并清理资源
