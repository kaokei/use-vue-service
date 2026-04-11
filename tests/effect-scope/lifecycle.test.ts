import { reactive, watchEffect } from 'vue';
import { RunInScope } from '@/index';
import { removeScope } from '@/scope';
import fc from 'fast-check';

// ============================================================================
// 公共常量
// ============================================================================

const PBT_NUM_RUNS = 100;

// ============================================================================
// 生命周期与级联清理单元测试
// ============================================================================

describe('RunInScope 装饰器 — 生命周期与级联清理', () => {
  // 测试：Child_Scope 被 stop 后，再次调用方法返回新的活跃 Child_Scope，且新 scope 能正常收集副作用（需求 5.3）
  it('Child_Scope 被 stop 后，再次调用方法返回新的活跃 Child_Scope，且新 scope 能正常收集副作用', () => {
    class DemoService {
      public count = 0;

      @RunInScope
      public setup() {
        watchEffect(() => {
          void this.count;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    // 第一次调用
    const scope1 = reactiveDemo.setup();
    expect(scope1.active).toBe(true);
    expect(scope1.effects.length).toBe(1);

    // stop 第一个 scope
    scope1.stop();
    expect(scope1.active).toBe(false);

    // 再次调用方法，应返回新的活跃 Child_Scope
    const scope2 = reactiveDemo.setup();
    expect(scope2.active).toBe(true);
    expect(scope2.effects.length).toBe(1);

    // 新 scope 与旧 scope 不是同一个对象
    expect(scope2).not.toBe(scope1);
  });

  // 测试：通过 removeScope(obj) 停止 Root_Scope 后，所有 Child_Scope 都变为 inactive（需求 7.1）
  it('通过 removeScope(obj) 停止 Root_Scope 后，所有 Child_Scope 都变为 inactive', () => {
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

    // 创建多个 Child_Scope
    const scopeA = reactiveDemo.setupA();
    const scopeB = reactiveDemo.setupB();

    expect(scopeA.active).toBe(true);
    expect(scopeB.active).toBe(true);

    // 通过 removeScope 停止 Root_Scope，级联清理所有 Child_Scope
    removeScope(reactiveDemo);

    expect(scopeA.active).toBe(false);
    expect(scopeB.active).toBe(false);
  });
});

// ============================================================================
// 属性测试（Property-Based Tests）
// ============================================================================

describe('RunInScope 装饰器 — 生命周期属性测试', () => {
  /**
   * Feature: effect-scope-decorator, Property 6: Stop 不影响后续调用
   *
   * 对于任意被 @RunInScope 装饰的方法，当之前返回的某个 Child_Scope 被 stop() 后，
   * 再次调用该方法时，应返回一个新的活跃 Child_Scope，且新 scope 能正常收集副作用。
   *
   * **Validates: Requirements 5.3**
   */
  it('Feature: effect-scope-decorator, Property 6: Stop 不影响后续调用', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        (effectCount, repeatCount) => {
          class DemoService {
            public count = 0;

            @RunInScope
            public setup() {
              for (let i = 0; i < effectCount; i++) {
                watchEffect(() => {
                  void this.count;
                });
              }
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          for (let r = 0; r < repeatCount; r++) {
            // 调用方法获取 scope
            const scope = reactiveDemo.setup();
            expect(scope.active).toBe(true);
            expect(scope.effects.length).toBe(effectCount);

            // stop 该 scope
            scope.stop();
            expect(scope.active).toBe(false);
          }

          // 最后一次调用，验证仍能正常工作
          const finalScope = reactiveDemo.setup();
          expect(finalScope.active).toBe(true);
          expect(finalScope.effects.length).toBe(effectCount);
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  /**
   * Feature: effect-scope-decorator, Property 7: 级联清理
   *
   * 对于任意包含 @RunInScope 方法的类实例，当通过 removeScope(obj) 停止 Root_Scope 时，
   * 所有 Child_Scope 都应变为 inactive 状态。
   *
   * **Validates: Requirements 7.1**
   */
  it('Feature: effect-scope-decorator, Property 7: 级联清理', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), (callCount) => {
        class DemoService {
          public count = 0;

          @RunInScope
          public setup() {
            watchEffect(() => {
              void this.count;
            });
          }
        }

        const demo = new DemoService();
        const reactiveDemo = reactive(demo);

        // 创建多个 Child_Scope
        const scopes = [];
        for (let i = 0; i < callCount; i++) {
          scopes.push(reactiveDemo.setup());
        }

        // 验证所有 scope 都是活跃的
        for (const scope of scopes) {
          expect(scope.active).toBe(true);
        }

        // 通过 removeScope 停止 Root_Scope，级联清理所有 Child_Scope
        removeScope(reactiveDemo);

        // 验证所有 Child_Scope 都变为 inactive
        for (const scope of scopes) {
          expect(scope.active).toBe(false);
        }
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
