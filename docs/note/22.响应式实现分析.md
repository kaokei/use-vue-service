---
author: kaokei
title: 依赖注入
---

## doux

该库似乎已经被删除了，但是历史代码还存在，代码实现比较简单，非常方便入门分析。

observable 相当于 reactive
observe 相当于 watch
observer 相当于 watchEffect

其实 observable 和另外两个是比较独立的，可以独立分析。

observable 在 get/ownKeys/has 三个方法中会调用 track 方法来收集依赖。在 set/deleteProperty 这个两个方法中会调用 trigger 方法来触发副作用。

对比 track 和 trigger 的参数部分，主要是通过 target+key 这两个参数作为链接的桥梁。简单的理解为在 track 时，把 activeEffect 存储到 target+key 对应的 map 中，当 trigger 发生时就可以通过 target+key 来获取曾经保存的 activeEffect，然后执行它。关键点在于 activeEffect 是一个运行时产生的，observable 本身是不依赖它的。

提到 activeEffect，它是怎么产生的呢？其实就是由 observe 产生的。observe 的返回值就是 effect。
其中这段代码说明了 activeEffect 是怎么产生的：

```ts
effectStack.push(effect);
activeEffect = effect;
return Reflect.apply(fn, ctx, args);
```

其中`fn`就是我们想要观察的代码，想要收集依赖的代码。所以在执行该代码之前，我们提前准备好 activeEffect。

observer 主要是实现了对组件的观察，主要是判断 effect 是否有 cb 属性。

```ts
effects.forEach((e: Effect) => (isFn(e.cb) ? e.cb(e) : e()));
```

## dob

首先查看最简单的例子。

```ts
import { observable, observe } from "dob";

const obj = observable({ a: 1 });

observe(() => {
  debugger;
  console.log("obj.a has changed to", obj.a);
}); // <· obj.a has changed to 1

obj.a = 2; // <· obj.a has changed to 2
```

首先 observable 会把一个普通对象转变为 Proxy 对象。主要是 get/set/deleteProperty 这三个属性。这种转变只是为了后续作服务的。

当执行 observe 函数时，类似于 vue-next 中的 watchEffect，它是立即执行的。关键在于 Reaction 中有一段代码是这样的。

```ts
global_state_1.globalState.currentReaction = this; // Clear bindings first.

this.clearBinding();

try {
  callback({
    debugId: global_state_1.globalState.currentDebugId
  });
} finally {
  global_state_1.globalState.currentReaction = null;
}
```

这段代码是非常经典的，首先设置当前的依赖项 currentReaction，然后执行 callback，再清除 currentReaction。这样在执行 callback 的过程中，会触发 observable 中设置的 getter 函数。会把 currentReaction 当作所有数据的依赖。关键代码在`bindCurrentReaction`中实现。

相应的当我们执行`obj.a = 2`时，会触发 Proxy 的 setter 函数，会调用 queueRunReactions 从而找到刚才保存下来的 currentReaction，然后就可以`runReaction(currentReaction)`。

重点需要关注`Reaction`的实现，类似于 vue-next 中的`effect`的实现。

另一个比较重要的点是这个库非常依赖全局状态管理，主要集中在 global-state.ts 文件中，尤其是其中的 objectReactionBindings 这个对象。它全局保存了数据和 Reaction 的依赖关系。

依赖`dependency-inject`实现依赖注入的功能。

## dob-react

主要是提供了 Provider 和 Connect 这两个方法。可以在 Provider 这个组件上声明任意多个 props，这些 props 数据都会被注入到`@Connect`装饰的组件中。

也就是说我们自己写的组件如果使用了`@Connect`装饰器，那么组件内`this.props`就会自动被注入一些属性，这些属性就是 Provider 上声明的属性。

目前发现的唯一路径是这样的。`observe`调用`new Reaction`调用`设置currentReaction`，然后在访问 getter 时，就会把数据和 currentReaction 绑定起来，也就是`bindCurrentReaction`。

在 dob 中只能通过`observe`才能实现依赖收集。在`dob-react`中，有以下流程：
`@connect`调用`mixinAndInject`调用`mixinLifecycleEvents`调用`patch`调用`reactiveMixin`调用`initialRender`调用`new Reaction`，从而把组件的 render 函数和数据绑定起来。

当然最终的实现部分还是需要注意`baseRender`和`initialRender`和`reactiveRender`之间的关系。

## concent

这是一个框架，而且功能非常强大，并且更新非常活跃。同时支持类组件和函数组件。唯一我不太喜欢的地方可能就是过于复杂了，上手成本有点高，再加上使用字符串来区分模块也是一个原罪。不过它仍然是一个非常优秀的框架。

我这里重点关注一下 register 和 useConcent 是如何实现组件的响应式更新的。

