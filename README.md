<h1 align="center">npm install @kaokei/use-vue-service</h1>

<div align="center">

[![Build Status](https://github.com/kaokei/use-vue-service/actions/workflows/build.yml/badge.svg)](https://github.com/kaokei/use-vue-service/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/kaokei/use-vue-service/badge.svg?branch=main)](https://coveralls.io/github/kaokei/use-vue-service?branch=main)
[![Downloads](https://img.shields.io/npm/dm/@kaokei/use-vue-service.svg?sanitize=true)](https://npmcharts.com/compare/@kaokei/use-vue-service?minimal=true)
[![Version](https://img.shields.io/npm/v/@kaokei/use-vue-service.svg?sanitize=true)](https://www.npmjs.com/package/@kaokei/use-vue-service)
[![License](https://img.shields.io/npm/l/@kaokei/use-vue-service.svg?sanitize=true)](https://www.npmjs.com/package/@kaokei/use-vue-service)
![GitHub Created At](https://img.shields.io/github/created-at/kaokei/use-vue-service?style=social)

</div>

灵感来自 angular 中的服务的概念。在 angular 中不需要全局唯一的数据源 store。而是通过声明服务，以及向组件中注入服务来达到数据管理以及数据共享的。

本库也是实现了类似的效果，可以通过依赖注入实现面向服务编程、实现领域驱动开发。从而可以代替 vuex。

本库通过类来声明服务，对 typescript 支持非常棒。

- [入门指南](./docs/guide/README.md)
- [API 文档](./docs/api/README.md)
- [博客文章](./docs/note/01.父组件与子组件的理解.md)
- [codesandbox example](https://codesandbox.io/s/di-playground-zjnyv)
- [online demo](https://use-vue-service.vercel.app/)
