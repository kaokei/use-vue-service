# Examples 补充实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 通过新增 3 个示例（15/16/17）和向现有示例（01/08/12）追加内容，完整覆盖所有测试场景。

**Architecture:** 简单场景合并到现有示例；高价值、独立性强的场景新建示例。所有示例均为独立 Vite + Vue 3 项目，结构与现有示例保持一致，可直接部署到 CodeSandbox。

**Tech Stack:** Vue 3, TypeScript, Vite, @kaokei/use-vue-service, @kaokei/di

---

## 文件结构

### 需要修改的现有示例

| 文件 | 修改内容 |
|------|---------|
| `examples/01-basic-usage/src/App.vue` | 追加"服务单例性验证"章节（test8 场景） |
| `examples/01-basic-usage/src/CountService.ts` | 无需修改 |
| `examples/01-basic-usage/README.md` | 追加单例性说明 |
| `examples/08-token-and-binding/src/App.vue` | 追加 `to` vs `toSelf` 绑定方式对比（test6 场景） |
| `examples/08-token-and-binding/README.md` | 追加 to/toSelf 说明 |
| `examples/12-app-providers-plugin/src/App.vue` | 追加 `useAppService` 获取 App 级服务的用法（test17/test25 场景） |
| `examples/12-app-providers-plugin/src/main.ts` | 追加 `app` 实例 provide，让子组件可以通过 inject 获取 |
| `examples/12-app-providers-plugin/README.md` | 追加 useAppService 说明 |

### 需要新建的示例

| 目录 | 对应测试 | 主题 |
|------|---------|------|
| `examples/15-service-singleton/` | test8 完整独立版 | 服务单例性与多次 declareProviders 追加绑定 |
| `examples/16-service-inheritance/` | test22 | 多层类继承中的依赖注入与装饰器 |
| `examples/17-useappservice/` | test24/test25 | useAppService 与 useService 的查找层级差异 |

---

## Task 1：在 01-basic-usage 中追加服务单例性演示（合并 test8）

**Files:**
- Modify: `examples/01-basic-usage/src/App.vue`
- Modify: `examples/01-basic-usage/README.md`

- [ ] **Step 1: 修改 App.vue，追加单例性章节**

将 `examples/01-basic-usage/src/App.vue` 中 `<script setup>` 和 `<template>` 替换为以下内容：

```vue
<script setup lang="ts">
/**
 * 基本用法示例
 *
 * 演示内容：
 * 1. declareProviders + useService 的基本流程
 * 2. 多次调用 declareProviders 追加绑定（不会覆盖已有服务）
 * 3. 多次调用 useService 获取同一服务——总是返回同一实例（单例）
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';

// 第一次声明 CountService
declareProviders([CountService]);

// 再次声明同一个服务（追加绑定，不会覆盖）——实际上此处重复声明同一个服务
// 在真实场景中，多次 declareProviders 用于分别声明不同的服务
declareProviders([CountService]);

// 多次 useService 获取同一服务，返回的是同一个实例
const service1 = useService(CountService);
const service2 = useService(CountService);

// service1 === service2，同一组件内保证单例
const isSameInstance = service1 === service2;
</script>

<template>
  <div>
    <h1>01 - 基本用法</h1>

    <section>
      <h2>基础用法</h2>
      <p>当前计数：{{ service1.count }}</p>
      <button @click="service1.addOne">加一（通过 service1）</button>
    </section>

    <section>
      <h2>服务单例性验证</h2>
      <p>
        service1 === service2：
        <strong :style="{ color: isSameInstance ? 'green' : 'red' }">
          {{ isSameInstance }}
        </strong>
      </p>
      <p>service1.count = {{ service1.count }}</p>
      <p>service2.count = {{ service2.count }}</p>
      <p>（两者始终相同，因为它们是同一个实例）</p>
      <button @click="service2.addOne">加一（通过 service2）</button>
    </section>
  </div>
</template>
```

- [ ] **Step 2: 更新 README.md，追加单例性说明**

