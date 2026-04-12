---
author: kaokei
title: 前端常见库的理解
---

## 常见库的理解

简单记录一下常见库的个人理解，把这些库放在一起对比后可以比较方便的知道各个库的不同，以及凸显 `@kaokei/use-vue-service` 的差异点和必要性。

可以从这几个方面来分析库的不同点。

- 如何定义服务
- 如何组织/组合/管理/注册服务
- 如何获取服务
- 数据如何驱动模板

这里的服务的定义是：**特定领域相关数据和方法的集合**。

## 定义服务的方式

1. class

```
// 定义服务
class Counter {
  count: 0;
}

const counter1 = new Counter(); // 获取服务实例
const counter2 = new Counter(); // 获取服务实例
```

2. function

```
// 定义服务
function getCounter() {
  return {
    count: 0
  }
}

const counter1 = getCounter(); // 获取服务实例
const counter2 = getCounter(); // 获取服务实例
```

3. 对象字面量

```
const Counter = {
  count: 0
}
```

注意这里第 3 种方式是单例模式，如果想要多个实例，只能使用 deepClone 来复制数据了。实际上没有哪个库是采用这种方式。

这里只是想明确一下服务声明和服务本身是两个不同的概念。服务定义可以有多种不同的形式，但是服务本身就是一个普通 js 对象。

## redux 以及 react-redux

