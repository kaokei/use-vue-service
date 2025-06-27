## 测试场景-容器绑定 API：to 与 toSelf 方法

### 测试目的

验证在使用函数式 API 进行服务绑定时，`to` 和 `toSelf` 两种方法的功能及等效性。

### 测试要点

1. **to 方法的用法**
   - `con.bind(DemoService).to(DemoService)` 将服务类自身作为实现类
   - 完整指定了标识符（DemoService）和实现类（DemoService）

2. **toSelf 方法的用法**
   - `con.bind(DemoService).toSelf()` 是一种简化语法
   - 等同于 `con.bind(DemoService).to(DemoService)`，但代码更简洁

3. **两种方法的等效性验证**
   - 两个组件分别使用不同的绑定方式，其功能和效果完全相同
   - 服务的实例化、状态管理和依赖注入在两种方式下结果一致

4. **适用场景区分**
   - `to` 方法更灵活，可以将标识符绑定到不同的实现类（如接口和实现）
   - `toSelf` 方法更简洁，适用于标识符和实现类是同一个类的情况

这个测试表明 API 设计的灵活性，允许开发者根据不同场景选择更适合的绑定方式。