将 `examples/01-basic-usage/README.md` 中"## 要点"章节替换为：

```markdown
## 要点

- 服务类不需要任何装饰器，普通 class 就可以被 DI 容器管理
- `declareProviders` 在当前组件建立容器，子组件也可以通过 `useService` 获取同一实例
- 服务实例已被 `reactive` 包装，修改属性会自动触发视图更新
- **服务单例性**：同一组件内多次调用 `useService(SameService)` 始终返回同一实例
- **追加绑定**：多次调用 `declareProviders` 不会覆盖已有服务，而是在同一容器上追加新绑定
```

---

## Task 2：在 08-token-and-binding 中追加 to/toSelf 绑定方式（合并 test6）

**Files:**
- Modify: `examples/08-token-and-binding/src/App.vue`
- Modify: `examples/08-token-and-binding/README.md`

- [ ] **Step 1: 修改 App.vue，追加 to/toSelf 章节**

将 `examples/08-token-and-binding/src/App.vue` 替换为：

```vue
<script setup lang="ts">
/**
 * Token 系统与自定义绑定示例
 *
 * 演示内容：
 * 1. Token<T> 作为服务标识符
 * 2. FunctionProvider — toConstantValue / toDynamicValue
 * 3. to(Class) vs toSelf() 两种类绑定方式
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { API_URL, CONFIG } from './tokens';
import { CountService } from './CountService';

// 用法1：FunctionProvider 形式，使用 Token 标识符
declareProviders((container) => {
  // toConstantValue：绑定静态常量值
  container.bind(API_URL).toConstantValue('https://api.example.com');

  // toDynamicValue：绑定工厂函数（单例，只执行一次）
  container.bind(CONFIG).toDynamicValue(() => ({
    env: 'production',
    debug: false,
  }));

  // to(Class)：将标识符绑定到指定实现类
  container.bind(CountService).to(CountService);
});

const apiUrl = useService(API_URL);
const config = useService(CONFIG);
const serviceViaTo = useService(CountService);
</script>

<template>
  <div>
    <h1>08 - Token 系统与自定义绑定</h1>

    <section>
      <h2>Token + toConstantValue</h2>
      <p>API 地址：<strong>{{ apiUrl }}</strong></p>
    </section>

    <section>
      <h2>Token + toDynamicValue</h2>
      <p>环境：{{ config.env }}</p>
      <p>调试模式：{{ config.debug ? '开启' : '关闭' }}</p>
    </section>

    <section>
      <h2>to(Class) vs toSelf()</h2>
      <p>
        <code>container.bind(CountService).to(CountService)</code> 与
        <code>container.bind(CountService).toSelf()</code> 完全等价。
      </p>
      <p>通过 <code>to(CountService)</code> 获取的计数：{{ serviceViaTo.count }}</p>
      <button @click="serviceViaTo.addOne">加一</button>
    </section>
  </div>
</template>
```

- [ ] **Step 2: 在 tokens.ts 同目录新建 CountService.ts**

新建 `examples/08-token-and-binding/src/CountService.ts`：

```ts
export class CountService {
  public count = 0;
  public addOne() {
    this.count++;
  }
}
```

- [ ] **Step 3: 更新 README.md，追加 to/toSelf 说明**

在 `examples/08-token-and-binding/README.md` 的"## 演示内容"章节末尾追加：

```markdown
- `to(Class)` vs `toSelf()` — 两种等价的类绑定方式
```

在"## 要点"或文档末尾追加：

```markdown
## to 与 toSelf 的区别

```ts
// 两者完全等价：
container.bind(CountService).to(CountService);
container.bind(CountService).toSelf();
```

- `to(Class)` 更灵活，可以将标识符绑定到不同的实现类（如接口与实现分离）
- `toSelf()` 是简写，适用于标识符和实现类是同一个类的场景
```

---

## Task 3：在 12-app-providers-plugin 中追加 useAppService 用法（合并 test17/test25）