参考官方文档中[最简单的例子](https://concentjs.github.io/concent-doc/api-much-used/useConcent)

```ts
function Demo() {
  const { state, setState } = useConcent({ module: "foo" });
  const changeName = e => setState({ name: e.target.value });
}
```

可以猜测到 useConcent 本身是不需要做依赖收集的。因为我们还是需要手动调用`setState`方法去更新数据，这时可以强制调用`forseUpdate`方法去更新组件。

分析源码可知，useConcent 返回值是一个`CcHook`的实例对象。这个实例对象的 state 和 setState 就是`React.useState`的返回值。综上 useConcent 就是对`React.useState`的封装，说明我猜测的没有错。

我还发现 useConcent 是不支持直接 mutable 修改 state 数据的，只能通过 setState 来修改数据。make-ob-state.js 中的 setter 中是没有 trigger 方法的，说明确实没有实现 mutable 响应式。

当然 useConcent 是需要做到多个组件共享数据的，也就是一个组件修改了数据，可能会影响到别的组件。

useConcent 调用 buildRef 调用 buildRefCtx，其中 buildRefCtx 会修改 ref.state 属性，该属性会合并当前组件的 state 和 moduleState。这就是 useConcent 从全局获取 moduleState 的过程。

至于 moduleState 状态的改变，是如何改变所有依赖这个 moduleState 所有组件的稍微复杂一些。

build-ref-ctx.js 中使用了 makeObState 处理了 state 数据， 从而利用 Proxy 的 getter 收集依赖。收集依赖的逻辑在 updateDep 函数中。主要是以下代码。

```ts
// 这个key代表着refCtx，从而可以利用这个refCtx来更新组件
const ccUniqueKey = refCtx.ccUniqueKey;
// 这个key代表着数据foo/count
const waKey = makeWaKey(module, key);
// 最终在wakey-ukey-map.js文件中把这两个key通过waKey2uKeyMap关联起来。
```

当用户点击某个按钮，触发点击事件，然后调用 setState 去修改数据时，这个 setState 其实是在 build-ref-ctx.js 文件中定义的，最终会调用 changeState 调用 changeRefState。
changeRefState 会调用 triggerBroadcastState 会调用 broadcastState，其中有个重要的函数是 findUpdateRefs，这个函数会返回所有依赖了变更数据的 ref 的 key。有了这个 key，再加上我们还有全局的 ref 对象池。

```ts
// 获取全局ref对象池，是一个Record<string, Ref>的对象
const ccUKey2ref = ccContext.ccUKey2ref;
// 通过key和全局ref对象池，就能获取到ref对象
const ref = ccUKey2ref[refKey];
// 有了ref对象，就能触发这个ref上的setState方法，从而更新组件
triggerReactSetState(ref);
```

以上分析我是通过 debug 代码观察到  的整个过程。当然我只是观察了最简单的两个组件依赖同一个 module 的过程。

我观察到的最大的结论是 useConcent 没有实现 Proxy 中的 setter 的响应式触发，也就是不支持 mutable 更新数据。第二点就是 concent 在保存数据和视图的依赖关系时，是通过保存 key 与 key 之间的依赖关系，而且还保存了全局的 ref 对象池。从而实现当某个数据变化时，多个依赖该数据的视图都能得到更新。相对应的在很多别的  库中，都是直接通过 map 来保存数据和 Dep 之间的依赖关系。

register 作为一个装饰器，会包装一个类组件，然后返回一个新的类组件。只需要知道这一行代码即可。

```ts
buildRefCtx(this, params, lite);
```

上面有提到的 useConcent 的核心代码就是`buildRefCtx(hookRef, params, lite);`，这行代码内部会重新包装 state 和 setState，从而可以支持 module 等特性。

## @nx-js/observer-util

observable 方法对应的是 reactive 方法，实现原理和 doux 比较一致，只是封装的更好一些。也是在不同的 handler 中处理 track 和 trigger。当然 track 和 trigger 需要处理的是 reaction，相当于 doux 中的 effect。

observe 和 unobserve 则分别对应的是 watch 和 stopWatch 方法。注意这里使用`reaction.scheduler`代替了`reaction`。从而实现了从组件收集依赖和更新组件的分离。这一点和 doux 的`cb`属性是比较相似的。

## preact-nx-observer

observer 方法支持类组件，这里比较取巧的地方就是在 componentDidMount 中替换了 render 方法。

```ts
this.render = observe(this.render, {
  scheduler: () => this.setState({}),
  lazy: true
});
```

这一段代码还是比较巧妙的，但就是不知道兼容性如何。而且也没有支持函数组件。

## react-easy-state

store，以及 createStore 都是对 observable 的封装。只是增加了对`unstable_batchedUpdates`的支持。[参考这片文章](https://zhuanlan.zhihu.com/p/78516581)

view 则是对组件的封装。支持函数组件和类组件。

注意类组件中是在构造函数中替换掉的 render 方法，对比`preact-nx-observer`是在 componentDidMount 中替换的。我认为在构造函数中替换更符合直觉。

```ts
// 针对函数组件的封装
const render = useMemo(
  () =>
    observe(Comp, {
      scheduler: () => setState({}),
      lazy: true
    }),
  // Adding the original Comp here is necessary to make React Hot Reload work
  // it does not affect behavior otherwise
  [Comp]
);
```

```ts
// 针对类组件的封装
this.render = observe(this.render, {
  scheduler: () => this.setState({}),
  lazy: true
});
```

## mobx

```ts
// 相当于vue-next中的reactive
makeObservable(target, annotations?, options?)
makeAutoObservable(target, overrides?, options?)
observable(source, overrides?, options?)
```

需要指定`@observable`,`@action`,`@computed`等来指定各个属性的性质。

```ts
// 相当于vue-next中的watch
reaction(() => value, (value, previousValue, reaction) => { sideEffect }, options?).
```

```ts
// 相当于vue-next中的watchEffect
autorun(effect: (reaction) => void)
```

```ts
// 对组件的封装
import { observer } from "mobx-react-lite"; // Or "mobx-react".
const MyComponent = observer(props => ReactElement);
```

这里的 observer 功能非常强大，只要组件依赖了 observable 数据，不管这个[数据的来源](https://mobx.js.org/react-integration.html#local-and-external-state)是什么，都能触发组件重新渲染。

尤其是对各种情况都考虑的非常周全，值得学习。

## vue-next

整个流程比较像`@nx-js/observer-util`，reactive 也是借助的 Proxy 来实现的，关键是 baseHandler 的实现。然后利用 track 来收集依赖。依赖被转为 effect，又有 activeEffect 和 effectStack 这些概念。

可惜我只想依赖其中的@vue/reactivity 这个库。但是 watch/watchEffect 这两个方法都不包含在内，因为 watch 和 watchEffect 都是和 vue 深度绑定的。

所以如果想要在 react 中使用，则必须实现自己的 watch/watchEffect 方法。

我理解广义 watch 的 api 形式有这 3 种场景：

1. 指定需要 watch 的数据，可以是对象、数组、函数形式指定依赖数据，当数据有变化时，执行 callback
2. 指定一个 effect，第一次立即执行时会收集依赖，后续当这些依赖数据有变化的时候，会再次执行这个 effect
3. 指定 effect 和 callback，当 effect 对应的依赖有变化的时候，会执行 callback

很容易发现在 vue-next 中已经实现了`watch`和`watchEffect`方法，但是实际上在 dowatch 中，又一个细节实现：

```ts
const runner = effect(getter, {
  lazy: true,
  onTrack,
  onTrigger,
  scheduler
});
```

这段代码可以理解为观察 getter 返回的数据是否有变化，如果有变化就执行 scheduler。这就是上面提到的第 3 中 api。而且 1 和 2 就是依赖 3 来实现的。
当 watch 的数据本身看作是一个 getter 时，1 就变成 3 了。
当 effect 等于 callback 时，2 就是 3 的一种特殊形式。
需要注意这里的 3 中的 effect 和 callback 不是完全独立的。如果是完全独立的，应该采用 1 这种形式以 getter 的形式提供观察的数据，而不是以 effect 的形式提供依赖数据。观察如下代码：

```ts
// 这里的本意是当state.count变化时，输出state.name
// 但是这里不应该这么写
watch(
  () => console.log(state.count),
  () => console.log(state.name)
);
// 这里明确以getter的形式提供依赖数据
watch(
  () => state.count,
  () => console.log(state.name)
);
```

3 的场景可能是这样的。

```ts
// renderView是渲染试图的函数，也是我们观察的effect，当其依赖的数据有变化时，我们可能没有办法直接调用renderView这个函数
// 我们只能通过另一个函数forceUpdate来触发视图更新
watch(
  () => renderView(someView),
  () => forceUpdate(someView)
);
```

## constate

[github 网址](https://github.com/diegohaz/constate)

我想实现的库可以看作是 constate 的升级版。现在 constate 只是把 hooks 都放到一个全局的空间中。然后达到所有组件可以共享这个 hooks 的状态。

缺点是只有一个全局命名空间。而且服务的形式只能是 hooks，没有依赖注入，没有 mutable 响应式。

优点是简单，而且只依赖 hooks 和 context，应该是兼容并发模式的。

## react 类组件 vs vue 类组件

react 类组件是官方原生支持的，实例属性不是 reactive 的，只有通过 this.setState 修改 this.state 才会 re-render。

vue 类组件必须借助 vue-class-component 才能工作，其原理也是转化为 Option 组件。其中所有实例属性都是 reactive 的。

## 总结

doux 使用函数组件包裹业务组件，也可以看作是`observe`函数的返回值作为 this.render
preact-nx-observer 是`observe`直接返回新的 render 函数替换 this.render
react-easy-state 也是直接替换的 this.render
dob-react 是需要自己构建新的 render 函数去替换 this.render
concent 主要是对`setState`的封装，而且不支持 mutable 响应式
mobx 再看看
vue-next 中的 render 函数默认就会收集依赖的，而且会把 render 函数当作一个 watchEffect 来对待
