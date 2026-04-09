# 实施计划

- [x] 1. 在未修复代码上运行测试套件，确认 bug 存在
  - **Property 1: Bug Condition** - TC39 Stage 3 不兼容导致测试失败
  - **CRITICAL**: 此测试必须在未修复代码上失败——失败确认 bug 存在
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: 此步骤编码期望行为——修复后将通过验证
  - **GOAL**: 暴露反例，证明 bug 存在
  - **Scoped PBT Approach**: 针对三类确定性 bug 的具体失败用例进行验证
  - 运行 `pnpm coverage` 观察失败模式：
    - Computed 签名不兼容：test20、test21 抛出 `TypeError: Cannot read properties of undefined (reading 'get')`（isBugCondition type=="computed"）
    - 缺少 @Injectable()：test1-test6、test11、test22 中 `@Inject` 属性为 `undefined`（isBugCondition type=="injectable"）
    - 错误信息不匹配：test15 断言字符串与实际错误信息不一致（isBugCondition type=="assertion"）
  - 在未修复代码上运行测试
  - **EXPECTED OUTCOME**: 测试失败（这是正确的——证明 bug 存在）
  - 记录失败的反例和错误信息，确认根因分析
  - 任务完成条件：测试已运行，失败已记录
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. 在未修复代码上验证已通过测试的保持性（修复前）
  - **Property 2: Preservation** - 已通过测试和现有行为不变
  - **IMPORTANT**: 遵循观察优先方法论
  - 观察：在未修复代码上运行 test7-test10、test12-test14、test16-test19，确认全部通过
  - 观察：记录已通过测试的数量和行为基线
  - 编写保持性验证：确认 11 个已通过测试文件在未修复代码上全部通过（来自设计文档的 Preservation Requirements）
  - 在未修复代码上验证测试通过
  - **EXPECTED OUTCOME**: 测试通过（确认需要保持的行为基线）
  - 任务完成条件：测试已运行，通过状态已记录
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. 任务 1：重写 src/computed.ts 为 TC39 Stage 3 getter decorator

  - [x] 3.1 重写 Computed 装饰器实现
    - 删除所有 legacy 重载签名和 `createComputedDescriptor` 函数
    - `Computed()` 返回 `(value: Function, context: ClassGetterDecoratorContext) => Function`
    - `value` 参数是原始 getter 函数，`context` 包含 `kind: "getter"`、`name`、`addInitializer`
    - 保留核心逻辑：`reactive(this)`、`computed()`、`getEffectScope()`、`Symbol` 缓存、`markRaw`
    - 处理 setter：Stage 3 getter decorator 不直接接收 setter，需要通过原型链查找对应 setter
    - 返回新的 getter 函数替换原始 getter
    - _Bug_Condition: isBugCondition({ type: "computed" }) — decoratorSignature(Computed) == legacy AND runtime == TC39_Stage3_
    - _Expected_Behavior: Computed() 正确接收 Stage 3 参数 (value, context)，返回响应式缓存 getter 函数_
    - _Preservation: @Computed() 的响应式缓存行为、getter/setter 组合、多 Computed 独立缓存不变_
    - _Requirements: 2.1, 2.2, 3.3, 3.4, 3.5_

  - [x] 3.2 运行 `pnpm coverage` 验证 Computed 相关测试通过
    - **Property 1: Expected Behavior** - Computed 装饰器 Stage 3 兼容性
    - **IMPORTANT**: 重新运行与任务 1 相同的测试——不要编写新测试
    - 任务 1 中的测试编码了期望行为
    - 当测试通过时，确认期望行为已满足
    - 运行 `pnpm coverage` 确认 test20（demo.test.ts、demo2.test.ts、demo3.test.ts）和 test21 通过
    - **EXPECTED OUTCOME**: 测试通过（确认 Computed bug 已修复）
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 验证保持性测试仍然通过
    - **Property 2: Preservation** - 已通过测试和现有行为不变
    - **IMPORTANT**: 重新运行与任务 2 相同的测试——不要编写新测试
    - 运行 `pnpm coverage` 确认 test7-test10、test12-test14、test16-test19 仍然通过
    - **EXPECTED OUTCOME**: 测试通过（确认无回归）
    - 确认修复后所有保持性测试仍然通过（无回归）

