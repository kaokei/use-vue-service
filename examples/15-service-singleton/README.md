# 15 - 服务单例性与多次 declareProviders

演示同一组件内多次调用 `declareProviders` 追加绑定，以及多次调用 `useService` 返回同一实例。

## 演示内容

- 多次调用 `declareProviders` 追加不同服务（不覆盖已有绑定）
- 多次调用 `useService(SameService)` 始终返回同一实例
- 通过任意引用修改服务状态，所有引用的视图同步更新
- 不同服务类之间的状态隔离

## 关键代码

```ts
// 分两次声明两个不同服务（等价于 declareProviders([CountService, OtherService])）
declareProviders([CountService]);
declareProviders([OtherService]);

// 多次获取同一服务，返回同一实例
const service1 = useService(CountService);
const service2 = useService(CountService);
// service1 === service2 → true
```

## 要点

- `declareProviders` 支持多次调用，每次追加绑定到同一容器
- 同一容器内每个服务类只有一个实例（单例）
- 不同服务类之间状态互不影响

## 运行

```bash
pnpm install
pnpm start
```
