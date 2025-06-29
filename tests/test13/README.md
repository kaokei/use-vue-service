## 测试场景-服务注册缺失时的错误处理

### 测试目的

验证当组件使用 `useService` 尝试获取未注册的服务时的错误处理机制。这个测试关注的是框架对缺失依赖项的适当报错能力。

### 测试要点

1. **未注册服务的错误检测**
   - 组件中调用 `useService(DemoService)` 但未先通过 `declareProviders` 注册服务
   - 测试系统是否能正确检测到该错误情况

2. **错误信息明确性**
   - 报错信息应清晰指出问题："No matching binding found for token: DemoService"
   - 错误信息中包含未找到对应绑定的服务名称，便于开发者识别问题

3. **异常发生时机**
   - 错误发生在组件挂载时（mount），而非代码编译阶段
   - 框架在运行时发现服务注册问题并立即抛出错误

4. **正确的使用模式提示**
   - 错误消息间接提示需要为所需服务先建立绑定关系
   - 这个测试的存在强调了使用框架的正确顺序：先 `declareProviders`，后 `useService`

这个测试用例对于理解服务容器的错误处理机制非常重要，帮助开发者快速发现和解决依赖注入相关的注册问题，避免在生产环境中出现未知服务引用导致的运行时错误。
