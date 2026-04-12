import { reactive, watchEffect, ref } from 'vue';
import { RunInScope } from '@/index';
import fc from 'fast-check';

// ============================================================================
// 公共常量
// ============================================================================

const PBT_NUM_RUNS = 100;

// ============================================================================
// 基础功能单元测试
// ============================================================================

describe('RunInScope 装饰器 — 基础功能', () => {
  // 测试：方法体内的 watchEffect 副作用被收集到返回的 Child_Scope 中（需求 1.1, 1.2）
  it('方法体内的 watchEffect 副作用被收集到返回的 Child_Scope 中', () => {
    class DemoService {
      public count = 0;

      @RunInScope
      public setup() {
        watchEffect(() => {
          // 读取 count 以建立依赖
          void this.count;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup();

    // 返回的 scope 应包含 1 个副作用
    expect(scope.effects.length).toBe(1);
  });

  // 测试：返回值是活跃的 Vue EffectScope 实例（需求 4.1）
  it('返回值是活跃的 Vue EffectScope 实例', () => {
    class DemoService {
      @RunInScope
      public setup() {
        watchEffect(() => {});
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup();

    // 验证返回值具有 active、run、stop 属性
    expect(scope.active).toBe(true);
    expect(typeof scope.run).toBe('function');
    expect(typeof scope.stop).toBe('function');
  });

  // 测试：实例化后被装饰方法不会自动执行（需求 2.1）
  it('实例化后被装饰方法不会自动执行', () => {
    let callCount = 0;

    class DemoService {
      @RunInScope
      public setup() {
        callCount++;
      }
    }

    const demo = new DemoService();
    reactive(demo);

    // 实例化和 reactive 包裹后，方法体不应被执行
    expect(callCount).toBe(0);
  });
});

// ============================================================================
// 装饰器调用风格测试
// ============================================================================

describe('RunInScope 装饰器 — 调用风格', () => {
  // 测试：@RunInScope（不带括号）正确装饰方法（需求 6.1）
  it('@RunInScope（不带括号）正确装饰方法', () => {
    class DemoService {
      @RunInScope
      public setup() {
        watchEffect(() => {});
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup();

    expect(scope.active).toBe(true);
    expect(scope.effects.length).toBe(1);
  });

  // 测试：@RunInScope()（带括号）正确装饰方法（需求 6.2）
  it('@RunInScope()（带括号）正确装饰方法', () => {
    class DemoService {
      @RunInScope()
      public setup() {
        watchEffect(() => {});
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup();

    expect(scope.active).toBe(true);
    expect(scope.effects.length).toBe(1);
  });
});

// ============================================================================
// 属性测试（Property-Based Tests）
// ============================================================================

describe('RunInScope 装饰器 — 属性测试', () => {
  /**
   * Feature: effect-scope-decorator, Property 1: 副作用收集到 Child_Scope
   *
   * 对于任意被 @RunInScope 装饰的方法，当方法体内创建了 N 个 watchEffect 副作用时，
   * 返回的 scope.effects 长度应等于 N。
   *
   * **Validates: Requirements 1.1, 1.2, 2.2**
   */
  it('Feature: effect-scope-decorator, Property 1: 副作用收集到 Child_Scope', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (n) => {
        const counter = ref(0);

        class DemoService {
          @RunInScope
          public setup() {
            for (let i = 0; i < n; i++) {
              watchEffect(() => {
                // 读取 counter 以建立依赖
                void counter.value;
              });
            }
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        const scope = reactiveDemo.setup();

        // 验证副作用数量等于 N
        expect(scope.effects.length).toBe(n);
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  /**
   * Feature: effect-scope-decorator, Property 3: 返回 Child_Scope 实例
   *
   * 对任意调用，验证返回值具有 active === true、run、stop 属性。
   *
   * **Validates: Requirements 4.1**
   */
  it('Feature: effect-scope-decorator, Property 3: 返回 Child_Scope 实例', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (initialValue) => {
        class DemoService {
          public value = initialValue;

          @RunInScope
          public setup() {
            watchEffect(() => {
              void this.value;
            });
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        const scope = reactiveDemo.setup();

        // 验证返回值是活跃的 EffectScope 实例
        expect(scope.active).toBe(true);
        expect(typeof scope.run).toBe('function');
        expect(typeof scope.stop).toBe('function');
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  /**
   * Feature: effect-scope-decorator, Property 4: 实例化不自动执行
   *
   * 使用计数器追踪方法体执行次数，实例化后验证计数器为 0。
   *
   * **Validates: Requirements 2.1**
   */
  it('Feature: effect-scope-decorator, Property 4: 实例化不自动执行', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (initialValue) => {
        let callCount = 0;

        class DemoService {
          public value = initialValue;

          @RunInScope
          public setup() {
            callCount++;
          }
        }

        // 重置计数器
        callCount = 0;

        const demo = new DemoService();
        reactive(demo);

        // 实例化后方法体不应被执行
        expect(callCount).toBe(0);
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
