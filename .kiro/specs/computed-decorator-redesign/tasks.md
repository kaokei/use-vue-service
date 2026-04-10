# 实现计划：@Computed 装饰器重新设计

## 概述

本实现计划采用"测试先行"策略：先编写全面的单元测试用例覆盖所有需求场景，然后依次实现三种方案（Plan_A_Lazy、Plan_A_Eager、Plan_B），通过测试结果对比各方案的优劣，最终编写对比文档。

测试框架：Vitest + fast-check（属性测试）
语言：TypeScript
源码目录：src/
测试目录：tests/

## 任务

- [x] 1. 搭建测试基础设施与公共工具
  - [x] 1.1 创建测试辅助工具文件 `tests/computed-helpers.ts`
    - 定义公共的测试辅助类（如带 getter 的 DemoService 基类模板）
    - 定义 fast-check 的公共 arbitrary（如 `fc.integer({ min: -1000, max: 1000 })` 用于生成随机初始值）
    - 定义公共常量 `PBT_NUM_RUNS = 100`
    - 导出三种方案的装饰器类型别名，方便测试文件统一引用
    - _需求：8.2_

  - [x] 1.2 在 `src/index.ts` 中预留三种方案的导出声明（暂时注释或使用占位）
    - 添加 `ComputedPlanALazy`、`ComputedPlanAEager`、`ComputedPlanB` 的导出
    - 确保测试文件可以通过 `@/index` 或直接路径导入
    - _需求：8.1_

- [x] 2. 编写 Plan_A_Lazy 的全面测试用例
  - [x] 2.1 创建 `tests/computed-plan-a-lazy/basic.test.ts` — 基础功能测试
    - 测试：getter 返回值与原始 getter 计算结果一致（非 ComputedRef 对象）
    - 测试：首次访问后，后续访问不再调用原始 getter（依赖未变化时）
    - 测试：首次访问前实例上不存在同名 ComputedRef 数据属性（懒创建验证）
    - 测试：首次访问后实例上存在同名 ComputedRef 数据属性
    - 测试：仅处理 getter 装饰器，不处理 setter 和 accessor
    - _需求：1.1, 1.2, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.2 在 `tests/computed-plan-a-lazy/basic.test.ts` 中编写属性测试
    - **Property 1：Plan_A 同名属性替代与自动解包**
    - **Property 2：Plan_A 后续访问不调用原始 getter**
    - **Property 3：Plan_A_Lazy 懒创建时机**
    - **验证：需求 1.1, 1.2, 1.4, 1.6, 1.7**

  - [x] 2.3 创建 `tests/computed-plan-a-lazy/reactive.test.ts` — 响应式能力测试
    - 测试：修改依赖属性后，getter 返回新的计算结果
    - 测试：在 watchEffect 中访问 getter 属性，依赖变化时回调被触发
    - 测试：多个 getter 共享同一依赖属性时，各自独立维护缓存
    - 测试：连续多次修改依赖属性，每次访问 getter 都返回正确的最新值
    - _需求：3.1, 3.2, 3.3_

  - [ ]* 2.4 在 `tests/computed-plan-a-lazy/reactive.test.ts` 中编写属性测试
    - **Property 6：响应式依赖追踪与重新计算**
    - **Property 7：多 getter 独立缓存**
    - **验证：需求 3.1, 3.3**

  - [x] 2.5 创建 `tests/computed-plan-a-lazy/multi-instance.test.ts` — 多实例隔离测试
    - 测试：同一类的两个实例，修改实例 A 的依赖不影响实例 B 的 getter 返回值
    - 测试：多个实例各自独立创建 ComputedRef 缓存
    - 测试：三个及以上实例的隔离性
    - _需求：6.1, 6.2_

  - [ ]* 2.6 在 `tests/computed-plan-a-lazy/multi-instance.test.ts` 中编写属性测试
    - **Property 8：多实例隔离**
    - **验证：需求 6.1, 6.2**

  - [x] 2.7 创建 `tests/computed-plan-a-lazy/inheritance.test.ts` — 继承场景测试
    - 测试：子类继承父类 getter 且未覆盖时，子类实例正确创建独立 ComputedRef
    - 测试：子类覆盖父类 getter 时，使用子类的 getter 实现计算
    - 测试：多层继承场景（祖父类 → 父类 → 子类）
    - _需求：10.1, 10.2_

  - [ ]* 2.8 在 `tests/computed-plan-a-lazy/inheritance.test.ts` 中编写属性测试
    - **Property 9：继承场景 — 未覆盖 getter**
    - **Property 10：继承场景 — 覆盖 getter**
    - **验证：需求 10.1, 10.2**

  - [x] 2.9 创建 `tests/computed-plan-a-lazy/scope.test.ts` — EffectScope 管理测试
    - 测试：ComputedRef 在 EffectScope.run 中创建
    - 测试：getEffectScope 自动创建新 scope
    - 测试：scope.stop() 后 ComputedRef 不再响应式更新
    - _需求：1.3, 5.1, 5.2, 5.3_

  - [x] 2.10 创建 `tests/computed-plan-a-lazy/non-reactive.test.ts` — 非 reactive 场景研究性测试
    - 测试：在非 Reactive_Proxy 实例上访问 getter 的行为
    - 测试：记录非 reactive 场景下的具体表现（缓存但不响应式更新等）
    - _需求：9.1, 9.2_

