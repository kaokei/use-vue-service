# 04 - @Computed 装饰器

演示 `@Computed` 装饰器将 getter 属性转换为 Vue 的 `computed` 响应式计算属性。

## 演示内容

1. `@Computed`（不带括号）— 只读计算属性
2. `@Computed()`（带括号）— 只读计算属性（工厂函数形式）
3. getter + setter 组合 — 可写计算属性
4. 缓存效果 — 依赖不变时不会重新计算

## 关键代码

```ts
export class UserService {
  public firstName = '张';
  public lastName = '三';

  @Computed
  public get fullName(): string {
    return `${this.firstName}${this.lastName}`;
  }

  @Computed
  public get writableFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  public set writableFullName(val: string) {
    this.firstName = val[0];
    this.lastName = val.slice(1).trim();
  }
}
```

## 要点

- `@Computed` 和 `@Computed()` 效果完全相同，只是语法形式不同
- 计算属性具有缓存特性，只有依赖的响应式数据变化时才会重新计算
- 可写计算属性需要同时定义 getter 和 setter
- 在 getter 中修改计数器时需要使用 `toRaw(this)` 避免 Computed 死循环

## 运行

```bash
pnpm install
pnpm start
```
