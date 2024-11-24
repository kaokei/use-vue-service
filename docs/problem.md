## class 中不能直接使用 computed

[When "reactive" uses "class" and "computed", the "computed" attribute will not Reactive](https://github.com/vuejs/core/issues/1036)

建议还是手动调用 init 方法初始化 computed 属性，而不是直接定义 computed 属性。

在 inversify 的背景下，使用 postReactive 代替 postConstruct。

另一个备选方案就是 getter，但是 getter 是没有缓存的。

## inversify 不支持循环依赖

[Circular dependencies with LazyServiceIdentifier](https://github.com/inversify/InversifyJS/issues/1206)

虽然有第三方的装饰器，但是性能不好，并且可能有副作用。

```
import getDecorators from "inversify-inject-decorators";
import { Container, injectable, tagged, named } from "inversify";

let container = new Container();
let { lazyInject } = getDecorators(container);
```

从以上代码可以看出，lazyInject 不仅仅依赖第三方包，而且还是通过具体的 container 生成了，这样就会导致 lazyInject 和具体的 container 绑定了，这显然是不能接受的，因为我在定义我的服务的时候并不关系最终由哪个 contaienr 来管理。

## 容器级别的 activation 钩子

[Global activation hooks](https://github.com/inversify/InversifyJS/issues/471)

从 2017 年就有的 issue 了，至今还没有解决。

目前也只能通过劫持 bind 函数来实现，但是也不太方便。

## 子容器获取实例时，依赖的实例是默认在子容器还是父容器

[Child-container-resolving problem within hierarchical DI](https://github.com/inversify/InversifyJS/issues/1156)

class Bar 依赖 class Foo

场景 1:
采用自动注入机制，父子容器都没有绑定关系，此时调用 childContainer.get(Bar)
此时 Bar 和 Foo 应该在哪个容易实例化？

场景 2:
采用自动注入机制，父容器绑定了 Bar，此时调用 childContainer.get(Bar)
此时 Bar 和 Foo 应该在哪个容易实例化？

场景 3:
采用自动注入机制，子容器绑定了 Bar，此时调用 childContainer.get(Bar)
此时 Bar 和 Foo 应该在哪个容易实例化？

## 容器获取所有子容器

当前 inversify 没有提供这个方法，所以也不太好实现父组件获取子组件相关的服务实例。

## 不再提供ContainerModule这种方案

```
function bindContainer(container: Container, providers: any) {
  if (providers instanceof ContainerModule) {
    container.load(providers);
  } else if (typeof providers === 'function') {
    providers(container);
  } else {
    for (let i = 0; i < providers.length; i++) {
      const s = providers[i];
      container.bind(s).toSelf();
    }
  }
}
```

主要是ContainerModule和直接暴露container从功能上比较重复，没有必要提供重复的功能。
而且还可以减少一个依赖项。
