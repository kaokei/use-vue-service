# RunInScope 装饰器补充测试 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `@RunInScope` 装饰器补充四类缺失测试场景：副作用真正执行/停止的行为验证、DI 容器集成、带参数方法、两种类型声明模式。

**Architecture:** 新增 4 个独立测试文件 + 2 个辅助文件，全部放在 `tests/effect-scope/` 目录。每个测试文件对应一个独立场景，每个 `it` 块独立创建实例，不共享模块级状态。核心测量手段：用 callCount 计数器验证副作用回调是否真正执行，而不只是检查 `scope.active`。

**Tech Stack:** Vue 3（reactive, ref, watchEffect, watch, nextTick, EffectScope），@vue/test-utils（mount），Vitest，@kaokei/di，fast-check（PBT）

---

## 文件清单

| 操作 | 路径 | 说明 |
|---|---|---|
| 新建 | `tests/effect-scope/DemoService.ts` | di-integration 测试用服务类（含 @RunInScope setup） |
| 新建 | `tests/effect-scope/DemoComp.vue` | di-integration 测试用 Vue 组件 |
| 新建 | `tests/effect-scope/side-effects.test.ts` | 副作用真正执行/停止行为验证 |
| 新建 | `tests/effect-scope/di-integration.test.ts` | DI 容器 + 组件集成，组件卸载自动销毁 |
| 新建 | `tests/effect-scope/arguments.test.ts` | 带参数方法的参数传递 |
| 新建 | `tests/effect-scope/return-type.test.ts` | 两种推荐类型声明模式 |

---

## Task 1：新建辅助文件 DemoService.ts 和 DemoComp.vue

**Files:**
- Create: `tests/effect-scope/DemoService.ts`
- Create: `tests/effect-scope/DemoComp.vue`

这两个文件供 `di-integration.test.ts` 使用。`DemoService` 包含一个 `@RunInScope` 装饰的 `setup` 方法，内部用 `watchEffect` 追踪 `count` 属性并递增外部计数器。`DemoComp` 通过 `declareProviders` 注册服务并在挂载时调用 `setup`。

- [ ] **Step 1: 创建 DemoService.ts**

```ts
// tests/effect-scope/DemoService.ts
import { Injectable } from '@/index';
import { RunInScope } from '@/index';
import { watchEffect } from 'vue';
import type { EffectScope } from 'vue';

@Injectable()
export class DemoService {
  public count = 0;

  public setupCallCount = 0;

  @RunInScope
  public setup(): EffectScope {
    watchEffect(() => {
      void this.count;
      this.setupCallCount++;
    });
    return null as unknown as EffectScope;
  }
}
```

- [ ] **Step 2: 创建 DemoComp.vue**

```vue
<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';

declareProviders([DemoService]);
const demoService = useService(DemoService);

const scope = demoService.setup();

defineExpose({ demoService, scope });
</script>

<template>
  <div>
    <div class="count">{{ demoService.count }}</div>
  </div>
</template>
```

- [ ] **Step 3: 运行现有测试确认无破坏**

```bash
cd /Users/hetao/workspace/github-mine/use-vue-service
npx vitest run tests/effect-scope/
```

期望：全部 PASS

---

## Task 2：新建 side-effects.test.ts — 副作用执行/停止行为验证

**Files:**
- Create: `tests/effect-scope/side-effects.test.ts`

**关键知识：**
- `watchEffect` 在 `scope.run()` 中**同步执行一次**（建立依赖追踪），之后每次依赖变化时异步调度。但在 jsdom 测试环境下，Vue 的调度器会在同一 microtask 中刷新，修改响应式数据后**无需 await** 即可观察到 watchEffect 回调执行（因为 reactive 触发同步）。
- `watch` 默认 lazy，首次**不**执行，回调在依赖变化后**异步**执行，需要 `await nextTick()`。
- `removeScope` 来自 `@/scope`（内部模块），可在测试中直接导入。

- [ ] **Step 1: 创建 side-effects.test.ts**

