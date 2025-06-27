## 测试场景-多层级服务容器系统

### 测试目的

验证服务注册和访问的三个不同层级的容器机制，分别是组件级、应用级和全局级。

### 测试要点

1. **组件级服务容器（Component Level）**
   - 通过 `declareProviders([DemoService])` 在组件内注册服务
   - 服务实例仅在组件内部以及子孙组件中可用，生命周期与组件绑定
   - 每个使用相同组件级服务的组件实例都有自己的独立服务实例

2. **应用级服务容器（App Level）**
   - 通过 `declareAppProvidersPlugin([AppService])` 在 Vue 应用级别注册服务
   - 服务实例在整个 Vue 应用内共享，几乎等同于全局单例
   - 适用于需要在多个组件之间共享状态的服务

3. **全局级服务容器（Root/Global Level）**
   - 通过 `declareRootProviders([RootService])` 注册全局服务
   - 服务实例在整个 JavaScript 运行环境中共享，生命周期持续到应用结束
   - 可以通过 `getRootService(RootService)` 直接在组件外部访问，如在路由守卫、全局事件总线等

4. **服务实例一致性验证**
   - 组件内访问的根服务实例与 `getRootService()` 获取的是同一实例
   - 每个层级的服务状态变更都会正确响应到 UI 上

这个测试展示了框架的多层级依赖注入系统，使开发者能够根据不同场景需求选择适合的服务容器级别。
