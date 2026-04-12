# 实施计划：@EffectScope 方法装饰器

## 概述

将设计文档中的 `@EffectScope` 方法装饰器转化为增量实现步骤。每个任务构建在前一个任务之上，从核心装饰器实现开始，逐步添加测试覆盖，最后完成导出变更和集成验证。

## 任务

- [x] 1. 实现 `@EffectScope` 装饰器核心逻辑
  - [x] 1.1 创建 `src/effect-scope.ts` 文件，实现 `effectScopeDecorator` 内部函数
    - 导入 `effectScope` from `vue` 和 `getEffectScope` from `./scope.ts`
    - 实现包装方法：获取 Root_Scope → 在 Root_Scope 内创建 Child_Scope → 在 Child_Scope.run() 中执行原始方法体 → 返回 Child_Scope
    - 定义 `VoidMethod` 类型约束被装饰方法返回 `void`
    - _需求：1.1, 1.2, 4.1, 4.2_

  - [x] 1.2 实现 `EffectScope` 导出函数，支持 `@EffectScope` 和 `@EffectScope()` 双调用风格
    - 使用函数重载签名：不带括号时 `value` 为函数且 `context.kind === 'method'`，直接调用 `effectScopeDecorator`；带括号时返回 `effectScopeDecorator`
    - 参考 `src/computed.ts` 和 `src/raw.ts` 的双调用风格实现模式
    - _需求：6.1, 6.2, 6.3_

- [x] 2. 修改公共 API 导出
  - [x] 2.1 修改 `src/index.ts`：新增 `export { EffectScope } from './effect-scope.ts'`，移除 `export { getEffectScope } from './scope.ts'`
    - _需求：9.1, 9.2, 9.3_

- [x] 3. 检查点 — 确保编译通过
  - 确保所有文件无 TypeScript 编译错误，如有问题请询问用户。

- [x] 4. 编写基础功能与调用风格测试
  - [x] 4.1 创建 `tests/effect-scope/basic.test.ts`，编写基础功能单元测试
    - 测试 `@EffectScope` 装饰的方法被调用后，方法体内的 `watchEffect` 副作用被收集到返回的 Child_Scope 中
    - 测试返回值是活跃的 Vue `EffectScope` 实例（具有 `active`、`run`、`stop` 属性）
    - 测试实例化后被装饰方法不会自动执行（方法体执行次数为 0）
    - 使用 `@/index` 导入 `EffectScope`，使用 `reactive` 包裹实例
    - 参考 `tests/raw/raw.test.ts` 和 `tests/computed-plan-a-lazy/basic.test.ts` 的测试风格
    - _需求：1.1, 1.2, 2.1, 2.2, 4.1_

  - [x] 4.2 在 `tests/effect-scope/basic.test.ts` 中添加装饰器调用风格测试
    - 测试 `@EffectScope`（不带括号）正确装饰方法
    - 测试 `@EffectScope()`（带括号）正确装饰方法
    - _需求：6.1, 6.2_

  - [x] 4.3 在 `tests/effect-scope/basic.test.ts` 中添加属性测试：副作用收集到 Child_Scope
    - **Property 1：副作用收集到 Child_Scope**
    - 使用 `fast-check` 生成随机副作用数量 N（1~10），在方法体内创建 N 个 `watchEffect`，验证返回的 `scope.effects` 长度等于 N
    - **验证：需求 1.1, 1.2, 2.2**

  - [x] 4.4 在 `tests/effect-scope/basic.test.ts` 中添加属性测试：返回 Child_Scope 实例
    - **Property 3：返回 Child_Scope 实例**
    - 对任意调用，验证返回值具有 `active === true`、`run`、`stop` 属性
    - **验证：需求 4.1**

  - [x] 4.5 在 `tests/effect-scope/basic.test.ts` 中添加属性测试：实例化不自动执行
    - **Property 4：实例化不自动执行**
    - 使用计数器追踪方法体执行次数，实例化后验证计数器为 0
    - **验证：需求 2.1**

