# Monorepo 子包架构搭建实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 monorepo 基础上新增 `nuxt-plugin` 和 `devtools` 两个子包，完整实现 nuxt-plugin（自动导入所有 API），并搭建 devtools 骨架。

**Architecture:** 采用扁平目录方案，`nuxt-plugin/` 和 `devtools/` 直接置于根目录，扩展 `pnpm-workspace.yaml` 纳入两个子包。nuxt-plugin 使用 `@nuxt/kit` 的 `defineNuxtModule` + `addImports` 实现零配置自动导入；devtools 作为 Vite 插件骨架，生产环境自动禁用。

**Tech Stack:** pnpm workspace、@nuxt/kit 4.4.2、TypeScript、Vite

---

## 文件结构

### 新增文件

```
nuxt-plugin/
├── src/
│   └── module.ts          # Nuxt 模块主入口，defineNuxtModule + addImports
├── package.json           # 包声明，dependencies 含主库和 @kaokei/di
└── tsconfig.json          # TypeScript 配置

devtools/
├── src/
│   └── index.ts           # Vite 插件入口骨架
├── package.json           # 包声明，peerDependencies 含 vite
└── tsconfig.json          # TypeScript 配置
```

### 修改文件

```
pnpm-workspace.yaml        # 新增 nuxt-plugin 和 devtools 条目
```

---

## Task 1: 更新 pnpm-workspace.yaml

**Files:**
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: 更新 pnpm-workspace.yaml**

将文件内容替换为：

```yaml
packages:
  - 'examples/*'
  - 'nuxt-plugin'
  - 'devtools'
```

- [ ] **Step 2: 验证文件内容正确**

```bash
cat pnpm-workspace.yaml
```

期望输出：

```
packages:
  - 'examples/*'
  - 'nuxt-plugin'
  - 'devtools'
```

- [ ] **Step 3: Commit**

```bash
git add pnpm-workspace.yaml
git commit -m "chore: extend pnpm workspace to include nuxt-plugin and devtools"
```

---

## Task 2: 搭建 nuxt-plugin 包结构

**Files:**
- Create: `nuxt-plugin/package.json`
- Create: `nuxt-plugin/tsconfig.json`

- [ ] **Step 1: 创建 nuxt-plugin/package.json**

```json
{
  "name": "@kaokei/nuxt-use-vue-service",
  "version": "1.0.0",
  "type": "module",
  "description": "Nuxt module for @kaokei/use-vue-service — zero-config auto-imports",
  "main": "./dist/module.cjs",
  "module": "./dist/module.mjs",
  "types": "./dist/module.d.ts",
  "exports": {
    ".": {
      "import": "./dist/module.mjs",
      "require": "./dist/module.cjs"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build build --stub",
    "prepare": "nuxt-module-build build --stub"
  },
  "dependencies": {
    "@kaokei/di": "^5.0.8",
    "@kaokei/use-vue-service": "^4.0.2"
  },
  "devDependencies": {
    "@nuxt/kit": "^4.4.2",
    "@nuxt/module-builder": "^0.9.3",
    "@nuxt/schema": "^4.4.2",
    "nuxt": "^3.17.1"
  },
  "peerDependencies": {
    "nuxt": "^3.0.0"
  },
  "author": "kaokei",
  "license": "MIT"
}
```

- [ ] **Step 2: 创建 nuxt-plugin/tsconfig.json**

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

- [ ] **Step 3: Commit**

```bash
git add nuxt-plugin/package.json nuxt-plugin/tsconfig.json
git commit -m "chore: scaffold nuxt-plugin package structure"
```

---

## Task 3: 实现 nuxt-plugin 模块主体

**Files:**
- Create: `nuxt-plugin/src/module.ts`

- [ ] **Step 1: 创建 src 目录并实现 module.ts**

创建 `nuxt-plugin/src/module.ts`，内容如下：

