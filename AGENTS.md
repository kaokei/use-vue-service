# AGENTS.md

## 开发命令

- **安装依赖**: `pnpm install`（pnpm workspace 项目，Node ≥ 20）
- **运行测试（watch 模式）**: `pnpm test`
- **运行单次测试+覆盖率**: `pnpm coverage`
- **构建**: `pnpm build`（先 `vue-tsc -b tsconfig.app.json` 类型检查，再 `vite build` 打包）
- **文档开发**: `pnpm docs:dev` / `pnpm docs:build` / `pnpm docs:preview`

强烈建议在修改代码后按此顺序验证：`build → coverage`

## 项目结构

这是一个 pnpm workspace 单体仓库，根包 `@kaokei/use-vue-service` 是核心库，另外两个 workspace 子包：

- `nuxt-plugin/` — `@kaokei/nuxt-use-vue-service`，Nuxt 自动导入模块
- `devtools/` — `@kaokei/devtools-use-vue-service`，Vue DevTools 插件

核心库源码全部在 `src/`，入口 `src/index.ts`。该库重导出 `@kaokei/di` 的所有 API 并补充 Vue 组件级 DI 功能。

## 关键架构要点

- 三组作用域 API：组件级（`useService`/`declareProviders`）、全局根级（`useRootService`/`declareRootProviders`）、App 级（`useAppService`/`declareAppProviders`）
- 仅 `vue` 和 `@kaokei/di` 是外部化依赖（peerDependencies），不打包进产物
- 构建产物同时输出 ESM（`.js`）和 CJS（`.cjs`/`.d.cts`），通过 `vite-plugin-dts` 生成类型声明

## 测试

- 测试框架：Vitest（jsdom 环境，globals 模式）
- 测试目录 `tests/`，包含 `test1` 到 `test26` 等多个编号子目录
- 路径别名：`@/` → `src/`，`@tests/` → `tests/`
- 覆盖率仅统计 `src/**/*.ts`，排除 `src/interface.ts`

## 代码风格

- Prettier：单引号、尾逗号 es5、箭头函数省略括号、2 空格缩进
- TypeScript strict 模式，`noUnusedLocals` 和 `noUnusedParameters` 均开启
- 源码注释为中文