- [x] 3. 编写 Plan_A_Eager 的全面测试用例
  - [x] 3.1 创建 `tests/computed-plan-a-eager/basic.test.ts` — 基础功能测试
    - 测试：getter 返回值与原始 getter 计算结果一致（非 ComputedRef 对象）
    - 测试：首次访问后，后续访问不再调用原始 getter（依赖未变化时）
    - 测试：addInitializer 回调执行后，实例上已存在同名 ComputedRef 数据属性（提前创建验证）
    - 测试：首次访问直接返回已预先创建的值，无需额外初始化
    - 测试：仅处理 getter 装饰器
    - _需求：1.1, 1.2, 1.4, 1.5, 1.8, 1.9_

  - [ ]* 3.2 在 `tests/computed-plan-a-eager/basic.test.ts` 中编写属性测试
    - **Property 1：Plan_A 同名属性替代与自动解包**
    - **Property 2：Plan_A 后续访问不调用原始 getter**
    - **Property 4：Plan_A_Eager 提前创建时机**
    - **验证：需求 1.1, 1.2, 1.4, 1.8, 1.9**

  - [x] 3.3 创建 `tests/computed-plan-a-eager/reactive.test.ts` — 响应式能力测试
    - 测试：修改依赖属性后，getter 返回新的计算结果
    - 测试：在 watchEffect 中访问 getter 属性，依赖变化时回调被触发
    - 测试：多个 getter 共享同一依赖属性时，各自独立维护缓存
    - 测试：连续多次修改依赖属性，每次访问 getter 都返回正确的最新值
    - _需求：3.1, 3.2, 3.3_

  - [ ]* 3.4 在 `tests/computed-plan-a-eager/reactive.test.ts` 中编写属性测试
    - **Property 6：响应式依赖追踪与重新计算**
    - **Property 7：多 getter 独立缓存**
    - **验证：需求 3.1, 3.3**

  - [x] 3.5 创建 `tests/computed-plan-a-eager/multi-instance.test.ts` — 多实例隔离测试
    - 测试：同一类的两个实例，修改实例 A 的依赖不影响实例 B 的 getter 返回值
    - 测试：多个实例各自独立创建 ComputedRef 缓存
    - _需求：6.1, 6.2_

  - [ ]* 3.6 在 `tests/computed-plan-a-eager/multi-instance.test.ts` 中编写属性测试
    - **Property 8：多实例隔离**
    - **验证：需求 6.1, 6.2**

  - [x] 3.7 创建 `tests/computed-plan-a-eager/inheritance.test.ts` — 继承场景测试
    - 测试：子类继承父类 getter 且未覆盖时，子类实例正确创建独立 ComputedRef
    - 测试：子类覆盖父类 getter 时，使用子类的 getter 实现计算
    - _需求：10.1, 10.2_

  - [ ]* 3.8 在 `tests/computed-plan-a-eager/inheritance.test.ts` 中编写属性测试
    - **Property 9：继承场景 — 未覆盖 getter**
    - **Property 10：继承场景 — 覆盖 getter**
    - **验证：需求 10.1, 10.2**

  - [x] 3.9 创建 `tests/computed-plan-a-eager/scope.test.ts` — EffectScope 管理测试
    - 测试：ComputedRef 在 EffectScope.run 中创建
    - 测试：getEffectScope 自动创建新 scope
    - 测试：scope.stop() 后 ComputedRef 不再响应式更新
    - _需求：1.3, 5.1, 5.2, 5.3_

  - [x] 3.10 创建 `tests/computed-plan-a-eager/non-reactive.test.ts` — 非 reactive 场景研究性测试
    - 测试：在非 Reactive_Proxy 实例上访问 getter 的行为
    - 测试：记录 Plan_A_Eager 在非 reactive 场景下的具体表现
    - _需求：9.1, 9.2_