```ts
import { defineNuxtModule, addImports } from '@nuxt/kit'

const MODULE_NAME = 'use-vue-service'
const FROM = '@kaokei/use-vue-service'

export default defineNuxtModule({
  meta: {
    name: MODULE_NAME,
    configKey: 'useVueService',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  setup() {
    addImports([
      // --- @kaokei/use-vue-service 核心 API ---
      { from: FROM, name: 'useService' },
      { from: FROM, name: 'declareProviders' },
      { from: FROM, name: 'useRootService' },
      { from: FROM, name: 'declareRootProviders' },
      { from: FROM, name: 'useAppService' },
      { from: FROM, name: 'declareAppProviders' },
      { from: FROM, name: 'declareAppProvidersPlugin' },
      { from: FROM, name: 'FIND_CHILD_SERVICE' },
      { from: FROM, name: 'FIND_CHILDREN_SERVICES' },
      { from: FROM, name: 'Computed' },
      { from: FROM, name: 'Raw' },
      { from: FROM, name: 'RunInScope' },
      // --- @kaokei/di 重导出 API ---
      { from: FROM, name: 'Token' },
      { from: FROM, name: 'LazyToken' },
      { from: FROM, name: 'Inject' },
      { from: FROM, name: 'Self' },
      { from: FROM, name: 'SkipSelf' },
      { from: FROM, name: 'Optional' },
      { from: FROM, name: 'PostConstruct' },
      { from: FROM, name: 'PreDestroy' },
      { from: FROM, name: 'Injectable' },
      { from: FROM, name: 'decorate' },
      { from: FROM, name: 'LazyInject' },
      { from: FROM, name: 'createLazyInject' },
      { from: FROM, name: 'autobind' },
      { from: FROM, name: 'Container' },
      { from: FROM, name: 'Binding' },
      // --- 类型导入 ---
      { from: FROM, name: 'TokenType', type: true },
      { from: FROM, name: 'FindChildService', type: true },
      { from: FROM, name: 'FindChildrenServices', type: true },
    ])
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add nuxt-plugin/src/module.ts
git commit -m "feat(nuxt-plugin): implement zero-config auto-imports module"
```

---

## Task 4: 搭建 devtools 包结构

**Files:**
- Create: `devtools/package.json`
- Create: `devtools/tsconfig.json`
- Create: `devtools/src/index.ts`

- [ ] **Step 1: 创建 devtools/package.json**

```json
{
  "name": "@kaokei/devtools-use-vue-service",
  "version": "1.0.0",
  "type": "module",
  "description": "Vite devtools plugin for @kaokei/use-vue-service",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./vite": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "peerDependencies": {
    "vite": "^5.0.0 || ^6.0.0",
    "@kaokei/use-vue-service": "^4.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "~5.6.3"
  },
  "author": "kaokei",
  "license": "MIT"
}
```

- [ ] **Step 2: 创建 devtools/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 devtools/src/index.ts 骨架**

```ts
import type { Plugin } from 'vite'

export default function devtoolsPlugin(): Plugin {
  return {
    name: 'vite-plugin-use-vue-service-devtools',
    apply: 'serve',
    transformIndexHtml() {
      // TODO: 注入悬浮面板 UI（待 devtools 面板功能开发后实现）
      return []
    },
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add devtools/package.json devtools/tsconfig.json devtools/src/index.ts
git commit -m "chore: scaffold devtools package structure"
```

---

## Task 5: 安装依赖并验证 monorepo 链接

**Files:**（无新增文件，验证任务）

- [ ] **Step 1: 在根目录安装所有依赖**

```bash
pnpm install
```

期望输出：包含 `nuxt-plugin` 和 `devtools` 的 workspace 链接信息，无报错。

- [ ] **Step 2: 验证 workspace 包被正确识别**

```bash
pnpm ls -r --depth 0
```

期望输出中应包含：
```
@kaokei/nuxt-use-vue-service
@kaokei/devtools-use-vue-service
```

- [ ] **Step 3: Commit（如果 pnpm-lock.yaml 有变化）**

```bash
git add pnpm-lock.yaml
git commit -m "chore: update lockfile after adding nuxt-plugin and devtools workspaces"
```