**Files:**
- Modify: `examples/12-app-providers-plugin/src/main.ts`
- Modify: `examples/12-app-providers-plugin/src/App.vue`
- Modify: `examples/12-app-providers-plugin/README.md`

- [ ] **Step 1: 修改 main.ts，provide app 实例**

将 `examples/12-app-providers-plugin/src/main.ts` 替换为：

```ts
/**
 * App 级服务插件示例 - 入口文件
 *
 * 演示：
 * 1. declareAppProvidersPlugin 以 Vue 插件形式注册 App 级服务
 * 2. 通过 app.provide('app', app) 将 app 实例注入组件树，
 *    使组件内可以通过 inject('app') 获取 app 引用，进而调用 useAppService
 */
import { createApp } from 'vue';
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service';
import App from './App.vue';
import { AppConfigService } from './AppConfigService';

const app = createApp(App);

// 以 Vue 插件形式声明 App 级服务
app.use(declareAppProvidersPlugin([AppConfigService]));

// 将 app 实例注入组件树，供子组件通过 inject('app') 获取
app.provide('app', app);

app.mount('#app');
```

- [ ] **Step 2: 修改 App.vue，展示 useAppService 用法**

将 `examples/12-app-providers-plugin/src/App.vue` 替换为：

```vue
<script setup lang="ts">
/**
 * App 级服务插件示例 - 根组件
 *
 * 演示：
 * 1. useService 获取 App 级服务（无需 declareProviders）
 * 2. useAppService(token, app) 在组件内通过 app 实例显式获取 App 级服务
 * 3. 两者返回同一个实例（因为都来自 App 级容器）
 */
import { inject } from 'vue';
import type { App } from 'vue';
import { useService, useAppService } from '@kaokei/use-vue-service';
import { AppConfigService } from './AppConfigService';
import Child from './Child.vue';

// 方式1：useService 自动沿组件树向上查找，找到 App 级容器中的 AppConfigService
const configViaUseService = useService(AppConfigService);

// 方式2：通过 inject 获取 app 实例，再用 useAppService 显式从 App 级容器获取
const app = inject<App>('app')!;
const configViaUseAppService = useAppService(AppConfigService, app);

// 两者来自同一容器，是同一实例
const isSameInstance = configViaUseService === configViaUseAppService;
</script>

<template>
  <div>
    <h1>12 - App 级服务插件</h1>

    <section>
      <h2>useService 获取 App 级服务</h2>
      <p>应用名称：{{ configViaUseService.appName }}</p>
      <p>版本号：{{ configViaUseService.version }}</p>
    </section>

    <section>
      <h2>useAppService vs useService</h2>
      <p>
        两者来自同一 App 级容器，是同一实例：
        <strong :style="{ color: isSameInstance ? 'green' : 'red' }">
          {{ isSameInstance }}
        </strong>
      </p>
      <p>
        <code>useAppService</code> 适合在组件外（路由守卫、工具函数）显式指定 app 实例获取服务。
      </p>
    </section>

    <hr />
    <Child />
  </div>
</template>
```

- [ ] **Step 3: 更新 README.md，追加 useAppService 说明**

在 `examples/12-app-providers-plugin/README.md` 的"## 演示内容"章节末尾追加：

```markdown
- `useAppService(token, app)` — 显式指定 app 实例从 App 级容器获取服务
```

在"## 要点"末尾追加：

```markdown
- `useService` 与 `useAppService` 在组件树中获取同一 App 级服务时，返回的是同一实例
- `useAppService` 适合在组件外部（路由守卫、工具函数）显式指定 app 实例来获取 App 级服务
```

---

## Task 4：新建 15-service-singleton 示例

**Files:**
- Create: `examples/15-service-singleton/README.md`
- Create: `examples/15-service-singleton/index.html`
- Create: `examples/15-service-singleton/package.json`
- Create: `examples/15-service-singleton/tsconfig.json`
- Create: `examples/15-service-singleton/vite.config.ts`
- Create: `examples/15-service-singleton/src/main.ts`
- Create: `examples/15-service-singleton/src/App.vue`
- Create: `examples/15-service-singleton/src/CountService.ts`
- Create: `examples/15-service-singleton/src/OtherService.ts`
- Create: `examples/15-service-singleton/src/Child.vue`

