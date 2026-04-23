# test19 补充测试 — FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES 全场景覆盖 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 tests/test19/ 中补充 App 级、组件级、@Inject 注入、隔离性四类测试场景，全面覆盖 FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES 的所有使用方式和边界情况。

**Architecture:** 新增 4 个独立测试文件和对应的辅助组件/服务文件，每个测试文件对应一个独立场景，互不共享 mount 状态。辅助文件（Vue 组件、Service 类）仅供对应测试文件使用，避免跨场景污染。

**Tech Stack:** Vue 3, @vue/test-utils, Vitest, @kaokei/di (Inject/Injectable), TypeScript

---

## 文件清单

| 操作 | 路径 | 说明 |
|---|---|---|
| 新建 | `tests/test19/EmptyDemoComp.vue` | 不含 ChildComp 的空父组件，用于边界测试 |
| 新建 | `tests/test19/ChildCompWithExpose.vue` | 暴露 findChildService/findChildrenServices 的 ChildComp 变体 |
| 新建 | `tests/test19/DemoServiceWithInject.ts` | 通过 @Inject 注入查找函数的 DemoService |
| 新建 | `tests/test19/DemoCompWithInject.vue` | 使用 DemoServiceWithInject 的父组件（含 3 个 ChildComp） |
| 新建 | `tests/test19/demo.app.test.ts` | App 级作用域测试 |
| 新建 | `tests/test19/demo.comp.test.ts` | 组件级 useService 测试 |
| 新建 | `tests/test19/demo.inject.test.ts` | @Inject 装饰器注入测试 |
| 新建 | `tests/test19/demo.isolation.test.ts` | 容器隔离性验证测试 |

---

## Task 1：新建 EmptyDemoComp.vue

**Files:**
- Create: `tests/test19/EmptyDemoComp.vue`

- [ ] **Step 1: 创建文件**

```vue
<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';

declareProviders([DemoService]);
const demoService = useService(DemoService);

defineExpose({ demoService });
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
  </div>
</template>
```

- [ ] **Step 2: 运行现有测试，确认无破坏**

```bash
cd /Users/hetao/workspace/github-mine/use-vue-service
npx vitest run tests/test19/demo.test.ts
```

期望：PASS

---

## Task 2：新建 ChildCompWithExpose.vue

**Files:**
- Create: `tests/test19/ChildCompWithExpose.vue`

这个组件与 ChildComp.vue 几乎相同，但额外 expose `findChildService` 和 `findChildrenServices`，以便测试代码可以访问"组件内部通过 useService 拿到的查找函数"。

- [ ] **Step 1: 创建文件**

```vue
<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { ChildService } from './ChildService';
import {
  FIND_CHILD_SERVICE,
  FIND_CHILDREN_SERVICES,
} from '@/index';

declareProviders([ChildService]);
const childService = useService(ChildService);
const findChildService = useService(FIND_CHILD_SERVICE);
const findChildrenServices = useService(FIND_CHILDREN_SERVICES);

defineExpose({
  childService,
  findChildService,
  findChildrenServices,
});
</script>

<template>
  <div>
    <div class="child-count">{{ childService.count }}</div>
    <button
      type="button"
      class="btn-count-child"
      @click="childService.increaseCount()"
    >
      Add count child
    </button>
  </div>
</template>
```

- [ ] **Step 2: 运行现有测试，确认无破坏**

```bash
npx vitest run tests/test19/demo.test.ts
```

期望：PASS

---

## Task 3：新建 DemoServiceWithInject.ts

**Files:**
- Create: `tests/test19/DemoServiceWithInject.ts`

- [ ] **Step 1: 创建文件**

```ts
import { Injectable, Inject } from '@/index';
import { FIND_CHILD_SERVICE, FIND_CHILDREN_SERVICES } from '@/index';
import type { FindChildService, FindChildrenServices } from '@/index';

@Injectable()
export class DemoServiceWithInject {
  public count = 1;

  public increaseCount() {
    this.count++;
  }

  @Inject(FIND_CHILD_SERVICE)
  public findChild!: FindChildService;

  @Inject(FIND_CHILDREN_SERVICES)
  public findChildren!: FindChildrenServices;
}
```