- [x] 4. 编写 Plan_B 的全面测试用例
  - [x] 4.1 创建 `tests/computed-plan-b/basic.test.ts` — 基础功能测试
    - 测试：getter 返回值与原始 getter 计算结果一致
    - 测试：首次调用 getter 时创建 ComputedRef 并缓存
    - 测试：后续调用 getter 时复用同一个 ComputedRef 对象，computed() 仅调用一次
    - 测试：使用 Symbol 作为缓存 key，不与用户属性冲突
    - 测试：仅处理 getter 装饰器
    - _需求：2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.2 在 `tests/computed-plan-b/basic.test.ts` 中编写属性测试
    - **Property 5：Plan_B 缓存创建与复用**
    - **验证：需求 2.2, 2.3**

  - [x] 4.3 创建 `tests/computed-plan-b/reactive.test.ts` — 响应式能力测试
    - 测试：修改依赖属性后，getter 返回新的计算结果
    - 测试：在 watchEffect 中访问 getter 属性，依赖变化时回调被触发
    - 测试：多个 getter 共享同一依赖属性时，各自独立维护缓存
    - _需求：3.1, 3.2, 3.3_

  - [ ]* 4.4 在 `tests/computed-plan-b/reactive.test.ts` 中编写属性测试
    - **Property 6：响应式依赖追踪与重新计算**
    - **Property 7：多 getter 独立缓存**
    - **验证：需求 3.1, 3.3**

  - [x] 4.5 创建 `tests/computed-plan-b/multi-instance.test.ts` — 多实例隔离测试
    - 测试：同一类的两个实例，修改实例 A 的依赖不影响实例 B 的 getter 返回值
    - 测试：多个实例各自独立创建 ComputedRef 缓存
    - _需求：6.1, 6.2_

  - [ ]* 4.6 在 `tests/computed-plan-b/multi-instance.test.ts` 中编写属性测试
    - **Property 8：多实例隔离**
    - **验证：需求 6.1, 6.2**

  - [x] 4.7 创建 `tests/computed-plan-b/inheritance.test.ts` — 继承场景测试
    - 测试：子类继承父类 getter 且未覆盖时，子类实例正确创建独立 ComputedRef
    - 测试：子类覆盖父类 getter 时，使用子类的 getter 实现计算
    - _需求：10.1, 10.2_

  - [ ]* 4.8 在 `tests/computed-plan-b/inheritance.test.ts` 中编写属性测试
    - **Property 9：继承场景 — 未覆盖 getter**
    - **Property 10：继承场景 — 覆盖 getter**
    - **验证：需求 10.1, 10.2**

  - [x] 4.9 创建 `tests/computed-plan-b/scope.test.ts` — EffectScope 管理测试
    - 测试：ComputedRef 在 EffectScope.run 中创建
    - 测试：getEffectScope 自动创建新 scope
    - 测试：scope.stop() 后 ComputedRef 不再响应式更新
    - _需求：2.4, 5.1, 5.2, 5.3_

  - [x] 4.10 创建 `tests/computed-plan-b/non-reactive.test.ts` — 非 reactive 场景研究性测试
    - 测试：在非 Reactive_Proxy 实例上访问 getter 的行为
    - 测试：记录 Plan_B 在非 reactive 场景下的具体表现
    - _需求：9.1, 9.2_

- [x] 5. 编写三种方案行为对比测试
  - [x] 5.1 创建 `tests/computed-comparison/comparison.test.ts` — 对比测试
    - 测试：三种方案在相同输入下返回相同的计算结果
    - 测试：三种方案在依赖变化后都能正确重新计算
    - 测试：三种方案在多实例场景下都能正确隔离
    - 测试：三种方案在继承场景下的行为对比
    - 测试：三种方案在 Auto_Unwrap 行为上的差异（Plan_A 依赖 Auto_Unwrap，Plan_B 不依赖）
    - 测试：三种方案的 getter 调用次数对比（性能特征差异）
    - _需求：8.2, 8.3_

- [x] 6. 检查点 — 确认测试用例完整性
  - 确保所有测试文件已创建，覆盖所有需求场景
  - 确保所有测试用例此时应该全部失败（因为实现代码尚未编写）
  - 确保所有测试都通过，如有问题请询问用户

- [x] 7. 实现 Plan_A_Lazy（方案一 — 懒创建策略）
  - [x] 7.1 创建 `src/computed-plan-a-lazy.ts`
    - 实现 `ComputedPlanALazy` 工厂函数
    - 返回新的 getter 函数，首次访问时创建同名 ComputedRef 数据属性
    - 利用 `getEffectScope` 在 EffectScope 中创建 computed
    - 通过 `this[propertyName] = computedRef` 覆盖 getter
    - 确保 TypeScript 类型签名正确（符合 ClassGetterDecoratorContext）
    - _需求：1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1, 5.2, 7.1, 7.2_

  - [x] 7.2 在 `src/index.ts` 中添加 `ComputedPlanALazy` 的正式导出
    - _需求：8.1_

  - [x] 7.3 运行 Plan_A_Lazy 测试套件，验证实现正确性
    - 运行 `tests/computed-plan-a-lazy/` 下所有测试
    - 修复未通过的测试（如果是实现问题）
    - 记录测试通过/失败情况
    - _需求：1.10, 1.11_

