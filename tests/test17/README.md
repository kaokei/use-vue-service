## 测试场景-服务注册缺失与应用层服务的行为

### 测试目的

验证当服务注册缺失时的错误处理，以及应用层级服务的注册、获取和应用卸载时的行为。

### 测试要点

1. **服务注册缺失时的错误处理**
   - 组件尝试使用未通过 `declareProviders` 注册的 `DemoService` 时，会抛出错误
   - 错误信息清晰指出问题："No matching binding found for token: DemoService"

2. **应用层级服务的注册与获取**
   - 使用 `declareAppProvidersPlugin([DemoService, OtherService])` 注册应用层级服务
   - 组件中可以直接通过 `useService` 获取这些服务
   - 在外部可以使用 `useAppService(ServiceClass, app)` 获取应用层级服务

3. **组件级与应用级服务的实例关系**
   - `DemoService` 仅在应用层注册，组件中获取到的实例与 `useAppService` 获取的相同
   - `OtherService` 同时在组件层和应用层注册，组件中优先使用组件层的独立实例
   - 这体现了服务查找的优先级机制

4. **应用卸载与服务清理**
   - 测试中最终调用 `rootApp.unmount()` 模拟应用卸载
   - 应用卸载时框架会自动调用内部的 `unbindAll` 方法清理所有注册的服务
   - 这确保了应用生命周期结束时资源被正确释放

这个测试用例展示了框架如何处理服务注册缺失、不同层级服务的使用优先级以及应用卸载时的资源清理机制。这有利于防止内存泄漏并确保应用的正确生命周期管理。
