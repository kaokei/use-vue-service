# 快速开始

## 简介

`@kaokei/use-vue-service` 是一个轻量级的适用于 Vue 3 项目的状态管理库。当前版本为 **4.0.0**，依赖 `@kaokei/di` 版本 **^5.0.4**。

本库基于 [@kaokei/di](https://github.com/kaokei/di) 开发，支持依赖注入能力。

本库的灵感来源于 [Angular Service](https://angular.dev/guide/di/creating-injectable-service)，优势是管理数据的方式更加灵活。

## 安装

```sh
npm install @kaokei/di @kaokei/use-vue-service
```

本库 **不依赖** `reflect-metadata`，所以 **不需要** 安装这个 npm 包。

本库使用 TC39 Stage 3 标准装饰器语法，TypeScript 5.0+ 默认支持，**无需** 在 `tsconfig.json` 中配置 `experimentalDecorators`。

::: tip 关于装饰器
本库在旧版本需要配置 `"experimentalDecorators": true`。目前最新的4.0.0 版本已迁移到 Stage 3 装饰器，不再需要任何额外配置。
:::

## 基本使用

```ts
// service.ts —— 定义了 2 个服务，LoggerService 和 CountService
// 其中 CountService 依赖 LoggerService
// @Inject 装饰器来自 @kaokei/di，通过 @kaokei/use-vue-service 重新导出
import { Inject } from '@kaokei/use-vue-service';

export class LoggerService {
  public log(...msg: any[]) {
    console.log('from logger service ==>', ...msg);
  }
}

export class CountService {
  public count = 0;

  @Inject(LoggerService)
  public accessor logger: LoggerService;

  public addOne() {
    this.count++;
    this.logger.log('addOne ==> ', this.count);
  }
}
```

```vue
<script lang="ts" setup>
// 这个组件使用了 service.ts 中定义的服务
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService, LoggerService } from './service.ts';
// 将 CountService、LoggerService 和当前组件进行绑定
declareProviders([CountService, LoggerService]);
// 实例化 CountService 得到一个 countService 对象
// countService 对象自动注入了 logger 属性，是一个 LoggerService 实例
const countService = useService(CountService);
</script>

<template>
  <div>{{ countService.count }}</div>
  <button @click="countService.addOne()">点击按钮+1</button>
</template>
```

::: info 关于 @Inject
`@Inject` 装饰器来自 `@kaokei/di`，本库通过 `export * from '@kaokei/di'` 重新导出，因此可以直接从 `@kaokei/use-vue-service` 导入使用。
:::

## 三组核心 API

本库提供三组 API，分别对应三种不同的服务作用域。每组包含一个"声明"函数和一个"获取"函数。

### 容器层级与查找规则

三组 API 背后的容器存在继承关系：**根容器 → App 容器 → 组件容器**。容器查找遵循就近原则，并沿层级向上回退：

- `useService` —— 从当前组件容器开始，沿组件树向上查找，最终回退到 App 容器，再回退到根容器。因此它能读取三组 API 声明的所有服务。
- `useAppService` —— 从 App 容器开始查找，可回退到根容器。因此它能读取 `declareAppProviders` 和 `declareRootProviders` 声明的服务，但读取不到其他组件内通过 `declareProviders` 声明的服务。
- `useRootService` —— 直接操作根容器，只能读取 `declareRootProviders` 声明的服务。

::: tip 三组 API 并非完全独立
`useService` 的查找链覆盖了全部三层容器，推荐在组件内优先使用 `useService`。`useRootService` 和 `useAppService` 主要用于组件树之外（如 main.ts、插件初始化等场景）。
:::

### 组件级：useService / declareProviders

组件级作用域是最常用的方式。容器通过 Vue 的 `provide/inject` 机制在组件树中传递。

- `declareProviders(providers)` —— 在当前组件创建一个子容器（继承父级容器），组件卸载时自动销毁。
- `useService(token)` —— 从当前组件或最近的祖先组件的容器中获取服务实例，最终可回退到根容器。

```ts
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './service.ts';

// 在组件的 setup 中调用
declareProviders([CountService]);
const countService = useService(CountService);
```

### 全局根级：useRootService / declareRootProviders

全局根级作用域直接操作全局的根容器，不依赖 Vue 组件树，可以在任何地方调用。

- `declareRootProviders(providers)` —— 在全局根容器上声明服务提供者，绑定的服务在整个应用中全局共享。
- `useRootService(token)` —— 只从全局根容器中获取服务实例，不会查找其他容器。

```ts
import { declareRootProviders, useRootService } from '@kaokei/use-vue-service';
import { GlobalConfigService } from './service.ts';

declareRootProviders([GlobalConfigService]);
const config = useRootService(GlobalConfigService);
```

### App 级：useAppService / declareAppProviders / declareAppProvidersPlugin

App 级作用域通过 `app.runWithContext` 在指定 Vue App 实例的上下文中操作容器，适用于多 App 实例场景。

- `declareAppProviders(providers, app)` —— 在指定 App 实例的上下文中声明服务提供者。
- `useAppService(token, app)` —— 从 App 容器中获取服务实例，找不到时可回退到根容器，但不会查找组件容器。
- `declareAppProvidersPlugin(providers)` —— 返回一个 Vue 插件，可直接用于 `app.use()`。

```ts
import { createApp } from 'vue';
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service';
import { AppService } from './service.ts';
import App from './App.vue';

const app = createApp(App);
// 以 Vue 插件形式声明 App 级服务
app.use(declareAppProvidersPlugin([AppService]));
app.mount('#app');
```

## 装饰器

除了从 `@kaokei/di` 重新导出的 `@Inject`、`@PostConstruct` 等装饰器外，本库还提供以下三个与 Vue 响应式系统集成的装饰器。

### @Computed

将 getter 属性转换为 Vue `computed` 响应式计算属性。支持 `@Computed` 和 `@Computed()` 两种用法。采用懒创建策略——首次访问时才创建 `ComputedRef`。如果原型链上存在同名 setter，则自动创建 writable computed。

```ts
import { Computed } from '@kaokei/use-vue-service';

class UserService {
  public firstName = '张';
  public lastName = '三';

  @Computed
  public get fullName() {
    return this.firstName + this.lastName;
  }
}
```

### @Raw

本库采用 **opt-out** 响应式策略：服务实例的所有属性默认都是响应式的，只有需要排除的属性才使用 `@Raw` 标记。这与 Pinia 等需要显式声明响应式字段的 opt-in 策略相反。

`@Raw` 标记属性或整个类不参与 Vue 响应式追踪。支持 `@Raw` 和 `@Raw()` 两种用法，支持普通 field、auto-accessor、class 三种装饰目标。适用于复杂的第三方 SDK 对象（如 ECharts 实例、Monaco Editor 实例等），避免转为响应式导致的性能问题或功能异常。

```ts
import { Raw } from '@kaokei/use-vue-service';

class ChartService {
  // 普通 field 用法：该属性值自动调用 markRaw，不被 Vue 代理
  @Raw
  public chartInstance: any = null;

  // auto-accessor 用法：读写时均保持 raw
  @Raw
  accessor editorInstance: any = null;
}

// class 用法：整个实例不被 reactive() 包裹
@Raw
class RawService {
  public data = {};
}
```

### @RunInScope

在 `EffectScope` 中运行方法，自动管理副作用生命周期。每次调用被装饰方法时，会在实例的根 Scope 内创建一个新的子 Scope，并在子 Scope 中执行方法体，返回该子 Scope。支持 `@RunInScope` 和 `@RunInScope()` 两种用法。

与 `@PostConstruct` 不同，`@RunInScope` **不会自动调用**被装饰的方法，需要用户主动调用才会生效。

绝大多数场景下不需要关注返回的 `EffectScope`，直接调用方法即可——实例销毁时所有副作用会自动清理。只有需要提前手动停止某次调用产生的副作用时，才需要保留返回值。

```ts
import { RunInScope } from '@kaokei/use-vue-service';
import { watchEffect } from 'vue';

class TimerService {
  public count = 0;

  @RunInScope
  public startWatch() {
    watchEffect(() => {
      console.log('count 变化了：', this.count);
    });
  }
}

// 主动调用后，watchEffect 才开始运行
timerService.startWatch();
```

## Token 常量

本库导出两个预定义的 Token 常量，用于在父子组件之间查找服务实例。

### FIND_CHILD_SERVICE

`FIND_CHILD_SERVICE` 是一个 `Token<FindChildService>` 实例。通过该 Token 获取的函数可以根据指定的 token 查找子组件中声明的单个服务实例。如果未找到则返回 `undefined`。

```ts
import { useService, FIND_CHILD_SERVICE } from '@kaokei/use-vue-service';

const findChild = useService(FIND_CHILD_SERVICE);
const childService = findChild(SomeService);
```

### FIND_CHILDREN_SERVICES

`FIND_CHILDREN_SERVICES` 是一个 `Token<FindChildrenServices>` 实例。通过该 Token 获取的函数可以根据指定的 token 查找子组件中声明的所有匹配服务实例，返回一个数组。

```ts
import { useService, FIND_CHILDREN_SERVICES } from '@kaokei/use-vue-service';

const findChildren = useService(FIND_CHILDREN_SERVICES);
const allChildServices = findChildren(SomeService);
```
