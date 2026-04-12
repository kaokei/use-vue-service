---
author: kaokei
title: 前端框架浅显对比
---

## vue、react 以及 Angular 对比

我第一个接触的框架是 vue，在 vue 之前我用的是 jquery。

这里可以先对比一下 jquery 是如何写代码的。其实关键还是数据和视图的同步工作。

比如某个变量的值改变了（先暂时不管是怎么改变的），现在要把这个数据反应到视图上，就必须首先使用 jquery 获取到相应的 dom，然后修改 dom 的属性。如果是大范围的视图变化，可能还需要相应的前端模版技术配合，比如 underscore 或者 handlebars。

如果用户点击了某个按钮，我们需要响应用户的点击事件。
前提是我们先要使用 jquery 注册 click 事件。
然后在事件内部，我们先获取 input 的数据，然后按照业务逻辑更新内存中的变量。
更新完变量同时后可能还需要更新其他依赖这个变量的 dom。

综上，可以看出来前端的主要工作一直都是保持数据和视图的一致性。

后来我开始使用 vue 来开发页面。整个过程完全不一样了。
我们定义初始数据，然后开发模版，并把数据和模版绑定。
同时在模版上监听事件。在事件处理器内部我们还是只需要更新数据即可。
整个过程完全不需要操作 dom。只要我们更新了数据，视图会自动更新。

人们常说 vue 是数据驱动的。这里非常明显的能感觉到和 jquery 不一样的地方，并且大大提升了开发效率。可以非常明显的感受到数据驱动的优势。

后来我又接触了 react，刚开始接触 react，最难的莫过于 jsx，搞不懂 jsx 和 js 之间的关系。后来理解之后就逐渐喜欢上 react 了。

可以这样理解 jsx `React.createElement(type, props, children);`
这是一个函数调用，返回一个对象，就是一个普通的 js 对象，了解到这些就够了。
之后我就发现 jsx 代码就自动变成 js 代码了。该怎么写代码，就怎么写代码。
React 中没有新的概念，没有新的语法，完全就是在写 js 代码。

在使用 vue 和 react 的过程中，不可避免的要使用到 vuex 和 redux。这种全局单一数据源的想法根深蒂固。
直到我接触到 angular。一开始我就在寻找 angular 中类似的单一数据源。但是我在项目中居然没有找到，接着我又去网上找到了 ngrx。
当然我还没有开始用上它，就发现了单一数据源完全不是必须的，我只需要定义好相应的 service，然后把该 service 注册到相应的组件上即可。
因为服务中是带有数据的。在组件中是可以直接获取到服务中的数据的。
所以如果我想要在全局所有组件中都使用该服务，那么就把该 service 注册到根组件；
如果是某个页面需要该 service，那么就注册到该路由组件即可；
如果只是某个表格组件需要该 service，那么就注册到该表格组件即可；
总之服务本身的定义是服务自己的事；至于服务具体的访问范围则完全取决于注册服务的位置。
而且服务也不一定就是单例的，在不同的地方多次注册，就意味着可以有多个实例。
更方便的是服务和服务之间也是可以互相注入的。

再然后就是我想着能不能在 vue 和 react 中也实现一下依赖注入的能力，于是就有了 `@kaokei/use-vue-service`。至于 use-react-service 则还在开发中。

类和函数

我之前是非常喜欢函数，而不喜欢类的。有很多原因，比如函数在 js 中是第一位的。
没有什么是函数解决不了的，比如模块化 amd 和 commonjs 都依赖函数的闭包。
再一个就是函数可以很纯粹，没有副作用。
类的底层实现也不过是函数的语法糖。

后来我发现某些场景还是类比较适合。甚至是唯一的选择。
比如我想要封装一些数据和方法。当然我可以采用工厂函数来生产新对象，该对象包含所有的数据和方法。
但是缺点是这些方法没有必要重复生产。
当然我们可以把这些方法提出来作为新生产的对象的原型，这样就可以复用这些方法了。
但是我们想要依赖装饰器的能力时，则只能使用类了。

SOA

先来看看什么是 soa，翻译过来就是面向服务的体系架构。关键的一个名词是服务。服务又是什么呢？

服务是数据和方法的集合，并且数据和方法都是可选的。意味着可以是类，函数，字符串，数字，布尔值等等。