> 注意：`FindChildService` 和 `FindChildrenServices` 从 `@/index` 导入（`src/interface.ts` 中定义，通过 `src/index.ts` 未导出——需先确认导出情况）。

- [ ] **Step 2: 确认 FindChildService / FindChildrenServices 是否已从 @/index 导出**

```bash
grep -n "FindChildService\|FindChildrenServices" /Users/hetao/workspace/github-mine/use-vue-service/src/index.ts
```

如果没有导出，需要在 `src/index.ts` 中添加：

```ts
export type { FindChildService, FindChildrenServices } from './interface.ts';
```

- [ ] **Step 3: 若需要补充导出，修改 src/index.ts**

在 `src/index.ts` 末尾（或合适位置）添加上述 export type 行。

- [ ] **Step 4: 运行现有测试确认无破坏**

```bash
npx vitest run tests/test19/demo.test.ts
```

期望：PASS

---

## Task 4：新建 DemoCompWithInject.vue

**Files:**
- Create: `tests/test19/DemoCompWithInject.vue`

- [ ] **Step 1: 创建文件**

```vue
<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoServiceWithInject } from './DemoServiceWithInject';
import ChildComp from './ChildComp.vue';

declareProviders([DemoServiceWithInject]);
const demoService = useService(DemoServiceWithInject);

defineExpose({ demoService });
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
  </div>

  <div class="child-1-container">
    <ChildComp>
      <p>001</p>
    </ChildComp>
  </div>

  <div class="child-2-container">
    <ChildComp />
  </div>

  <div class="child-3-container">
    <Suspense>
      <ChildComp />
      <template #fallback>Loading...</template>
    </Suspense>
  </div>
</template>
```

- [ ] **Step 2: 运行现有测试，确认无破坏**

```bash
npx vitest run tests/test19/demo.test.ts
```

期望：PASS

---

## Task 5：新建 demo.app.test.ts — App 级作用域测试

**Files:**
- Create: `tests/test19/demo.app.test.ts`

- [ ] **Step 1: 创建测试文件**

```ts
import { mount } from '@vue/test-utils';
import { type App } from 'vue';
import DemoComp from './DemoComp.vue';
import EmptyDemoComp from './EmptyDemoComp.vue';
import { ChildService } from './ChildService';
import { DemoService } from './DemoService';
import {
  FIND_CHILD_SERVICE,
  FIND_CHILDREN_SERVICES,
  useAppService,
  declareAppProvidersPlugin,
} from '@/index';

describe('test19 — App 级作用域 (useAppService)', () => {
  it('FIND_CHILD_SERVICE 返回第一个 ChildService 实例', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    const childService = findChildService(ChildService);

    expect(childService).toBeInstanceOf(ChildService);
  });

  it('FIND_CHILDREN_SERVICES 返回 3 个 ChildService 实例', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildrenServices = useAppService(FIND_CHILDREN_SERVICES, rootApp);
    const list = findChildrenServices(ChildService);

    expect(list).toHaveLength(3);
    list.forEach(s => expect(s).toBeInstanceOf(ChildService));
  });

  it('FIND_CHILD_SERVICE 返回的实例与 FIND_CHILDREN_SERVICES[0] 是同一对象', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    const findChildrenServices = useAppService(FIND_CHILDREN_SERVICES, rootApp);

    expect(findChildService(ChildService)).toBe(findChildrenServices(ChildService)[0]);
  });

  it('边界 — 无 ChildComp 时 FIND_CHILD_SERVICE 返回 undefined', () => {
    let rootApp!: App;
    mount(EmptyDemoComp, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    expect(findChildService(ChildService)).toBeUndefined();
  });

  it('边界 — 无 ChildComp 时 FIND_CHILDREN_SERVICES 返回空数组', () => {
    let rootApp!: App;
    mount(EmptyDemoComp, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildrenServices = useAppService(FIND_CHILDREN_SERVICES, rootApp);
    expect(findChildrenServices(ChildService)).toEqual([]);
  });

  it('边界 — 查未在子组件注册的 Token 返回 undefined', () => {
    let rootApp!: App;
    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { rootApp = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const findChildService = useAppService(FIND_CHILD_SERVICE, rootApp);
    // DemoService 注册在 DemoComp 容器，不是 App 容器的直接子，但 App 容器查找会向下遍历
    // ChildComp 没有注册 DemoService，所以查不到
    expect(findChildService(DemoService)).toBeUndefined();
  });
});
```

