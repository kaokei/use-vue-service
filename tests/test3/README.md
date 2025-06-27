## 测试场景-服务之间的依赖注入

### 测试目的

验证在同一个组件中声明多个服务，并实现服务之间的依赖注入与交互。

### 测试要点

1. **多服务一次性声明**
   - 通过 `declareProviders([DemoService, OtherService])` 同时声明多个服务提供者

2. **服务之间的依赖注入**
   - 使用 `@Inject(new LazyToken(() => OtherService))` 将 OtherService 注入到 DemoService 中
   - 验证注入的服务实例与直接使用 `useService` 获取的是同一实例

3. **服务之间的数据传递与计算**
   - DemoService 中的计算属性 `sum` 依赖于两个服务的状态
   - 当任一服务的状态变化时，计算属性能正确更新

4. **服务实例的相互独立性**
   - 每个服务维护自己的状态，但可以通过依赖关系相互访问
