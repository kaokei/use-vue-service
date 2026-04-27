# API 文档

## [@kaokei/di](https://github.com/kaokei/di/blob/main/docs/api/index.md)

本库是基于`@kaokei/di`开发的，默认导出了`@kaokei/di`中的所有 API。

主要是业务开发中也是经常需要使用到`@kaokei/di`中的 API，本库默认导出了`@kaokei/di`是为了方便用户导入 API，也就是只需要从`@kaokei/use-vue-service`中可以导入所有 API。不需要从两个不同的库中分别导入 API，从而避免一定的记忆成本。

## 类型定义

### NewableProvider / FunctionProvider / Provider

```ts
import type { Container, Newable } from '@kaokei/di';

type NewableProvider = Newable[];
type FunctionProvider = (container: Container) => void;
type Provider = NewableProvider | FunctionProvider;
```

- `NewableProvider`：类数组形式的服务提供者。将每个类以 `toSelf()` 的方式绑定到容器，即类本身既是 token 也是实现。
- `FunctionProvider`：函数形式的服务提供者。接收容器实例作为参数，允许使用者自由调用容器的绑定 API（如 `container.bind(token).toConstantValue()`、`container.bind(token).toDynamicValue()` 等），实现更灵活的绑定方式。
- `Provider`：`NewableProvider | FunctionProvider` 的联合类型，是 `declareProviders` 等 API 的参数类型。

使用示例：

```ts
import { declareProviders } from '@kaokei/use-vue-service';

// NewableProvider 用法：传入类数组
declareProviders([ServiceA, ServiceB]);

// FunctionProvider 用法：传入函数，自由绑定
declareProviders((container) => {
  container.bind(ServiceA).toSelf();
  container.bind(TOKEN).toConstantValue('hello');
});
```

### FindChildService / FindChildrenServices

```ts
import type { CommonToken } from '@kaokei/di';

type FindChildService = <T>(token: CommonToken<T>) => T | undefined;
type FindChildrenServices = <T>(token: CommonToken<T>) => T[];
```

- `FindChildService`：通过 `FIND_CHILD_SERVICE` Token 获取的工具函数类型。接收一个 token 参数，返回当前组件的子孙组件中绑定的第一个匹配服务实例，如果未找到则返回 `undefined`。
- `FindChildrenServices`：通过 `FIND_CHILDREN_SERVICES` Token 获取的工具函数类型。接收一个 token 参数，返回当前组件的子孙组件中绑定的所有匹配服务实例组成的数组。

## declareProviders

```ts
function declareProviders(providers: FunctionProvider): void;
function declareProviders(providers: NewableProvider): void;
```

在当前组件中声明服务提供者。

行为逻辑：
- 如果当前组件已经声明过容器（重复调用 `declareProviders`），则直接在已有容器上追加绑定。
- 如果当前组件尚未声明容器，则创建一个子容器（继承父级容器的所有绑定），在子容器上绑定新的服务，并通过 Vue 的 `provide` 将子容器注入组件树。组件卸载时自动销毁子容器。

`declareProviders`的伪代码如下：

```ts
// 创建一个container对象
const container = new Container();
// 将container对象和当前组件进行绑定，这样其子孙组件就可以快速找到这个container对象了
provide(CONTAINER_TOKEN, container);
// 根据providers的类型，绑定对应的服务
container.bind(ClassName).toSelf();
```

## useService

```ts
function useService<T>(token: CommonToken<T>): T;
```

在组件内获取服务实例时最常用的方法。

查找顺序：先检查当前组件自身是否声明了容器，如果没有，则沿组件树向上查找最近的祖先组件的容器，再回退到 App 容器，最终回退到全局根容器。因此 `useService` 能读取三组 API（`declareProviders`、`declareAppProviders`、`declareRootProviders`）声明的所有服务。

`useService`的伪代码如下：

```ts
// 通过inject获取最近父级组件/祖先组件关联的container对象
const container = inject(CONTAINER_TOKEN);
// 通过container.get获取对应的服务
return container.get(token);
```

## declareRootProviders

```ts
function declareRootProviders(providers: FunctionProvider): void;
function declareRootProviders(providers: NewableProvider): void;
```

基本逻辑和`declareProviders`方法一致，但是需要注意这里的 container 是全局唯一的，是`@kaokei/use-vue-service`提前创建好的，不需要和任何 vue 组件进行关联。不依赖 Vue 组件树，可以在任何地方调用。

`declareRootProviders`的伪代码如下：

```ts
// 根据providers的类型，绑定对应的服务
root_container.bind(ClassName).toSelf();
```

## useRootService

```ts
function useRootService<T>(token: CommonToken<T>): T;
```

`useRootService` 直接操作全局根容器，只能读取 `declareRootProviders` 声明的服务，不会查找 App 容器或组件容器。适用于组件树之外的场景（如 main.ts、工具函数等）。

