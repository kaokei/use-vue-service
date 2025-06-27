## 测试场景-组件级与全局级服务注册的区别

### 测试目的

验证组件级服务注册与全局级服务注册的严格区分，以及当试图使用 `getRootService` 访问未在全局容器中注册的服务时的错误处理机制。

### 测试要点

1. **组件级注册不等同于全局级注册**
   - 在组件中通过 `declareProviders([DemoService])` 注册的服务仅限于组件范围内访问
   - 组件内使用 `useService(DemoService)` 可以正常获取服务实例
   - 组件外使用 `getRootService(DemoService)` 尝试获取全局服务实例则会失败

2. **容器隔离机制验证**
   - 组件级容器和全局级容器是相互隔离的
   - 只有通过 `declareRootProviders` 注册的服务才能被 `getRootService` 获取

3. **明确的错误信息**
   - 当尝试使用 `getRootService` 获取未注册的全局服务时，框架抛出错误："No matching binding found for token: DemoService"
   - 错误信息清晰指出了问题所在及缺失的服务标识

4. **正确使用方式的引导**
   - 测试用例展示了在需要全局访问服务时必须使用 `declareRootProviders`
   - 明确区分了不同注册方式对应的不同服务访问方法

这个测试用例对理解服务注册的不同层级和范围非常重要。它强调了 `declareProviders` 和 `declareRootProviders` 的区别，以及如何正确地选择相应的服务获取方式（`useService` 或 `getRootService`）。这有助于开发者设计具有适当作用域的服务架构。