- [ ] **Step 2: 运行测试，确认通过**

```bash
npx vitest run tests/test19/demo.app.test.ts
```

期望：全部 PASS

---

## Task 6：新建 demo.comp.test.ts — 组件级 useService 测试

**Files:**
- Create: `tests/test19/demo.comp.test.ts`

需要一个能暴露 findChildService / findChildrenServices 的 DemoComp 变体。直接在测试中使用 `wrapper.vm` 访问 `DemoComp` 暴露的值，同时需要 `DemoComp` 也 expose 出这两个查找函数。

> 注意：现有 `DemoComp.vue` 不 expose 查找函数，为避免修改现有文件，新建 `DemoCompWithFindExpose.vue`。

- [ ] **Step 1: 新建 DemoCompWithFindExpose.vue**

```vue
<script setup lang="ts">
import { declareProviders, useService } from '@/index';
import { DemoService } from './DemoService';
import { FIND_CHILD_SERVICE, FIND_CHILDREN_SERVICES } from '@/index';
import ChildComp from './ChildComp.vue';

declareProviders([DemoService]);
const demoService = useService(DemoService);
const findChildService = useService(FIND_CHILD_SERVICE);
const findChildrenServices = useService(FIND_CHILDREN_SERVICES);

defineExpose({
  demoService,
  findChildService,
  findChildrenServices,
});
</script>

<template>
  <div>
    <div class="demo-count">{{ demoService.count }}</div>
  </div>

  <div class="child-1-container">
    <ChildComp>
      <p>001</p>
      <p>002</p>
      <p>003</p>
    </ChildComp>
  </div>

  <div class="child-2-container">
    <div class="child-2-wrapper">
      <div class="child-2-box">
        <ChildComp />
      </div>
    </div>
  </div>

  <div class="child-3-container">
    <Suspense>
      <ChildComp />
      <template #fallback>Loading...</template>
    </Suspense>
  </div>
</template>
```

- [ ] **Step 2: 创建 demo.comp.test.ts**

```ts
import { mount } from '@vue/test-utils';
import DemoCompWithFindExpose from './DemoCompWithFindExpose.vue';
import ChildCompWithExpose from './ChildCompWithExpose.vue';
import { ChildService } from './ChildService';
import { useRootService, FIND_CHILD_SERVICE, FIND_CHILDREN_SERVICES } from '@/index';

describe('test19 — 组件级 useService 获取查找函数', () => {
  it('DemoComp 内 useService(FIND_CHILD_SERVICE) 返回的函数能查到 ChildService', () => {
    const wrapper = mount(DemoCompWithFindExpose);
    const childService = wrapper.vm.findChildService(ChildService);
    expect(childService).toBeInstanceOf(ChildService);
  });

  it('DemoComp 内 useService(FIND_CHILDREN_SERVICES) 返回 3 个 ChildService', () => {
    const wrapper = mount(DemoCompWithFindExpose);
    const list = wrapper.vm.findChildrenServices(ChildService);
    expect(list).toHaveLength(3);
    list.forEach(s => expect(s).toBeInstanceOf(ChildService));
  });

  it('组件级查找函数与 useRootService 查到的是同一实例（单棵子树时）', () => {
    const wrapper = mount(DemoCompWithFindExpose);
    const fromComp = wrapper.vm.findChildService(ChildService);
    const fromRoot = useRootService(FIND_CHILD_SERVICE)(ChildService);
    expect(fromComp).toBe(fromRoot);
  });

  it('关键边界 — ChildComp 内 useService(FIND_CHILD_SERVICE) 查 ChildService 返回 undefined（不含自身）', () => {
    const wrapper = mount(ChildCompWithExpose);
    // ChildService 注册在 ChildComp 自身容器，查找只往子孙走，不含自身
    const result = wrapper.vm.findChildService(ChildService);
    expect(result).toBeUndefined();
  });

  it('关键边界 — ChildComp 内 useService(FIND_CHILDREN_SERVICES) 查 ChildService 返回空数组', () => {
    const wrapper = mount(ChildCompWithExpose);
    const list = wrapper.vm.findChildrenServices(ChildService);
    expect(list).toEqual([]);
  });
});
```

