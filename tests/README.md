## 所有待验证场景

1. 当前组件访问当前组件的服务 --> test1
   1. declareProviders + useService
2. 当前组件的服务访问当前组件 --> test2
   1. @Inject(CURRENT_COMPONENT) 注入当前组件实例
3. 当前组件的服务访问另一个当前组件的服务 --> test3
   1. @Inject(Other_Service)
4. 子组件访问父组件
   1. 属于 vue 原生功能，instance.parent
5. 子组件访问父组件服务 --> test4
   1. declareProviders + useService
6. 子组件服务访问父组件
   1. 虽然可以实现，但是没有必要。使用场景太少，最终决定不实现了。
7. 子组件服务访问父组件服务 --> test4
   1. @Inject(Parent_Service)
8. 父组件访问子组件/孙组件
   1. 访问子组件属于 vue 原生功能，通过 ref 来引用子组件，但是不能引用子组件的子组件
9. 父组件访问子组件服务/孙组件服务
   1. findService(token, component)
10. 父组件服务访问子组件 3. 目前只支持获取当前服务所属组件，不支持在服务中获取父组件/子组件，因为不期望过多操作组件，而是应该把业务逻辑封装到服务中
11. 父组件服务访问子组件服务
    1. findService(token, component)
12. new Token 创建的 token --> test5
    1. 可以在 useService(token) 自动推导返回值类型
    2. 不支持在 @Inject 中自动推导注入属性的类型，需要手动通过 TokenType 获取 Token 关联的服务类型
13. to 方法和 toSelf 方法验证 --> test6
14. declareAppProviders+useService --> test7
15. declareRootProviders+getRootService --> test7
16. 验证 declareProviders 多次调用结果 --> test8
    1. bindProviders 多次调用验证
    2. 验证 useService 多次调用结果
17. 验证 declareAppProviders 多次调用结果 --> test9
    1. bindProviders 多次调用验证
    2. 验证 useService 多次调用结果
18. 验证 declareRootProviders 多次调用结果 --> test10
    1. bindProviders 多次调用验证
    2. 验证 getRootService 多次调用结果
    3. 验证 getRootService 在组件内/外调用的结果
    4. 全局 provide 路由变量-route 和 router --> test11
