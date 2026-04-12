# 实施计划：文档与示例代码重构

## 概述

将文档和示例代码重构分为四个阶段：文档更新、VitePress 配置更新、示例项目创建、清理与验证。每个阶段按依赖关系排列，确保增量推进。

## 任务

- [x] 1. 更新 Guide 文档
  - [x] 1.1 更新 docs/guide/index.md
    - 移除 `experimentalDecorators: true` 配置说明，替换为 Stage 3 装饰器说明（TypeScript 5.0+ 默认支持，无需额外配置）
    - 说明 `@Inject` 装饰器来自 `@kaokei/di`，通过本库重新导出
    - 补充三组核心 API 的简要介绍：组件级（useService / declareProviders）、全局根级（useRootService / declareRootProviders）、App 级（useAppService / declareAppProviders / declareAppProvidersPlugin）
    - 补充 `@Computed`、`@Raw`、`@RunInScope` 三个装饰器的简要介绍和基本用法示例
    - 补充 `FIND_CHILD_SERVICE` 和 `FIND_CHILDREN_SERVICES` 两个 Token 常量的简要介绍
    - 标注当前版本为 4.0.0，依赖 `@kaokei/di` 版本为 `^5.0.4`
    - _需求：1.1、1.2、1.3、1.4、1.5、1.6_

- [x] 2. 更新 API 文档
  - [x] 2.1 更新 docs/api/index.md
    - 新增 `@Raw` 装饰器完整文档（功能说明、`@Raw` 和 `@Raw()` 两种用法、field 和 auto-accessor 两种装饰目标、使用示例）
    - 新增 `@RunInScope` 装饰器完整文档（功能说明、`@RunInScope` 和 `@RunInScope()` 两种用法、返回 EffectScope 行为、使用示例）
    - 更新 `@Computed` 装饰器文档，补充 `@Computed` 和 `@Computed()` 两种用法、writable computed 支持、懒创建策略说明
    - 移除 `getEffectScope` 的公开 API 文档
    - 新增类型定义文档（`NewableProvider`、`FunctionProvider`、`Provider`、`FindChildService`、`FindChildrenServices`）
    - 确认已有的 declareProviders、useService 等 API 文档与当前源代码一致
    - _需求：2.1、2.2、2.3、2.4、2.5、2.6_

- [x] 3. 修正 Note 文档
  - [x] 3.1 修正 docs/note/05.响应式方案.md
    - 修正 `@Computed` 示例代码，将 `@Computed` 应用于 getter 属性而非普通方法
    - 移除示例中多余的 `.value` 访问（因为整个实例已经是 reactive 对象）
    - _需求：3.2_
  - [x] 3.2 更新 docs/note/06.装饰器.md
    - 更新 MarkRaw 装饰器部分，说明 `@Raw` 装饰器已在 4.0.0 版本中实现
    - 说明实现方式：基于 TC39 Stage 3 field/accessor 装饰器，不再需要与 `container.onActivation` 耦合
    - 保留历史讨论内容作为参考，但明确标注已解决
    - _需求：3.1_

- [x] 4. 更新 VitePress 配置与创建 EXAMPLES 文档
  - [x] 4.1 更新 docs/.vitepress/config.ts
    - 在 `/note/` sidebar 中补充 11-15 号条目
    - 新增 `/guide/` sidebar，包含快速开始和 CodeSandbox 在线示例两个条目
    - 新增 `/api/` sidebar，包含 API 文档条目
    - _需求：4.1、4.2、4.3_
  - [x] 4.2 创建 docs/guide/EXAMPLES.md
    - 参照 `di` 项目的 EXAMPLES.md 格式，以表格形式列出所有 12 个示例
    - 使用 URL 格式 `https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/<示例目录>`
    - 说明每个示例目录包含独立的 `package.json`，与主包构建流程完全隔离
    - _需求：6.1、6.2、6.3、6.4_

- [x] 5. 检查点 - 文档阶段验证
  - 确保所有文档修改完成，检查文档内容一致性，如有疑问请询问用户。

