import { reactive, ref, watchEffect, watch, nextTick } from 'vue';
import { RunInScope } from '@/index';
import { removeScope } from '@/scope';
import fc from 'fast-check';

const PBT_NUM_RUNS = 50;

// ============================================================================
// watchEffect 基础行为
// ============================================================================

describe('RunInScope — 副作用真正执行/停止（watchEffect）', () => {
  it('watchEffect 活跃时响应数据变化', async () => {
    const counter = ref(0);
    let callCount = 0;

    class DemoService {
      @RunInScope
      public setup() {
        watchEffect(() => {
          void counter.value;
          callCount++;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup();
    expect(callCount).toBe(1); // watchEffect 首次同步执行

    counter.value++;
    await nextTick();
    expect(callCount).toBe(2); // 响应数据变化，回调再次执行
  });

  it('scope.stop() 后 watchEffect 不再响应数据变化', async () => {
    const counter = ref(0);
    let callCount = 0;

    class DemoService {
      @RunInScope
      public setup() {
        watchEffect(() => {
          void counter.value;
          callCount++;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup();
    expect(callCount).toBe(1);

    scope.stop();

    counter.value++;
    await nextTick();
    expect(callCount).toBe(1); // 副作用已停止，callCount 不变
  });

  it('stop 只停本次 scope，其他 scope 的 watchEffect 仍正常响应', async () => {
    const counter = ref(0);
    let callCount1 = 0;
    let callCount2 = 0;
    let callCount3 = 0;

    class DemoService {
      @RunInScope
      public setup1() {
        watchEffect(() => {
          void counter.value;
          callCount1++;
        });
      }

      @RunInScope
      public setup2() {
        watchEffect(() => {
          void counter.value;
          callCount2++;
        });
      }

      @RunInScope
      public setup3() {
        watchEffect(() => {
          void counter.value;
          callCount3++;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup1();
    const scope2 = reactiveDemo.setup2();
    reactiveDemo.setup3();

    // 首次同步执行，各计数为 1
    expect(callCount1).toBe(1);
    expect(callCount2).toBe(1);
    expect(callCount3).toBe(1);

    scope2.stop();

    counter.value++;
    await nextTick();

    expect(callCount1).toBe(2); // 仍响应
    expect(callCount2).toBe(1); // 已停止
    expect(callCount3).toBe(2); // 仍响应
  });

  it('同一方法多次调用，stop 中间某个 scope，其他 scope 仍响应', async () => {
    const counter = ref(0);
    const counts: number[] = [0, 0, 0];

    class DemoService {
      @RunInScope
      public setup(idx: number) {
        watchEffect(() => {
          void counter.value;
          counts[idx]++;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup(0);
    const scope1 = reactiveDemo.setup(1);
    reactiveDemo.setup(2);

    expect(counts).toEqual([1, 1, 1]);

    scope1.stop();

    counter.value++;
    await nextTick();

    expect(counts[0]).toBe(2);
    expect(counts[1]).toBe(1); // 已停止
    expect(counts[2]).toBe(2);
  });
});

// ============================================================================
// watch 类型
// ============================================================================

describe('RunInScope — 副作用真正执行/停止（watch）', () => {
  it('watch 活跃时响应数据变化', async () => {
    const counter = ref(0);
    let callCount = 0;

    class DemoService {
      @RunInScope
      public setup() {
        watch(counter, () => {
          callCount++;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup();
    expect(callCount).toBe(0); // watch 默认 lazy，首次不执行

    counter.value++;
    await nextTick();
    expect(callCount).toBe(1); // 响应数据变化
  });

  it('scope.stop() 后 watch 不再响应数据变化', async () => {
    const counter = ref(0);
    let callCount = 0;

    class DemoService {
      @RunInScope
      public setup() {
        watch(counter, () => {
          callCount++;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup();

    counter.value++;
    await nextTick();
    expect(callCount).toBe(1);

    scope.stop();

    counter.value++;
    await nextTick();
    expect(callCount).toBe(1); // 副作用已停止
  });
});

// ============================================================================
// 批量销毁
// ============================================================================

describe('RunInScope — 批量销毁（removeScope）', () => {
  it('removeScope 销毁服务对象后，所有 scope 的 watchEffect 副作用全部停止运行', async () => {
    const counter = ref(0);
    const counts = [0, 0, 0];

    class DemoService {
      @RunInScope
      public setup(idx: number) {
        watchEffect(() => {
          void counter.value;
          counts[idx]++;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup(0);
    reactiveDemo.setup(1);
    reactiveDemo.setup(2);

    expect(counts).toEqual([1, 1, 1]); // 首次同步执行

    removeScope(reactiveDemo);

    counter.value++;
    await nextTick();

    expect(counts).toEqual([1, 1, 1]); // 全部副作用停止
  });
});

// ============================================================================
// PBT 属性测试
// ============================================================================

describe('RunInScope — 副作用行为属性测试', () => {
  it('Property: stop 第 i 个 scope，只有第 i 个副作用停止，其余仍响应', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        fc.integer({ min: 0, max: 4 }),
        async (n, stopIdxRaw) => {
          const actualStopIdx = stopIdxRaw % n;

          const counter = ref(0);
          const counts = new Array(n).fill(0);

          class DemoService {
            @RunInScope
            public setup(idx: number) {
              watchEffect(() => {
                void counter.value;
                counts[idx]++;
              });
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          const scopes = [];
          for (let i = 0; i < n; i++) {
            scopes.push(reactiveDemo.setup(i));
          }

          for (let i = 0; i < n; i++) {
            expect(counts[i]).toBe(1);
          }

          scopes[actualStopIdx].stop();
          counter.value++;
          await nextTick();

          for (let i = 0; i < n; i++) {
            if (i === actualStopIdx) {
              expect(counts[i]).toBe(1);
            } else {
              expect(counts[i]).toBe(2);
            }
          }
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  it('Property: removeScope 后，所有副作用执行次数全部冻结', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async n => {
          const counter = ref(0);
          const counts = new Array(n).fill(0);

          class DemoService {
            @RunInScope
            public setup(idx: number) {
              watchEffect(() => {
                void counter.value;
                counts[idx]++;
              });
            }
          }

          const demo = new DemoService();
          const reactiveDemo = reactive(demo);

          for (let i = 0; i < n; i++) {
            reactiveDemo.setup(i);
          }

          for (let i = 0; i < n; i++) {
            expect(counts[i]).toBe(1);
          }

          removeScope(reactiveDemo);
          counter.value++;
          await nextTick();

          for (let i = 0; i < n; i++) {
            expect(counts[i]).toBe(1);
          }
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
