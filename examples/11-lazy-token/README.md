# 11 - LazyToken 解决循环依赖

演示两个服务互相依赖时，如何通过 `LazyToken` 延迟解析避免循环引用。

## 演示内容

- `LazyToken` — 接收工厂函数 `() => ServiceClass`，在实际解析时才调用
- ServiceA ↔ ServiceB 互相依赖的场景
- 循环引用验证

## 关键代码

```ts
@Injectable()
export class ServiceA {
  @Inject(new LazyToken(() => ServiceB))
  public serviceB!: ServiceB;
}

@Injectable()
export class ServiceB {
  @Inject(new LazyToken(() => ServiceA))
  public serviceA!: ServiceA;
}
```

## 要点

- `LazyToken` 解决的是模块加载时的循环引用问题（JavaScript 模块系统层面）
- DI 容器通过先实例化再注入属性的策略，天然支持运行时的循环依赖
- 两个服务都使用 `LazyToken`，确保无论哪个先被加载都不会出现引用错误
- 页面中会验证 `serviceA.serviceB === serviceB` 和 `serviceB.serviceA === serviceA`

## 运行

```bash
pnpm install
pnpm start
```
