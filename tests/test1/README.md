## 测试场景-当前组件访问当前组件的服务

主要测试了 declareProviders 和 useService 可以互相配合。

useService 可以获取正确的实例化对象，且实例化对象确实是响应式对象，会自动更新 dom 数据。

并且可以触发点击事件，调用对应的事件处理函数。

service 中的 getter 属性可以看作是没有缓存的 computed 属性。

最后还测试了@postReactive装饰器，用于代替@postConstruct装饰器，主要用于保证此时this已经是响应式对象。
