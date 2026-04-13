# 03 - 三层级服务作用域

演示全局根级、App 级、组件级三层容器的层级覆盖关系。

## 演示内容

- `declareRootProviders` — 在全局根容器中声明服务
- `declareAppProvidersPlugin` — 在 App 级容器中声明服务（Vue 插件形式）
- `declareProviders` — 在组件级容器中声明服务
- `useRootService` / `useAppService` / `useService` — 分别从不同层级获取服务

## 容器继承关系

```
全局根级 → App 级 → 组件级
```

## 关键代码

```ts
// main.ts — 第一层：全局根级
declareRootProviders((container) => {
  container.bind(ConfigService).toDynamicValue(() => {
    const s = new ConfigService(); s.scope = '全局根级'; return s;
  });
});

// main.ts — 第二层：App 级
app.use(declareAppProvidersPlugin((container) => {
  container.bind(ConfigService).toDynamicValue(() => {
    const s = new ConfigService(); s.scope = 'App 级'; return s;
  });
}));

// App.vue — 第三层：组件级
declareProviders((container) => {
  container.bind(ConfigService).toDynamicValue(() => {
    const s = new ConfigService(); s.scope = '组件级'; return s;
  });
});
```

## 要点

- 获取服务时优先从最近的容器查找：组件级覆盖 App 级，App 级覆盖全局根级
- 子组件会继承父组件的容器，未声明新服务的子组件会沿组件树向上查找
- `useRootService` 始终从全局根容器获取，不受组件级覆盖影响

## 文件结构

- `main.ts` — 声明全局根级和 App 级服务
- `App.vue` — 声明组件级服务，展示三层对比
- `Child.vue` — 子组件，继承父组件的组件级容器
- `ConfigService.ts` — 通过 `scope` 属性标识所属层级

## 运行

```bash
pnpm install
pnpm start
```