- [x] 4. 任务 2：为 test1/DemoService.ts 添加 @Injectable()

  - [x] 4.1 修改 tests/test1/DemoService.ts
    - `import { Injectable } from '@/index'`（合并到现有 import）
    - 在类上添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService, ["PostConstruct"]) AND NOT classHasDecorator(DemoService, "Injectable")_
    - _Expected_Behavior: @PostConstruct 方法 init() 在实例化后被 DI 容器调用，computedName 正确初始化_
    - _Preservation: 不影响其他测试文件_
    - _Requirements: 2.3, 2.5_

  - [x] 4.2 运行 `pnpm coverage` 验证 test1 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test1）
    - **IMPORTANT**: 重新运行与任务 1 相同的测试——不要编写新测试
    - **EXPECTED OUTCOME**: test1 测试通过
    - _Requirements: 2.3, 2.5_

- [x] 5. 任务 3：为 test2/DemoService.ts 添加 @Injectable()

  - [x] 5.1 修改 tests/test2/DemoService.ts
    - `import { Injectable } from '@/index'`（合并到现有 import）
    - 在类上添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService, ["PostConstruct"]) AND NOT classHasDecorator(DemoService, "Injectable")_
    - _Expected_Behavior: @PostConstruct 方法 init() 被调用，computedName 正确初始化_
    - _Requirements: 2.3, 2.5_

  - [x] 5.2 运行 `pnpm coverage` 验证 test2 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test2）
    - **EXPECTED OUTCOME**: test2 测试通过
    - _Requirements: 2.3, 2.5_

- [x] 6. 任务 4：为 test3/DemoService.ts 添加 @Injectable()

  - [x] 6.1 修改 tests/test3/DemoService.ts
    - `import { Injectable } from '@/index'`（合并到现有 import）
    - 在类上添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService, ["Inject"]) AND NOT classHasDecorator(DemoService, "Injectable")_
    - _Expected_Behavior: @Inject(LazyToken) 属性 otherService 正确解析为服务实例_
    - _Requirements: 2.3_

  - [x] 6.2 运行 `pnpm coverage` 验证 test3 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test3）
    - **EXPECTED OUTCOME**: test3 测试通过
    - _Requirements: 2.3_

- [x] 7. 任务 5：为 test4/ParentService.ts 和 test4/ChildService.ts 添加 @Injectable()

  - [x] 7.1 修改 tests/test4/ParentService.ts 和 tests/test4/ChildService.ts
    - 两个文件都添加 `import { Injectable } from '@/index'`（合并到现有 import）
    - 两个类都添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(ParentService/ChildService, ["Inject"]) AND NOT classHasDecorator(class, "Injectable")_
    - _Expected_Behavior: @Inject 属性在父子服务中正确解析_
    - _Requirements: 2.3, 2.4_

  - [x] 7.2 运行 `pnpm coverage` 验证 test4 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test4）
    - **EXPECTED OUTCOME**: test4 测试通过
    - _Requirements: 2.3, 2.4_

- [x] 8. 任务 6：为 test5/DemoService.ts 添加 @Injectable()

  - [x] 8.1 修改 tests/test5/DemoService.ts
    - `import { Injectable } from '@/index'`（合并到现有 import）
    - 在类上添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService, ["Inject", "PostConstruct"]) AND NOT classHasDecorator(DemoService, "Injectable")_
    - _Expected_Behavior: @Inject 和 @PostConstruct 均正确工作_
    - _Requirements: 2.3, 2.5_

  - [x] 8.2 运行 `pnpm coverage` 验证 test5 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test5）
    - **EXPECTED OUTCOME**: test5 测试通过
    - _Requirements: 2.3, 2.5_

- [x] 9. 任务 7：为 test6/DemoService.ts 添加 @Injectable()

  - [x] 9.1 修改 tests/test6/DemoService.ts
    - `import { Injectable } from '@/index'`（合并到现有 import）
    - 在类上添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService, ["Inject", "PostConstruct"]) AND NOT classHasDecorator(DemoService, "Injectable")_
    - _Expected_Behavior: @Inject 和 @PostConstruct 均正确工作_
    - _Requirements: 2.3, 2.5_

  - [x] 9.2 运行 `pnpm coverage` 验证 test6 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test6）
    - **EXPECTED OUTCOME**: test6 测试通过
    - _Requirements: 2.3, 2.5_

