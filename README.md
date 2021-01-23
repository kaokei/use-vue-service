# 官网
- [documentation](https://use-vue-service-demo.vercel.app/)
## 简介
灵感来自angular中的服务的概念。在angular中不需要全局唯一的数据源store。而是通过声明服务，以及向组件中注入服务来达到数据管理以及数据共享的。

本库也是实现了类似的效果，可以通过依赖注入实现面向服务编程、实现领域驱动开发。从而可以代替vuex。

本库通过类来声明服务，对typescript支持非常棒。

## 常用命令
- 运行demo网站 `npm run dev`
- 运行单元测试 `npm run unit`
- 发布新版本 `npm run release patch`
- 发布npm包 `npm publish`

## 项目技术特点
- 自带单元测试
- 自带示例demo网站
- 使用typescript
- 使用editconfig配置通用编辑器规范
- 使用eslint配合编辑器作语法检查
- 使用eslint配合prettier来格式化代码
- 使用eslint配合husky以及lint-stage自动格式化提交的代码，保证git仓库代码的规范性
- 使用rollup打包源码

## bug记录
1. example中的文件import时路径解析有点问题。

主要是因为在tsconfig.json中配置了paths。
观察到example中的ts文件会使用example目录下的tsconfig.json文件中的paths配置。
但是example中的vue文件则会使用根目录下的tsconfig.json文件中的paths配置。
总结就是ts文件中的解析机制是正确的，它会寻找最近的tsconfig.json文件。而vue文件则总是从根目录寻找。

2. vue-class-component和vue-test-utils似乎配合有点问题

观察到的现象是vue-class-component定义的组件中，template中访问到的变量似乎在组件创建之前就访问了，此时访问到的数据还没有定义
