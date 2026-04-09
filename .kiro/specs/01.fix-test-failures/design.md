# 修复测试失败 Bugfix 设计

## 概述

`@kaokei/di` 升级到 TC39 Stage 3 标准装饰器后，`@kaokei/use-vue-service` 中存在三类不兼容问题导致 17 个测试用例失败：

1. `Computed` 装饰器仍使用 legacy 签名，需要重写为 Stage 3 getter decorator
2. 使用了 `@Inject()`/`@PostConstruct()` 的 Service 类缺少 `@Injectable()` 类装饰器
3. 测试中的错误信息断言与 `@kaokei/di` 新版本不匹配

修复策略：重写 `src/computed.ts` 为 Stage 3 getter decorator 签名；在受影响的测试 Service 类上添加 `@Injectable()`；更新错误信息断言。

## 术语表

- **Bug_Condition (C)**：触发 bug 的条件——`Computed` 使用 legacy 签名、Service 类缺少 `@Injectable()`、错误信息断言不匹配
- **Property (P)**：修复后的期望行为——`Computed` 正确转换 getter 为 Vue computed、DI 注入正常工作、断言匹配
- **Preservation**：修复不应影响的行为——已通过的 11 个测试文件、Vue reactive 缓存机制、组件卸载清理
- **`Computed()`**：`src/computed.ts` 中的工厂函数，返回 TC39 Stage 3 getter decorator，将 getter 转换为 Vue `computed` 响应式计算属性
- **`@Injectable()`**：`@kaokei/di` 提供的类装饰器，在类定义阶段关联 `target`（类构造函数）和 `context.metadata`，使成员装饰器的元数据能被 DI 容器读取
- **Stage 3 Getter Decorator**：TC39 Stage 3 规范中的 getter 装饰器签名 `(value: Function, context: ClassGetterDecoratorContext) => Function | void`

## Bug 详情

### Bug 条件

Bug 在以下三种情况下触发：

1. `Computed` 装饰器使用 legacy 签名 `(target, propertyKey, descriptor)` 但运行时传入 Stage 3 的 `(value, context)` 参数
2. Service 类使用了 `@Inject()` 或 `@PostConstruct()` 但缺少 `@Injectable()` 类装饰器
3. 测试断言的错误信息字符串与 `@kaokei/di` 新版本实际抛出的错误信息不一致

**形式化规约：**
```
FUNCTION isBugCondition(input)
  INPUT: input 为 { type: "computed" | "injectable" | "assertion", context: any }
  OUTPUT: boolean

  IF input.type == "computed" THEN
    // Computed 装饰器签名不兼容 Stage 3
    RETURN decoratorSignature(Computed) == legacy
           AND runtime == TC39_Stage3
  
  ELSE IF input.type == "injectable" THEN
    // Service 类使用了成员装饰器但缺少 @Injectable()
    RETURN classHasMemberDecorators(input.context.class, ["Inject", "PostConstruct"])
           AND NOT classHasDecorator(input.context.class, "Injectable")
  
  ELSE IF input.type == "assertion" THEN
    // 错误信息断言与实际不匹配
    RETURN input.context.expectedMessage != input.context.actualMessage
  
  END IF

  RETURN false
END FUNCTION
```

### 示例

- `@Computed()` 装饰 getter 属性 → 抛出 `TypeError: Cannot read properties of undefined (reading 'get')`，因为 Stage 3 传入的 `value` 是 getter 函数而非 `target` 对象
- `DemoService` 使用 `@Inject(OtherService)` 但无 `@Injectable()` → `otherService` 为 `undefined`，访问 `otherService.count` 抛出 `TypeError`
- `DemoService` 使用 `@PostConstruct()` 但无 `@Injectable()` → `init()` 方法不被 DI 容器调用，`computedName` 未初始化
- 测试断言 `'Cannot apply @PostConstruct decorator multiple times in the same class'` → 实际错误信息为 `'Multiple @PostConstruct decorators are not allowed in a single class.'`