`useRootService`的伪代码如下：

```ts
// 直接通过root_container.get获取对应的服务
return root_container.get(token);
```

## declareAppProviders

```ts
function declareAppProviders(providers: FunctionProvider, app: App): void;
function declareAppProviders(providers: NewableProvider, app: App): void;
```

参考`declareProviders`方法是用于组件内部声明绑定服务，后续通过`useService`获取对应的服务。
`declareRootProviders`方法是全局声明绑定服务，后续通过`useRootService`获取对应的服务。

`declareAppProviders`则是在 vue app 上声明绑定服务，后续通过`useAppService`获取对应的服务。
观察下方的伪代码就能知道这里使用的是`app.provide`方法代替了`provide`方法。

行为逻辑：
- 如果该 App 已经有容器（之前调用过 `declareAppProviders`），则直接追加绑定。
- 如果该 App 尚未有容器，则以全局根容器为 parent 创建子容器，绑定服务，并通过 `app.provide` 将容器注入该 App 的组件树。App 卸载时自动销毁容器。

`declareAppProviders`的伪代码如下：

```ts
app.runWithContext(() => {
  // 创建一个container对象
  const container = new Container();
  // 将container对象和当前组件进行绑定，这样其子孙组件就可以快速找到这个container对象了
  app.provide(CONTAINER_TOKEN, container);
  // 根据providers的类型，绑定对应的服务
  container.bind(ClassName).toSelf();
});
```

## useAppService

```ts
function useAppService<T>(token: CommonToken<T>, app: App): T;
```

在 App 容器中获取服务实例。查找范围从 App 容器开始，找不到时可回退到全局根容器，因此能读取 `declareAppProviders` 和 `declareRootProviders` 声明的服务。由于不在组件的 `provide/inject` 链上，无法读取组件内通过 `declareProviders` 声明的服务。

`useAppService`的伪代码如下：

```ts
app.runWithContext(() => {
  // 通过inject获取最近父级组件/祖先组件关联的container对象
  const container = inject(CONTAINER_TOKEN);
  // 通过container.get获取对应的服务
  return container.get(token);
});
```

## declareAppProvidersPlugin

```ts
function declareAppProvidersPlugin(providers: Provider): (app: App) => void;
```

注意到上方的`declareAppProviders`方法需要明确提供 app 参数。
这里的`declareAppProvidersPlugin`方法则不需要 app 参数，这是因为本方法返回的是一个 vue 插件，需要将`declareAppProvidersPlugin`返回值当作一个 vue 插件来使用。

使用示例：

```ts
import { createApp } from 'vue';
import { declareAppProvidersPlugin } from '@kaokei/use-vue-service';
import App from './App.vue';

const app = createApp(App);
app.use(declareAppProvidersPlugin([ServiceA, ServiceB]));
app.mount('#app');
```

## FIND_CHILD_SERVICE

```ts
const findService = useService(FIND_CHILD_SERVICE);
const service = findService(Token);
```

首先通过 useService 获取一个工具方法，该工具方法用于查找当前组件的子孙组件中绑定的 token 服务。返回找到的第一个服务实例。

FIND_CHILD_SERVICE 本身是一个 token，所以也可以用在服务中。

```ts
class DemoService {
  @Inject(FIND_CHILD_SERVICE)
  public findService!: FindChildService;

  public handleClickBtn() {
    const childService = this.findService(ChildService);
    childService?.doSomething();
  }
}
```

## FIND_CHILDREN_SERVICES

```ts
const findAllService = useService(FIND_CHILDREN_SERVICES);
const services = findAllService(Token);
```

功能同上，返回指定 token 服务的多个实例组成的数组。FIND_CHILDREN_SERVICES 本身是一个 token，所以也可以用在服务中。

```ts
class DemoService {
  @Inject(FIND_CHILDREN_SERVICES)
  public findAllService!: FindChildrenServices;

  public handleClickBtn() {
    const childServices = this.findAllService(ChildService);
    childServices.forEach(service => service.doSomething());
  }
}
```

## Computed

```ts
// 用法一：不带括号
@Computed
public get count() {
  return this._count * 100;
}

// 用法二：带括号
@Computed()
public get count() {
  return this._count * 100;
}
```

`@Computed` 装饰器用于将 class 的 getter 属性转换为 Vue 的 `computed` 响应式计算属性。支持 `@Computed` 和 `@Computed()` 两种用法，效果完全一致。

### 功能说明

- 对 getter 属性进行性能优化，避免每次访问都重复执行 getter 方法，只有在确实有依赖变化时，才会重新执行 getter 方法。
- 采用懒创建策略（Lazy）：首次在 reactive 代理上访问该 getter 时，才会创建 `ComputedRef`。创建后会在原始实例上定义同名数据属性来存储 `ComputedRef`，后续访问由 reactive 的 Auto_Unwrap 机制自动解包。
- 支持 writable computed：如果原型链上存在同名的 setter，则自动创建可写的 `computed({ get, set })`。赋值时 reactive 的 Auto_Unwrap 会调用 `computedRef.value = val`，触发 writable computed 的 set 回调，进而调用原始 setter。

