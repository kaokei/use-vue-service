## 测试场景-应用上下文中的 useService 行为

### 测试目的

验证在 Vue 应用的 `app.runWithContext` 上下文中使用 `useService` 获取服务的行为、作用域以及与全局服务和组件级服务的关系。

### 测试要点

1. **应用级别上下文的 useService 行为**
   - 在 `app.runWithContext` 回调中可以成功调用 `useService`
   - 这提供了一种在组件外部获取服务的方式
   - 与组件中直接调用不同，这里需要应用上下文环境

2. **应用上下文中 useService 获取全局服务**
   - 当服务已通过 `declareRootProviders` 注册为全局服务时
   - 在 `app.runWithContext` 中调用 `useService` 将返回全局单例
   - 这个实例与通过 `getRootService` 获得的实例是相同的

3. **应用上下文服务与组件级服务的隔离性**
   - 组件内部通过 `declareProviders` 和 `useService` 获取的服务实例
   - 与应用上下文中或全局获取的服务实例不是同一个
   - 组件级服务保持了独立的实例和状态

4. **不同层级的服务实例隔离**
   - 测试明确验证了组件内服务(`wrapper.vm.service`)与应用级服务(`appDemoService`)不同
   - 同时组件内服务与全局服务(`rootDemoService`)也不同
   - 而应用级服务和全局服务是相同的实例

这个测试用例说明了在 Vue 应用初始化阶段使用 `app.runWithContext` 访问服务的模式，以及不同环境下服务实例的隔离和依赖关系。这对于理解服务实例的作用域和共享性非常重要。
