import { ComputedPlanAEager } from './computed-plan-a-eager';
import { reactive, isRef } from 'vue';

describe('Plan_A_Eager — 基础功能', () => {
  // 测试：getter 返回值与原始 getter 计算结果一致（需求 1.1, 1.4）
  it('getter 返回值与原始计算结果一致', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 在 reactive 代理上访问 getter，返回值应与原始计算结果一致
    expect(reactiveDemo.age).toBe(111); // 1 + 10 + 100 = 111
  });

  // 测试：首次访问后，后续访问不再调用原始 getter（需求 1.2）
  it('缓存行为 — 后续访问不调用原始 getter', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const spyOnComputeAge = vi.spyOn(DemoService.prototype, 'computeAge');

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // Plan_A_Eager 在 addInitializer 阶段创建了 ComputedRef，
    // 但 Vue 的 computed() 是惰性的，创建时不会立即求值，
    // 所以 new 之后 computeAge 未被调用（callsAfterNew = 0）。
    const callsAfterNew = spyOnComputeAge.mock.calls.length;
    expect(callsAfterNew).toBe(0);

    // 首次访问：通过 Auto_Unwrap 读取 ComputedRef.value，触发惰性求值，computeAge 被调用一次
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledTimes(1);

    // 后续多次访问，依赖未变化，不应再调用原始 getter（computed 缓存生效）
    expect(reactiveDemo.age).toBe(111);
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledTimes(1);
  });

  // 测试：提前创建验证 — addInitializer 后已有 ComputedRef（需求 1.8）
  it('提前创建验证 — addInitializer 后已有 ComputedRef', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();

    // 实例创建完成后（new 之后、reactive 之前），实例上应已存在同名的数据属性（ComputedRef）
    const descriptor = Object.getOwnPropertyDescriptor(demo, 'age');
    expect(descriptor).toBeDefined();
    expect(descriptor!.value).toBeDefined();
    expect(isRef(descriptor!.value)).toBe(true);
  });

  // 测试：首次访问直接返回预创建的值（需求 1.9）
  it('首次访问直接返回预创建的值，无需额外初始化', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问时无需额外初始化逻辑，直接返回已预先创建的 ComputedRef 的值
    expect(reactiveDemo.age).toBe(11);

    // 验证原始实例上的 ComputedRef 在 new 阶段就已创建
    const descriptor = Object.getOwnPropertyDescriptor(demo, 'age');
    expect(descriptor).toBeDefined();
    expect(isRef(descriptor!.value)).toBe(true);
  });

  // 测试：仅处理 getter 装饰器（需求 1.5）
  it('仅处理 getter 装饰器', () => {
    // ComputedPlanAEager 的类型签名限制了它只能应用于 getter
    // 通过运行时验证：装饰器返回的函数返回 void（不替换 getter）
    const decorator = ComputedPlanAEager();
    expect(typeof decorator).toBe('function');

    // 模拟一个 getter 函数
    const originalGetter = function (this: any) {
      return 42;
    };

    // 模拟 ClassGetterDecoratorContext
    const mockContext = {
      kind: 'getter' as const,
      name: 'testProp',
      static: false,
      private: false,
      addInitializer: vi.fn(),
      access: { get: vi.fn(), has: vi.fn() },
      metadata: {},
    } as unknown as ClassGetterDecoratorContext;

    // 装饰器应返回 void（不替换 getter 函数）
    const result = decorator(originalGetter, mockContext);
    expect(result).toBeUndefined();
  });

  // 测试：Auto_Unwrap 验证（需求 1.4）
  it('Auto_Unwrap — 返回自动解包后的值', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 在 reactive 代理上访问属性时，返回的应该是自动解包后的值（number 类型）
    const value = reactiveDemo.age;
    expect(typeof value).toBe('number');
    expect(value).toBe(111);

    // 确认不是 ComputedRef 对象
    expect(isRef(value)).toBe(false);
  });
});


// ============================================================================
// 属性测试（Property-Based Tests）
// ============================================================================

import fc from 'fast-check';
import { PBT_NUM_RUNS, arbInitialValue } from '../computed-helpers';

