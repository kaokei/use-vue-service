# API 文档

## [@kaokei/di](https://github.com/kaokei/di/blob/main/docs/api/README.md)

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

## useRootService

```ts
function useRootService<T>(token: CommonToken<T>): T;
```

`useRootService`方法和`declareRootProviders`方法是一对。
也就是`declareRootProviders`方法声明的服务，需要通过`useRootService`来获取。

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

## CURRENT_COMPONENT

```ts
// 使用场景1
const component = useService(CURRENT_COMPONENT);
```

```ts
// 使用场景2
class DemoService {
  @Inject(CURRENT_COMPONENT)
  public component!: ComponentInternalInstance;

  public handleClickEvent() {
    const service = findService(token, this.component);
    service.doSomething();
  }
}
```

用于获取当前组件的实例对象，实际山和`getCurrentInstance`方法的返回值是一样的。
本意是用于场景 2 中，也就是 findService 需要提供当前组件作为参数。

## CURRENT_CONTAINER

```ts
// 使用场景1
const container = useService(CURRENT_CONTAINER);
```

```ts
// 使用场景2
class DemoService {
  @Inject(CURRENT_CONTAINER)
  public container!: Container;
}
```

暂时没有想到使用场景，功能和`CURRENT_COMPONENT`类似，可以获取到当前绑定的 container 对象。

## findService

```ts
function findService<T>(
  token: CommonToken<T>,
  component: ComponentInternalInstance
): T | undefined;
```

功能和`useService`类似，用于获取当前组件的子孙组件中绑定的 token 服务。返回第一个找到的服务实例。

## findAllServices

```ts
function findAllServices<T>(
  token: CommonToken<T>,
  component: ComponentInternalInstance
): T[];
```

功能同上，返回所有找到的服务要求的服务实例数组。

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
