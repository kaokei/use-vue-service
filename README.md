<h1 align="center">use-vue-service</h1>
<div align="center">

[![Build CI](https://github.com/kaokei/use-vue-service/actions/workflows/build.yml/badge.svg)](https://github.com/kaokei/use-vue-service/actions/workflows/build.yml) [![Coverage Status](https://coveralls.io/repos/github/kaokei/use-vue-service/badge.svg?branch=main)](https://coveralls.io/github/kaokei/use-vue-service?branch=main)

</div>

[documentation](https://kaokei.com/project/use-vue-service/)

[online playground](https://kaokei.com/project/use-vue-service/)

[online demo](https://use-vue-service.vercel.app/)

```bash
npm install @kaokei/use-vue-service @kaokei/di reflect-metadata
```

## 简介

灵感来自 angular 中的服务的概念。在 angular 中不需要全局唯一的数据源 store。而是通过声明服务，以及向组件中注入服务来达到数据管理以及数据共享的。

本库也是实现了类似的效果，可以通过依赖注入实现面向服务编程、实现领域驱动开发。从而可以代替 vuex。

本库通过类来声明服务，对 typescript 支持非常棒。

## 常用命令

- 运行 demo 网站 `npm run dev`
- 运行单元测试 `npm run unit`
- 发布新版本 `npm run release patch`
- 发布 npm 包 `npm publish`

## 项目技术特点

- 自带单元测试
- 自带示例 demo 网站
- 使用 typescript
- 使用 editconfig 配置通用编辑器规范
- 使用 eslint 配合编辑器作语法检查
- 使用 eslint 配合 prettier 来格式化代码
- 使用 eslint 配合 husky 以及 lint-stage 自动格式化提交的代码，保证 git 仓库代码的规范性
- 使用 rollup 打包源码

## MIT LICENSE
