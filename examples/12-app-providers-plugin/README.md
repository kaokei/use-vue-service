# 12 - App 级服务插件

演示 `declareAppProvidersPlugin` 以 Vue 插件形式声明 App 级服务。

## 演示内容

- `declareAppProvidersPlugin` — 返回一个 Vue 插件，通过 `app.use()` 安装
- App 级服务在整个应用范围内共享
- 所有组件都可以通过 `useService` 获取，无需在组件内调用 `declareProviders`
- `useAppService(token, app)` — 显式指定 app 实例从 App 级容器获取服务

## 关键代码

```ts
// main.ts
const app = createApp(App);
app.use(declareAppProvidersPlugin([AppConfigService]));
app.mount('#app');
```

```vue
<!-- 任意组件中直接获取 -->
<script setup lang="ts">
const configService = useService(AppConfigService);
</script>
```

## 要点

- `declareAppProvidersPlugin` 是声明全局共享服务的推荐方式
- 以 Vue 插件形式集成，使用简洁
- 根组件和子组件获取到的是同一个服务实例
- `useService` 与 `useAppService` 在组件树中获取同一 App 级服务时，返回的是同一实例
- `useAppService` 适合在组件外部（路由守卫、工具函数）显式指定 app 实例来获取 App 级服务

## 文件结构

- `main.ts` — 通过 `app.use()` 注册 App 级服务
- `App.vue` — 根组件，获取 App 级服务
- `Child.vue` — 子组件，获取同一个 App 级服务实例
- `AppConfigService.ts` — 应用配置服务

## 运行

```bash
pnpm install
pnpm start
```