- [x] 8. 检查点 — Plan_A_Lazy 实现验证
  - 确保所有测试都通过，如有问题请询问用户

- [x] 9. 实现 Plan_A_Eager（方案一 — 提前创建策略）
  - [x] 9.1 创建 `src/computed-plan-a-eager.ts`
    - 实现 `ComputedPlanAEager` 工厂函数
    - 通过 `context.addInitializer` 注册回调，在构造函数阶段创建 ComputedRef
    - 处理 `this` 引用问题（addInitializer 中 this 是原始实例，需确保响应式追踪正确）
    - 在 EffectScope 中创建 computed
    - 返回 void（不替换 getter 函数）
    - 确保 TypeScript 类型签名正确
    - _需求：1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 1.9, 5.1, 5.2, 7.1, 7.2_

  - [x] 9.2 在 `src/index.ts` 中添加 `ComputedPlanAEager` 的正式导出
    - _需求：8.1_

  - [x] 9.3 运行 Plan_A_Eager 测试套件，验证实现正确性
    - 运行 `tests/computed-plan-a-eager/` 下所有测试
    - 修复未通过的测试（如果是实现问题）
    - 记录测试通过/失败情况，特别关注 `this` 引用问题导致的响应式追踪失败
    - _需求：1.10, 1.11_

- [x] 10. 检查点 — Plan_A_Eager 实现验证
  - 确保所有测试都通过，如有问题请询问用户

- [x] 11. 实现 Plan_B（方案二 — 返回新 getter 函数）
  - [x] 11.1 创建 `src/computed-plan-b.ts`
    - 实现 `ComputedPlanB` 工厂函数
    - 返回新的 getter 函数替换原始 getter
    - 使用 Symbol 作为缓存 key，首次调用时创建 ComputedRef 并缓存
    - 在 EffectScope 中创建 computed
    - 手动返回 `computedRef.value`（不依赖 Auto_Unwrap）
    - 确保 TypeScript 类型签名正确
    - _需求：2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 7.1, 7.2_

  - [x] 11.2 在 `src/index.ts` 中添加 `ComputedPlanB` 的正式导出
    - _需求：8.1_

  - [x] 11.3 运行 Plan_B 测试套件，验证实现正确性
    - 运行 `tests/computed-plan-b/` 下所有测试
    - 修复未通过的测试（如果是实现问题）
    - 记录测试通过/失败情况
    - _需求：8.2_

- [x] 12. 检查点 — Plan_B 实现验证
  - 确保所有测试都通过，如有问题请询问用户

- [x] 13. 运行对比测试并收集结果
  - [x] 13.1 运行 `tests/computed-comparison/comparison.test.ts`
    - 验证三种方案在相同场景下的行为差异
    - 记录各方案的测试通过/失败情况
    - _需求：8.2, 8.3_

  - [x] 13.2 运行全量测试套件
    - 运行所有 `tests/computed-*` 目录下的测试
    - 汇总各方案的测试结果
    - _需求：8.2_

- [x] 14. 编写对比文档
  - [x] 14.1 创建 `docs/computed-comparison.md` — 三种方案对比文档
    - 记录三种方案的测试通过/失败汇总
    - 对比实现复杂度、运行时性能特征、内存占用特征
    - 对比 Auto_Unwrap 依赖性、TypeScript 类型推断表现
    - 对比与 Vue reactive 系统的兼容性
    - 记录 Plan_A_Lazy 与 Plan_A_Eager 的策略差异（初始化开销、首次访问性能、与 Reactive_Proxy 的交互行为）
    - 记录非 reactive 场景下的行为差异（标注为"研究性结论，不影响实现方案选择"）
    - 给出推荐方案及理由
    - _需求：1.12, 8.3, 9.2, 9.3_

- [x] 15. 最终检查点 — 确保所有测试通过
  - 确保所有测试都通过，如有问题请询问用户

## 说明

- 标记 `*` 的任务为可选任务（属性测试），可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证设计文档中定义的正确性属性（Property 1-10）
- 单元测试覆盖具体的使用场景和边界条件
- 测试先行策略确保可以通过测试结果客观对比三种方案的优劣
