## 测试场景-服务实例单例性和多服务注册

### 测试目的

验证多次调用 `declareProviders` 注册不同服务类以及多次调用 `useService` 获取相同服务的表现。

### 测试要点

1. **多次注册服务类的支持**
   - 可以连续调用 `declareProviders([DemoService])` 和 `declareProviders([OtherService])` 注册不同服务
   - 每次注册不会覆盖或影响已注册的其他服务

2. **服务实例单例性验证**
   - 同一组件内多次调用 `useService(DemoService)` 返回的是同一个实例
   - `demoService1` 和 `demoService2` 指向相同的实例（identity equality）
   - `otherService1` 和 `otherService2` 也指向相同的实例

3. **状态变更的一致性**
   - 通过任一引用改变服务状态（如 `demoService1.increaseCount()`）会影响所有引用
   - 状态更新能正确反映到使用不同引用的所有界面元素上

4. **不同服务类间的隔离性**
   - 操作 DemoService 的实例不会影响 OtherService 实例的状态
   - 每类服务维护独立的状态管理

这个测试说明框架内部实现了每个服务类在组件内的单例模式，简化了状态管理并保证数据一致性。
