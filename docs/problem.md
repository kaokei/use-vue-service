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
从以上代码可以看出，lazyInject不仅仅依赖第三方包，而且还是通过具体的container生成了，这样就会导致lazyInject和具体的container绑定了，这显然是不能接受的，因为我在定义我的服务的时候并不关系最终由哪个contaienr来管理。

## 容器级别的 activation 钩子

[Global activation hooks](https://github.com/inversify/InversifyJS/issues/471)

从 2017 年就有的 issue 了，至今还没有解决。

目前也只能通过劫持 bind 函数来实现，但是也不太方便。