- [x] 5. 编写累加语义与每次调用返回新 scope 测试
  - [x] 5.1 创建 `tests/effect-scope/accumulation.test.ts`，编写累加语义单元测试
    - 测试多次调用同一方法，每次返回不同的 Child_Scope 实例（引用不相等）
    - 测试多次调用后，之前调用产生的副作用仍然活跃（未被清理）
    - _需求：3.1, 3.2_

  - [x] 5.2 在 `tests/effect-scope/accumulation.test.ts` 中添加属性测试：每次调用返回新的 Child_Scope
    - **Property 2：每次调用返回新的 Child_Scope**
    - 使用 `fast-check` 生成随机调用次数 N（2~10），验证 N 次调用返回 N 个不同的 scope 实例，且每个 scope 都是活跃的
    - **验证：需求 3.1, 3.2, 5.3**

- [x] 6. 编写 scope 隔离性与 @Computed 共存测试
  - [x] 6.1 创建 `tests/effect-scope/isolation.test.ts`，编写 scope 隔离性单元测试
    - 测试同一实例上多个 `@EffectScope` 方法的 Child_Scope 互相独立，stop 一个不影响另一个
    - 测试 `@EffectScope` 方法的 Child_Scope 被 stop 后，`@Computed` 创建的 computed 属性继续正常响应式更新
    - 使用 `@/index` 导入 `EffectScope` 和 `Computed`，使用 `@/scope` 导入 `getScope`
    - _需求：5.1, 5.2, 8.1, 8.2_

  - [x] 6.2 在 `tests/effect-scope/isolation.test.ts` 中添加属性测试：Scope 隔离性
    - **Property 5：Scope 隔离性**
    - 构造同时包含 `@EffectScope` 方法和 `@Computed` getter 的类，stop 某个 Child_Scope 后验证其他 scope 仍活跃，computed 属性仍正常更新
    - **验证：需求 5.1, 5.2, 8.1, 8.2**

- [x] 7. 编写生命周期与级联清理测试
  - [x] 7.1 创建 `tests/effect-scope/lifecycle.test.ts`，编写 stop 与重建单元测试
    - 测试 Child_Scope 被 stop 后，再次调用方法返回新的活跃 Child_Scope，且新 scope 能正常收集副作用
    - 测试通过 `removeScope(obj)` 停止 Root_Scope 后，所有 Child_Scope 都变为 inactive
    - 使用 `@/scope` 导入 `removeScope`
    - _需求：5.3, 7.1_

  - [x] 7.2 在 `tests/effect-scope/lifecycle.test.ts` 中添加属性测试：Stop 不影响后续调用
    - **Property 6：Stop 不影响后续调用**
    - stop 某个 Child_Scope 后再次调用方法，验证返回新的活跃 scope 且能收集副作用
    - **验证：需求 5.3**

  - [x] 7.3 在 `tests/effect-scope/lifecycle.test.ts` 中添加属性测试：级联清理
    - **Property 7：级联清理**
    - 使用 `fast-check` 生成随机调用次数，创建多个 Child_Scope 后调用 `removeScope(obj)`，验证所有 Child_Scope 的 `active` 都为 `false`
    - **验证：需求 7.1**

- [x] 8. 编写导出检查测试
  - [x] 8.1 创建 `tests/effect-scope/export.test.ts`，编写导出冒烟测试
    - 验证 `@/index` 导出了 `EffectScope`
    - 验证 `@/index` 不再导出 `getEffectScope`
    - 验证 `@/scope` 仍然导出 `getEffectScope` 供内部使用
    - _需求：9.1, 9.2, 9.3_

- [x] 9. 最终检查点 — 确保所有测试通过
  - 运行 `vitest run tests/effect-scope/` 确保所有测试通过，如有问题请询问用户。

## 说明

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 开发
- 每个任务引用了具体的需求条款以确保可追溯性
- 检查点确保增量验证
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
