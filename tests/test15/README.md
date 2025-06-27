## 测试场景-@PostConstruct 装饰器与 API 错误处理

### 测试目的

验证 `@PostConstruct` 装饰器的使用规则、错误处理以及框架关键 API 的使用限制。

### 测试要点

1. **@PostConstruct 的单次使用验证**
   - 单个类中仅使用一次 `@PostConstruct` 装饰器是合法的
   - 创建含有单个 `@PostConstruct` 方法的类实例不会抛出异常
   - 装饰的方法在实例创建时将自动执行

2. **@PostConstruct 的多次使用限制**
   - 在同一个类中多次使用 `@PostConstruct` 装饰器是禁止的
   - 尝试创建含有多个 `@PostConstruct` 方法的类实例将抛出错误
   - 错误信息清晰提示："Cannot apply @PostConstruct decorator multiple times in the same class"

3. **@PostConstruct 方法异常处理**
   - 如果 `@PostConstruct` 设计的初始化方法抛出异常，则异常会被向上传递
   - 使用含有异常的 `@PostConstruct` 方法的服务在组件挂载时将导致错误
   - 错误信息保留了原始异常消息，如"something wrong"

4. **declareProviders 的使用限制**
   - `declareProviders` 函数只能在组件的 setup 函数内部调用
   - 在组件外部直接调用 `declareProviders` 会抛出异常
   - 错误信息指明了限制："getProvideContainer 只能在 setup 中使用"

这个测试用例验证了框架的多种限制和错误处理机制，帮助开发者避免常见错误，并按照框架预期的方式使用 API。`@PostConstruct` 装饰器的限制确保了服务初始化逻辑的清晰性，而 API 使用限制则确保了服务容器的正确使用。
