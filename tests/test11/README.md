## 测试场景-Vue Router 与依赖注入集成

### 测试目的

验证将 Vue Router 的实例（router 和 route）注册为全局服务，并通过依赖注入在组件和服务中使用。

### 测试要点

1. **通过 Token 注册路由相关实例**
   - 使用 `declareRootProviders` 将 router 和 route 实例注册到全局容器
   - 使用 `Token<T>` 创建类型安全的标识符，用于访问 router 和 route
   - 应用 `toConstantValue` 将现有的路由实例绑定到容器
   - 使用 `markRaw` 标记路由对象以避免 Vue 的响应式处理

2. **服务中注入路由实例**
   - 在 DemoService 类中使用 `@Inject(TYPES.route)` 和 `@Inject(TYPES.router)` 注入路由实例
   - 服务可直接访问路由信息和路由导航方法

3. **多种方式访问路由对象的一致性**
   - 比较 Vue 的原生方法（`useRoute`/`useRouter`）与依赖注入的方法获取的实例一致性
   - 验证组件中直接使用的路由实例与服务中注入的路由实例的相等性
   - 确保通过 `getRootService` 获取的路由实例与组件和服务中的实例相同

4. **路由导航与状态的实时同步**
   - 点击路由链接后，所有使用不同方式获取的路由信息都同步更新
   - 路由变化反映在组件和服务的不同方法中

这个测试说明了框架如何与 Vue Router 集成，并展示了使用依赖注入系统管理路由实例的灵活方式。这种方法可以有效简化路由对象的访问和测试。
