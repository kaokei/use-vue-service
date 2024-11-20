
1. 所有待验证场景
```
1. 当前组件访问当前组件的服务 --> test1
    1. declareProviders + useService
2. 当前组件的服务访问当前组件 --> test2
    1. @inject(CURRENT_COMPONENT) 注入当前组件实例
3. 当前组件的服务访问另一个当前组件的服务 --> test3
    1. @inject(Other_Service)
4. 子组件访问父组件
    1. 属于vue原生功能，instance.parent，不推荐使用
5. 子组件访问父组件服务 --> test4
    1. declareProviders + useService
6. 子组件服务访问父组件
    1. 虽然可以实现，但是没有必要，使用场景太少，所以最终就不实现了
    2. 实现原理和@inject(CURRENT_COMPONENT)类似，但是要求每个组件都要把自己注册到容器中，其中key可以通过instance.type获取到当前组件的定义，value就是instance。
7. 子组件服务访问父组件服务 --> test4
    1. @inject(Parent_Service)
8. 父组件访问子组件/孙组件
    1. 访问子组件属于vue原生功能，通过ref来引用子组件，但是不能引用子组件的子组件
    2. 确定不支持
    3. 技术实现起来比较麻烦
9. 父组件访问子组件服务/孙组件服务
    1. 未实现
    2. 确定不支持，主要是不想要在组件中写过多的业务代码，应该把业务代码都转移到服务中。
    3. 技术实现起来比较麻烦
10. 父组件服务访问子组件
    1. 未实现
    2. 确定不支持
    3. 目前只支持获取当前服务所属组件，不支持获取父组件/子组件，因为不期望过多操作组件，而是应该把业务逻辑封装到服务中
11. 父组件服务访问子组件服务
    1. 未实现 - todo
    2. 确定要实现，因为父子组件的生命周期不一致，所以不会在父组件的服务中持有子组件服务的实例对象，而是应该实时查询子组件服务
    3. 伪代码如下：`this.container.getServiceFromChild(ChildServiceToken)`
    3. 伪代码如下：`this.component.getServiceFromChild(ChildServiceToken)`似乎没有必要暴露container对象，直接使用component对象即可
    3. 伪代码如下：`getServiceFromChild(this.component, ChildServiceToken)`，以工具方法提供getServiceFromChild
    4. 从当前container获取当前组件instance，然后通过instance.subTree来遍历所有子元素
    5. 如果子元素是组件，然后通过组件获取是否有对应的container实例
    6. 然后通过获取的contaienr实例尝试获取是否有绑定ChildServiceToken，如果有则返回，否则继续查找
    7. 应该是container绑定实例，实例也需要绑定container。这样只需要暴露useContainer这个方法就可以了通过container来获取子元素/子服务。
    8. 在服务中，则可以通过inject(CURRENT_CONTAINER)获取container实例
    9. 问题在与container和实例的相互绑定是否会导致内存泄漏？gc的逻辑是判断对象是否可达，也就是从全局上下文中是否可以访问该对象。
    10. 父组件服务持有子组件服务实例对gc不友好，反过来则没有这个问题
    11. 不提供useChildService这样的方法，原因同2，10
    12. 不提供useContainer和inject(CURRENT_CONTAINER)，原因是暂时没有想到暴露container的使用场景
    13. https://github.com/vuejs/test-utils/blob/9c9659441c59de557f5844e5f9b7fee00b3938e0/src/baseWrapper.ts#L154
```
2. createToken创建的token --> todo
  1. 是否可以在useService自动推导类型
  1. 是否可以在inject中自动推导类型
4. to方法和toSelf方法验证
5. bindContainer多次调用验证
6. 验证默认容器DEFAULT_CONTAINER
7. 验证useService多次调用结果
8. 验证useService在组件外调用场景
9. 验证useRootService多次调用结果
10. 验证useRootService在组件内/外调用的结果
11. 验证declareProviders多次调用结果
12. 验证declareProviders不同参数的结果
13. 验证declareRootProviders多次调用结果
14. 验证declareRootProviders不同参数的结果
15. 验证declareAppProviders多次调用结果
16. 验证declareAppProviders不同参数的结果
17. 全局provide路由变量-route和router
3. ContainerOptions不同场景验证
