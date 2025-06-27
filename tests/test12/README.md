## 测试场景-useService 的使用约束

### 测试目的

验证 `useService` 函数的使用约束，特别是测试其只能在 Vue 组件的 setup 函数内部调用的限制。

### 测试要点

1. **正确使用场景**
   - 在组件的 `<script setup>` 内部调用 `useService(DemoService)` 正常工作
   - 成功获取 DemoService 的实例并可访问其方法和属性

2. **使用限制测试**
   - 在组件的 setup 函数外部直接调用 `useService(DemoService)` 会引发异常
   - 抛出错误消息："getProvideContainer 只能在 setup 中使用"

3. **设计原理验证**
   - `useService` 依赖于 Vue 的组件上下文和依赖注入机制
   - 当没有有效的组件上下文时无法获取服务实例

这个测试对于理解框架的使用边界十分重要，它明确指出 `useService` 函数只能在组件的 setup 函数中调用，而不能在组件外部直接使用。如果需要在组件外部获取服务实例，应使用 `getRootService` 函数来访问全局注册的服务。