- [ ] **Step 1: 创建 README.md**

```markdown
# 15 - 服务单例性与多次 declareProviders

演示同一组件内多次调用 `declareProviders` 追加绑定，以及多次调用 `useService` 返回同一实例。

## 演示内容

- 多次调用 `declareProviders` 追加不同服务（不覆盖已有绑定）
- 多次调用 `useService(SameService)` 始终返回同一实例
- 通过任意引用修改服务状态，所有引用的视图同步更新
- 不同服务类之间的状态隔离

## 关键代码

```ts
// 分两次声明两个不同服务（等价于 declareProviders([CountService, OtherService])）
declareProviders([CountService]);
declareProviders([OtherService]);

// 多次获取同一服务，返回同一实例
const service1 = useService(CountService);
const service2 = useService(CountService);
// service1 === service2 → true
```

## 要点

- `declareProviders` 支持多次调用，每次追加绑定到同一容器
- 同一容器内每个服务类只有一个实例（单例）
- 不同服务类之间状态互不影响

## 运行

```bash
pnpm install
pnpm start
```
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "use-vue-service-example-15-service-singleton",
  "version": "1.0.0",
  "description": "服务单例性：多次 declareProviders 追加绑定，多次 useService 返回同一实例",
  "type": "module",
  "scripts": {
    "start": "vite"
  },
  "dependencies": {
    "@kaokei/di": "^5.0.0",
    "@kaokei/use-vue-service": "^4.0.0",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>15-service-singleton - use-vue-service</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "useDefineForClassFields": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

- [ ] **Step 5: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

- [ ] **Step 6: 创建 src/main.ts**

```ts
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

- [ ] **Step 7: 创建 src/CountService.ts**

```ts
export class CountService {
  public count = 100;

  public increaseCount() {
    this.count++;
  }
}
```

- [ ] **Step 8: 创建 src/OtherService.ts**

```ts
export class OtherService {
  public count = 200;

  public increaseCount() {
    this.count++;
  }
}
```

- [ ] **Step 9: 创建 src/App.vue**

```vue
<script setup lang="ts">
/**
 * 服务单例性与多次 declareProviders 示例
 *
 * 演示内容：
 * 1. 分两次调用 declareProviders 声明不同的服务（追加绑定）
 * 2. 多次 useService(CountService) 返回同一实例
 * 3. 通过任意引用修改状态，所有引用的视图同步更新
 * 4. 不同服务类之间状态互不影响
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';
import { OtherService } from './OtherService';

// 第一次 declareProviders：声明 CountService
declareProviders([CountService]);

// 第二次 declareProviders：声明 OtherService（追加绑定，不覆盖 CountService）
declareProviders([OtherService]);

// 多次获取 CountService，返回同一实例
const countService1 = useService(CountService);
const countService2 = useService(CountService);

// 多次获取 OtherService，也返回同一实例
const otherService1 = useService(OtherService);
const otherService2 = useService(OtherService);
</script>

<template>
  <div>
    <h1>15 - 服务单例性与多次 declareProviders</h1>

    <section>
      <h2>CountService 单例性验证</h2>
      <p>
        countService1 === countService2：
        <strong :style="{ color: countService1 === countService2 ? 'green' : 'red' }">
          {{ countService1 === countService2 }}
        </strong>
      </p>
      <p>countService1.count = {{ countService1.count }}</p>
      <p>countService2.count = {{ countService2.count }}</p>
      <button @click="countService1.increaseCount()">通过 countService1 加一</button>
      <button @click="countService2.increaseCount()">通过 countService2 加一</button>
    </section>

    <section>
      <h2>OtherService 单例性验证</h2>
      <p>
        otherService1 === otherService2：
        <strong :style="{ color: otherService1 === otherService2 ? 'green' : 'red' }">
          {{ otherService1 === otherService2 }}
        </strong>
      </p>
      <p>otherService1.count = {{ otherService1.count }}</p>
      <p>otherService2.count = {{ otherService2.count }}</p>
      <button @click="otherService1.increaseCount()">通过 otherService1 加一</button>
      <button @click="otherService2.increaseCount()">通过 otherService2 加一</button>
    </section>

    <section>
      <h2>服务间状态隔离</h2>
      <p>操作 CountService 不影响 OtherService，反之亦然。</p>
    </section>
  </div>
</template>
```

