import { reactive, watchEffect } from 'vue';
import { RunInScope, Computed } from '@/index';
import { getScope } from '@/scope';
import fc from 'fast-check';

// ============================================================================
// 公共常量
// ============================================================================

const PBT_NUM_RUNS = 100;

// ============================================================================
// Scope 隔离性单元测试
// ============================================================================

describe('RunInScope 装饰器 — Scope 隔离性', () => {
  // 测试：同一实例上多个 @RunInScope 方法的 Child_Scope 互相独立，stop 一个不影响另一个（需求 5.1, 5.2）
  it('多个 @RunInScope 方法的 Child_Scope 互相独立，stop 一个不影响另一个', () => {
    class DemoService {
      public count = 0;

      @RunInScope
      public setupA() {
        watchEffect(() => {
          void this.count;
        });
      }

      @RunInScope
      public setupB() {
        watchEffect(() => {
          void this.count;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scopeA = reactiveDemo.setupA();
    const scopeB = reactiveDemo.setupB();

    // 两个 scope 都是活跃的
    expect(scopeA.active).toBe(true);
    expect(scopeB.active).toBe(true);

    // stop scopeA
    scopeA.stop();

    // scopeA 已停止，scopeB 仍然活跃
    expect(scopeA.active).toBe(false);
    expect(scopeB.active).toBe(true);

    // Root_Scope 仍然活跃
    const rootScope = getScope(reactiveDemo);
    expect(rootScope!.active).toBe(true);
  });

  // 测试：@RunInScope 方法的 Child_Scope 被 stop 后，@Computed 创建的 computed 属性继续正常响应式更新（需求 8.1, 8.2）
  it('@RunInScope 的 Child_Scope 被 stop 后，@Computed 的 computed 属性继续正常响应式更新', () => {
    class DemoService {
      public value = 1;

      @Computed
      get doubled() {
        return this.value * 2;
      }

      @RunInScope
      public setup() {
        watchEffect(() => {
          void this.value;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 先访问 computed 属性触发惰性创建
    expect(reactiveDemo.doubled).toBe(2);

    // 调用 @RunInScope 方法
    const scope = reactiveDemo.setup();
    expect(scope.active).toBe(true);

    // stop Child_Scope
    scope.stop();
    expect(scope.active).toBe(false);

    // @Computed 的 computed 属性仍然正常响应式更新
    reactiveDemo.value = 5;
    expect(reactiveDemo.doubled).toBe(10);

    // Root_Scope 仍然活跃
    const rootScope = getScope(reactiveDemo);
    expect(rootScope!.active).toBe(true);
  });
});


// ============================================================================
// 属性测试（Property-Based Tests）
// ============================================================================

describe('RunInScope 装饰器 — Scope 隔离性属性测试', () => {
  /**
   * Feature: effect-scope-decorator, Property 5: Scope 隔离性
   *
   * 对于任意同时包含多个 @RunInScope 方法和 @Computed getter 的类实例，
   * 当某次 @RunInScope 方法调用返回的 Child_Scope 被 stop() 后，
   * 其他调用返回的 Child_Scope 应仍然活跃，且 @Computed 创建的 computed 属性应继续正常响应式更新。
   *
   * **Validates: Requirements 5.1, 5.2, 8.1, 8.2**
   */
  it('Feature: effect-scope-decorator, Property 5: Scope 隔离性', () => {
    fc.assert(
      fc.property(
        // 生成初始值和更新值
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (initialValue, delta) => {
          class DemoService {
            public value = initialValue;

            @Computed
            get doubled() {
              return this.value * 2;
            }

            @RunInScope
            public setupA() {
              watchEffect(() => {
                void this.value;
              });
            }

            @RunInScope
            public setupB() {
              watchEffect(() => {
                void this.value;
              });
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          // 触发 computed 惰性创建
          expect(reactiveDemo.doubled).toBe(initialValue * 2);

          // 调用两个 @RunInScope 方法
          const scopeA = reactiveDemo.setupA();
          const scopeB = reactiveDemo.setupB();

          // 两个 scope 都是活跃的
          expect(scopeA.active).toBe(true);
          expect(scopeB.active).toBe(true);

          // stop scopeA
          scopeA.stop();

          // scopeA 已停止，scopeB 仍然活跃
          expect(scopeA.active).toBe(false);
          expect(scopeB.active).toBe(true);

          // Root_Scope 仍然活跃
          const rootScope = getScope(reactiveDemo);
          expect(rootScope!.active).toBe(true);

          // @Computed 的 computed 属性仍然正常响应式更新
          const newValue = initialValue + delta;
          reactiveDemo.value = newValue;
          expect(reactiveDemo.doubled).toBe(newValue * 2);
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