## 期望行为

### 保持不变的行为

**不变行为：**
- 已通过的 11 个测试文件（test7-test10、test12-test14、test16-test19）必须继续通过
- `declareProviders`/`useService` 通过 Vue provide/inject 管理 DI 容器层级的机制不变
- `@Computed()` 装饰的 getter 配合 `reactive()` 的响应式缓存行为不变：依赖未变时不重新计算
- `@Computed()` 装饰的 getter/setter 组合功能不变：setter 设置值后 getter 自动重新计算
- 多个 `@Computed()` 装饰同一类的不同 getter 时，各自独立缓存
- 组件卸载时 EffectScope 正确停止并清理资源
- 不使用 `@Inject`/`@PostConstruct` 的普通 Service 类无需 `@Injectable()`

**范围：**
所有不涉及上述三类 bug 条件的输入应完全不受此修复影响，包括：
- 不使用 `@Computed()` 的普通 getter 属性
- 不使用成员装饰器的 Service 类
- 鼠标点击、路由导航等非装饰器相关的功能

## 假设的根因

基于 bug 分析，最可能的原因如下：

1. **`Computed` 装饰器签名不兼容**：当前 `src/computed.ts` 中 `Computed` 函数使用 legacy 签名 `(target, propertyKey, descriptor)`，但 tsconfig 未启用 `experimentalDecorators`，运行时按 Stage 3 规范传入 `(value: Function, context: ClassGetterDecoratorContext)`。`value` 是原始 getter 函数，`context` 是装饰器上下文对象，代码试图访问 `descriptor.get` 但 `context` 没有 `.get` 属性（`context.access.get` 存在但语义不同），导致 `TypeError`。

2. **缺少 `@Injectable()` 类装饰器**：`@kaokei/di` 新版本中，成员装饰器（`@Inject`、`@PostConstruct`）将元数据写入 `context.metadata`，而 `@Injectable()` 类装饰器负责在类定义阶段通过 `defineMetadata` 将 `context.metadata` 映射到类构造函数。缺少 `@Injectable()` 时，DI 容器无法找到注入元数据，导致 `@Inject` 属性为 `undefined`、`@PostConstruct` 方法不被调用。

3. **错误信息变更**：`@kaokei/di` 新版本重构了 `@PostConstruct` 的重复检测逻辑，错误信息从 `'Cannot apply @PostConstruct decorator multiple times in the same class'` 改为 `'Multiple @PostConstruct decorators are not allowed in a single class.'`。

## 正确性属性

Property 1: Bug Condition - Computed 装饰器 Stage 3 兼容性

_For any_ getter 属性使用 `@Computed()` 装饰时（isBugCondition 中 type == "computed"），修复后的 `Computed` 函数 SHALL 正确接收 Stage 3 getter decorator 参数 `(value: Function, context: ClassGetterDecoratorContext)`，返回一个新的 getter 函数，该函数使用 Vue `computed()` 包装原始 getter 实现响应式缓存，不抛出任何错误。

**验证需求：2.1, 2.2**

Property 2: Bug Condition - Injectable 装饰器补全

_For any_ Service 类使用了 `@Inject()` 或 `@PostConstruct()` 成员装饰器时（isBugCondition 中 type == "injectable"），添加 `@Injectable()` 类装饰器后，DI 容器 SHALL 正确解析注入元数据，`@Inject` 属性为对应的服务实例，`@PostConstruct` 方法在实例化后被调用。

**验证需求：2.3, 2.4, 2.5**

Property 3: Bug Condition - 错误信息断言匹配

_For any_ 测试断言 `@PostConstruct` 重复使用的错误信息时（isBugCondition 中 type == "assertion"），更新后的断言字符串 SHALL 与 `@kaokei/di` 新版本实际抛出的错误信息 `'Multiple @PostConstruct decorators are not allowed in a single class.'` 完全匹配。

**验证需求：2.6, 2.7**