---

## Task 5：新建 16-service-inheritance 示例

**Files:**
- Create: `examples/16-service-inheritance/README.md`
- Create: `examples/16-service-inheritance/index.html`
- Create: `examples/16-service-inheritance/package.json`
- Create: `examples/16-service-inheritance/tsconfig.json`
- Create: `examples/16-service-inheritance/vite.config.ts`
- Create: `examples/16-service-inheritance/src/main.ts`
- Create: `examples/16-service-inheritance/src/App.vue`
- Create: `examples/16-service-inheritance/src/LogService.ts`
- Create: `examples/16-service-inheritance/src/BaseService.ts`
- Create: `examples/16-service-inheritance/src/MiddleService.ts`
- Create: `examples/16-service-inheritance/src/TopService.ts`

- [ ] **Step 1: 创建 README.md**

```markdown
# 16 - 服务继承

演示多层类继承结构中，`@Inject`、`@PostConstruct`、`@Computed` 装饰器的行为。

## 演示内容

- 四层继承：`TopService` → `MiddleService` → `BaseService`（`@Inject` 注入 `LogService`）
- 子类可访问父类通过 `@Inject` 注入的依赖
- 每个继承层级各自维护独立的计数属性，`increaseCount` 只修改本层的计数
- `@PostConstruct` 在子类中使用，在依赖注入完成后执行初始化
- `@Computed` 在继承链的任意层级都能正常工作

## 继承结构

```
TopService
  └── MiddleService
        └── BaseService  ← @Inject(LogService)
```

## 关键代码

```ts
@Injectable()
export class BaseService {
  public countBase = 0;

  @Inject(LogService)
  public logService!: LogService;

  public increaseBase() { this.countBase++; }
}

export class MiddleService extends BaseService {
  public countMiddle = 0;
  public increaseMiddle() { this.countMiddle++; }
}

@Injectable()
export class TopService extends MiddleService {
  public countTop = 0;
  public label = 'Top';

  @Computed
  public get summary() {
    return `${this.label} / Base:${this.countBase} / Middle:${this.countMiddle} / Top:${this.countTop}`;
  }

  @PostConstruct()
  public init() {
    this.logService.log('TopService 初始化完成');
  }
}
```

## 要点

- 最顶层使用 `@Inject` 的类需要标注 `@Injectable()`
- 子类如果也使用了 `@Inject` 或 `@PostConstruct`，也需要标注 `@Injectable()`
- 父类注入的依赖在子类中可以直接通过 `this.xxx` 访问
- `increaseCount` 方法在每层各自定义，只影响本层的计数属性

## 运行

```bash
pnpm install
pnpm start
```
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "use-vue-service-example-16-service-inheritance",
  "version": "1.0.0",
  "description": "服务继承：多层类继承中的 @Inject、@PostConstruct、@Computed 行为",
  "type": "module",
  "scripts": {
    "start": "vite"
  },
  "dependencies": {
    "@kaokei/di": "^5.0.0",
    "@kaokei/use-vue-service": "^4.0.0",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>16-service-inheritance - use-vue-service</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "useDefineForClassFields": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

- [ ] **Step 5: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

- [ ] **Step 6: 创建 src/main.ts**

```ts
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

- [ ] **Step 7: 创建 src/LogService.ts**

```ts
/**
 * 日志服务——被注入到 BaseService 中，演示跨继承层级访问注入依赖。
 */
export class LogService {
  public logs: string[] = [];

  public log(message: string) {
    this.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
  }
}
```

- [ ] **Step 8: 创建 src/BaseService.ts**

