# 09 - Vue Router 集成

演示在路由组件中使用依赖注入服务，展示服务实例随路由切换的生命周期。

## 演示内容

- 路由组件中使用 `declareProviders` + `useService`
- 服务实例的作用域绑定在路由组件上
- 切换路由时组件销毁重建，服务实例也随之重建

## 关键代码

```ts
// Home.vue 和 About.vue 各自声明独立的 CountService
declareProviders([CountService]);
const countService = useService(CountService);
```

```ts
// router.ts
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];
```

## 要点

- 每个路由组件通过 `declareProviders` 声明的服务实例是独立的
- 切换路由后旧组件销毁、新组件创建，服务实例也会重建（计数重置为 0）
- 首页和关于页的 `CountService` 互不影响

## 文件结构

- `router.ts` — 路由配置
- `Home.vue` — 首页，声明自己的 CountService
- `About.vue` — 关于页，声明自己的 CountService
- `CountService.ts` — 计数服务

## 运行

```bash
pnpm install
pnpm start
```