Property 4: Preservation - 已通过测试和现有行为不变

_For any_ 不涉及上述三类 bug 条件的输入（isBugCondition 返回 false），修复后的代码 SHALL 产生与修复前完全相同的结果，保持已通过的 11 个测试文件全部通过，Vue reactive 缓存机制、EffectScope 生命周期管理、组件 provide/inject 层级等行为不变。

**验证需求：3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## 修复实现

### 需要的变更

假设根因分析正确：

**文件**：`src/computed.ts`

**函数**：`Computed`

**具体变更**：
1. **重写 `Computed` 为 Stage 3 getter decorator 工厂**：
   - 删除所有 legacy 重载签名
   - `Computed()` 返回一个函数 `(value: Function, context: ClassGetterDecoratorContext) => Function`
   - `value` 参数是原始 getter 函数
   - `context` 参数包含 `kind: "getter"`、`name`、`addInitializer` 等信息

2. **保留核心响应式逻辑**：
   - 继续使用 `reactive(this)` 确保响应式上下文
   - 继续使用 `computed()` 包装 getter 实现缓存
   - 继续使用 `getEffectScope()` 管理生命周期
   - 继续使用 `Symbol` 作为每个属性的缓存 key
   - 继续使用 `markRaw` 包装 computedRef 避免被 reactive 代理

3. **处理 getter 替换**：
   - 返回一个新的 getter 函数替换原始 getter
   - 新 getter 内部：获取 `reactive(this)` → 检查缓存 → 创建/复用 computed → 返回 `.value`

4. **处理 setter**：
   - Stage 3 getter decorator 只装饰 getter，不直接接收 setter
   - 需要通过 `context.access` 或在类原型上查找对应的 setter
   - 如果原始类定义了 setter，需要在 computed 中包含 setter 逻辑

**文件**：测试文件（添加 `@Injectable()`）

**具体变更**：
5. **为使用成员装饰器的 Service 类添加 `@Injectable()`**：
   - `tests/test1/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test2/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test3/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test4/ParentService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test4/ChildService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test5/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test6/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test11/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test22/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test22/DemoServiceBase.ts` - 添加 `@Injectable()` 和 import（注意：此文件从 `@kaokei/di` 导入，需要从同一包导入 `Injectable`）

6. **更新 test15 错误信息断言和添加 `@Injectable()`**：
   - `tests/test15/DemoService.ts` - 添加 `@Injectable()` 和 import
   - `tests/test15/demo.test.ts` - 不要在测试中写死错误信息字符串，改为使用 `@kaokei/di` 导出的 `ERRORS` 常量（通过 `import { ERRORS } from '@kaokei/di/dist/constants'`）引用 `ERRORS.POST_CONSTRUCT`，这样当上游库修改错误信息时测试不会因为字符串不匹配而失败
   - `tests/test15/demo.test.ts` - 内联定义的类中使用了 `@PostConstruct()` 的也需要添加 `@Injectable()`

7. **test20 测试文件**：
   - `tests/test20/demo.test.ts`、`demo2.test.ts`、`demo3.test.ts` 中内联定义的类仅使用 `@Computed()`（本库装饰器），不使用 `@kaokei/di` 的成员装饰器，不需要添加 `@Injectable()`

## 测试策略

### 验证方法

测试策略分两阶段：首先在未修复代码上验证 bug 存在（探索性测试），然后验证修复正确且不引入回归。

### 探索性 Bug 条件检查

**目标**：在实施修复前，验证 bug 确实存在，确认或否定根因分析。如果否定，需要重新假设。

**测试计划**：在未修复代码上运行现有测试套件，观察失败模式，确认三类 bug 的根因。

