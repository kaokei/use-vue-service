## class 中不能直接使用 computed

[When "reactive" uses "class" and "computed", the "computed" attribute will not Reactive](https://github.com/vuejs/core/issues/1036)

建议还是手动调用 init 方法初始化 computed 属性，而不是直接定义 computed 属性。
在 inversify 的背景下，使用 postReactive 代替 postConstruct。

另一个备选方案就是 getter，但是 getter 是没有缓存的。
