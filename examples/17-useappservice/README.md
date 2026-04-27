# 17 - useAppService 与 useService 的查找层级差异

演示在多层组件嵌套中，`useService` 取最近容器 vs `useAppService` 取 App 级容器的差异。

## 演示内容

- `useService(token)` — 沿组件树向上查找，返回**最近容器**中的实例
- `useAppService(token, app)` — 直接获取 **App 级容器**中的实例
- 当组件自身声明了同名服务时，两者返回不同实例
- 当组件未声明同名服务时，`useService` 会回退到 App 级，两者返回同一实例

## 组件树结构

```
App（App 级绑定 SharedService，name = 'App级'）
  └── DeepChild（自己也绑定一份 SharedService，name = '组件级'）
```

## 关键代码

```ts
// DeepChild.vue：自己声明了 SharedService
declareProviders([SharedService]);
const fromComponent = useService(SharedService);   // 来自 DeepChild 自己的容器

const app = inject<App>('app')!;
const fromApp = useAppService(SharedService, app); // 来自 App 级容器

// fromComponent !== fromApp（不同实例）
```

## 要点

- `useService` 遵循就近原则，找到最近的容器即返回
- `useAppService` 绕过组件树，直接访问 App 级容器，适合需要精确获取应用级共享状态的场景
- 使用 `app.provide('app', app)` 将 app 实例向下传递，子组件通过 `inject('app')` 获取

## 运行

```bash
pnpm install
pnpm start
```