**测试用例**：
1. **Computed 签名测试**：在未修复代码上运行 test20/test21 测试，观察 `TypeError: Cannot read properties of undefined` 错误（将在未修复代码上失败）
2. **Injectable 缺失测试**：在未修复代码上运行 test1-test6、test11、test22 测试，观察 `@Inject` 属性为 `undefined` 的错误（将在未修复代码上失败）
3. **PostConstruct 未执行测试**：在未修复代码上运行 test1、test2、test5、test6、test22 测试，观察 `computedName` 未初始化的错误（将在未修复代码上失败）
4. **错误信息不匹配测试**：在未修复代码上运行 test15 测试，观察断言失败（将在未修复代码上失败）

**预期反例**：
- test20/test21：`TypeError` 因为 Computed 尝试访问 Stage 3 context 对象上不存在的 legacy 属性
- test1-test6、test11、test22：`TypeError: Cannot read properties of undefined` 因为 `@Inject` 属性未被解析
- test15：断言失败因为错误信息字符串不匹配

### 修复检查

**目标**：验证对所有满足 bug 条件的输入，修复后的函数产生期望行为。

**伪代码：**
```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.type == "computed" THEN
    result := Computed_fixed()(originalGetter, context)
    ASSERT result 是一个函数
    ASSERT 调用 result 返回 Vue computed 缓存值
    ASSERT 依赖变化时自动更新
  ELSE IF input.type == "injectable" THEN
    result := Container.resolve(ServiceWithInjectable)
    ASSERT result.injectedProperty !== undefined
    ASSERT result.postConstructMethod 已被调用
  ELSE IF input.type == "assertion" THEN
    ASSERT errorMessage == 'Multiple @PostConstruct decorators are not allowed in a single class.'
  END IF
END FOR
```

### 保持性检查

**目标**：验证对所有不满足 bug 条件的输入，修复后的函数产生与原函数相同的结果。

**伪代码：**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) == fixedBehavior(input)
END FOR
```

**测试方法**：属性基测试（Property-Based Testing）推荐用于保持性检查，因为：
- 自动生成大量测试用例覆盖输入域
- 捕获手动单元测试可能遗漏的边界情况
- 对所有非 bug 输入的行为不变提供强保证

**测试计划**：在未修复代码上先观察非 bug 输入的行为，然后编写属性基测试捕获该行为。

**测试用例**：
1. **已通过测试保持**：运行 test7-test10、test12-test14、test16-test19 确认全部通过
2. **Computed 缓存行为保持**：验证 `@Computed()` 装饰的 getter 在 `reactive()` 包装后，依赖未变时不重新计算（spy 调用次数不增加）
3. **Computed setter 行为保持**：验证 `@Computed()` 装饰的 getter/setter 组合，setter 设置值后 getter 正确更新
4. **多 Computed 独立缓存保持**：验证同一类上多个 `@Computed()` getter 各自独立缓存

### 单元测试

- 测试 `Computed()` 返回的 getter decorator 正确接收 Stage 3 参数
- 测试 `Computed()` 装饰的 getter 在非 reactive 对象上的行为（缓存但不响应式更新）
- 测试 `Computed()` 装饰的 getter 在 reactive 对象上的响应式缓存行为
- 测试 `Computed()` 装饰的 getter/setter 组合
- 测试添加 `@Injectable()` 后 `@Inject` 属性正确解析
- 测试添加 `@Injectable()` 后 `@PostConstruct` 方法正确执行
- 测试更新后的错误信息断言匹配

### 属性基测试

- 生成随机 reactive 对象状态，验证 `@Computed()` getter 的缓存一致性：连续两次访问同一 getter 且依赖未变时，spy 调用次数不增加
- 生成随机依赖值变化序列，验证 `@Computed()` getter 在依赖变化后返回正确的新值
- 验证所有不涉及 bug 条件的测试在修复前后行为一致

### 集成测试

- 测试完整的 Vue 组件挂载流程：`declareProviders` → `useService` → 服务实例化 → `@Inject` 解析 → `@PostConstruct` 执行
- 测试 `@Computed()` 在 Vue 组件模板中的响应式渲染
- 测试组件卸载时 EffectScope 清理
