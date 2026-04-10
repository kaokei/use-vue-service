import { ComputedPlanAEager } from './computed-plan-a-eager';
import { reactive, watchEffect, nextTick, effectScope } from 'vue';

describe('Plan_A_Eager — 响应式能力', () => {
  // 测试：依赖变化后重新计算（需求 3.1）
  it('依赖变化后重新计算', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.age).toBe(11);

    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);

    reactiveDemo.id = 100;
    expect(reactiveDemo.age).toBe(110);
  });

  // 测试：watchEffect 中的响应式追踪（需求 3.2）
  it('watchEffect 中的响应式追踪', async () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const collected: number[] = [];
    const scope = effectScope();

    scope.run(() => {
      watchEffect(() => {
        collected.push(reactiveDemo.age);
      });
    });

    // watchEffect 立即执行一次
    expect(collected).toEqual([11]);

    // 修改依赖属性
    reactiveDemo.id = 2;
    await nextTick();

    expect(collected).toEqual([11, 12]);

    // 再次修改依赖属性
    reactiveDemo.id = 5;
    await nextTick();

    expect(collected).toEqual([11, 12, 15]);

    // 清理 scope
    scope.stop();
  });

  // 测试：多 getter 独立缓存（需求 3.3）
  it('多 getter 独立缓存', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }

      @ComputedPlanAEager()
      public get score() {
        return this.id * 2;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 初始值
    expect(reactiveDemo.age).toBe(11);
    expect(reactiveDemo.score).toBe(2);

    // 修改共享依赖
    reactiveDemo.id = 5;

    // 每个 getter 独立返回各自正确的计算结果
    expect(reactiveDemo.age).toBe(15);
    expect(reactiveDemo.score).toBe(10);

    // 再次修改
    reactiveDemo.id = 10;
    expect(reactiveDemo.age).toBe(20);
    expect(reactiveDemo.score).toBe(20);
  });

  // 测试：连续多次修改依赖（需求 3.1）
  it('连续多次修改依赖，每次访问 getter 都返回正确的最新值', () => {
    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    expect(reactiveDemo.age).toBe(11);

    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);

    reactiveDemo.id = 3;
    expect(reactiveDemo.age).toBe(13);

    reactiveDemo.id = 100;
    expect(reactiveDemo.age).toBe(110);

    reactiveDemo.id = -5;
    expect(reactiveDemo.age).toBe(5);

    reactiveDemo.id = 0;
    expect(reactiveDemo.age).toBe(10);
  });

  // 测试：缓存有效性 — 依赖未变化时不重新计算（需求 3.1）
  it('缓存有效性 — 依赖未变化时不重新计算', () => {
    const computeAgeFn = vi.fn();

    class DemoService {
      public id = 1;

      @ComputedPlanAEager()
      public get age() {
        computeAgeFn();
        return this.id + 10;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // Plan_A_Eager 在 addInitializer 阶段创建了 ComputedRef，
    // 但 Vue 的 computed() 是惰性的，创建时不会立即求值，
    // 所以 new 之后 computeAgeFn 未被调用。
    const callsAfterNew = computeAgeFn.mock.calls.length;
    expect(callsAfterNew).toBe(0);

    // 首次访问：触发惰性求值，computeAgeFn 被调用一次
    expect(reactiveDemo.age).toBe(11);
    expect(computeAgeFn).toHaveBeenCalledTimes(1);

    // 依赖未变化，多次访问不应重新计算
    expect(reactiveDemo.age).toBe(11);
    expect(reactiveDemo.age).toBe(11);
    expect(reactiveDemo.age).toBe(11);
    expect(computeAgeFn).toHaveBeenCalledTimes(1);

    // 修改依赖后，访问应触发重新计算
    reactiveDemo.id = 2;
    expect(reactiveDemo.age).toBe(12);
    expect(computeAgeFn).toHaveBeenCalledTimes(2);

    // 依赖再次未变化，多次访问不应重新计算
    expect(reactiveDemo.age).toBe(12);
    expect(reactiveDemo.age).toBe(12);
    expect(computeAgeFn).toHaveBeenCalledTimes(2);
  });
});


// ============================================================================
// 属性测试（Property-Based Tests）
// ============================================================================

import fc from 'fast-check';
import {
  PBT_NUM_RUNS,
  arbInitialValue,
} from '../computed-helpers';

describe('Plan_A_Eager — 属性测试（响应式）', () => {
  /**
   * Feature: computed-decorator-redesign, Property 6
   * 响应式依赖追踪与重新计算
   *
   * 对于任意被 Computed_Decorator（Plan_A_Eager）装饰的 getter 属性，
   * 当 getter 函数的依赖属性值发生变化时，通过 Reactive_Proxy 访问该 getter 属性
   * 应返回基于新依赖值的重新计算结果。
   *
   * **Validates: Requirements 3.1, 3.3**
   */
  it('Feature: computed-decorator-redesign, Property 6 — 响应式依赖追踪与重新计算', () => {
    fc.assert(
      fc.property(
        arbInitialValue,
        // 生成 1~5 次变更值序列，每个值都在 [-1000, 1000] 范围内
        fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 5 }),
        (initialId, changeValues) => {
          class DemoService {
            public id = initialId;

            @ComputedPlanAEager()
            public get age() {
              return this.id + 10;
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          // 首次访问，验证初始计算结果
          expect(reactiveDemo.age).toBe(initialId + 10);

          // 依次修改依赖属性，每次修改后验证 getter 返回基于新依赖值的重新计算结果
          for (const newId of changeValues) {
            reactiveDemo.id = newId;
            expect(reactiveDemo.age).toBe(newId + 10);
          }
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  /**
   * Feature: computed-decorator-redesign, Property 7
   * 多 getter 独立缓存
   *
   * 对于任意类中被 Computed_Decorator 装饰的多个 getter 属性，
   * 即使它们共享同一个依赖属性，每个 getter 属性应独立维护各自的 ComputedRef 缓存，
   * 修改共享依赖后每个 getter 应独立返回各自的正确计算结果。
   *
   * **Validates: Requirements 3.3**
   */
  it('Feature: computed-decorator-redesign, Property 7 — 多 getter 独立缓存', () => {
    fc.assert(
      fc.property(
        arbInitialValue,
        fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1, maxLength: 5 }),
        (initialId, changeValues) => {
          // 定义两个 getter 使用不同的计算逻辑，但共享同一个依赖属性 id
          class MultiGetterService {
            public id = initialId;

            @ComputedPlanAEager()
            public get age() {
              return this.id + 10;
            }

            @ComputedPlanAEager()
            public get score() {
              return this.id * 2;
            }
          }

          const service = new MultiGetterService();
          const reactiveService = reactive(service);

          // 首次访问，验证各 getter 的初始计算结果
          expect(reactiveService.age).toBe(initialId + 10);
          expect(reactiveService.score).toBe(initialId * 2);

          // 依次修改共享依赖属性，验证每个 getter 独立返回各自的正确计算结果
          for (const newId of changeValues) {
            reactiveService.id = newId;
            expect(reactiveService.age).toBe(newId + 10);
            expect(reactiveService.score).toBe(newId * 2);
          }
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