describe('Plan_A_Eager — 属性测试', () => {
  /**
   * Feature: computed-decorator-redesign, Property 1
   * Plan_A 同名属性替代与自动解包
   *
   * 对于任意被 @ComputedPlanAEager() 装饰的 getter 属性，
   * 在 Reactive_Proxy 上访问该属性时，应返回与原始 getter 计算结果相同的原始值
   * （非 ComputedRef 对象），且该值的类型与 getter 返回类型一致。
   *
   * **Validates: Requirements 1.1, 1.4**
   */
  it('Feature: computed-decorator-redesign, Property 1 — Plan_A 同名属性替代与自动解包', () => {
    fc.assert(
      fc.property(arbInitialValue, (initialId) => {
        // 使用随机初始值构造类
        class DemoService {
          public id = initialId;

          @ComputedPlanAEager()
          public get age() {
            return this.id + 10 + 100;
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        // 期望的原始计算结果
        const expected = initialId + 10 + 100;

        // 在 Reactive_Proxy 上访问属性，应返回与原始 getter 计算结果相同的值
        const actual = reactiveDemo.age;
        expect(actual).toBe(expected);

        // 返回值应为原始类型（number），而非 ComputedRef 对象
        expect(typeof actual).toBe('number');
        expect(isRef(actual)).toBe(false);
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  /**
   * Feature: computed-decorator-redesign, Property 2
   * Plan_A 后续访问不调用原始 getter
   *
   * 对于任意被 Plan_A_Eager 装饰的 getter 属性，
   * 在 Reactive_Proxy 上首次访问后，后续的多次访问不应再调用原始 getter 函数
   * （在依赖未变化的情况下），即原始 getter 的调用次数应为 1。
   *
   * **Validates: Requirements 1.2**
   */
  it('Feature: computed-decorator-redesign, Property 2 — Plan_A 后续访问不调用原始 getter', () => {
    fc.assert(
      fc.property(
        arbInitialValue,
        fc.integer({ min: 2, max: 10 }),
        (initialId, accessCount) => {
          // 用于追踪原始 getter 调用次数的计数器
          let getterCallCount = 0;

          class DemoService {
            public id = initialId;

            @ComputedPlanAEager()
            public get age() {
              getterCallCount++;
              return this.id + 10;
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          // 首次访问，触发 computed 惰性求值
          const firstValue = reactiveDemo.age;
          expect(firstValue).toBe(initialId + 10);

          // 首次访问后，getter 应被调用恰好 1 次
          expect(getterCallCount).toBe(1);

          // 后续多次访问（依赖未变化），不应再调用原始 getter
          for (let i = 0; i < accessCount; i++) {
            const value = reactiveDemo.age;
            expect(value).toBe(initialId + 10);
          }

          // 原始 getter 的调用次数仍然为 1
          expect(getterCallCount).toBe(1);
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  /**
   * Feature: computed-decorator-redesign, Property 4
   * Plan_A_Eager 提前创建时机
   *
   * 对于任意被 @ComputedPlanAEager() 装饰的 getter 属性，
   * 在 addInitializer 回调执行完成后（即构造函数完成后），
   * 实例上应已存在同名的 ComputedRef 数据属性，无需等待首次访问。
   *
   * **Validates: Requirements 1.8, 1.9**
   */
  it('Feature: computed-decorator-redesign, Property 4 — Plan_A_Eager 提前创建时机', () => {
    fc.assert(
      fc.property(arbInitialValue, (initialId) => {
        class DemoService {
          public id = initialId;

          @ComputedPlanAEager()
          public get age() {
            return this.id + 10;
          }
        }

        const demo = new DemoService();

        // 构造函数完成后（addInitializer 已执行），
        // 实例上应已存在同名的 ComputedRef 数据属性
        const descriptor = Object.getOwnPropertyDescriptor(demo, 'age');
        expect(descriptor).toBeDefined();
        expect(descriptor!.value).toBeDefined();
        expect(isRef(descriptor!.value)).toBe(true);

        // 包装为 reactive 后，首次访问直接返回预创建的值，无需额外初始化
        const reactiveDemo = reactive(demo);
        const actual = reactiveDemo.age;
        expect(actual).toBe(initialId + 10);

        // 返回值应为原始类型，Auto_Unwrap 自动解包
        expect(typeof actual).toBe('number');
        expect(isRef(actual)).toBe(false);
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
