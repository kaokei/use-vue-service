## 测试场景-使用 LazyToken 解决循环依赖

### 测试目的

验证在使用 `LazyToken` 的情况下，框架能否正确处理服务间的循环依赖问题。

### 测试要点

1. **循环依赖的场景**
   - `DemoService` 通过 `@Inject(new LazyToken(() => TYPES.OtherService))` 依赖 `OtherService`
   - `OtherService` 通过 `@Inject(new LazyToken(() => TYPES.DemoService))` 依赖 `DemoService`
   - 这形成了一个循环依赖的关系图

2. **LazyToken 的解决方案**
   - 使用 `LazyToken` 延迟依赖的解析和加载
   - 相比于直接注入，延迟注入可以避免在实例化时需要立即解析所有依赖
   - 测试表明这种方式可以成功创建存在循环依赖的组件

3. **框架内部实现**
   - 框架使用提前缓存机制来解决循环依赖
   - 在实例化对象后，立即放入缓存系统，此时还没有注入属性依赖
   - 当出现循环依赖时，可以从缓存中获取已初始化但尚未被完全设置的对象

4. **与Inversify的差异**
   - Inversify的LazyServiceIdentifier 不能解决循环依赖的问题
   - 与依赖注入框架Inversify不同，本框架提供了对循环依赖的支持
   - 这一特性使开发者可以更灵活地设计服务间的依赖关系

这个测试用例展示了框架如何处理服务间的循环依赖，这是一个在依赖注入系统中常见但处理困难的问题。通过 `LazyToken` 和二级缓存的实现，框架成功地支持了这一复杂场景。