```ts
import { reactive, ref, watchEffect, watch, nextTick } from 'vue';
import { RunInScope } from '@/index';
import { removeScope } from '@/scope';
import fc from 'fast-check';

const PBT_NUM_RUNS = 50;

// ============================================================================
// watchEffect 基础行为
// ============================================================================

describe('RunInScope — 副作用真正执行/停止（watchEffect）', () => {
  it('watchEffect 活跃时响应数据变化', () => {
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
    expect(callCount).toBe(2); // 响应数据变化，回调再次执行
  });

  it('scope.stop() 后 watchEffect 不再响应数据变化', () => {
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
    expect(callCount).toBe(1); // 副作用已停止，callCount 不变
  });

  it('stop 只停本次 scope，其他 scope 的 watchEffect 仍正常响应', () => {
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

    expect(callCount1).toBe(2); // 仍响应
    expect(callCount2).toBe(1); // 已停止
    expect(callCount3).toBe(2); // 仍响应
  });

  it('同一方法多次调用，stop 中间某个 scope，其他 scope 仍响应', () => {
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
  it('removeScope 销毁服务对象后，所有 scope 的 watchEffect 副作用全部停止运行', () => {
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

    expect(counts).toEqual([1, 1, 1]); // 全部副作用停止
  });
});

// ============================================================================
// PBT 属性测试
// ============================================================================

describe('RunInScope — 副作用行为属性测试', () => {
  it('Property: stop 第 i 个 scope，只有第 i 个副作用停止，其余仍响应', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        fc.integer({ min: 0, max: 4 }),
        (n, stopIdx) => {
          const actualN = n;
          const actualStopIdx = stopIdx % actualN;

          const counter = ref(0);
          const counts = new Array(actualN).fill(0);

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
          for (let i = 0; i < actualN; i++) {
            scopes.push(reactiveDemo.setup(i));
          }

          // 首次同步执行
          for (let i = 0; i < actualN; i++) {
            expect(counts[i]).toBe(1);
          }

          scopes[actualStopIdx].stop();
          counter.value++;

          for (let i = 0; i < actualN; i++) {
            if (i === actualStopIdx) {
              expect(counts[i]).toBe(1); // 已停止
            } else {
              expect(counts[i]).toBe(2); // 仍响应
            }
          }
        }
      ),
      { numRuns: PBT_NUM_RUNS }
    );
  });

  it('Property: removeScope 后，所有副作用执行次数全部冻结', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), n => {
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

        // 首次同步执行
        for (let i = 0; i < n; i++) {
          expect(counts[i]).toBe(1);
        }

        removeScope(reactiveDemo);
        counter.value++;

        // 全部冻结
        for (let i = 0; i < n; i++) {
          expect(counts[i]).toBe(1);
        }
      }),
      { numRuns: PBT_NUM_RUNS }
    );
  });
});
```

- [ ] **Step 2: 运行测试，确认通过**

```bash
npx vitest run tests/effect-scope/side-effects.test.ts
```

期望：全部 PASS

---

## Task 3：新建 di-integration.test.ts — DI 容器集成测试

**Files:**
- Create: `tests/effect-scope/di-integration.test.ts`

**关键知识：**
- `DemoService.setupCallCount` 是响应式属性（通过 `reactive` 包裹后变为响应式）
- `declareProviders` + `useService` 的用法与 tests/test19 中相同
- `wrapper.unmount()` 会触发 `onUnmounted` → `container.destroy()` → `removeScope`，从而级联清理所有 Child_Scope
- `declareAppProvidersPlugin([DemoService])` 将服务注册到 App 级容器
- App 级测试需要先捕获 `app` 实例：通过 `(app: App) => { rootApp = app; }` 插件

- [ ] **Step 1: 创建 di-integration.test.ts**

```ts
import { mount } from '@vue/test-utils';
import { type App } from 'vue';
import DemoComp from './DemoComp.vue';
import { DemoService } from './DemoService';
import {
  useAppService,
  declareAppProvidersPlugin,
} from '@/index';

describe('RunInScope — DI 容器集成（组件卸载自动销毁）', () => {
  it('组件挂载期间 watchEffect 正常响应数据变化', () => {
    const wrapper = mount(DemoComp);
    const { demoService } = wrapper.vm;

    // setup 已调用，watchEffect 首次同步执行一次
    expect(demoService.setupCallCount).toBe(1);

    // 修改响应式数据，watchEffect 再次执行
    demoService.count++;
    expect(demoService.setupCallCount).toBe(2);
  });

  it('组件 unmount 后 watchEffect 副作用自动停止', () => {
    const wrapper = mount(DemoComp);
    const { demoService } = wrapper.vm;

    expect(demoService.setupCallCount).toBe(1);

    wrapper.unmount();

    // unmount 触发服务销毁，副作用停止
    demoService.count++;
    expect(demoService.setupCallCount).toBe(1); // 不再响应
  });

  it('多个组件实例各自独立，unmount 一个不影响另一个', () => {
    const wrapper1 = mount(DemoComp);
    const wrapper2 = mount(DemoComp);

    const service1 = wrapper1.vm.demoService;
    const service2 = wrapper2.vm.demoService;

    expect(service1.setupCallCount).toBe(1);
    expect(service2.setupCallCount).toBe(1);

    wrapper1.unmount();

    // service1 已销毁，service2 仍响应
    service1.count++;
    service2.count++;

    expect(service1.setupCallCount).toBe(1); // 已停止
    expect(service2.setupCallCount).toBe(2); // 仍响应
  });

  it('App 卸载后，App 级服务的 @RunInScope 副作用停止', () => {
    let rootApp!: App;

    const wrapper = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => {
            rootApp = app;
          },
          declareAppProvidersPlugin([DemoService]),
        ],
      },
    });

    const appService = useAppService(DemoService, rootApp);

    // App 级服务的 setup 由组件内调用（DemoComp 的 setup 阶段）
    // 此时 setupCallCount 已 >= 1
    const countBefore = appService.setupCallCount;
    expect(countBefore).toBeGreaterThanOrEqual(1);

    wrapper.unmount();

    appService.count++;
    expect(appService.setupCallCount).toBe(countBefore); // 不再响应
  });
});
```

