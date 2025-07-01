# API 文档

## [@kaokei/di](https://github.com/kaokei/di/blob/main/docs/api/index.md)

本库是基于`@kaokei/di`开发的，默认导出了`@kaokei/di`中的所有 API。

主要是业务开发中也是经常需要使用到`@kaokei/di`中的 API，本库默认导出了`@kaokei/di`是为了方便用户导入 API，也就是只需要从`@kaokei/use-vue-service`中可以导入所有 API。不需要从两个不同的库中分别导入 API，从而避免一定的记忆成本。

## declareProviders

```ts
function declareProviders(providers: FunctionProvider): void;
function declareProviders(providers: NewableProvider): void;
```

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

`useService`方法和`declareProviders`方法是一对。
也就是`declareProviders`方法声明的服务，需要通过`useService`来获取。

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

基本逻辑和`declareProviders`方法一致，但是需要注意这里的 container 是全局唯一的，是`@kaokei/use-vue-service`提前创建好的，不需要和任何 vue 组件进行关联。

`declareRootProviders`的伪代码如下：

```ts
// 根据providers的类型，绑定对应的服务
root_container.bind(ClassName).toSelf();
```

## getRootService

```ts
function getRootService<T>(token: CommonToken<T>): T;
```

`getRootService`方法和`declareRootProviders`方法是一对。
也就是`declareRootProviders`方法声明的服务，需要通过`getRootService`来获取。

`getRootService`的伪代码如下：

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
`declareRootProviders`方法是全局声明绑定服务，后续通过`getRootService`获取对应的服务。

`declareAppProviders`则是在 vue app 上声明绑定服务，后续通过`useAppService`获取对应的服务。
观察下方的伪代码就能知道这里使用的是`app.provide`方法代替了`provide`方法。

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

## declareAppProvidersPlugin

```ts
function declareAppProvidersPlugin(providers: FunctionProvider): Plugin;
function declareAppProvidersPlugin(providers: NewableProvider): Plugin;
```

注意到上方的`declareAppProviders`方法需要明确提供 app 参数。
这里的`declareAppProvidersPlugin`方法则不需要 app 参数，这是因为本方法返回的是一个 vue 插件，需要将`declareAppProvidersPlugin`返回值当作一个 vue 插件来使用。

## useAppService

```ts
function useAppService<T>(token: CommonToken<T>, app: App): T;
```

`useAppService`方法和`declareAppProviders`方法是一对。
也就是`declareAppProviders`方法声明的服务，需要通过`useAppService`来获取。

`useAppService`的伪代码如下：

```ts
app.runWithContext(() => {
  // 通过inject获取最近父级组件/祖先组件关联的container对象
  const container = inject(CONTAINER_TOKEN);
  // 通过container.get获取对应的服务
  return container.get(token);
});
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
  public findService!: TokenType<typeof FIND_CHILD_SERVICE>;

  public handleClickBtn() {
    const childService = this.findService(ChildService);
    childService.doSomething();
  }
}
```

## FIND_CHILDREN_SERVICES

```ts
const findAllService = useService(FIND_CHILDREN_SERVICES);
const service = findAllService(Token);
```

功能同上，返回指定 token 服务的多个实例组成的数组。FIND_CHILDREN_SERVICES 本身是一个 token，所以也可以用在服务中。

```ts
class DemoService {
  @Inject(FIND_CHILDREN_SERVICES)
  public findAllService!: TokenType<typeof FIND_CHILDREN_SERVICES>;

  public handleClickBtn() {
    const childServices = this.findAllService(ChildService);
    childServices.forEach(service => service.doSomething());
  }
}
```

## Computed

```ts
class DemoService {
  public _count = 1;

  @Computed
  public get count() {
    return this._count * 100;
  }
}
```

通过 vue 的`computed`对 class 的 getter 属性进行性能优化，避免每次访问都重复执行 getter 方法，只有在确实有依赖变化时，才会重新执行 getter 方法。

## getEffectScope

```ts
class DemoService {
  public init() {
    getEffectScope().run(() => {
      const doubled = computed(() => counter.value * 2);
      watch(doubled, () => console.log(doubled.value));
      watchEffect(() => console.log('Count: ', doubled.value));
    });
  }
}
```

主要是用于解决`computed`、`watch`、`watchEffect`等方法的副作用销毁问题。
也就是当实力对象被销毁时，`computed`、`watch`、`watchEffect`等方法的副作用也会被销毁。

如果没有`getEffectScope`工具方法，那么就需要自己手动管理 effectScope 的生命周期。

```ts
class DemoService {
  public init() {
    this.scope = effectScope();
    this.scope.run(() => {
      const doubled = computed(() => counter.value * 2);
      watch(doubled, () => console.log(doubled.value));
      watchEffect(() => console.log('Count: ', doubled.value));
    });
  }

  @PreDestroy()
  public dispose() {
    this.scope.stop();
  }
}
```
