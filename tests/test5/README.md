## 测试场景-Token系统与TokenType类型推导

### 测试目的

验证 Token 系统的使用，包括 Token 创建、类型推导和依赖注入功能，以及更灵活的服务注册与解析方式。

### 测试要点

1. **Token 创建与使用**
   - 使用 `new Token<ServiceType>('name')` 创建带类型的服务标记
   - 基于命名空间（如 `TYPES` 对象）组织多个 Token

2. **容器绑定 API**
   - 使用 `declareProviders` 的函数式 API
   - 通过 `con.bind(token).to(ServiceClass)` 实现 Token 到实际服务类的绑定
   
3. **TokenType 类型推导**
   - `useService(TYPES.DemoService)` 自动返回正确类型的服务实例
   - `@Inject(TYPES.OtherService)` 结合 `TokenType<typeof TYPES.OtherService>` 实现注入属性的类型推导

4. **服务间依赖关系**
   - 在 DemoService 中通过 Token 注入 OtherService
   - 利用强类型节省手动类型转换，通过 TokenType 可直接访问被注入服务的属性和方法
   
通过这种方式，可以更灵活地管理服务依赖和注入，并且保持完整的类型推导支持。