- [ ] **Step 2: 运行测试，确认通过**

```bash
npx vitest run tests/effect-scope/di-integration.test.ts
```

期望：全部 PASS

---

## Task 4：新建 arguments.test.ts — 带参数方法的参数传递

**Files:**
- Create: `tests/effect-scope/arguments.test.ts`

- [ ] **Step 1: 创建 arguments.test.ts**

```ts
import { reactive, ref, watchEffect } from 'vue';
import { RunInScope } from '@/index';
import type { EffectScope } from 'vue';

describe('RunInScope — 带参数方法的参数传递', () => {
  it('带单个参数，参数值在 watchEffect 闭包内可正常访问', () => {
    const trigger = ref(0);
    let callCount = 0;

    class DemoService {
      @RunInScope
      public setup(multiplier: number): EffectScope {
        watchEffect(() => {
          void trigger.value;
          callCount += multiplier;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup(3);
    expect(callCount).toBe(3); // 首次同步执行，累加 multiplier=3

    trigger.value++;
    expect(callCount).toBe(6); // 再次执行，累加 3
  });

  it('参数通过闭包捕获，多次调用传不同 label，各自独立追加日志', () => {
    const trigger = ref(0);
    const log: string[] = [];

    class DemoService {
      @RunInScope
      public setup(label: string): EffectScope {
        watchEffect(() => {
          void trigger.value;
          log.push(label);
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup('A'); // 首次执行：log = ['A']
    reactiveDemo.setup('B'); // 首次执行：log = ['A', 'B']

    expect(log).toEqual(['A', 'B']);

    trigger.value++;
    // 两个 watchEffect 都响应
    expect(log).toEqual(['A', 'B', 'A', 'B']);
  });

  it('多次调用传不同参数，stop 中间 scope 后只有该 scope 的副作用停止', () => {
    const trigger = ref(0);
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;

    class DemoService {
      @RunInScope
      public setup(increment: number): EffectScope {
        watchEffect(() => {
          void trigger.value;
          if (increment === 1) count1 += increment;
          else if (increment === 10) count2 += increment;
          else if (increment === 100) count3 += increment;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    reactiveDemo.setup(1);
    const scope2 = reactiveDemo.setup(10);
    reactiveDemo.setup(100);

    expect(count1).toBe(1);
    expect(count2).toBe(10);
    expect(count3).toBe(100);

    scope2.stop();
    trigger.value++;

    expect(count1).toBe(2);    // 仍响应
    expect(count2).toBe(10);   // 已停止
    expect(count3).toBe(200);  // 仍响应
  });

  it('带多个参数，所有参数均正确传递到方法体', () => {
    let result = 0;

    class DemoService {
      @RunInScope
      public setup(a: number, b: number): EffectScope {
        watchEffect(() => {
          result = a + b;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup(3, 4);

    expect(result).toBe(7);
    expect(scope.active).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试，确认通过**

```bash
npx vitest run tests/effect-scope/arguments.test.ts
```

期望：全部 PASS

---

## Task 5：新建 return-type.test.ts — 两种类型声明模式

**Files:**
- Create: `tests/effect-scope/return-type.test.ts`

**关键知识：**
- 方案 1：方法不声明返回类型（默认 `void`），调用侧使用 `as unknown as EffectScope` 转换
- 方案 2：方法声明返回类型 `: EffectScope`，方法体末尾加 `return null as unknown as EffectScope`，调用侧无需转换
- 两种方案在运行时完全等价，只是类型层面的处理不同

- [ ] **Step 1: 创建 return-type.test.ts**

```ts
import { reactive, watchEffect } from 'vue';
import type { EffectScope } from 'vue';
import { RunInScope } from '@/index';