- [ ] **Step 3: 运行测试，确认通过**

```bash
npx vitest run tests/test19/demo.comp.test.ts
```

期望：全部 PASS

---

## Task 7：新建 demo.inject.test.ts — @Inject 装饰器注入测试

**Files:**
- Create: `tests/test19/demo.inject.test.ts`

- [ ] **Step 1: 创建测试文件**

```ts
import { mount } from '@vue/test-utils';
import DemoCompWithInject from './DemoCompWithInject.vue';
import { ChildService } from './ChildService';
import { DemoService } from './DemoService';
import { useRootService, FIND_CHILD_SERVICE } from '@/index';

describe('test19 — @Inject 装饰器注入查找函数', () => {
  it('注入的 findChild 是函数类型', () => {
    const wrapper = mount(DemoCompWithInject);
    expect(typeof wrapper.vm.demoService.findChild).toBe('function');
  });

  it('注入的 findChildren 是函数类型', () => {
    const wrapper = mount(DemoCompWithInject);
    expect(typeof wrapper.vm.demoService.findChildren).toBe('function');
  });

  it('demoService.findChild(ChildService) 返回 ChildService 实例', () => {
    const wrapper = mount(DemoCompWithInject);
    const result = wrapper.vm.demoService.findChild(ChildService);
    expect(result).toBeInstanceOf(ChildService);
  });

  it('demoService.findChildren(ChildService) 返回 3 个 ChildService 实例', () => {
    const wrapper = mount(DemoCompWithInject);
    const list = wrapper.vm.demoService.findChildren(ChildService);
    expect(list).toHaveLength(3);
    list.forEach(s => expect(s).toBeInstanceOf(ChildService));
  });

  it('注入的 findChild 查到的实例与 useRootService 查到的是同一对象', () => {
    const wrapper = mount(DemoCompWithInject);
    const fromInject = wrapper.vm.demoService.findChild(ChildService);
    const fromRoot = useRootService(FIND_CHILD_SERVICE)(ChildService);
    expect(fromInject).toBe(fromRoot);
  });

  it('边界 — 查未注册的 Service 返回 undefined', () => {
    const wrapper = mount(DemoCompWithInject);
    const result = wrapper.vm.demoService.findChild(DemoService);
    // DemoService 注册在当前组件容器（DemoCompWithInject），findChild 不含自身，查不到
    expect(result).toBeUndefined();
  });

  it('边界 — 批量查未注册的 Service 返回空数组', () => {
    const wrapper = mount(DemoCompWithInject);
    const list = wrapper.vm.demoService.findChildren(DemoService);
    expect(list).toEqual([]);
  });
});
```

- [ ] **Step 2: 运行测试，确认通过**

```bash
npx vitest run tests/test19/demo.inject.test.ts
```

期望：全部 PASS

---

## Task 8：新建 demo.isolation.test.ts — 容器隔离性验证

**Files:**
- Create: `tests/test19/demo.isolation.test.ts`

- [ ] **Step 1: 创建测试文件**

