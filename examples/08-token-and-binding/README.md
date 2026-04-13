# 08 - Token 系统与自定义绑定

演示使用 `Token` 实例作为服务标识符，以及 `FunctionProvider` 进行自定义绑定。

## 演示内容

- `Token<T>` — 泛型标识符，用于标识非类类型的服务
- `FunctionProvider` — `declareProviders` 的函数形式参数
- `toConstantValue` — 绑定静态常量值
- `toDynamicValue` — 绑定动态工厂值

## 关键代码

```ts
// 定义 Token
const API_URL = new Token<string>('API_URL');
const CONFIG = new Token<{ env: string; debug: boolean }>('CONFIG');

// 使用 FunctionProvider 进行自定义绑定
declareProviders((container) => {
  container.bind(API_URL).toConstantValue('https://api.example.com');
  container.bind(CONFIG).toDynamicValue(() => ({
    env: 'production',
    debug: false,
  }));
});

// 通过 Token 获取值，类型自动推导
const apiUrl = useService(API_URL);   // string
const config = useService(CONFIG);    // { env: string; debug: boolean }
```

## 要点

- 当需要注入非类类型的值（字符串、数字、对象等）时，使用 `Token` 作为标识符
- `FunctionProvider` 接收 `container` 实例，可以自由调用 `bind()` API
- `toConstantValue` 绑定固定值，`toDynamicValue` 绑定工厂函数（首次获取时执行，单例）

## 文件结构

- `tokens.ts` — 定义 Token 标识符
- `App.vue` — 使用 FunctionProvider 绑定值并获取

## 运行

```bash
pnpm install
pnpm start
```
