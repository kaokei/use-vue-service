# 装饰器速查表

本库同时透传导出了 `@kaokei/di` 的全部装饰器（`@Injectable`、`@Inject`、`@PostConstruct`、`@PreDestroy`、`@Self`、`@SkipSelf`、`@Optional`、`@LazyInject`、`@autobind`），可直接从 `@kaokei/use-vue-service` 导入使用。详细说明请参阅 [@kaokei/di 装饰器文档](https://di.kaokei.com/decorator/)。

| 装饰器             | 无括号调用 | 有括号调用 | 依赖 `@Injectable` | 依赖 `@Inject` | 支持 `decorate()` |
| ------------------ | :--------: | :--------: | :----------------: | :------------: | :----------------------: |
| `@Computed`<br/>（getter） |     ✓      |     ✓      |         ✗          |       ✗        |            ✓             |
| `@Raw`<br/>（field）       |     ✓      |     ✓      |         ✗          |       ✗        |            ✗             |
| `@Raw`<br/>（accessor）    |     ✓      |     ✓      |         ✗          |       ✗        |            ✓             |
| `@Raw`<br/>（class）       |     ✓      |     ✓      |         ✓          |       ✗        |            ✓             |
| `@RunInScope`<br/>（method） |     ✓      |     ✓      |         ✗          |       ✗        |            ✓             |

**说明：**

- **无括号调用**：直接写 `@Computed`，装饰器本身作为装饰器使用。
- **有括号调用**：写成 `@Computed()`，装饰器作为工厂函数调用后返回真正的装饰器。
- **`@Raw`（field）不可在 `decorate()` 中使用**：field 形式内部使用了 `addInitializer`，而 `decorate()` 不支持该机制。
- **`@Raw`（class）依赖 `@Injectable`**：类形式通过 `context.metadata` 写入标记，元数据机制由 `@Injectable` 激活，因此必须配合使用。

---

## @Computed

```ts
// 用法一：不带括号
@Computed
public get doubleCount() { return this.count * 2; }

// 用法二：带括号
@Computed()
public get doubleCount() { return this.count * 2; }
```

getter 装饰器，将 class 的 getter 属性转换为 Vue 的 `computed` 响应式计算属性。支持只读和可写（writable）两种形式。如果原型链上存在同名 setter，则自动创建 `computed({ get, set })`。

[详细说明](../api/index.md#computed)

---

## @Raw

field / accessor / 类装饰器，标记属性或整个类不参与 Vue 响应式追踪。装饰属性时，赋值时自动调用 `markRaw`；装饰整个类时，实例不会被 `reactive()` 包裹。

### field 装饰器（不带括号）

```ts
@Raw
public chartInstance = {};
```

### field 装饰器（带括号）

```ts
@Raw()
public chartInstance = {};
```

::: warning
field 形式内部使用了 `addInitializer`，**不能在 `decorate()` 中使用**。
:::

### accessor 装饰器（不带括号）

```ts
@Raw
accessor chartInstance = {};
```

### accessor 装饰器（带括号）

```ts
@Raw()
accessor chartInstance = {};
```

### 类装饰器（不带括号）

```ts
@Injectable()
@Raw
class RawService {
  public data = {};
}
```

### 类装饰器（带括号）

```ts
@Injectable()
@Raw()
class RawService {
  public data = {};
}
```

::: warning
类形式通过 `context.metadata` 写入标记，元数据机制由 `@Injectable` 激活，因此必须配合 `@Injectable()` 使用。
:::

[详细说明](../api/index.md#raw)

---

## @RunInScope

```ts
// 用法一：不带括号
@RunInScope
public setup() { watchEffect(() => { /* ... */ }); }

// 用法二：带括号
@RunInScope()
public setup() { watchEffect(() => { /* ... */ }); }
```

方法装饰器，将方法体包裹在一个新的 Vue `EffectScope` 中执行，并返回该 `EffectScope`。方法内的 `watchEffect`、`watch`、`computed` 等副作用统一由该 scope 管理。**不会自动调用**被装饰的方法，需要用户主动调用。

[详细说明](../api/index.md#runinscope)
