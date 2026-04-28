# CodeSandbox 在线示例

以下示例托管在 GitHub 仓库的 `examples/` 目录中，可通过 CodeSandbox 直接在线运行。

URL 格式：`https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/<示例目录>`

| 示例                      | 说明                                                                   | 在线运行                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 01-basic-usage            | 基本用法：declareProviders 声明服务、useService 获取服务实例、服务单例性验证 | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/01-basic-usage)            |
| 02-service-injection      | 服务间依赖注入：使用 @Inject 装饰器注入依赖服务                        | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/02-service-injection)      |
| 03-three-level-scope      | 三层级服务作用域：组件级、App 级、全局根级服务的声明与获取             | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/03-three-level-scope)      |
| 04-computed-decorator     | @Computed 装饰器：将 getter 属性转换为 Vue computed 响应式计算属性     | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/04-computed-decorator)     |
| 05-raw-decorator          | @Raw 装饰器：标记属性不参与 Vue 响应式追踪                             | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/05-raw-decorator)          |
| 06-run-in-scope           | @RunInScope 装饰器：在 EffectScope 中运行方法，自动管理副作用生命周期  | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/06-run-in-scope)           |
| 07-find-child-service     | 父组件获取子组件服务：FIND_CHILD_SERVICE 和 FIND_CHILDREN_SERVICES     | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/07-find-child-service)     |
| 08-token-and-binding      | Token 系统与自定义绑定：Token 实例、FunctionProvider、to/toSelf 绑定方式 | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/08-token-and-binding)      |
| 09-vue-router-integration | Vue Router 集成：在路由组件中使用依赖注入服务                          | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/09-vue-router-integration) |
| 10-post-construct         | @PostConstruct 生命周期：服务实例化后自动执行初始化方法                | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/10-post-construct)         |
| 11-lazy-token             | LazyToken 解决循环依赖：使用 LazyToken 延迟解析避免循环引用            | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/11-lazy-token)             |
| 12-app-providers-plugin   | App 级服务插件：declareAppProvidersPlugin、useAppService 与 useService 对比 | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/12-app-providers-plugin)   |
| 13-nuxt-decorators        | Nuxt 装饰器集成：在 Nuxt 4 项目中使用 TC39 Stage 3 装饰器             | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/13-nuxt-decorators)        |
| 14-tree-scope-demo        | 树形作用域演示：多层级组件树中的服务作用域隔离与继承                   | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/14-tree-scope-demo)        |
| 15-service-singleton      | 服务单例性：多次 declareProviders 追加绑定，多次 useService 返回同一实例 | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/15-service-singleton)      |
| 16-service-inheritance    | 服务继承：多层类继承中 @Inject、@PostConstruct、@Computed 的行为       | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/16-service-inheritance)    |
| 17-useappservice          | useAppService vs useService：多层嵌套时的查找层级差异                  | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/17-useappservice)          |
| 18-post-construct-run-in-scope | @PostConstruct 与 @RunInScope 配合：实例化时自动建立响应式监听，useService 即监听 | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/18-post-construct-run-in-scope) |
| 19-nuxt-auto-imports          | Nuxt 自动导入：通过 @kaokei/nuxt-use-vue-service 插件实现所有 API 零 import 自动注入 | [打开](https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/19-nuxt-auto-imports)          |

每个示例目录包含独立的 `package.json`（依赖已发布的 `@kaokei/use-vue-service` 和 `@kaokei/di` 版本）和 `tsconfig.json`，与主包构建流程完全隔离，可直接在 CodeSandbox 中运行。