```ts
import { mount } from '@vue/test-utils';
import { type App } from 'vue';
import DemoComp from './DemoComp.vue';
import { ChildService } from './ChildService';
import {
  FIND_CHILDREN_SERVICES,
  FIND_CHILD_SERVICE,
  useRootService,
  useAppService,
  declareAppProvidersPlugin,
} from '@/index';

describe('test19 — 容器隔离性验证', () => {
  it('Root vs Component：Root 查到 6 个，各 DemoComp 各查到 3 个', () => {
    const wrapperA = mount(DemoComp);
    const wrapperB = mount(DemoComp);

    // ROOT 遍历整棵子树：两个 DemoComp 各 3 个 ChildService = 6 个
    const allFromRoot = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(allFromRoot).toHaveLength(6);

    wrapperA.unmount();
    wrapperB.unmount();
  });

  it('卸载一个 DemoComp 后，Root 查到的数量减少到 3', () => {
    const wrapperA = mount(DemoComp);
    const wrapperB = mount(DemoComp);

    let allFromRoot = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(allFromRoot).toHaveLength(6);

    wrapperA.unmount();

    allFromRoot = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(allFromRoot).toHaveLength(3);

    wrapperB.unmount();
  });

  it('多 App 实例隔离：App A 与 App B 各自查到 3 个，且实例无交集', () => {
    let appA!: App;
    let appB!: App;

    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { appA = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { appB = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    const listA = useAppService(FIND_CHILDREN_SERVICES, appA)(ChildService);
    const listB = useAppService(FIND_CHILDREN_SERVICES, appB)(ChildService);

    expect(listA).toHaveLength(3);
    expect(listB).toHaveLength(3);

    // 两个列表无交集
    listA.forEach(sA => {
      listB.forEach(sB => {
        expect(sA).not.toBe(sB);
      });
    });
  });

  it('App A unmount 后，Root 不再包含 App A 的子服务', () => {
    let appA!: App;

    const wrapperA = mount(DemoComp, {
      global: {
        plugins: [
          (app: App) => { appA = app; },
          declareAppProvidersPlugin([]),
        ],
      },
    });

    // unmount 前，Root 能查到 App A 的子服务
    const beforeUnmount = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(beforeUnmount.length).toBeGreaterThan(0);

    wrapperA.unmount();

    // unmount 后，Root 查不到任何 ChildService
    const afterUnmount = useRootService(FIND_CHILDREN_SERVICES)(ChildService);
    expect(afterUnmount).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 运行测试，确认通过**

```bash
npx vitest run tests/test19/demo.isolation.test.ts
```

期望：全部 PASS

---

## Task 9：运行全部 test19 测试，确认整体通过

- [ ] **Step 1: 运行 test19 所有测试**

```bash
npx vitest run tests/test19/
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
| App 级基础查找 | Task 5 用例 1-3 |
| App 级边界（空树、查不存在） | Task 5 用例 4-6 |
| 组件级基础查找 | Task 6 用例 1-2 |
| 组件级与 useRootService 一致 | Task 6 用例 3 |
| 不含自身（关键边界） | Task 6 用例 4-5 |
| @Inject 注入类型验证 | Task 7 用例 1-2 |
| @Inject 基础查找 | Task 7 用例 3-4 |
| @Inject 实例一致性 | Task 7 用例 5 |
| @Inject 边界 | Task 7 用例 6-7 |
| Root vs Component 数量对比 | Task 8 用例 1 |
| 卸载后数量减少 | Task 8 用例 2 |
| 多 App 实例隔离 | Task 8 用例 3 |
| App unmount 后 Root 隔离 | Task 8 用例 4 |
| EmptyDemoComp 辅助文件 | Task 1 |
| ChildCompWithExpose 辅助文件 | Task 2 |
| DemoServiceWithInject 辅助文件 | Task 3 |
| DemoCompWithInject 辅助文件 | Task 4 |

所有需求均有对应任务，无遗漏。

### 类型一致性

- `FindChildService` / `FindChildrenServices` 在 Task 3 定义（从 `@/index` 导入），Task 7 测试中通过 `wrapper.vm.demoService.findChild` 访问，类型链一致。
- `DemoServiceWithInject.findChild` / `.findChildren` 在 Task 3 定义，Task 7 直接使用，命名一致。
- `DemoCompWithFindExpose` 在 Task 6 Step 1 定义，Task 6 Step 2 测试中使用，命名一致。
