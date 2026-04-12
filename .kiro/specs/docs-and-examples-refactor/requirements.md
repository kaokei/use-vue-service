# 需求文档

## 简介

重构 `@kaokei/use-vue-service` 项目的文档（docs）和示例代码（examples）目录，使其与 4.0.0 版本的源代码保持一致。文档需要覆盖所有公开 API，修正过时内容，补充缺失文档；示例代码需要覆盖各种功能场景，支持 CodeSandbox 在线运行。

## 术语表

- **Guide_文档**：`docs/guide/index.md`，快速开始指南
- **API_文档**：`docs/api/index.md`，API 参考文档
- **Note_文档**：`docs/note/` 目录下的技术笔记文件
- **VitePress_配置**：`docs/.vitepress/config.ts`，VitePress 站点配置文件
- **Sidebar**：VitePress 侧边栏导航配置
- **Example**：`examples/` 目录下的独立示例项目，每个示例可在 CodeSandbox 中运行
- **EXAMPLES_文档**：`docs/guide/EXAMPLES.md`，CodeSandbox 在线示例索引页
- **Stage_3_装饰器**：TC39 Stage 3 标准装饰器规范，TypeScript 5.0+ 默认支持
- **DI_库**：`@kaokei/di` 依赖注入库
- **Provider**：服务提供者，包括 NewableProvider（类数组）和 FunctionProvider（函数）两种形式

## 需求

### 需求 1：更新 Guide 文档与源代码保持一致

**用户故事：** 作为开发者，我希望快速开始指南反映当前 4.0.0 版本的实际用法，以便我能正确配置和使用本库。

#### 验收标准

1. THE Guide_文档 SHALL 移除 `experimentalDecorators: true` 的配置说明，替换为 Stage_3_装饰器的说明（即 TypeScript 5.0+ 默认支持，无需额外配置）
2. THE Guide_文档 SHALL 说明 `@Inject` 装饰器来自 DI_库，并通过 `@kaokei/use-vue-service` 重新导出
3. THE Guide_文档 SHALL 包含三组核心 API 的简要介绍：组件级（useService / declareProviders）、全局根级（useRootService / declareRootProviders）、App 级（useAppService / declareAppProviders / declareAppProvidersPlugin）
4. THE Guide_文档 SHALL 包含 `@Computed`、`@Raw`、`@RunInScope` 三个装饰器的简要介绍和基本用法示例
5. THE Guide_文档 SHALL 包含 `FIND_CHILD_SERVICE` 和 `FIND_CHILDREN_SERVICES` 两个 Token 常量的简要介绍
6. THE Guide_文档 SHALL 标注当前版本为 4.0.0，依赖 `@kaokei/di` 版本为 `^5.0.4`

### 需求 2：更新 API 文档覆盖所有公开 API

**用户故事：** 作为开发者，我希望 API 文档完整覆盖所有从 `@kaokei/use-vue-service` 导出的 API，以便我能查阅每个 API 的详细用法。

#### 验收标准

1. THE API_文档 SHALL 包含 `@Raw` 装饰器的完整文档，包括功能说明、支持 `@Raw` 和 `@Raw()` 两种用法、支持普通 field 和 auto-accessor 两种装饰目标、使用示例
2. THE API_文档 SHALL 包含 `@RunInScope` 装饰器的完整文档，包括功能说明、支持 `@RunInScope` 和 `@RunInScope()` 两种用法、返回 EffectScope 的行为、使用示例
3. THE API_文档 SHALL 更新 `@Computed` 装饰器文档，说明支持 `@Computed` 和 `@Computed()` 两种用法、支持 writable computed（当原型链上存在 setter 时）、懒创建策略
4. THE API_文档 SHALL 移除 `getEffectScope` 的公开 API 文档（该函数不再从 index.ts 导出）
5. THE API_文档 SHALL 包含类型定义文档，说明 `NewableProvider`、`FunctionProvider`、`Provider`、`FindChildService`、`FindChildrenServices` 的类型签名和用途
6. THE API_文档 SHALL 保持已有的 declareProviders、useService、declareRootProviders、useRootService、declareAppProviders、useAppService、declareAppProvidersPlugin、FIND_CHILD_SERVICE、FIND_CHILDREN_SERVICES 的文档内容，并确保与当前源代码一致

### 需求 3：检查并修正 Note 文档中的不一致内容

**用户故事：** 作为开发者，我希望技术笔记中的内容与当前代码实现一致，以免被过时信息误导。

#### 验收标准

1. WHEN Note_文档 `06.装饰器.md` 中声明"放弃了 MarkRaw 装饰器"时，THE Note_文档 SHALL 更新该部分内容，说明 `@Raw` 装饰器已在 4.0.0 版本中实现，并简要描述其实现方式（基于 TC39 Stage 3 field/accessor 装饰器）
2. WHEN Note_文档 `05.响应式方案.md` 中的代码示例使用 `@Computed` 装饰器时，THE Note_文档 SHALL 确保示例代码使用正确的 getter 语法（`@Computed` 只适用于 getter 属性）
3. THE Note_文档 SHALL 确保所有引用 `experimentalDecorators` 的文件在上下文中明确标注该配置已不再需要（仅在 `13.Legacy-experimentalDecorators-装饰器类型详解.md` 中作为历史参考保留）

