# 设计文档：RunInScope 补充测试 — 全场景覆盖

## 背景

`@RunInScope` 装饰器的现有测试（5 个文件）存在一个系统性缺口：**只验证 `scope.active` 状态，从不验证副作用回调函数是否真正停止执行**。对于底层状态管理库，必须端到端验证副作用确实被销毁，而不只是依赖内部标志位。

此外，以下场景尚未覆盖：
- 带参数方法的参数传递
- 与 DI 容器 + Vue 组件集成时的自动销毁
- 两种推荐类型声明模式

---

## 核心测量手段

验证副作用是否运行，统一用 **callCount 计数器**模式：

```ts
let callCount = 0;
const counter = ref(0);

@RunInScope
setup() {
  watchEffect(() => {
    void counter.value; // 建立依赖
    callCount++;
  });
}

// watchEffect 首次同步执行一次，callCount = 1
// 修改 counter.value 后，若副作用活跃，callCount 增加
// 修改 counter.value 后，若副作用已停止，callCount 不变
```

---

## 新增文件清单

| 文件 | 描述 |
|---|---|
| `tests/effect-scope/side-effects.test.ts` | 副作用真正执行/停止的行为验证 |
| `tests/effect-scope/di-integration.test.ts` | DI 容器 + 组件集成，组件卸载自动销毁 |
| `tests/effect-scope/arguments.test.ts` | 带参数方法的参数传递 |
| `tests/effect-scope/return-type.test.ts` | 两种推荐类型声明模式 |

---

## 各文件详细设计

### side-effects.test.ts

**核心命题：** 验证副作用回调函数真正执行或停止，而不只是检查 `scope.active`。

#### 基础副作用行为（watchEffect）

**用例 1：watchEffect 活跃时响应数据变化**

```
setup() 内有 watchEffect(() => { callCount++; void counter.value; })
调用 setup() → watchEffect 同步执行一次，callCount = 1
修改 counter.value → callCount = 2
scope.active 为 true
```

**用例 2：scope.stop() 后 watchEffect 不再响应**

```
调用 setup()，watchEffect 同步执行，callCount = 1
scope.stop()
修改 counter.value → callCount 仍为 1（副作用已停止）
```

**用例 3：stop 只停本次 scope，其他 scope 的 watchEffect 仍正常响应**（关键场景 1）

```
调用 setup() 三次，得到 scope1/scope2/scope3
三个 watchEffect 各自维护独立的 callCount1/callCount2/callCount3
每个 scope 的 watchEffect 首次同步执行，各 callCount = 1

scope2.stop()

修改共享的 counter.value
callCount1 = 2（仍响应）
callCount2 = 1（已停止）
callCount3 = 2（仍响应）
```

#### watch 类型

**用例 4：watch 活跃时响应数据变化**

```
setup() 内有 watch(counter, () => { callCount++; })
调用 setup() → watch 首次不执行（watch 默认 lazy），callCount = 0
修改 counter.value → callCount = 1
```

**用例 5：scope.stop() 后 watch 不再响应**

```
调用 setup()，callCount = 0（watch lazy）
修改 counter.value → callCount = 1
scope.stop()
再次修改 counter.value → callCount 仍为 1
```

#### 批量销毁

**用例 6：removeScope 销毁服务对象后，所有 scope 的副作用全部停止运行**（关键场景 2）

```
调用 setup() N 次，得到 N 个 scope
N 个 watchEffect 各自维护独立 callCount，首次同步执行后各为 1

removeScope(reactiveDemo)

修改 counter.value
所有 callCount 仍为 1（全部副作用停止）
```

#### PBT 属性测试

**Property 1：stop 第 i 个 scope，只有第 i 个副作用停止，其他仍响应**

```
任意 N（2-5），任意 i（0 到 N-1）
创建 N 个 scope，各自计数
stop 第 i 个
修改数据
第 i 个计数不变，其余计数各增加 1
```

**Property 2：removeScope 后，所有副作用执行次数全部冻结**

```
任意 N（1-5）
创建 N 个 scope，各自计数，首次各为 1
removeScope
修改数据
所有计数仍为 1
```

---

### di-integration.test.ts

**核心命题：** 在真实的 Vue 组件 + DI 容器场景下，`@RunInScope` 副作用随组件卸载自动销毁。

**用例 1：组件挂载期间 watchEffect 正常响应**

