## use-vue-service
Use angular service in vue.
发现angular中的依赖注入特别好用，于是写了这个库实现了vue中的依赖注入。
主要是解决了vue中的数据管理问题，当前一般的实现都是把数据放在vuex中作为全局单一数据源，有时候并不是很灵活。
有了依赖注入能力之后，就可以在vue中实现的领域驱动开发。
数据模型层和视图层可以分别由不同的人来开发，实现数据层和视图层的解耦。

## 常用命令
运行demo网站 `npm run dev`
运行单元测试 `npm test`
发布新版本 `npm run release patch`
发布npm包 `npm publish`

## 特点
自带单元测试
自带示例demo网站
使用typescript
使用editconfig配置通用编辑器规范
使用eslint配合编辑器作语法检查
使用eslint配合prettier来格式化代码
使用eslint配合husky以及lint-stage自动格式化提交的代码，保证git仓库代码的规范性
使用rollup打包源码
