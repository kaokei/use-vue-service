1. createToken创建的token
  1. 是否可以在useService自动推导类型
  1. 是否可以在inject中自动推导类型
2. CURRENT_COMPONENT注入当前组件实例
3. ContainerOptions不同场景验证
4. 所有待验证场景
```
1. 当前组件访问当前组件的服务
    1. declareProviders + useService
2. 当前组件的服务访问当前组件
    1. @inject(CURRENT_COMPONENT)
3. 当前组件的服务访问另一个当前组件的服务
    1. @inject(Other_Service)
4. 子组件访问父组件
    1. 属于vue原生功能，instance.parent，不推荐使用
5. 子组件访问父组件服务
    1. declareProviders + useService
6. 子组件服务访问父组件
    1. 可以实现，但是没有必要，使用场景太少
    2. 实现原理和@inject(CURRENT_COMPONENT)类似，但是要求每个组件都要把自己注册到容器中，其中key可以通过instance.type获取到当前组件的定义，value就是instance。
7. 子组件服务访问父组件服务
    1. @inject(Parent_Service)
8. 父组件访问子组件
    1. 属于vue原生功能，通过ref来引用子组件，但是不能引用子组件的子组件
9. 父组件访问子组件服务
    1. 未实现
10. 父组件服务访问子组件
    1. 未实现
11. 父组件服务访问子组件服务
    1. 未实现
```
5. to方法和toSelf方法验证
6. bindContainer多次调用验证
7. 验证默认容器DEFAULT_CONTAINER
8. 验证useService多次调用结果
9. 验证useService在组件外调用场景
10. 验证useRootService多次调用结果
11. 验证useRootService在组件内/外调用的结果
12. 验证declareProviders多次调用结果
13. 验证declareProviders不同参数的结果
14. 验证declareRootProviders多次调用结果
15. 验证declareRootProviders不同参数的结果
16. 验证declareAppProviders多次调用结果
17. 验证declareAppProviders不同参数的结果
