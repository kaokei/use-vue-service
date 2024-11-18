## 测试场景-当前组件的服务访问另一个当前组件的服务

declareProviders 一次性声明多个 Class。

useService 分别获取 demoService 和 otherService，并且 demoService 依赖 otherService。