```
DemoComp 中 declareProviders([DemoService])，DemoService 有 @RunInScope setup
组件挂载后，setup 的 watchEffect 回调执行（callCount = 1）
修改 demoService 的响应式数据 → callCount = 2
```

**用例 2：组件 unmount 后 watchEffect 副作用自动停止**

```
组件挂载后，setup 执行，watchEffect 回调计数 callCount = 1
wrapper.unmount()
修改数据 → callCount 仍为 1（服务销毁，副作用停止）
```

**用例 3：多个子组件各自独立，unmount 一个不影响另一个**

```
挂载 wrapper1 和 wrapper2，各自的 DemoService 实例各有独立 callCount
wrapper1.unmount()
修改共享响应式数据 → wrapper1 的 callCount 不变，wrapper2 的 callCount 增加
```

**用例 4：App 卸载后，所有 @RunInScope 副作用停止**

```
通过 declareAppProvidersPlugin 注册服务
mount 带 App 容器的组件
setup 执行，callCount = 1
app.unmount()（通过 wrapper.unmount 触发）
修改数据 → callCount 仍为 1
```

> **注意**：di-integration.test.ts 需要 Vue 组件文件辅助。新建以下文件：
> - `tests/effect-scope/DemoService.ts` — 包含 `@RunInScope setup()` 的服务类
> - `tests/effect-scope/DemoComp.vue` — 使用 DemoService 的组件

---

### arguments.test.ts

**核心命题：** 被 `@RunInScope` 装饰的方法的参数能正确传入方法体。

**用例 1：带单个参数，参数值在方法体内可访问**

```
@RunInScope
setup(multiplier: number) {
  watchEffect(() => { callCount += multiplier; });
}

setup(3) → watchEffect 首次执行，callCount = 3
修改依赖 → callCount = 6
```

**用例 2：参数在 watchEffect 闭包内通过闭包捕获可正常使用**

```
@RunInScope
setup(label: string) {
  watchEffect(() => { log.push(label); });
}

setup('A') → log = ['A']
setup('B') → log = ['A', 'B']
修改依赖 → log = ['A', 'B', 'A', 'B']
```

**用例 3：多次调用传不同参数，各自 scope 行为独立**

```
调用 setup(1)、setup(10)、setup(100)
stop 第二个 scope
修改数据
countFromCall1 增加 1，countFromCall2 不变，countFromCall3 增加 100
```

**用例 4：带多个参数**

```
@RunInScope
setup(a: number, b: number) {
  watchEffect(() => { result = a + b; });
}

setup(3, 4) → watchEffect 执行，result = 7
scope 返回正常，active = true
```

---

### return-type.test.ts

**核心命题：** 两种推荐的类型声明模式均能正常获得 EffectScope 并调用其方法。

**用例 1：方案 1 — 调用侧 `as unknown as EffectScope` 强制转换**

```ts
class DemoService {
  @RunInScope
  public setup() {
    watchEffect(() => {});
  }
}

const scope = reactiveDemo.setup() as unknown as EffectScope;
expect(scope.active).toBe(true);
scope.stop();
expect(scope.active).toBe(false);
```

**用例 2：方案 2 — 方法声明 `: EffectScope` + `return null as unknown as EffectScope`**

```ts
class DemoService {
  @RunInScope
  public setup(): EffectScope {
    watchEffect(() => {});
    return null as unknown as EffectScope;
  }
}

const scope = reactiveDemo.setup(); // 无需转换
expect(scope.active).toBe(true);
scope.stop();
expect(scope.active).toBe(false);
```

**用例 3：两种方案功能等价**

```
两种方案都能：
- 访问 scope.active
- 调用 scope.stop()，stop 后 active 为 false
- 访问 scope.effects
```

---

## 辅助文件

| 文件 | 用途 |
|---|---|
| `tests/effect-scope/DemoService.ts` | 供 di-integration.test.ts 使用的服务类（含 @RunInScope setup） |
| `tests/effect-scope/DemoComp.vue` | 供 di-integration.test.ts 使用的 Vue 组件 |

---

## 文件依赖关系

```
side-effects.test.ts       → RunInScope, reactive, watchEffect, watch, ref, removeScope
di-integration.test.ts     → DemoService.ts, DemoComp.vue, mount, declareProviders
arguments.test.ts          → RunInScope, reactive, watchEffect, ref
return-type.test.ts        → RunInScope, reactive, watchEffect, EffectScope
```

每个测试文件独立，不共享模块级状态，每个 `it` 块独立创建实例。