### 需求 4：更新 VitePress 配置同步所有文档

**用户故事：** 作为文档读者，我希望侧边栏导航能展示所有文档页面，以便我能方便地浏览全部内容。

#### 验收标准

1. THE VitePress_配置 SHALL 在 `/note/` 的 Sidebar 中包含 `11.computed缓存陷阱`、`12.TC39-Stage3-装饰器类型详解`、`13.Legacy-experimentalDecorators-装饰器类型详解`、`14.Computed装饰器只适用于getter属性`、`15.computed-comparison` 五个条目的链接
2. THE VitePress_配置 SHALL 在 `/guide/` 路径下配置 Sidebar，包含快速开始（`/guide/`）和 CodeSandbox 在线示例（`/guide/EXAMPLES`）两个条目
3. THE VitePress_配置 SHALL 在 `/api/` 路径下配置 Sidebar，包含 API 文档（`/api/`）条目

### 需求 5：创建覆盖核心功能的示例项目

**用户故事：** 作为开发者，我希望有丰富的示例代码覆盖各种使用场景，以便我能快速理解和参考各功能的用法。

#### 验收标准

1. THE Example SHALL 采用编号命名的独立目录结构（如 `01-basic-usage`），每个目录包含 `.codesandbox/tasks.json`、`index.html`、`package.json`、`tsconfig.json`、`vite.config.ts`、`src/` 目录
2. THE Example 的 `package.json` SHALL 使用已发布的包版本作为 dependencies：`@kaokei/di: ^5.0.0`、`@kaokei/use-vue-service: ^4.0.0`、`vue: ^3.5.13`，devDependencies 包含 `@vitejs/plugin-vue: ^6.0.0`、`vite: ^6.0.0`
3. THE Example SHALL 至少覆盖以下场景，每个场景一个独立示例目录：
   - 基本用法（declareProviders + useService）
   - 服务间依赖注入（@Inject）
   - 三层级服务作用域（组件级 / App 级 / 全局级）
   - @Computed 装饰器
   - @Raw 装饰器
   - @RunInScope 装饰器
   - FIND_CHILD_SERVICE / FIND_CHILDREN_SERVICES
   - Token 系统与自定义绑定
   - Vue Router 集成
   - @PostConstruct 生命周期
   - LazyToken 解决循环依赖
   - App 级服务插件（declareAppProvidersPlugin）
4. WHEN 用户在 CodeSandbox 中打开任意 Example 时，THE Example SHALL 能够通过 `pnpm install` 安装依赖并通过 `pnpm start` 启动 Vite 开发服务器正常运行
5. THE Example 的 `vite.config.ts` SHALL 使用 `@vitejs/plugin-vue` 插件（因为是 Vue 项目）
6. THE Example 的 `.codesandbox/tasks.json` SHALL 配置 `setupTasks` 为 `pnpm install`，`tasks.start` 为 `pnpm start` 并设置 `runAtStart: true`

### 需求 6：创建 CodeSandbox 在线示例索引文档

**用户故事：** 作为开发者，我希望有一个索引页面列出所有示例及其 CodeSandbox 链接，以便我能快速找到并在线运行感兴趣的示例。

#### 验收标准

1. THE EXAMPLES_文档 SHALL 创建在 `docs/guide/EXAMPLES.md` 路径下
2. THE EXAMPLES_文档 SHALL 以表格形式列出所有示例，包含示例名称、说明、CodeSandbox 在线运行链接
3. THE EXAMPLES_文档 SHALL 使用 URL 格式 `https://codesandbox.io/p/sandbox/github/kaokei/use-vue-service/tree/main/examples/<示例目录>` 生成链接
4. THE EXAMPLES_文档 SHALL 说明每个示例目录包含独立的 `package.json`，与主包构建流程完全隔离，可直接在 CodeSandbox 中运行

### 需求 7：清理旧示例并保持目录结构一致

**用户故事：** 作为项目维护者，我希望 examples 目录结构统一规范，以便后续维护和扩展。

#### 验收标准

1. WHEN 旧的 `examples/demo1` 目录存在时，THE Example SHALL 将其内容迁移到新的编号命名目录中（如 `01-basic-usage`），或在确认新示例已覆盖其功能后删除
2. THE Example 的每个目录 SHALL 包含中文描述的 `package.json` description 字段，简要说明该示例演示的功能
3. THE Example 的 `tsconfig.json` SHALL 统一配置 `target: ES2022`、`module: ESNext`、`moduleResolution: bundler`、`strict: true`、`useDefineForClassFields: true`、`jsx: preserve`、`noEmit: true`