```ts
import { Inject, Injectable } from '@kaokei/use-vue-service';
import { LogService } from './LogService';

/**
 * 基础服务——继承链的底层，通过 @Inject 注入 LogService。
 * 子类可以通过 this.logService 访问注入的依赖。
 */
@Injectable()
export class BaseService {
  public countBase = 0;

  @Inject(LogService)
  public logService!: LogService;

  public increaseBase() {
    this.countBase++;
    this.logService.log(`increaseBase → countBase = ${this.countBase}`);
  }
}
```

- [ ] **Step 9: 创建 src/MiddleService.ts**

```ts
import { BaseService } from './BaseService';

/**
 * 中间层服务——继承 BaseService，可以访问父类的 logService。
 * 不需要再次标注 @Injectable()，因为自身没有新增 @Inject。
 */
export class MiddleService extends BaseService {
  public countMiddle = 0;

  public increaseMiddle() {
    this.countMiddle++;
    this.logService.log(`increaseMiddle → countMiddle = ${this.countMiddle}`);
  }
}
```

- [ ] **Step 10: 创建 src/TopService.ts**

```ts
import { Injectable, PostConstruct } from '@kaokei/use-vue-service';
import { Computed } from '@kaokei/use-vue-service';
import { MiddleService } from './MiddleService';

/**
 * 顶层服务——继承 MiddleService，新增 @PostConstruct 和 @Computed。
 * 因为自身使用了 @PostConstruct，需要标注 @Injectable()。
 */
@Injectable()
export class TopService extends MiddleService {
  public countTop = 0;
  public label = 'TopService';

  @Computed
  public get summary(): string {
    return `${this.label} | Base:${this.countBase} | Middle:${this.countMiddle} | Top:${this.countTop}`;
  }

  public increaseTop() {
    this.countTop++;
    this.logService.log(`increaseTop → countTop = ${this.countTop}`);
  }

  @PostConstruct()
  public init() {
    this.logService.log('TopService @PostConstruct 执行：依赖注入已完成');
  }
}
```

- [ ] **Step 11: 创建 src/App.vue**

```vue
<script setup lang="ts">
/**
 * 服务继承示例
 *
 * 演示多层类继承结构中的 DI 行为：
 * 1. BaseService 通过 @Inject 注入 LogService
 * 2. MiddleService 继承 BaseService，自动获得 logService
 * 3. TopService 继承 MiddleService，通过 @PostConstruct 执行初始化
 * 4. @Computed 装饰器在顶层服务中正常工作
 * 5. 各层级的 increaseXxx 方法只修改本层计数，互不影响
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { TopService } from './TopService';
import { LogService } from './LogService';

// 声明 TopService 和 LogService（DI 容器自动解析依赖关系）
declareProviders([TopService, LogService]);

const service = useService(TopService);
const logService = useService(LogService);
</script>

<template>
  <div>
    <h1>16 - 服务继承</h1>
    <p>演示多层类继承中 @Inject、@PostConstruct、@Computed 的行为</p>

    <section>
      <h2>@Computed 计算属性（依赖各层计数）</h2>
      <p>summary = <strong>{{ service.summary }}</strong></p>
    </section>

    <section>
      <h2>各层级计数（互相独立）</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr><th>层级</th><th>计数</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>BaseService.countBase</td>
            <td>{{ service.countBase }}</td>
            <td><button @click="service.increaseBase()">+1</button></td>
          </tr>
          <tr>
            <td>MiddleService.countMiddle</td>
            <td>{{ service.countMiddle }}</td>
            <td><button @click="service.increaseMiddle()">+1</button></td>
          </tr>
          <tr>
            <td>TopService.countTop</td>
            <td>{{ service.countTop }}</td>
            <td><button @click="service.increaseTop()">+1</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>@PostConstruct 初始化日志（由注入的 LogService 记录）</h2>
      <p>logService === service.logService：
        <strong :style="{ color: logService === service.logService ? 'green' : 'red' }">
          {{ logService === service.logService }}
        </strong>
      </p>
      <ol>
        <li v-for="(log, i) in logService.logs" :key="i">{{ log }}</li>
      </ol>
    </section>
  </div>
</template>
```

