## 测试场景-应用级服务插件和多服务注册

### 测试目的

验证多次调用 `declareAppProvidersPlugin` 注册不同的服务类，以及应用级别服务的单例性和状态管理特性。

### 测试要点

1. **应用级插件注册服务**
   - 通过 `declareAppProvidersPlugin([DemoService])` 和 `declareAppProvidersPlugin([OtherService])` 注册服务
   - 不需要在组件级别使用 `declareProviders`，直接通过 `useService` 获取服务实例

2. **多插件兼容性**
   - 多次调用 `declareAppProvidersPlugin` 注册不同的服务类
   - 多个插件可以同时添加到 Vue 应用的 plugins 配置中
   - 每次注册不会覆盖或影响其他已注册的服务

3. **应用级服务的单例性**
   - 在同一个 Vue 应用实例内，多次调用 `useService(DemoService)` 返回的是同一个实例
   - `demoService1` 和 `demoService2` 指向相同的应用级单例
   - 不需要在组件中显式注册，即可像全局服务一样访问

4. **应用级服务的状态一致性**
   - 通过任一引用改变服务状态会影响整个应用中的所有该服务引用
   - 状态更新能正确反映到使用不同引用的所有界面元素上

5. **不同服务类的隔离性**
   - 操作 DemoService 的实例不会影响 OtherService 实例的状态
   - 各服务类之间状态互不影响，保持隔离

这个测试说明框架提供的应用级服务注册机制，可以简化全局状态管理，并且在不同组件间共享服务实例。它为应用级别的依赖注入和状态共享提供了便捷的解决方案。
