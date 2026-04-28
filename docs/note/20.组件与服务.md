---
author: kaokei
title: 组件与服务
---

## option 组件，类组件和服务的关系

option 组件本身就是一个对象，这个对象预定义了一套属性，比如 data、methods、components 等。

类组件看起来像是一个类，只不过是把一部分 option 组件中的属性定义为类的成员属性。另一部分不支持的属性还是需要借助`vue-class-component`这个库来支持。比如 watch 属性，只能定义在`@Options`这个装饰器中。总之看上去会有点不伦不类。
通过深入分析`vue-class-component`这个库，可以发现最终这个类还是被转化成 option 组件了，所以从性能上来看也并不推荐使用类组件。
当然类组件也是有优势的，比如在 angular 中，组件只能是类，大多数服务也是类，而且都可以使用依赖注入，整体上来看是比较一致的。

服务可以是任意数据或者任意方法或者数据和方法的集合。在依赖注入框架中，大多数服务被定义成类，因为类对依赖注入是最友好的。

## 为什么使用类来作为服务

类是一种抽象，而类的实例化过程就是从抽象到具体的转变。正是因为存在这一实例化的过程，所以就存在干预这个过程的机会。

类本身是一个语法糖，每个实例独享数据，但是共享方法。在存在多个实例时也是一种性能优化。

而且类是支持装饰器的，装饰器则是提供了一种声明式语法。

## 类组件是如何收集数据的

查看`vue-class-component`的[源码](https://github.com/vuejs/vue-class-component/blob/16433462b40aefecc030919623f17b0ec9afe61c/dist/vue-class-component.esm-browser.js#L160)可以知道，类组件会被转化为 Option 组件，而且会自动生成一个 setup 函数作为该组件的属性。setup 函数的返回值其实就是类组件的所有实例属性。
而且注意到类会在 setup 中被实例化，才能收集到实例属性。
还可以观察到`__s`属性，这个属性其实就是我们使用的`import { setup } from 'vue-class-component'`，这个`setup`函数的返回值的属性。其定义在[这里](https://github.com/vuejs/vue-class-component/blob/16433462b40aefecc030919623f17b0ec9afe61c/dist/vue-class-component.esm-browser.js#L252)。

以上的介绍是指`vue-class-component`的正常工作逻辑。也就是`@Options`的工作逻辑。如果是使用了本库的`@Component`这个装饰器。则又有一些不同。

在`@Component`中，会对上面生成的 setup 属性再次进行一次包装，再生成一个新的 setup 属性。在这个新的 setup 函数中实现我们自己的依赖注入逻辑。粗略的概括起来就是首先根据类来获取需要注入的数据 A，然后在计算出原属 setup 函数的返回值 B，最后合并数据 A 和数据 B 得到最终返回值 C。这个 C 就是新的 setup 函数的返回值。

所以可以发现当前类组件的依赖注入是在 setup 执行完之后才注入的。

这个目前还算不上是缺陷，因为类组件的 setup 函数是 vue-class-component 固定实现的，并不含有业务逻辑。

意味着该原始 setup 函数中并不会访问类的实例属性。本质是 vue-class-component 提供的 setup 函数本身不能访问`this.$data`。

它只能访问`this.$props $emit $attrs $slots`。

需要注意 setup 不是类组件的合法方法，意味着我们不能在类组件中定义 setup 方法。

注意虽然 option 组件中的 setup 函数虽然也是只能访问 props 和 ctx，但是一个组件只有一个 setup 函数，在该 setup 函数内部定义的数据，是可以衍生出新数据的。

但是现在类组件中每个实例属性都对应一个 setup 函数，这些 setup 函数是互相独立的，没有办法做到数据之间的衍生。倒是可以通过定义 getter 方法来定义新数据。

## 如何在类组件中使用 setup

首先在 vue 中存在两种组件形式，一种是 Option 组件，即直接声明一个对象，然后配置固定的某些属性即代表一个组件。还有一种形式是类组件。

类组件本身是不被 vue 支持的，需要借助 vue-class-component 才能工作。还好 vue-class-component 也是 vue 官方支持的。

在 Option 组件中，我们可以直接配置 setup 属性。但是在类组件中，我们不能在类中直接写一个 setup 属性/或者 setup 函数。

实际上在类组件的类中只能写特定的属性和方法。比如生命周期函数，其他函数都相当于 Option 组件中的 methods 中定义的方法。

类组件中的属性则相当于 Option 组件中的 data 定义的数据。

我们可以发现，在 Option 组件还有其他的属性或者方法似乎不知道在什么地方定义了。

比如 watch 属性，computed 属性，setup 函数，props 属性，directives 属性，components 属性。

对于 computed 属性应该定义为类的 getter 方法。

对于 setup，则需要`import { setup } from 'vue-class-component'`，然后使用 setup 函数初始化类的属性。

对于 props 属性，则需要`class MyComponent extends Vue.with(SomeProps) {}`，可以[参考这里](https://github.com/vuejs/vue-class-component/issues/465)

其他的属性和函数都需要在`@Options`装饰器中定义。可以[参考这里](https://github.com/vuejs/vue-class-component/issues/406)

顺便提一句，我本以为在类组件中使用 setup，就像在 Option 组件中一样简单，直接在类中定义 setup 方法就可以了。但是实际上这样是行不通的。

如果我们在类组件中定义 setup 方法，那么最终会被 vue-class-component 覆盖掉。实际上 vue-class-component 内部会自动生成一个 setup 函数来收集数据。

所以需要使用 vue-class-component 提供的 setup 函数来延迟初始化类的属性。

根据官方 issue 来看，不能在类中定义 setup 方法的原因是，我们不能根据 setup 方法的返回值类型来修改类的类型。这里的意思是指 setup 的返回值应该设置为类的成员属性，我们可以在运行时做到这一点，但是在类型提示方面做不到。

## 如何使用 declareProviders

可以说在 99%的场景中我们都不需要使用 declareProviders，除非业务足够复杂。

当我们不使用 declareProviders 时，意味着所有的服务都是全局的，那么所有的服务的生命周期都是全局的。

如果我们的业务稍微复杂一点，我们可以在页面路由层面使用 declareProviders，这样这些服务的生命周期就是路由级别的，当切换路由的时候，这些服务也会被卸载。

如果我们的业务更加复杂，可以在 2 级路由，3 级路由都这样操作。

上面提到的都是针对路由的操作，之所以首先提到路由，是因为路由的切换，我们可以非常明显的感受到页面的更新，也就是某些组件的卸载和某些组件的创建。这同时也是生命周期的体现。

那么在有生命周期的地方，我们都是可以使用 declareProviders 的。比如复杂的弹窗，tabs 切换。但是实际上我觉得没有必要把服务的生命周期卡的这么死，稍微把服务的生命周期提升一点也是无伤大雅的。

还有一种场景就是某个组件本身需要使用 declareProviders，即我们希望每个组件实例都有自己的服务实例，而不是所有的组件共享服务。比如 Table 组件我们可以提供一个选择了 table 的哪些行的、以及全选/取消全选这种服务。显然我们希望这个服务是每个 table 组件独享的。