---

## Task 6：新建 17-useappservice 示例

**Files:**
- Create: `examples/17-useappservice/README.md`
- Create: `examples/17-useappservice/index.html`
- Create: `examples/17-useappservice/package.json`
- Create: `examples/17-useappservice/tsconfig.json`
- Create: `examples/17-useappservice/vite.config.ts`
- Create: `examples/17-useappservice/src/main.ts`
- Create: `examples/17-useappservice/src/App.vue`
- Create: `examples/17-useappservice/src/SharedService.ts`
- Create: `examples/17-useappservice/src/DeepChild.vue`

- [ ] **Step 1: 创建 README.md**

```markdown
# 17 - useAppService 与 useService 的查找层级差异

演示在多层组件嵌套中，`useService` 取最近容器 vs `useAppService` 取 App 级容器的差异。

## 演示内容

- `useService(token)` — 沿组件树向上查找，返回**最近容器**中的实例
- `useAppService(token, app)` — 直接获取 **App 级容器**中的实例
- 当组件自身声明了同名服务时，两者返回不同实例
- 当组件未声明同名服务时，`useService` 会回退到 App 级，两者返回同一实例

## 组件树结构

```
App（App 级绑定 SharedService）
  └── DeepChild（自己也绑定一份 SharedService）
```

## 关键代码

```ts
// DeepChild.vue：自己声明了 SharedService
declareProviders([SharedService]);
const fromComponent = useService(SharedService);   // 来自 DeepChild 自己的容器

const app = inject<App>('app')!;
const fromApp = useAppService(SharedService, app); // 来自 App 级容器

// fromComponent !== fromApp（不同实例）
```

## 要点

- `useService` 遵循就近原则，找到最近的容器即返回
- `useAppService` 绕过组件树，直接访问 App 级容器，适合需要精确获取应用级共享状态的场景
- 使用 `app.provide('app', app)` 将 app 实例向下传递，子组件通过 `inject('app')` 获取

## 运行

```bash
pnpm install
pnpm start
```
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "use-vue-service-example-17-useappservice",
  "version": "1.0.0",
  "description": "useAppService vs useService：多层嵌套时的查找层级差异",
  "type": "module",
  "scripts": {
    "start": "vite"
  },
  "dependencies": {
    "@kaokei/di": "^5.0.0",
    "@kaokei/use-vue-service": "^4.0.0",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>17-useappservice - use-vue-service</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "useDefineForClassFields": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

- [ ] **Step 5: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

- [ ] **Step 6: 创建 src/SharedService.ts**

```ts
/**
 * 共享服务——在 App 级和组件级各自绑定一份，
 * 用于演示 useAppService 与 useService 获取的是不同实例。
 */
export class SharedService {
  public name = '';
  public count = 0;

  public increaseCount() {
    this.count++;
  }
}
```

- [ ] **Step 7: 创建 src/main.ts**

```ts
/**
 * 应用入口
 *
 * 1. 在 App 级容器中绑定 SharedService（name = 'App级'）
 * 2. 将 app 实例通过 provide 注入组件树，供子组件获取
 */
import { createApp } from 'vue';
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service';
import App from './App.vue';
import { SharedService } from './SharedService';

const app = createApp(App);

// App 级绑定：设置 name = 'App级' 以便区分
app.use(
  declareAppProvidersPlugin((container) => {
    container.bind(SharedService).toDynamicValue(() => {
      const s = new SharedService();
      s.name = 'App级';
      return s;
    });
  })
);

// 将 app 实例注入组件树，子组件通过 inject('app') 获取
app.provide('app', app);

app.mount('#app');
```

- [ ] **Step 8: 创建 src/App.vue**

```vue
<script setup lang="ts">
/**
 * 根组件
 *
 * 演示 useService 在根组件（无自身绑定）时直接获取 App 级服务。
 * 子组件 DeepChild 自己也绑定了一份 SharedService，
 * 观察 DeepChild 中 useService 与 useAppService 返回的是否为同一实例。
 */