[![redux](https://github-readme-stats.vercel.app/api/pin?username=reduxjs&repo=redux)](https://github.com/reduxjs/redux)
[![react-redux](https://github-readme-stats.vercel.app/api/pin?username=reduxjs&repo=react-redux)](https://github.com/reduxjs/react-redux)

- [reduxjs/redux](https://github.com/reduxjs/redux)
- [reduxjs/react-redux](https://github.com/reduxjs/react-redux)
- [redux 中文文档](https://www.redux.org.cn/)
- [官网 github demo](https://github.com/reduxjs/redux#examples)
- [官网文档 examples](https://redux.js.org/introduction/examples#todomvc)
- [官网文档 中间件选择](https://redux.js.org/faq/actions#what-async-middleware-should-i-use-how-do-you-decide-between-thunks-sagas-observables-or-something-else)

redux 本身的概念比较简单，而且是和具体 UI 框架无关的。所以必须要配合 react-redux 一起使用才能更好的在 react 中使用。

```
// 观察redux的主要API调用
const rootReducer = combineReducers({subReducer1, subReducer2});
const store = createStore(rootReducer);
store.subscribe(() => console.log(store.getState()));
store.dispatch({type: 'someType'});
```

第一点需要弄明白的就是 reducer 的定义。reducer 本身是一个纯函数，是和 redux 无关的。

但是函数签名必须满足：`(previousState = initialState, action) => newState`，其实这也是和类所表达的服务是一个东西，是数据和方法的封装。

其中 state 部分就是数据，但是要注意这里的 state 部分，虽然说 reducer 是一个纯函数，但其实并不够纯，因为 initalState 必然属于闭包中的一个变量值。

而 action 部分就是方法。只不过这里的 action 部分使用的是 type 字段，类型是字符串而已。

再看 combineReducers 只是组合服务的一种方式而已。

然后再通过 createStore 创建一个全局 store，通过 store 来管理这些服务，最重要的一种管理方式就是只能通过 store.dispatch 来修改数据。

又因为 store 是全局的，我们可以通过单例模式，import 到需要的模块中，就达到获取服务的目的了。

而 store.subscribe 则是实现数据驱动模板更新的最底层的机制。

如果不使用 react-redux，可以参考这个[简单的例子](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter)。

这个例子中可以明显看出来如何通过 store.subscribe 来实现数据变化进而驱动模板更新。但是这样操作的性能太低了。

再来看看 react-redux，它是基于 redux 的连接 react 和 redux 的库，基本特性和 redux 一致，主要是解决了 store 中数据变化时，模版也会自动更新。

主要 api 是 connect 和 Provider。

Provider 通过 context 提供了全局的 store，是为了 conenct 服务的。在 connect 中可以随时通过 context 获取到 store。从而读取数据。

connect 本身是是一个函数，该函数返回值是一个高阶组件。注意高阶组件是一个函数，而不是组件。这个高阶组件函数可以包裹我们自己的组件，返回一个新组件。

该高阶组件可以通过闭包拿到 connect 提供的 mapStateToProps 和 mapDispatchToProps，通过这两个函数再加上 context 中的 store，就可以获取到相应数据和方法了。

其中数据部分是：`store+mapStateToProps=>newState`，其中方法部分是：`store.dispatch+mapDispatchToProps=>newActions`。

目前为止还只能解决组件第一次渲染的时候获取数据的问题，关键还是要解决数据变化的时候，组件如何响应更新。

实际上还是需要依赖 store.subscribe 这个 api，会在组件 mounted 时注册一个监听器，卸载组件时取消监听器。

该监听器每次会重新从 store 获取数据，并和缓存中的数据做对比，如果数据有变化，那么执行 setState 操作，从而更新组件。

redux 的缺点是模版代码很多，而且在 reducer 中已经定义了数据和方法了，在 connect 中还是需要再次定义数据和方法。再加上 action、actionCreator 等等。

> 使用 reduce 表达服务，使用闭包中的 initialState 作为服务的初始值
> 使用 combineReducers 来组合服务
> 使用 createStore 来管理服务
> 使用 Provider 提供全局的 store，组件使用 connect 来订阅 store 中的数据和方法
> 组件通过 store.dispatch 来修改数据，当 store 中数据变化时，因为 connect 订阅了 store，所以会接收到 store.subscribe 的通知，从而可以更新组件

## 对比 vuex 和 redux 的区别 todo

mutable 和 immutable
自顶向下
直接触达

## mobx 和 mobx-react

[![mobx](https://github-readme-stats.vercel.app/api/pin?username=mobxjs&repo=mobx)](https://github.com/mobxjs/mobx)
[![mobx-react](https://github-readme-stats.vercel.app/api/pin?username=mobxjs&repo=mobx-react)](https://github.com/mobxjs/mobx-react)
[![awesome-mobx](https://github-readme-stats.vercel.app/api/pin?username=mobxjs&repo=awesome-mobx)](https://github.com/mobxjs/awesome-mobx#examples)

- [mobxjs/mobx](https://github.com/mobxjs/mobx)
- [mobxjs/mobx-react](https://github.com/mobxjs/mobx-react)
- [mobx 官方例子](https://github.com/mobxjs/awesome-mobx#examples)
- [参考官方文档](https://cn.mobx.js.org/intro/overview.html)

mobx 和 vue 非常像，可以说大部分能力 vue 已经天生支持了，剩下的就是如何组织代码的区别而已。

**mobx 使用步骤**

1. 定义可观察数据，可以是对象或者类。这里依赖 mobx 的 observable 这个 API。
2. 定义组件。这里依赖 mobx-react 的 observer 这个 API。
3. 通过依赖注入 store 到组件，依赖 mobx-react 的 Provider 和 inject 两个 API
4. 然后我们只要改变了数据，组件就会自动更新。

再对比 vue3 中的实现，第 1 步其实就是 reactive 这个 api，第 2 步中 vue 组件默认就是会观察 reactive 数据的，所以也不需要 observer 这个 API。至于第 3 步确实还没有比较好的复用数据的方式。这也就是 `@kaokei/use-vue-service` 主要做的事情。

参考这个[demo](https://github.com/gothinkster/react-mobx-realworld-example-app)，分析如下：

1. 采用类来定义服务，但是需要具体声明各个属性和方法的性质，比如@observable @computed @action
2. 然后导出一个类的实例，这里就能看出来至少在这个项目中服务都是单例的，如果需要多例，就需要自己手动 new 多个实例。
3. 然后在根组件使用 Provider，这个 Provider 比较特殊，可以注入任意个值。
4. 然后在组件中就可以@inject('articlesStore')类似这样注入服务，然后就可以通过 this.props 获取到特定 store 数据。
5. 因为定义组件时，会将组件当作参数传递给 observer 函数，所以当数据有变化时，observer 函数就会更新组件。

再参考这个[demo](https://github.com/mobxjs/mobx-react-todomvc)

这里没有使用 Provider，而是通过 props 从根组件一层层传递服务，这也是一种方式，但是就略显麻烦，但是证明了只要能获取到 store，就可以使用该 store 的数据和方法。而且能看出来，相比于 redux 和 react-redux，mobx 和 mobx-react 结合的更加紧密，完全不能独立分开使用。

## mobx-state-tree

[![mobx-state-tree](https://github-readme-stats.vercel.app/api/pin?username=mobxjs&repo=mobx-state-tree)](https://github.com/mobxjs/mobx-state-tree)

- [mobxjs/mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

mobx-state-tree 虽然是基于 mobx 的，但是定位应该是和 mobx 是一样的，只不过在于组织代码方面有所区别。

参考[这个例子](https://github.com/mobxjs/mobx-state-tree/tree/master/packages/mst-example-redux-todomvc)

可以发现居然还可以和 redux 相结合，虽然我觉得有点脱裤子放屁了。这里面有很多的重复性工作。

依赖 redux 的 Provider 来提供全局单一数据源，然后依赖 connect 订阅数据源。

在定义 mobx-state-tree 的模型的 actions 时，需要 actions 常量作为方法名。

在 mapDispatchToProps 时也需要 actions 常量生成方法名，关键是组件中的 props 还是需要定义一摸一样的方法名来接受 props。

总之就是非常繁琐，而且耦合非常严重，但是确实可以工作，而且能非常明确的看出来 mobx-state-tree 具体做了什么工作，没有做什么工作。

注意 mobx-state-tree 非常明显的语法特征：

`const SomeStore = types.model("modelName").props({someProps}).views({someViews}).actions({someActions})`

看起来狂拽酷炫吊炸天，实际上就是一个类的换一种写法，也就是 mobx-state-tree 中服务的定义形式。

需要注意的是 mobx-state-tree 自带一套类型系统，尤其是其中的 Model 类型，是可以嵌套的。从而可以形成一个 state-tree。

还有一点就是实际使用 mobx-state-tree 时，还是需要我们手动初始化 Model 的。

`const someStore = SomeStore.create(initialState)`

参考[这个例子](https://github.com/mobxjs/mobx-state-tree/tree/master/packages/mst-example-bookshop)

这个例子可以明显看出来 mobx-state-tree 是代替了 mobx，并且配合 mobx-react 来工作的。

上面有分析过，主要就是 Provider 和 inject 注入 store，并且 mobx-state-tree 是依赖 mobx 的，所以数据本身也是响应式的。

可以明显看出来，mobx-state-tree 和 mobx 的区别在于组织代码的区别。

- mobx 是采用类来组织数据和方法。
- mobx-state-tree 是基于自带的类型定义采用链式方法调用来定义数据和方法。并且 Model 本身就是类型，也就意味着 Model 是可以嵌套的，所以这也是 mobx-state-tree 名称的来源，因为 Model 就是 state，嵌套之后就会形成一颗树。但是 mobx 中的类则不能相互嵌套形成复杂的“类树”。

可以看出来 mobx-state-tree 这个库相比于 mobx 更加的 opinionated，它有一套自己的代码组织方式。但是我现在觉得单一数据源就是有原罪的。

## redux-thunk

[![redux-thunk](https://github-readme-stats.vercel.app/api/pin?username=reduxjs&repo=redux-thunk)](https://github.com/reduxjs/redux-thunk)

- [reduxjs/redux-thunk](https://github.com/reduxjs/redux-thunk)

这个是 redux 的中间件，而且是官方的中间件。用来解决 redux 本身不支持异步更新的缺点。如果看了源代码会惊讶的发现只有十几行代码。

原来的 store.dispatch 只支持对象作为参数，经过 redux-thunk 中间件的加持就可以额外支持 dispatch 一个函数了，而且函数的第一个参数还是 dispatch，意味着我们可以在函数内部再次调用 dispatch。在函数内部我们可以写条件判断逻辑，可以异步执行 dispatch。

再加上 async/await 的加持，基本可以解决所有异步问题。而且可以避免深度回调的噩梦。

再来说说问题的本质。redux 本身只是提供了 store 来保存数据，通过 store.dispatch 来更新数据。它本身并不支持异步更新和条件更新。

实际上这只是客观描述这个现状，这本身并不是一个问题。问题在于我们非要把这些条件逻辑和异步逻辑放到 redux 中来管理而已。

通过 redux-thunk 的加持，我们可以这样写代码：

```
store.dispatch((dispatch) => {
  setTimeout(function() {
    dispatch({
      type: 'add',
      payload: 1
    });
  }, 5000);
})
```

但是实际上没有 redux-thunk 中间件，我们可以这样写代码：

```
setTimeout(function() {
  store.dispatch({
    type: 'add',
    payload: 1
  })
}, 5000)
```

只不过缺点是没有纳入 redux 中被管理起来，我们可能需要把这些逻辑抽取出来，放到一个公共的模块中。然后 import 到当前模块中使用。

## redux-saga

[![redux-saga](https://github-readme-stats.vercel.app/api/pin?username=redux-saga&repo=redux-saga)](https://github.com/redux-saga/redux-saga)

- [redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)
- [redux-saga 中文文档](https://github.com/superRaytin/redux-saga-in-chinese)
- [Vuex、Flux、Redux、Redux-saga、Dva、MobX](https://zhuanlan.zhihu.com/p/53599723)
- [Redux-Saga 漫谈](https://zhuanlan.zhihu.com/p/35437092)
- [彻彻底底教会你使用 Redux-saga(包含样例代码)](https://zhuanlan.zhihu.com/p/39452751)
- [redux-saga 实现原理及 umi, dva 设计思想解析](https://zhuanlan.zhihu.com/p/98870028)
- [redux-saga 实践总结](https://zhuanlan.zhihu.com/p/23012870)

saga 是英语 传奇 的意思。它的思想是 拦截。

同样是 redux 的中间件，和 redux-thunk 一样都是为了解决 redux 解决不了的副作用的问题。

据说是用来解决复杂异步场景下的问题。

我没有 redux-saga 的使用经验，之前尝试入门过好几次，每次都是放弃了，是真正的从入门到放弃。这次因为要写总结，还是硬着头皮看了一些文章，大概弄明白了 saga 的原理。

像 redux-thunk、redux-promise 这些中间件都是特别简单的，源代码都没有几行。总体思路都是增强 store.dispatch 函数的能力。

原始 store.dispatch 只支持 dispatch 普通对象，redux-thunk 中间件则可以支持 dispatch 函数，redux-promise 中间件则可以 dispatch promise。

针对 redux-thunk 分析 store.dispatch(action)，如果 action 是函数，那么就执行这个函数，而且函数参数就是 dispatch，这样在 action 内部可以再次使用 dispatch 去真正的 dispatch 一个普通对象，达到修改 store 中数据的效果。

对比分析一下 redux-saga，它也是增强了 store.dispatch 能力，但是不像 redux-thunk 是判断 action 本身是不是函数来执行不同的策略。redux-saga 虽然增强了 store.dispatch 的能力，但是它还是只能 dispatch 普通对象，这就意味着我们很难从 store.dispatch 区分我们到底是 dispatch 一个普通 action，还是一个 saga action。因为它们的格式都是:

```
{
  type: 'ACTION_NAME',
  payload: some_data
}
```

那么 redux-saga 是如何增强 store.dispatch 的呢？我的理解是基于字符串匹配的。因为在使用 redux-saga 时，第一步是定义 saga，然后是需要注册 saga，注册的时候，其实就是配置 ACTION_NAME 和 saga 的映射。

那么当用户手动 store.dispatch 一个普通对象时，redux-saga 这个中间件会去自己注册的 saga 列表中去找有没有对应的 ACTION_NAME，如果找到了该 ACTION_NAME，那么就执行该 ACTION_NAME 对应的 saga 函数。剩下的逻辑和 redux-thunk 是一样的，thunk 本身就是一个普通函数，只是具有访问 dispatch 的能力，这样我们就可以随意在 thunk 函数中调用 dispatch 函数来更新 store 中的数据。saga 也是一个函数，它倒是不能直接访问 dispatch 函数，但是提供了更多更复杂的函数来帮助我们处理副作用、异步逻辑。其中的 put 函数就是类似 dispatch 的能力。还有一点需要注意，类似 put 这类的 effect function 是从从全局包导入的。`import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'`，这意味着他们是全局唯一的，也意味着他们是单例的，也意味着全局 store 也是单例的，但是在 redux-thunk 是可以实现多例的。

如果要是找不到对应的 ACTION_NAME，那么就走正常的 redux 原始的 store.dispatch 逻辑，也就是直接通过 reducer 来消费该 action，最终修改了 store 中的数据。这里还可以再强调一点，正常 redux 的逻辑是由多个 reducer 组合而成的，这些 reducer 内部会消费 action，隐含逻辑是所有 reducer 中的 ACTION_NAME 都是全局的，是不能同名的，否则可能会引起逻辑错误。

总结就是 redux-thunk 是通过类型来判断当前 action 到底是函数，还是普通对象。redux-saga 则是通过字符串匹配来检查到底是 saga action，还是原来的普通的 action。

还有一点区别是 redux-saga 是需要常驻内存的监听器的，redux-thunk 则不需要。

有人说 redux-saga 是通过事件监听机制来实现的，或者说观察者订阅者模式实现的，但是底层还是依赖字符串匹配。

## redux-observable

[![redux-observable](https://github-readme-stats.vercel.app/api/pin?username=redux-observable&repo=redux-observable)](https://github.com/redux-observable/redux-observable)

- [redux-observable/redux-observable](https://github.com/redux-observable/redux-observable)

看名字就知道是基于 rxjs 的 redux 的中间件。我没有使用过该库，只是看了看文档。

因为我有过 angular 的开发经验，所以对 rxjs 还算比较熟悉。当我在熟悉 redux-saga 的过程中，我就发现其 api 的设计和 rxjs 非常相似。这里的相似是指操作符部分。

rxjs 中提供了很多的操作符函数来帮助我们操作流，redux-saga 中提供了很多 effect function 来帮助我们操作副作用。

再来看 redux-observable 的 api，我发现 redux-saga 和 redux-observable 非常相似。这里的相似是指架构设计部分。

redux-saga 中主要概念是 saga，对应 redux-observable 中主要概念是 epic。通过声明式的语句定义好这些 saga 或者 epic，然后在通过 combine 函数组合成 rootSaga 或者 rootEpic。

在注册完 redux 中间件后，即 applyMiddle 后，还需要 run(rootSaga)或者 run(rootEpic)。

不管是 saga 还是 epic，他们的思想都是通过 store.dispatch(plain action)来触发异步调用，并调用另一些 store.dispatch(plain action)。

本质都是要根据字符串匹配找到对应的 saga 或者 epic，然后执行相应的异步逻辑。该异步逻辑又会通过 dispatch(plain action)来修改 store 中的数据。

## dva

[![dva](https://github-readme-stats.vercel.app/api/pin?username=dvajs&repo=dva)](https://github.com/dvajs/dva)

- [dvajs/dva](https://github.com/dvajs/dva)
- [一图胜千言, 何况是四图? 图解 DVA](https://www.yuque.com/flying.ni/the-tower/tvzasn)
- [Dva 源码解析](https://dvajs.com/guide/source-code-explore.html#%E9%9A%90%E8%97%8F%E5%9C%A8-package-json-%E9%87%8C%E7%9A%84%E7%A7%98%E5%AF%86)

dva 首先是一个基于 redux 和 redux-saga 的数据流方案，然后为了简化开发体验，dva 还额外内置了 react-router 和 fetch，所以也可以理解为一个轻量级的应用框架。

通过官方介绍，可以知道 dva 是通过组合 redux、redux-saga、react-router、fetch、antd 这些项目必须的常用库，以及采用约定大于配置的思想定义了自己的开发规范。并且提供了 dva-cli 脚手架快速初始化项目目录。

```
app.model({
  namespace: 'count', // 全局store的一级属性
  state: { // store.count的子属性
    record: 0,
    current: 0,
  },
  reducers: { // redux概念中的reducers
    add(state) {},
    minus(state) {},
  },
  effects: { // redux-saga概念中的saga
    *add(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: 'minus' });
    },
  },
  subscriptions: { // 新增加的概念，主要是帮助我们订阅其他事件
    keyboardWatcher({ dispatch }) {
      key('⌘+up, ctrl+up', () => { dispatch({type:'add'}) });
    },
  },
});
```

可以看出主要特点是把 store 及 saga 统一为一个 model 的概念, 写在一个 js 文件里面，增加了一个 Subscriptions, 用于收集其他来源的 action, eg: 键盘操作

可以把 dva 理解为换一种方式组织 react、redux、saga 代码。虽然看起来没有新东西，但是确实有助于管理代码，提升开发效率，所以又有人说 dva 只是 react 开发的一种最佳实践。

再回过头看看上面的示例代码，其他属性都不用太关心，唯有 namespace 是必须要要关心的，目前我知道有两个作用：

第一：自动作为全局 store 的一级属性，意味着在 connect 时，必须以 namespace 作为参数解构。
第二：prefixNamespace 函数使用 reduce 对每一个 model 做处理，为 model 的 reducers 和 effects 中的方法添加了 namespace 的前缀。解决了 redux 中 action 重名的问题，以及 saga 中 action 重名的问题。

```
可以直接指定namespace来跨model通信
yield call({ type: 'namespace/foo' });
yield take({ type: 'namespace/bar' });
```

## rematch

[![rematch](https://github-readme-stats.vercel.app/api/pin?username=rematch&repo=rematch)](https://github.com/rematch/rematch)

- [rematch/rematch](https://github.com/rematch/rematch)
- [rematch 官方文档](https://rematch.netlify.app/#/)

## composition-api

[![composition-api](https://github-readme-stats.vercel.app/api/pin?username=vuejs&repo=composition-api)](https://github.com/vuejs/composition-api)

- [vuejs/composition-api](https://github.com/vuejs/composition-api)

## rxjs

[![rxjs](https://github-readme-stats.vercel.app/api/pin?username=ReactiveX&repo=rxjs)](https://github.com/ReactiveX/rxjs)

- [ReactiveX/rxjs](https://github.com/ReactiveX/rxjs)

有人说 rxjs 和 promise 非常像，确实如此。但是随着学习的深入，就会发现差别越来越大。

- promise 只有单个值，observable 则可以有多个值。
- promise 函数是立即执行的，observable 则是订阅后才执行的。
- promise 不能被取消，observable 则可以取消订阅。
- promise 没有提供便利的操作符函数，observable 则提供了一系列强大的操作符函数。
- 以上这些差异最终导致 promise 是需要使用的时候才去使用的，是命令式的；observable 则容易上瘾，我自己容易把所有的业务逻辑变成 observable 的衍变逻辑，是声明式的。

## vue-rx

[![vue-rx](https://github-readme-stats.vercel.app/api/pin?username=vuejs&repo=vue-rx)](https://github.com/vuejs/vue-rx)

- [vuejs/vue-rx](https://github.com/vuejs/vue-rx)

```
new Vue({
  // requires `Rx` passed to Vue.use() to expose `Subject`
  domStreams: ['plus$'],
  subscriptions () {
    // use this.plus$
  }
})

<button v-stream:click="{ subject: plus$, data: someData }">+</button>
```

作为 Vue 的插件，我们可以通过 subscriptions 属性声明 observable 属性，可以通过 domStreams 属性声明流式事件。

唯一不习惯的是 subscriptions 声明的属性一般没有\$后缀，因为在模版中使用的时候确实不是 observable 对象，但是有时候我们确实又想知道这个变量到底是不是流。

总之没有在 angular 使用的这么舒服，并且和 vue 本身的配合还是有一些不和谐的地方。subscriptions 对象本身每个属性都是流，但是我们实际使用的时候，已经变成普通数据了，就像 data 属性声明的那些属性一样。这就导致一些问题。

第一、认知方面的转变，我们定义的是流，使用的时候却是数据，只不过该数据会被流驱动修改。

第二、所有流式 api 都只能在 subscriptions 内部使用，其他地方都不能（不建议）使用流相关的 api。

第三、官网中有说到，因为初始化顺序问题，导致不能直接在 watch 中观察 subscriptions。这也是 subscriptions 和 data 的区别。

第四、新增加了很多概念以及 api，有上手成本。

## Recoil todo

[![Recoil](https://github-readme-stats.vercel.app/api/pin?username=facebookexperimental&repo=Recoil)](https://github.com/facebookexperimental/Recoil)

- [Recoil 仓库](https://github.com/facebookexperimental/Recoil)
- [Recoil 官方文档](https://www.recoiljs.cn/docs/introduction/getting-started)
- [如何评价 Facebook 的 React 状态管理库 Recoil？](https://www.zhihu.com/question/394899726/answer/1264322654)

## immer

[![immer](https://github-readme-stats.vercel.app/api/pin?username=immerjs&repo=immer)](https://github.com/immerjs/immer)
[![immutable-js](https://github-readme-stats.vercel.app/api/pin?username=immutable-js&repo=immutable-js)](https://github.com/immutable-js/immutable-js)

- [immerjs/immer](https://github.com/immerjs/immer)
- [immutable-js/immutable-js](https://github.com/immutable-js/immutable-js)
- [官方文档](https://immerjs.github.io/immer/docs/introduction)
- [immer.js:也许更适合你的 immutable js 库](https://zhuanlan.zhihu.com/p/122187278)

immerjs 和 immutable-js 都是用来实现 immutable 效果的库。我自己之前一直没有意识到我在写代码的时候，也会不自觉的使用了 immutable 特性。比如：

```
const baseArray = [1, 2, 3];
const baseObj = { name: 'zhangsan', age: 12 };

const newArray = baseArray.map(val => val + 1);
const newArray = [...baseArray];
const newObj = {...baseObj, age: 13};
```

但是这些方式都属于浅拷贝，有时候我们需要处理复杂的 json 数据，就需要用到深拷贝，比如`lodash.deepClone`。

但是每次修改都需要深拷贝的话，性能方面比较差，所以就有了 immerjs 和 immutable-js，他们的实现原理都是只会拷贝修改部分的数据，没有修改过的数据则不会拷贝。

immutable-js 的特点是采用 fromJS 和 toJS，可以将普通 js 类型和 immutable-js 自带的类型之间转化，所有的修改都需要嗲用 immutable-js 自带的类型的特定方法去修改数据，但是最终消费数据的时候，还是需要采用 toJS 转化为普通对象。

这种转换来转换去的操作，我不是很喜欢，而且 api 众多，上手成本过高。但是优点是兼容性比较好。

反果类 immerjs 这个库只是提供了 produce 这个函数来实现 immutable 特性。参考如下代码：

```
import produce from "immer"

const baseState = [
    {
        todo: "Learn typescript",
        done: true
    },
    {
        todo: "Try immer",
        done: false
    }
]

const nextState = produce(baseState, draftState => {
    draftState.push({todo: "Tweet about it"})
    draftState[1].done = true
})
```

观察示例代码，使用 produce 函数，可以通过 reducer 的处理 baseState，得到一个新的对象 nextState。说实话，我光看这个示例代码没有办法想出来它底层原理是如何实现的。当然最简单的实现肯定是先把 baseState 深拷贝一份，然后当作参数传递给 draftState，然后返回值就是 nextState 了。但是显然这么做完全不需要 immerjs 了，用户只需要一个深拷贝函数就行了。因为这并没有实现只拷贝修改的部分。上面参考文章中有提到它内部其实是用到了 Proxy 来实现的，具体可以看那篇文章。

## concent

[![concent](https://github-readme-stats.vercel.app/api/pin?username=concentjs&repo=concent)](https://github.com/concentjs/concent)

- [concentjs/concent](https://github.com/concentjs/concent)
- [concent 知乎专栏](https://zhuanlan.zhihu.com/p/114655336)
- [concent minimal-example](https://github.com/concentjs/concent#minimal-example)
- [concent complete-example](https://github.com/concentjs/concent#complete-example)

从服务的角度来理解就非常容易理解 concent 的思路，当然有些细节不看源码还是不太了解。

观察官网的示例代码，通过对象的形式定义服务，并且通过 run 函数注册服务。需要注意这里的服务可以包含数据 state，computed，也有方法 reducer，甚至还有 watch 和 lifecycle。

注意官网一直说的是 module，我这里说的是服务，虽然名词不一样，但是指的是一个东西。需要注意这里的服务的标识符号是字符串。那么在使用服务的时候。
在类组件上使用`@register("counter")`，在函数组件上使用`useConcent("counter");`。可以明显看出来服务的标识符就是字符串。

另外@register 和 useConcent 这两个 api 不仅仅是只能接受一个字符串来代表一个服务，或者说 module。

在知乎专栏这篇文章中有展示其他使用方式，比如：

```
useConcent('login');
useConcent({connect: ['login']});
useConcent({module: "login", state: spState});
useConcent({module: "login", state: spState, setup});
useConcent({setup, state: iState, props});
useConcent({state: iState});
```

可以看出来目前就有 connect，module，state，setup，props 这些属性，注意到 module 本身也是有 state 的，组件本身也是有 state 的；connect 和 module 的区别是什么？setup 又是做什么的？ 总体来说还是太复杂了。

不清楚服务，或者说 module 是否支持多例，主要是看到示例代码中有关生命周期部分的注释有提到多例，但是不清楚如何实现的。

## dob

[![dob](https://github-readme-stats.vercel.app/api/pin?username=dobjs&repo=dob)](https://github.com/dobjs/dob)

- [dobjs/dob](https://github.com/dobjs/dob)
- [要不要支持一下国产的 dob?](https://www.zhihu.com/question/63726609/answer/212605476)

理念与 mobx 相同，使用 proxy 让使用过程更流畅，数组不会搞成纯对象，有依赖注入最佳实践，还能配合 redux。

只是看了看官网的示例代码，感觉和 mobx 非常像，api 一样，代码组织方式都基本是一样的。

## xreact

[![xreact](https://github-readme-stats.vercel.app/api/pin?username=reactive-react&repo=xreact)](https://github.com/reactive-react/xreact)

- [reactive-react/xreact](https://github.com/reactive-react/xreact)
- [FP, FRP, observable, declarative, monadic, composable, reactivex, fantasyland](https://www.zhihu.com/question/63726609/answer/212818893)

这个项目应该类似 vue-rx，但是对于这种项目我个人理解价值不大。我的理解是像 rxjs 这种库，就像 jquery、lodash 一样，就是一种工具库。我们使用这些工具库也不需要专门的 react-jquery，react-lodash。
像 xreact，vue-rx 这种库，一般都是 opinionated library，提供自己的开发规范。当然如果认可这种开发规范，对开发效率应该是有提升的。但是我还是更愿意自己手写 rxjs 代码，就像在 angular 中一样。

我硬着头皮看了看官方文档，比我想的要复杂得多，并没有像 vue-rx 那样是在 vue 基础上增加了很少的概念，xreact 增加的概念就比较多了。官方文档介绍了如何使用 xreact，一共分成 3 步：

第一步：定义视图组件，也叫受控组件、展示组件、无状态组件

这里还是 react 的概念，只不过对 props 有固定的要求，即必须含有 props.actions 属性，该属性包含了改变数据的所有方法。

第二步：定义 Plan

这里开始出现 xreact 特有的概念了，plan 本身就是一个函数，只不过对入参和出参有固定的要求。

入参是 `intent$`, 本身是一个流，其中的值就是 action。

出参是一个对象，包含 `update$` 和 `actions` 两个属性。`update$` 类似于 redux 中的 `reducer`，`actions` 属性则是类似于 redux 中的 `action creator`

这里需要注意第一步中定义组件时也有一个 actions，我的理解是这两个 actions 虽然有关联，但是不完全一致，其中 props.actions 更加像 redux 中的 `store.dispatch(action)`

我看了一下项目的 package.json，本身是不依赖 redux 的，所以应该是自己实现了类似的 api，但是似乎没有发现类似 combineReducers 的函数。

目前我看到的示例代码都是一个 plan 对应一个组件，似乎没有类似 combinePlan 这样的函数来组合 plan。

第三步：我认为就是链接 plan 和组件

但是命名有点过于简约了。比如 X、 x。

```
<X x={rx}>
  <Counter />
</X>,

猜测功能应该类似于

<Provider store={store}>
  <Counter />
</Provider>
```

还有一点也需要注意：

```
import {x, X} from 'xreact/lib/x'
const Counter = x(plan)(CounterView)
```

这里的 x 是一个函数，但是`<X x={rx}>`中的 x 只是一个 props 属性

## stamen

[![stamen](https://github-readme-stats.vercel.app/api/pin?username=forsigner&repo=stamen)](https://github.com/forsigner/stamen)

- [forsigner/stamen](https://github.com/forsigner/stamen)
- [简洁的 React 状态管理库 - Stamen - 该文档太旧了，和最新版本的 api 不太一致](https://zhuanlan.zhihu.com/p/45789975)
- [Stamen 文档](http://forsigner.com/stamen-zh-cn/)

Stamen 是一个 immutable React 状态管理库。api 非常简洁，内部采用 immer 实现 immutable 特性。

我刚开始看的是知乎的文章，后来才看的是 github 主页，发现知乎的文章是 2018 年的，最新版本已经有很大变化了。

只看最新版本的话，api 变得特别像 redux 和 dva 了。

通过 createStore 返回 useStore 和 dispatch，其中 useStore 可以获取数据，dispatch 可以修改数据。

多 store 的实现，依赖 import/export 来手动导入导出。

组件依赖多个 store 的场景，需要重命名 useStore 和 dispatch。

## redux-arena

[![redux-arena](https://github-readme-stats.vercel.app/api/pin?username=hapood&repo=redux-arena)](https://github.com/hapood/redux-arena)

- [hapood/redux-arena](https://github.com/hapood/redux-arena/blob/master/README.zh-CN.MD)
- [全新的 redux 模块化框架，redux-arena](https://zhuanlan.zhihu.com/p/28690716)

我的理解 redux-arena 的特点是依赖 react、redux、redux-saga、immutable 实现 state、saga、action、Component 在组件级别可复用。

如果把 state、saga、action 理解为服务的一种形式，这句话可以解释为实现服务在组件层面可复用。是不是有 angular 的味道了。

## 各个库的特性总结

- 如何定义服务
  - 类
  - 工厂函数
  - 函数链式调用
  - reducer
- 如何组织/组合服务
  - 依赖注入
  - combineReducers
  - 单例还是多例
- 如何获取服务
  - 自动初始化还是手动初始化
  - 全局 Provider+connect 还是手动 import 还是依赖注入
- 数据如何驱动模板

## vue 和 react 的数据驱动的区别

immutable 和 mutable
react 是修改完数据后再次执行函数组件或者 render 函数来更新视图
vue 是视图订阅数据，数据变更后通知视图更新。
xxx 场景下，理论上 vue 的效率要比 react 高。

## 其他参考文章

- [Redux 与它的中间件：redux-thunk，redux-actions，redux-promise，redux-saga](https://www.cnblogs.com/vvjiang/p/9505646.html)
- [redux 异步处理之 redux-thunk 和 redux-saga—阿楠](https://blog.csdn.net/weixin_50076551/article/details/108751709)
- [redux-thunk 和 redux-saga 的区别？](https://zhuanlan.zhihu.com/p/126481634)
- [异步方案选型 redux-saga 和 redux-thunk（async/await）](https://blog.csdn.net/liwusen/article/details/79677827)
- [Redux 源码解析](https://zhuanlan.zhihu.com/p/321362823)
- [Rectx - 通过引入基类提供默认的 setState 方式管理数据](https://zhuanlan.zhihu.com/p/35894511)
- [除 Redux 外，目前还有哪些状态管理解决方案？1](https://www.zhihu.com/question/63726609/answer/212562463)
- [除 Redux 外，目前还有哪些状态管理解决方案？2](https://www.zhihu.com/question/63726609/answer/212270561)
- [除 Redux 外，目前还有哪些状态管理解决方案？3](https://www.zhihu.com/question/63726609/answer/1284469580)
- [除 Redux 外，目前还有哪些状态管理解决方案？4](https://www.zhihu.com/question/63726609/answer/212357616)
- [两种状态管理模型](https://zhuanlan.zhihu.com/p/271170805)
- [Redux 数据流管理架构有什么致命缺陷,未来会如何改进？1](https://www.zhihu.com/question/277623017/answer/396056598)
- [Redux 数据流管理架构有什么致命缺陷,未来会如何改进？2](https://www.zhihu.com/question/277623017/answer/395056100)
- [Redux 数据流管理架构有什么致命缺陷,未来会如何改进？3](https://www.zhihu.com/question/277623017/answer/1517983092)
- [鬼才！我居然把 Vue3 的原理用到了 React 上？](https://zhuanlan.zhihu.com/p/227953759)
- [Vue 3 核心原理 -- reactivity 自己实现](https://zhuanlan.zhihu.com/p/94964868)
- [React Hooks 是否可以改为用类似 Vue 3 Composition API 的方式实现？1](https://www.zhihu.com/question/378861485/answer/1127598769)
- [React Hooks 是否可以改为用类似 Vue 3 Composition API 的方式实现？2](https://www.zhihu.com/question/378861485/answer/1080453929)
- [React Hooks 是否可以改为用类似 Vue 3 Composition API 的方式实现？3](https://www.zhihu.com/question/378861485/answer/1153717028)
