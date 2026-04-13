# 06 - @RunInScope 装饰器

演示 `@RunInScope` 装饰器将方法包装在 `EffectScope` 中执行，统一管理副作用生命周期。

## 演示内容

- `@RunInScope` 为方法创建独立的 `EffectScope`
- 方法内的 `watchEffect` 由该 scope 管理
- 调用 `scope.stop()` 一次性清理所有副作用

## 关键代码

```ts
export class TimerService {
  public count = 0;
  public logs: string[] = [];

  @RunInScope
  public startWatch(): EffectScope {
    watchEffect(() => {
      this.logs.push(`[watchEffect] count 变为 ${this.count}`);
    });
    return null as any; // 装饰器会替换返回值为 EffectScope
  }
}
```

## 操作流程

1. 点击"启动监听"→ 调用 `startWatch()`，`watchEffect` 立即执行一次
2. 点击"递增 count"→ count 变化触发 `watchEffect`，产生新日志
3. 点击"停止监听"→ 调用 `scope.stop()`，清理所有副作用
4. 再次点击"递增 count"→ count 变化但不再触发 `watchEffect`

## 要点

- 方法体内返回 `void`，但装饰器在运行时会将返回值替换为 `EffectScope`
- 适合需要手动控制副作用生命周期的场景

## 运行

```bash
pnpm install
pnpm start
```