import { useService } from '@kaokei/use-vue-service';
import { SharedService } from './SharedService';
import DeepChild from './DeepChild.vue';

// 根组件未调用 declareProviders，useService 回退到 App 级容器
const serviceInRoot = useService(SharedService);
</script>

<template>
  <div>
    <h1>17 - useAppService 与 useService 的查找层级差异</h1>

    <section>
      <h2>根组件（无自身绑定）</h2>
      <p>
        <code>useService</code> 获取的服务来源：
        <strong>{{ serviceInRoot.name }}</strong>
        （回退到 App 级容器）
      </p>
      <p>count = {{ serviceInRoot.count }}</p>
      <button @click="serviceInRoot.increaseCount()">App 级 +1</button>
    </section>

    <hr />
    <DeepChild />
  </div>
</template>
```

- [ ] **Step 9: 创建 src/DeepChild.vue**

```vue
<script setup lang="ts">
/**
 * 深层子组件——自己声明了一份 SharedService（name = '组件级'）
 *
 * 关键演示：
 * - useService → 从自己的容器获取（name = '组件级'）
 * - useAppService → 从 App 级容器获取（name = 'App级'）
 * - 两者是不同实例
 */
import { inject } from 'vue';
import type { App } from 'vue';
import { declareProviders, useService, useAppService } from '@kaokei/use-vue-service';
import { SharedService } from './SharedService';

// DeepChild 自己绑定一份 SharedService（name = '组件级'）
declareProviders((container) => {
  container.bind(SharedService).toDynamicValue(() => {
    const s = new SharedService();
    s.name = '组件级';
    return s;
  });
});

const serviceFromComponent = useService(SharedService);  // 组件级

const app = inject<App>('app')!;
const serviceFromApp = useAppService(SharedService, app); // App 级

const isSame = serviceFromComponent === serviceFromApp;
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 12px; margin-top: 12px;">
    <h2>DeepChild（自身绑定了 SharedService）</h2>

    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>获取方式</th>
          <th>name</th>
          <th>count</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>useService</code>（最近容器）</td>
          <td>{{ serviceFromComponent.name }}</td>
          <td>{{ serviceFromComponent.count }}</td>
          <td><button @click="serviceFromComponent.increaseCount()">+1</button></td>
        </tr>
        <tr>
          <td><code>useAppService</code>（App 级容器）</td>
          <td>{{ serviceFromApp.name }}</td>
          <td>{{ serviceFromApp.count }}</td>
          <td><button @click="serviceFromApp.increaseCount()">+1</button></td>
        </tr>
      </tbody>
    </table>

    <p style="margin-top: 12px;">
      两者是同一实例：
      <strong :style="{ color: isSame ? 'green' : 'red' }">
        {{ isSame }}
      </strong>
      （预期：<strong>false</strong>，因为组件级覆盖了 App 级）
    </p>
  </div>
</template>
```

---

## 自检清单

### Spec 覆盖验证

| 测试场景 | 处理方式 | 对应 Task |
|---------|---------|---------|
| test8：服务单例性 + 多次 declareProviders | 合并到 01-basic-usage + 新建 15 | Task 1 + Task 4 |
| test6：to vs toSelf | 合并到 08-token-and-binding | Task 2 |
| test14：组件级与全局级容器隔离（已有 03 演示层级）| 已被 03 示例部分覆盖，test6 场景在 Task 2 中处理 | — |
| test17/test25：useAppService 显式获取 App 级 | 合并到 12 + 新建 17 | Task 3 + Task 6 |
| test22：多层服务继承 | 新建 16 | Task 5 |
| test24：useService 从 declareAppProviders/declareRootProviders 获取 | 已被 03 示例覆盖 | — |

### 无占位符确认

- 所有 Step 均包含完整代码，无 TBD/TODO
- 所有文件路径均为精确路径
- 所有类型引用均在本计划内定义