- [x] 6. 创建示例项目（01-06）
  - [x] 6.1 创建 examples/01-basic-usage
    - 创建通用文件：`.codesandbox/tasks.json`、`index.html`、`package.json`、`tsconfig.json`、`vite.config.ts`
    - 创建 `src/main.ts`、`src/App.vue`、`src/CountService.ts`
    - 演示 `declareProviders` + `useService` 基本用法
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 6.2 创建 examples/02-service-injection
    - 创建通用文件和 `src/` 目录
    - 演示 `@Inject` 装饰器注入依赖服务，ServiceA 通过 @Inject 注入 ServiceB
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 6.3 创建 examples/03-three-level-scope
    - 创建通用文件和 `src/` 目录
    - 演示组件级、App 级、全局根级三层服务作用域
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 6.4 创建 examples/04-computed-decorator
    - 创建通用文件和 `src/` 目录
    - 演示 `@Computed` 和 `@Computed()` 两种用法、缓存效果、writable computed
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 6.5 创建 examples/05-raw-decorator
    - 创建通用文件和 `src/` 目录
    - 演示 `@Raw` 和 `@Raw()` 两种用法、field 和 auto-accessor 两种装饰目标
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 6.6 创建 examples/06-run-in-scope
    - 创建通用文件和 `src/` 目录
    - 演示 `@RunInScope` 装饰方法，在方法中使用 watchEffect，展示 scope.stop() 清理
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_

- [x] 7. 创建示例项目（07-12）
  - [x] 7.1 创建 examples/07-find-child-service
    - 创建通用文件和 `src/` 目录
    - 演示父组件通过 `FIND_CHILD_SERVICE` 和 `FIND_CHILDREN_SERVICES` 获取子组件服务
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 7.2 创建 examples/08-token-and-binding
    - 创建通用文件和 `src/` 目录
    - 演示 Token 实例作为标识符、FunctionProvider、toDynamicValue 自定义绑定
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 7.3 创建 examples/09-vue-router-integration
    - 创建通用文件和 `src/` 目录
    - 额外依赖 `vue-router: ^4.5.0`
    - 演示在路由组件中使用依赖注入服务
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 7.4 创建 examples/10-post-construct
    - 创建通用文件和 `src/` 目录
    - 演示 `@PostConstruct` 装饰器在服务创建后自动执行初始化方法
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 7.5 创建 examples/11-lazy-token
    - 创建通用文件和 `src/` 目录
    - 演示两个服务互相依赖，通过 LazyToken 解决循环依赖问题
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_
  - [x] 7.6 创建 examples/12-app-providers-plugin
    - 创建通用文件和 `src/` 目录
    - 演示通过 `app.use(declareAppProvidersPlugin([...]))` 声明 App 级服务
    - _需求：5.1、5.2、5.3、5.4、5.5、5.6、7.2、7.3_

- [x] 8. 检查点 - 示例项目验证
  - 确保所有 12 个示例项目创建完成，文件结构和配置一致，如有疑问请询问用户。

- [x] 9. 清理旧示例
  - [x] 9.1 删除 examples/demo1 目录
    - 确认新示例 01-basic-usage 和 04-computed-decorator 已覆盖 demo1 的功能后删除
    - _需求：7.1_

- [x] 10. 属性测试
  - [x] 10.1 编写属性测试：示例目录结构与配置完整性
    - **属性 1：示例目录结构与配置完整性**
    - 使用 fast-check 遍历所有示例目录，验证必需文件存在性（`.codesandbox/tasks.json`、`index.html`、`package.json`、`tsconfig.json`、`vite.config.ts`、`src/`）和配置内容
    - **验证：需求 5.1、5.5、5.6**
  - [x] 10.2 编写属性测试：示例 package.json 规范性
    - **属性 2：示例 package.json 规范性**
    - 读取所有示例的 package.json，验证 dependencies 版本号和 description 字段
    - **验证：需求 5.2、7.2**
  - [x] 10.3 编写属性测试：示例 tsconfig.json 统一配置
    - **属性 3：示例 tsconfig.json 统一配置**
    - 读取所有示例的 tsconfig.json，验证编译选项一致性
    - **验证：需求 7.3**
  - [x] 10.4 编写属性测试：EXAMPLES 文档 CodeSandbox 链接格式正确性
    - **属性 4：EXAMPLES 文档 CodeSandbox 链接格式正确性**
    - 解析 EXAMPLES.md 中的链接，验证 URL 格式和目录存在性
    - **验证：需求 6.3**

- [x] 11. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有疑问请询问用户。

## 说明

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务用于阶段性验证，确保增量推进
- 属性测试验证所有示例目录的一致性规范
