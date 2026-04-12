import { Computed as ComputedPlanALazy } from '@/index';
import { reactive, ComputedRef, isRef } from 'vue';

describe('Plan_A_Lazy — 基础功能', () => {
  // 测试：getter 返回值与原始 getter 计算结果一致（需求 1.1, 1.4）
  it('getter 返回值与原始计算结果一致', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
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

      @ComputedPlanALazy()
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

    expect(spyOnComputeAge).not.toHaveBeenCalled();

    // 首次访问，触发 getter 计算
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledOnce();

    // 后续多次访问，依赖未变化，不应再调用原始 getter
    expect(reactiveDemo.age).toBe(111);
    expect(reactiveDemo.age).toBe(111);
    expect(spyOnComputeAge).toHaveBeenCalledOnce();
  });

  // 测试：首次访问前实例上不存在同名 ComputedRef 数据属性（需求 1.6, 1.7）
  it('懒创建验证 — 首次访问前无 ComputedRef', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 实例创建后、首次访问前，原始实例上不应存在同名的数据属性
    // 此时 age 应该仍然是原型链上的 getter，而非实例自身的数据属性
    const descriptor = Object.getOwnPropertyDescriptor(demo, 'age');
    expect(descriptor).toBeUndefined();
  });

  // 测试：首次访问后实例上存在同名 ComputedRef 数据属性（需求 1.6）
  it('懒创建验证 — 首次访问后有 ComputedRef', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
      public get age() {
        return this.computeAge() + 100;
      }

      public computeAge() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 首次访问前，实例上不存在同名数据属性
    expect(Object.getOwnPropertyDescriptor(demo, 'age')).toBeUndefined();

    // 在 reactive 代理上首次访问
    reactiveDemo.age;

    // 首次访问后，原始实例上应存在同名的数据属性（ComputedRef）
    const descriptor = Object.getOwnPropertyDescriptor(demo, 'age');
    expect(descriptor).toBeDefined();
    expect(descriptor!.value).toBeDefined();
    expect(isRef(descriptor!.value)).toBe(true);
  });

  // 测试：仅处理 getter 装饰器（需求 1.5）
  it('仅处理 getter 装饰器', () => {
    // ComputedPlanALazy 的类型签名限制了它只能应用于 getter
    // 通过运行时验证：装饰器返回的函数是一个新的 getter 函数
    const decorator = ComputedPlanALazy();
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

    // 装饰器应返回一个新的 getter 函数
    const result = decorator(originalGetter, mockContext);
    expect(typeof result).toBe('function');
  });

  // 测试：Auto_Unwrap 验证（需求 1.4）
  it('Auto_Unwrap — 返回自动解包后的值', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy()
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

describe('Plan_A_Lazy — 属性测试', () => {
  /**
   * Feature: computed-decorator-redesign, Property 1
   * Plan_A 同名属性替代与自动解包
   *
   * 对于任意被 @ComputedPlanALazy() 装饰的 getter 属性，
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

          @ComputedPlanALazy()
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
   * 对于任意被 Plan_A_Lazy 装饰的 getter 属性，
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

            @ComputedPlanALazy()
            public get age() {
              getterCallCount++;
              return this.id + 10;
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          // 首次访问，触发 getter 计算
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
   * Feature: computed-decorator-redesign, Property 3
   * Plan_A_Lazy 懒创建时机
   *
   * 对于任意被 @ComputedPlanALazy() 装饰的 getter 属性，
   * 在实例创建完成但尚未访问该属性时，实例上不应存在同名的 ComputedRef 数据属性；
   * 首次在 Reactive_Proxy 上访问该属性后，实例上应存在同名的 ComputedRef 数据属性。
   *
   * **Validates: Requirements 1.6, 1.7**
   */
  it('Feature: computed-decorator-redesign, Property 3 — Plan_A_Lazy 懒创建时机', () => {
    fc.assert(
      fc.property(arbInitialValue, (initialId) => {
        class DemoService {
          public id = initialId;

          @ComputedPlanALazy()
          public get age() {
            return this.id + 10;
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        // 实例创建后、首次访问前，原始实例上不应存在同名的数据属性
        const descriptorBefore = Object.getOwnPropertyDescriptor(demo, 'age');
        expect(descriptorBefore).toBeUndefined();

        // 在 Reactive_Proxy 上首次访问
        const value = reactiveDemo.age;
        expect(value).toBe(initialId + 10);

        // 首次访问后，原始实例上应存在同名的数据属性（ComputedRef）
        const descriptorAfter = Object.getOwnPropertyDescriptor(demo, 'age');
        expect(descriptorAfter).toBeDefined();
        expect(descriptorAfter!.value).toBeDefined();
        expect(isRef(descriptorAfter!.value)).toBe(true);
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});

describe('Plan_A_Lazy — 不带括号用法 @Computed', () => {
  it('不带括号：getter 返回值与原始计算结果一致', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy
      public get age() {
        return this.id + 10 + 100;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.age).toBe(111);
  });

  it('不带括号：依赖变化后重新计算', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanALazy
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.age).toBe(11);

    reactiveDemo.id = 5;
    expect(reactiveDemo.age).toBe(15);
  });
});