describe('RunInScope — 类型声明模式', () => {
  it('方案 1：调用侧 as unknown as EffectScope 强制转换', () => {
    class DemoService {
      public value = 0;

      @RunInScope
      public setup() {
        watchEffect(() => {
          void this.value;
        });
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup() as unknown as EffectScope;

    expect(scope.active).toBe(true);
    expect(typeof scope.stop).toBe('function');
    expect(typeof scope.run).toBe('function');
    expect(Array.isArray(scope.effects)).toBe(true);

    scope.stop();
    expect(scope.active).toBe(false);
  });

  it('方案 2：方法声明 : EffectScope + return null as unknown as EffectScope，调用侧无需转换', () => {
    class DemoService {
      public value = 0;

      @RunInScope
      public setup(): EffectScope {
        watchEffect(() => {
          void this.value;
        });
        return null as unknown as EffectScope;
      }
    }

    const demo = new DemoService();
    const reactiveDemo = reactive(demo);

    const scope = reactiveDemo.setup(); // 无需类型转换

    expect(scope.active).toBe(true);
    expect(typeof scope.stop).toBe('function');
    expect(typeof scope.run).toBe('function');
    expect(Array.isArray(scope.effects)).toBe(true);

    scope.stop();
    expect(scope.active).toBe(false);
  });

  it('两种方案的 scope 功能完全等价', () => {
    class DemoService1 {
      public value = 0;

      @RunInScope
      public setup() {
        watchEffect(() => {
          void this.value;
        });
      }
    }

    class DemoService2 {
      public value = 0;

      @RunInScope
      public setup(): EffectScope {
        watchEffect(() => {
          void this.value;
        });
        return null as unknown as EffectScope;
      }
    }

    const scope1 = (reactive(new DemoService1()).setup() as unknown as EffectScope);
    const scope2 = reactive(new DemoService2()).setup();

    // 两种方案的 scope 具有相同的属性和行为
    expect(scope1.active).toBe(scope2.active);
    expect(scope1.effects.length).toBe(scope2.effects.length);

    scope1.stop();
    scope2.stop();

    expect(scope1.active).toBe(false);
    expect(scope2.active).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试，确认通过**

```bash
npx vitest run tests/effect-scope/return-type.test.ts
```

期望：全部 PASS

---

## Task 6：运行全量测试，确认整体通过

- [ ] **Step 1: 运行 effect-scope 全部测试**

```bash
npx vitest run tests/effect-scope/
```

期望：全部 PASS，无 FAIL

- [ ] **Step 2: 运行全量测试，确认无回归**

```bash
npx vitest run
```

期望：全部 PASS

---

## 自审检查

### Spec 覆盖

| 设计文档要求 | 对应 Task |
|---|---|
| watchEffect 活跃时响应数据变化 | Task 2 用例 1 |
| scope.stop() 后 watchEffect 不再响应 | Task 2 用例 2 |
| stop 只停本次 scope，其他 scope 仍响应（场景 1） | Task 2 用例 3、4 |
| watch 活跃时响应数据变化 | Task 2 用例 watch-1 |
| scope.stop() 后 watch 不再响应 | Task 2 用例 watch-2 |
| removeScope 后所有 scope 副作用停止（场景 2） | Task 2 用例 removeScope |
| PBT: stop 第 i 个，只有第 i 个停止 | Task 2 PBT Property 1 |
| PBT: removeScope 后所有计数冻结 | Task 2 PBT Property 2 |
| 组件挂载期间 watchEffect 正常响应 | Task 3 用例 1 |
| 组件 unmount 后副作用自动停止 | Task 3 用例 2 |
| 多组件实例独立，unmount 一个不影响另一个 | Task 3 用例 3 |
| App 卸载后副作用停止 | Task 3 用例 4 |
| 带单个参数，参数值可访问 | Task 4 用例 1 |
| 参数在闭包中捕获 | Task 4 用例 2 |
| 多次调用传不同参数，各自 scope 行为独立 | Task 4 用例 3 |
| 带多个参数 | Task 4 用例 4 |
| 方案 1：as unknown as EffectScope | Task 5 用例 1 |
| 方案 2：: EffectScope + return null | Task 5 用例 2 |
| 两种方案功能等价 | Task 5 用例 3 |
| DemoService.ts 辅助文件 | Task 1 |
| DemoComp.vue 辅助文件 | Task 1 |

所有需求均有对应任务，无遗漏。

### 类型一致性

- `DemoService.setup()` 在 Task 1 定义返回 `EffectScope`，Task 3 中通过 `wrapper.vm.scope` 访问，命名一致。
- `DemoService.setupCallCount` 在 Task 1 定义，Task 3 的所有用例中均通过 `demoService.setupCallCount` 访问，一致。
- `removeScope` 从 `@/scope` 导入，Task 2 中正确使用。
- Task 4 用例 3 中 `increment === 1/10/100` 的判断是临时的行内区分方式，不依赖外部状态，每个 `it` 块独立。