但是在当前 ts 环境下，数据和方法的封装最好的方式还是类，再加上装饰器只支持类。所以在 ts 中类是服务最好的表现形式。
当然如果你只需要数据或者只需要方法，是不一定非得需要类。
关于[函数装饰器](https://github.com/microsoft/TypeScript/issues/7318)，目前基本毫无希望了。

类还有一个好处，在依赖注入中，我们需要 Key-Value，类可以既当作 Key，也可以当作 Value。
可以直接使用`const countService = useService(CountService)`获取服务。

如果我们想要注入一个字符串`http://test.com/`，那么我们还要同时定义一个 Key，比如是`const publicPath = 'PUBLIC_PATH'`。
然后使用`declareProviders([{provide: publicPath, useValue: 'http://test.com/'}])`注册服务，
再使用`const publicPathValue = useService(publicPath)`获取服务

[领域驱动设计](https://www.zhihu.com/question/376817427/answer/1069081450)
可以参考这篇文章，非常有深度，虽然我也不能完全理解到位，但是我觉的非常有共鸣。

注意一下数据驱动这个术语的不同含义，上面有提到 vue 是数据驱动的，我的理解是 vue 的组件是数据驱动模版的，数据变化了，模板会跟着更新。
而知乎文章里提到的数据驱动设计是相对于领域驱动设计的，说的不是一回事。
我的简单的理解是数据驱动设计是全局单一数据源，然后组件订阅该数据源部分数据。领域驱动设计重点区别在于不是全局的。而是聚焦于特定领域。
所谓特定领域则是特定的一些数据和方法的集合。比如学生服务 StudentService 是学生相关的数据和方法的集合。

顺便再提一句我认为 angular 中 ngModule 绝对不是必需的。只不过是 angular 团队的一种选择而已，还是目前的一种选择。最新版的 angular11 已经开始支持可以不使用 ngModule 了。
只要分析一下 ngModule 的 3 个属性就能大概理解 ngModule 的作用了：
declarations 声明当前 module 有哪些组件，指令，管道
exports 导出当前 module 的部分组件，指令，管道
imports 导入其它 module 导出的组件，指令，管道

这些内容[angular 官网](https://angular.io/guide/ngmodule-api)上都有，每个字都能看的懂，但是却还是不太理解有什么用。
实际上可以简单的理解为 angular 在编译模板的时候，需要知道模板中出现的那些标签（准确的叫做选择器）到底对应哪个组件、指令或者管道。
只要参考一下 vue 中是怎么做的就更容易理解了，vue 中需要在组件中 components 属性注册当前组件依赖的其它组件。所以 vue 中的做法是在每一个组件上注册自己依赖的其他组件。

但是在 angular 中则是在一个 module 中注册需要的组件。

再来看看[这篇文章](https://zhuanlan.zhihu.com/p/70148492)，这里提供了一种思路可以做到自动化全局注册组件。全局注册也是有缺点的，比如没有使用到的组件也会被加载，组件重名问题。

所以声明组件依赖有三种方式：组件本身，module，全局。只不过 angular 选择了 module 而已。然后 angular 又在 module 的基础上附加了其他功能，比如声明服务的 providers。回到问题本身，答案就是这是 angular 团队的选择而已，并不是必不可少的，也不是毫无缺点的。

再对比一下 vue 和 react 中声明组件的区别，在 vue 中首先需要 import 组件，然后在 components 属性中注册组件。总共需要两步。
但是在 react 中则只需要 import 组件即可以使用了，这是因为 jsx 和 js 是作用域是一致的。所以我一直觉得 vue 中局部注册组件是毫无必要的，因为我都已经 import 了，为什么模板不能从当前作用域中寻找对应的组件呢？

具体原因没有研究过，期待有人能告诉我一下。我个人猜测是和 vue 中组件名称比较混乱有关，有好几种格式。导致模板编译的时候不知道应该编译成那种形式的变量名？
比如在 react 的 jsx 中遇到标签 UserInfo，那么组件名一定就是 UserInfo，而且 react 强制要求组件名首字母必须大写。但是在 vue 中则不一定了。导致编译成 render 函数时不能直接编译过来，现在还是通过标签名在 components 对象中去查找，而且会按照优先级依次判断各种格式的组件名，直到查找到组件为止。
[createElement 源码链接](https://github.com/vuejs/vue/blob/861aea16615a9736eab6af6d05fa5500ae4d6c37/src/core/vdom/create-element.js#L111)
[resolveAsset 源码链接](https://github.com/vuejs/vue/blob/7912f75c5eb09e0aef3e4bfd8a3bb78cad7540d7/src/core/util/options.js#L442)

但是都无所谓了，因为借助[setup 提案](https://github.com/vuejs/rfcs/pull/227)，现在我们也不需要手动在 components 中注册组件了，只需要 import 相应的组件即可。

当然在 vuex 中也是可以划分 module 的，此 module 和 angular 中的 module 不是一回事，它更像是 angular 中的 service。所以也可以说 vuex 也具有部分领域驱动的特性。
但是相比于 angular 中 service 的依赖注入的特点，显得不够灵活。

vue 缺点

vue 中注册局部 components 比较麻烦
vue 中 api 和语法比较多，总是记不住。=

template 和 jsx 区别？
第一层：template 相比于拼接字符串有了很大的提升
第二层：jsx 是什么玩意？完全看不懂为啥能在模版里直接写 js
第三层：jsx 真香，template 显得太不灵活了
第四层：jsx 过于灵活了，导致代码逻辑混乱，完全没有做到 UI 和逻辑的分离。相反 template 只是做了它该做的事情。
第五层：jsx 和 template 都有它的优点。看个人喜好以及场景决定使用哪个。

computed 和 watch 的区别

这个在 mobx 中叫做 computed 和 reactions。
computed 是多个值计算出一个新的值，watch 则是观察一个值，然后触发一些副作用，这些副作用可以修改多个值。
说到这里不得不提的就是 rxjs 了，可以理解为 rxjs 就是 computed 和 reactions 的集合，但是更加强大。
比如 rxjs 中的流可以衍生出新的流，也可以多个流衍生出新的流。每个流都可以 subscribe 自己的副作用。

## 常见库的实现对比

[reduxjs/redux](https://github.com/reduxjs/redux)

redux 本身的概念比较简单，但是复杂的地方在于很难单独使用它，必须结合 react-redux 这样的连接库才能比较方便的工作。
这就意味着必须要同时掌握 redux 和 react-redux 才能顺利使用。

```
const store = createStore(someReducer);
store.subscribe(() => console.log(store.getState()));
store.dispatch({type: 'someType'});
```

最核心的 api 就是这三个了，当然比较关键的还有一点是 reducer 的定义。reducer 本身是一个纯函数，是和 redux 无关的。但是函数签名必须满足：
`(previousState, action) => newState`，其实这也是和类所表达的服务是一个东西。是数据和方法的封装。其中 state 部分就是数据。action 部分就是方法。只不过这里的 action 部分使用的是 type，类型是字符串而已。

尤其要注意其中的 state 部分，虽然说 reducer 是一个纯函数，但其实并不够纯，以为 initalState 必然属于闭包中的一个变量值。

如果不使用 react-redux，可以参考这个[简单的例子](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter)。
这里还有 redux 官网[其他例子](https://github.com/reduxjs/redux#examples)。

使用 reduce 表达服务
使用 combineReducers 来组合服务
可以读取 store 中的数据，以及通过 dispatch 修改数据，但是数据并不会自动更新模板

[reduxjs/react-redux](https://github.com/reduxjs/react-redux)

基于 redux 的链接 react 和 redux 的库，基本特性和 redux 一致，主要是解决了 store 中数据变化时，模版也会自动更新。

主要 api 是 connect 和 Provider。
Provider 通过 context 提供了全局的 store，是为了 conenct 服务的。在 connect 中可以随时通过 context 获取到 store。从而读取数据。
connect 本身是是一个函数，该函数返回值是一个高阶组件。注意高阶组件是一个函数，而不是组件。这个函数可以包裹我们自己的组件。
该高阶组件可以通过闭包拿到 connect 提供的 mapStateToProps 和 mapDispatchToProps，通过这两个函数再加上 context 中的 store，就可以获取到相应数据和方法了。
其中数据部分是：`store+mapStateToProps=>newState`，其中方法部分是：`store.dispatch+mapDispatchToProps=>newActions`。
目前为止还只能解决组件第一次渲染的时候获取数据的问题，关键还是要解决数据变化的时候，组件如何响应更新。

实际上还是需要依赖 store.subscribe 这个 api，会在组建 mounted 时注册一个监听器，卸载组件时取消监听器。
该监听器每次会重新从 store 获取数据，并和缓存中的数据做对比，如果数据有变化，那么执行 setState 操作，从而更新组件。

缺点是模版代码很多，而且在 reducer 中已经定义了数据和方法了，在 connect 中还是需要再次定义数据和方法。

[mobxjs/mobx](https://github.com/mobxjs/mobx)
[mobxjs/mobx-react](https://github.com/mobxjs/mobx-react)
[mobx 官方例子](https://github.com/mobxjs/awesome-mobx#examples)

mobx 和 vue 非常像，可以说大部分能力 vue 已经天生支持了，剩下的就是如何组织代码而已。[参考官方文档](https://cn.mobx.js.org/intro/overview.html)。

1. 第一步：定义可观察数据，可以是对象或者类。这里依赖 mobx 的 observable 这个 API。
2. 第二步：定义组件。这里依赖 mobx-react 的 observer 这个 API。
3. 第三步其实和 mobx 就没有关系了，我们只要改变了数据，组件就会自动更新。

再对比 vue3 中的实现，第一步其实就是 reactive 这个 api，第二步中 vue 组件默认就是会观察 reactive 数据的，所以也不需要 observer 这个 API。

参考这个[demo](https://github.com/gothinkster/react-mobx-realworld-example-app)

1. 采用类来定义服务，但是需要具体声明各个属性和方法的性质，比如@observable @computed @action
2. 然后导出一个类的实例，这里就能看出来至少在这个项目中服务都是单例的，如果需要多例，就需要自己手动 new 多个实例。
3. 然后在根组件使用 Provider
4. 然后在组件中就可以@inject('articlesStore')类似这样注入服务

参考这个[demo](https://github.com/mobxjs/mobx-react-todomvc)
这里没有使用 Provider，而是通过 props 从根组件一层层传递服务

[mobxjs/mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

mobx-state-tree 虽然是基于 mobx 的，但是定位应该是和 mobx 是一样的，只不过在于组织代码方面有所区别。

参考[这个例子](https://github.com/mobxjs/mobx-state-tree/tree/master/packages/mst-example-redux-todomvc)

可以发现居然还可以和 redux 相结合，虽然我觉得有点脱裤子放屁了。这里面有很多的重复性工作。
依赖 redux 的 Provider 来提供全局单一数据源，然后依赖 connect 订阅数据源。
在定义 mobx-state-tree 的模型的 actions 时，需要 actions 常量作为方法名。
在 mapDispatchToProps 时也需要 actions 常量生成方法名，关键是组件中的 props 还是需要定义一摸一样的方法名来接受 props。
总之就是非常繁琐，而且耦合非常严重，但是确实可以工作，而且能非常明确的看出来 mobx-state-tree 具体做了什么工作，没有做什么工作。
还有一点就是 mobx-state-tree 首先是定义了模型（model），这里的 model 可以看作服务，数据和方法的集合。但是实际使用时，还是需要我们手动初始化的。
`const someStore = SomeStore.create(initialState)`

参考[这个例子](https://github.com/mobxjs/mobx-state-tree/tree/master/packages/mst-example-bookshop)
这个例子可以明显看出来 mobx-state-tree 是代替了 mobx，并且配合 mobx-react 来工作的。
上面有分析过，主要就是 Provider 和 inject 注入 store，并且 mobx-state-tree 是依赖 mobx 的，所以数据本身也是响应式的。
可以明显看出来，mobx-state-tree 和 mobx 的区别在于组织代码的区别。
mobx 是采用类来组织数据和方法。
mobx-state-tree 是基于自带的类型定义采用链式方法调用来定义数据和方法。并且 Model 本身就是类型，也就意味着 Model 是可以嵌套的，所以这也是 mobx-state-tree 名称的来源，因为 Model 就是 state，嵌套之后就会形成一颗树。但是 mobx 中的类则不能相互嵌套形成复杂的“类树”。

[reduxjs/redux-thunk](https://github.com/reduxjs/redux-thunk)
[redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)
[redux-observable/redux-observable](https://github.com/redux-observable/redux-observable)

[dvajs/dva](https://github.com/dvajs/dva)

[vuejs/composition-api](https://github.com/vuejs/composition-api)
[concentjs/concent](https://github.com/concentjs/concent)
[concent 知乎专栏](https://zhuanlan.zhihu.com/p/114655336)
[yisar/doux](https://github.com/yisar/doux)

[ReactiveX/rxjs](https://github.com/ReactiveX/rxjs)
[vuejs/vue-rx](https://github.com/vuejs/vue-rx)

[immerjs/immer](https://github.com/immerjs/immer)

这个库不是做状态管理的，只是提供了 produce 这个函数来实现 immutable 特性。

## 需要解决的问题

单例和多例
服务的边界-数据和方法
类
reducer+connect
数据驱动模版/组件
Provider
服务如何管理/组合
依赖注入
combineReducers

## vue 和 react 的数据驱动的区别
