import { reactive, watchEffect } from 'vue';
import { EffectScope } from '@/index';
import fc from 'fast-check';

// ============================================================================
// 公共常量
// ============================================================================

const PBT_NUM_RUNS = 100;

// ============================================================================
// 累加语义单元测试
// ============================================================================

describe('EffectScope 装饰器 — 累加语义', () => {
  // 测试：多次调用同一方法，每次返回不同的 Child_Scope 实例（需求 3.1, 3.2）
  it('多次调用同一方法，每次返回不同的 Child_Scope 实例（引用不相等）', () => {
    class DemoService {
      @EffectScope
      public setup() {
        watchEffect(() => {});
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope1 = reactiveDemo.setup();
    const scope2 = reactiveDemo.setup();
    const scope3 = reactiveDemo.setup();

    // 每次调用返回的 scope 引用不相等
    expect(scope1).not.toBe(scope2);
    expect(scope2).not.toBe(scope3);
    expect(scope1).not.toBe(scope3);
  });

  // 测试：多次调用后，之前调用产生的副作用仍然活跃（需求 3.1, 3.2）
  it('多次调用后，之前调用产生的副作用仍然活跃（未被清理）', () => {
    class DemoService {
      @EffectScope
      public setup() {
        watchEffect(() => {});
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 第一次调用
    const scope1 = reactiveDemo.setup();
    expect(scope1.active).toBe(true);
    expect(scope1.effects.length).toBe(1);

    // 第二次调用
    const scope2 = reactiveDemo.setup();
    expect(scope2.active).toBe(true);
    expect(scope2.effects.length).toBe(1);

    // 第三次调用
    const scope3 = reactiveDemo.setup();
    expect(scope3.active).toBe(true);
    expect(scope3.effects.length).toBe(1);

    // 之前调用产生的 scope 仍然活跃（未被清理）
    expect(scope1.active).toBe(true);
    expect(scope2.active).toBe(true);

    // 之前调用产生的副作用仍然存在
    expect(scope1.effects.length).toBe(1);
    expect(scope2.effects.length).toBe(1);
  });
});

// ============================================================================
// 属性测试（Property-Based Tests）
// ============================================================================

describe('EffectScope 装饰器 — 累加语义属性测试', () => {
  /**
   * Feature: effect-scope-decorator, Property 2: 每次调用返回新的 Child_Scope
   *
   * 对于任意被 @EffectScope 装饰的方法和任意调用次数 N（N ≥ 2），
   * 每次调用都应返回一个新的 Child_Scope 实例（与之前返回的 scope 不是同一个对象），
   * 且每个 scope 都是活跃的。
   *
   * **Validates: Requirements 3.1, 3.2, 5.3**
   */
  it('Feature: effect-scope-decorator, Property 2: 每次调用返回新的 Child_Scope', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (n) => {
        class DemoService {
          @EffectScope
          public setup() {
            watchEffect(() => {});
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        // 调用 N 次，收集所有返回的 scope
        const scopes = [];
        for (let i = 0; i < n; i++) {
          scopes.push(reactiveDemo.setup());
        }

        // 验证返回了 N 个 scope
        expect(scopes.length).toBe(n);

        // 验证每个 scope 都是活跃的
        for (const scope of scopes) {
          expect(scope.active).toBe(true);
        }

        // 验证所有 scope 两两不同（引用不相等）
        for (let i = 0; i < scopes.length; i++) {
          for (let j = i + 1; j < scopes.length; j++) {
            expect(scopes[i]).not.toBe(scopes[j]);
          }
        }
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