### 使用示例

只读 computed：

```ts
import { Computed } from '@kaokei/use-vue-service';

class CountService {
  public count = 1;

  @Computed
  public get doubleCount() {
    return this.count * 2;
  }
}
```

Writable computed：

```ts
import { Computed } from '@kaokei/use-vue-service';

class UserService {
  public firstName = '张';
  public lastName = '三';

  @Computed
  public get fullName() {
    return this.firstName + this.lastName;
  }

  public set fullName(val: string) {
    this.firstName = val.slice(0, 1);
    this.lastName = val.slice(1);
  }
}
```

## Raw

```ts
// 用法一：不带括号
@Raw
public chart = {};

// 用法二：带括号
@Raw()
public chart = {};
```

`@Raw` 装饰器用于标记属性不参与 Vue 的响应式追踪。支持 `@Raw` 和 `@Raw()` 两种用法，效果完全一致。

### 功能说明

当服务实例被 `reactive()` 包裹后，默认所有属性都会被递归转为响应式对象。对于复杂的第三方 SDK 对象（如 ECharts 实例、Monaco Editor 实例等），转为响应式会导致性能问题甚至功能异常。

使用 `@Raw` 装饰的属性，无论初始值还是后续赋值，都会自动调用 `markRaw`，确保该属性值永远不会被 Vue 的响应式系统代理。

### 装饰目标

`@Raw` 支持三种装饰目标：

**普通 field 装饰器：**

```ts
import { Raw } from '@kaokei/use-vue-service';

class ChartService {
  @Raw
  public chartInstance = {};

  @Raw()
  public editorInstance = {};
}
```

**auto-accessor 装饰器：**

```ts
import { Raw } from '@kaokei/use-vue-service';

class ChartService {
  @Raw
  accessor chartInstance = {};

  @Raw()
  accessor editorInstance = {};
}
```

**class 装饰器：**

```ts
import { Raw } from '@kaokei/use-vue-service';

@Raw
class RawService {
  public data = {};
}
```

当 `@Raw` 装饰整个 class 时，该类的实例被激活时不会被 `reactive()` 包裹，整个实例保持原始对象状态，不参与任何响应式追踪。适用于需要完全脱离 Vue 响应式系统的服务类。

### 使用示例

```ts
import { Raw } from '@kaokei/use-vue-service';

class MapService {
  // 地图实例不参与响应式追踪
  @Raw
  public mapInstance: any = null;

  public zoom = 10;

  public initMap(el: HTMLElement) {
    // 赋值时自动调用 markRaw，确保 mapInstance 不被代理
    this.mapInstance = new SomeMapSDK(el);
  }
}
```

## RunInScope

```ts
// 用法一：不带括号
@RunInScope
public setup() {
  watchEffect(() => { /* ... */ });
}

// 用法二：带括号
@RunInScope()
public setup() {
  watchEffect(() => { /* ... */ });
}
```

`@RunInScope` 装饰器用于在 Vue 的 `EffectScope` 中运行方法，自动管理副作用生命周期。支持 `@RunInScope` 和 `@RunInScope()` 两种用法，效果完全一致。

### 功能说明

每次调用被装饰方法时：

1. 获取或创建实例的 Root_Scope（每个实例对象上最多只存在一个 Root_Scope）
2. 在 Root_Scope 内创建新的 Child_Scope
3. 在 Child_Scope 中执行原始方法体
4. 返回 Child_Scope 给调用者

返回的 `EffectScope` 可以用于手动停止副作用。当实例销毁时，Root_Scope 会被自动清理，其下所有 Child_Scope 中的 `computed`、`watch`、`watchEffect` 等副作用也会一并销毁。

### 使用示例

```ts
import type { EffectScope } from 'vue';
import { watchEffect } from 'vue';
import { RunInScope } from '@kaokei/use-vue-service';

class DemoService {
  public count = 0;

  @RunInScope
  public setup(): EffectScope {
    watchEffect(() => {
      console.log('count 变化了：', this.count);
    });
    return null as unknown as EffectScope;
  }
}
```

手动停止副作用：

```ts
// 调用被装饰方法，返回 EffectScope
const scope = demoService.setup() as unknown as EffectScope;

// 当不再需要副作用时，手动停止
scope.stop();
```

::: tip 关于返回类型
由于 TypeScript 装饰器目前无法自动修改被装饰方法的返回类型，原始方法返回 `void`，但装饰器在运行时将返回值替换为 `EffectScope`。推荐在方法签名上显式声明返回 `EffectScope`，并在方法体末尾添加 `return null as unknown as EffectScope` 占位，这样调用侧可以直接获得正确的类型推断。
:::