- [x] 10. 任务 8：为 test11/DemoService.ts 添加 @Injectable()

  - [x] 10.1 修改 tests/test11/DemoService.ts
    - `import { Injectable } from '@/index'`（合并到现有 import）
    - 在类上添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService, ["Inject"]) AND NOT classHasDecorator(DemoService, "Injectable")_
    - _Expected_Behavior: @Inject(TYPES.route) 和 @Inject(TYPES.router) 属性正确解析_
    - _Requirements: 2.3_

  - [x] 10.2 运行 `pnpm coverage` 验证 test11 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test11）
    - **EXPECTED OUTCOME**: test11 测试通过
    - _Requirements: 2.3_

- [x] 11. 任务 9：为 test15 添加 @Injectable() 并更新错误信息断言

  - [x] 11.1 修改 tests/test15/DemoService.ts
    - `import { Injectable } from '@/index'`（合并到现有 import）
    - 在类上添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService, ["PostConstruct"]) AND NOT classHasDecorator(DemoService, "Injectable")_
    - _Expected_Behavior: @PostConstruct 方法 test1() 在 DI 容器实例化后被调用，mount(DemoComp) 正确传播 'something wrong' 错误_
    - _Requirements: 2.5, 2.7_

  - [x] 11.2 修改 tests/test15/demo.test.ts
    - 添加 `import { ERRORS } from '@kaokei/di/dist/constants'`
    - 内联类中使用了 `@PostConstruct()` 的添加 `@Injectable()`（需要 `import { Injectable } from '@/index'`）
    - 将硬编码的错误信息字符串 `'Cannot apply @PostConstruct decorator multiple times in the same class'` 替换为 `ERRORS.POST_CONSTRUCT`
    - _Bug_Condition: isBugCondition({ type: "assertion" }) — expectedMessage != actualMessage_
    - _Expected_Behavior: 断言使用 ERRORS.POST_CONSTRUCT 常量，与 @kaokei/di 实际错误信息匹配_
    - _Requirements: 2.6, 2.7_

  - [x] 11.3 运行 `pnpm coverage` 验证 test15 通过
    - **Property 1: Expected Behavior** - Injectable 补全 + 错误信息断言匹配（test15）
    - **EXPECTED OUTCOME**: test15 所有测试用例通过
    - _Requirements: 2.5, 2.6, 2.7_

- [x] 12. 任务 10：为 test22/DemoService.ts 和 test22/DemoServiceBase.ts 添加 @Injectable()

  - [x] 12.1 修改 tests/test22/DemoService.ts 和 tests/test22/DemoServiceBase.ts
    - `tests/test22/DemoService.ts`：`import { Injectable } from '@/index'`（合并到现有 import），添加 `@Injectable()`
    - `tests/test22/DemoServiceBase.ts`：`import { Injectable } from '@kaokei/di'`（合并到现有 import，注意此文件从 `@kaokei/di` 导入），添加 `@Injectable()`
    - _Bug_Condition: isBugCondition({ type: "injectable" }) — classHasMemberDecorators(DemoService/DemoServiceBase, ["Inject", "PostConstruct"]) AND NOT classHasDecorator(class, "Injectable")_
    - _Expected_Behavior: 继承链中 @Inject 和 @PostConstruct 均正确工作_
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 12.2 运行 `pnpm coverage` 验证 test22 通过
    - **Property 1: Expected Behavior** - Injectable 装饰器补全（test22 继承链）
    - **EXPECTED OUTCOME**: test22 测试通过
    - _Requirements: 2.3, 2.4, 2.5_

- [x] 13. 任务 11：运行完整测试套件验证所有 33 个测试用例通过
  - 运行 `pnpm coverage` 验证全部测试通过
  - 确认所有 33 个测试用例通过，0 个失败
  - 确认保持性：test7-test10、test12-test14、test16-test19 仍然通过（无回归）
  - 确认修复：test1-test6、test11、test15、test20-test22 全部通过
  - 如有问题，询问用户
