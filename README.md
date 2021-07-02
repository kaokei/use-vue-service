<h1 align="center">use-vue-service</h1>
<div align="center">

[![Build CI](https://github.com/kaokei/use-vue-service/actions/workflows/build.yml/badge.svg)](https://github.com/kaokei/use-vue-service/actions/workflows/build.yml) [![Coverage Status](https://coveralls.io/repos/github/kaokei/use-vue-service/badge.svg?branch=main)](https://coveralls.io/github/kaokei/use-vue-service?branch=main)

</div>

## 待修改的 5 个名字

- 项目名，也就是项目文件夹的名称，这个在我们创建项目时就已经指定了。
- package.json 中的 name，这个大多数时可能就是和项目名一致了，但是如果是带有 scope 的，或者驼峰的，都需要自己修改。
- package.json 中的 browserVariableName，这个大多数情况下不关心也不会有问题，但是如果我们想要编译的代码想要在浏览器中直接使用，最好是指定一个全局变量。
- package.json 中的 homepage，bugs-url，repository-url 这些外部链接。
- README.md 中的 github 地址。

## github 地址

- [github](https://github.com/kaokei/use-vue-service)

## 解决了什么问题？

## 整体方案以及使用方式

## 特性

使用 typescript，并且类型定义统一在 types 文件夹中，建议使用 module 来管理类型，而不是 script 来创建全局的类型。
`tsconfig.json`作为编辑器的默认配置文件，方便编辑器识别。实际构建时使用`tsconfig.app.json`文件

使用 esm 模块化规范

使用 npm 作为包管理

使用 git 作为代码版本工具。

编码规范使用 eslint+prettier+editorconfig

git commit message 采用 angular 规范，以及使用 commitlint 校验

使用 yorkie 自动化校验并格式化代码，自动化校验 commit message

使用 jest 作为单元测试，统一放在`tests`文件夹中。

可以在 playground 中进行代码实验，使用 vscode 配置.vscode/launch.json 可以调试 nodejs

使用 rollup 作为打包工具，同时打包出多个版本的 bundle。支持压缩/未压缩、使用 runtime/不使用 runtime、commonjs/esm、浏览器版本总共 10 个版本。

npm run release:first 第一次发布，会自动创建 CHANGELOG.md 文件
npm run release patch 发布新版本

使用 MIT 作为开源协议

# 官网

- [documentation](https://use-vue-service-demo.vercel.app/)

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

## bug 记录

1. vue-class-component 和 vue-test-utils 似乎配合有点问题

观察到的现象是 vue-class-component 定义的组件中，template 中访问到的变量似乎在组件创建之前就访问了，此时访问到的数据还没有定义

单元测试出现了一个 warning，[参考这里](https://github.com/vuejs/vue-cli/issues/5974#issuecomment-711069784)

`[Vue warn]: Property "name" was accessed during render but is not defined on instance.`

2. 本来是想实现@Skip 可以指定跳过的次数，后来废弃了这个特性，只是实现了@SkipSelf。

理由是不建议通过@Skip 来实现复杂命名空间的作用，我们可以利用 useClass 指向同一个 Service，但是提供不同的 provide 来实现多个服务。

3. 服务可能是有状态的

如果服务的状态可以直接设置初始值，那么是比较方便的。

如果服务的状态需要从服务器端获取，那么就会存在异步的问题，比如父子组件共享一个服务，在服务的状态还没有初始化完毕时，子组件就已经触发了某个动作去修改服务的状态，显然就会导致状态错乱。解决方案有两种。
第一种：使用 rxjs 的 observable 把状态变成流，不确定是否和 reactive 有冲突
第二种：就在在父组件中判断服务的状态是否已经 ready，如果 ready 了才显示子组件，否则展示 loading

4. injectFromSelf 实际上并不是和它的名字一样

因为 vue3 自带的 inject 依赖了原型链，并且子组件的 provides 属性默认就是父组件的 provides，从而导致虽然是从当前组件的 provides 开始寻找的服务。但是实际上这个服务有可能是从父组件的 Injector 中获取的。

关于这一点并不打算修复，主要是因为@Self 并不是特别常用的一个方法，如果我们使用@Self，那么我们应该自己明确调用了 declareProviders。另一个原因就是为了解决这个问题会引入不必要的复杂性。比如可以通过对比组件的 uid 和 Injector 的 uid 是否一致来解决问题。
