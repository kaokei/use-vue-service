## useReactiveRef 与 useRef 不兼容

解决不了

主要体现在 react 自带的 useRef 使用的是 current 属性，但是 vue 中 ref 使用的是 value 属性

## 支持 watch 功能

watch 功能其实和 useEffect 已经非常相似了。

## 支持 class component

不支持

经过考虑，本库默认不支持类组件，并且计划把 use-vue-service 库中也去掉对类组件的支持。

如果以后有时间可以考虑新增加一个专门库来支持类组件。

这一点是参考了 mobx 的实现。并且我也认为实在是没有必要使用到类组件，而外增加了实现的复杂度。

## 生命周期

主要是 destroy，卸载资源

## hooks

post hook

merge hook

需要这两个 hook 才能配置响应式能力

## 支持 vue 插件

在 app 实例上声明 providers
