## DeepSeek 的流程设计

#### ​ 服务端渲染时

1. 创建独立上下文存储状态
2. 每次初始化 Store 时记录状态
3. 渲染结束后将状态注入 HTML

#### ​ 客户端水合时

1. 从 HTML 中提取序列化状态
2. 在初始化 Store 前注入保存的状态

#### 服务端状态收集

```js
// 服务端入口
import { createSSRApp } from 'vue';
import { createStore, serializeState } from 'your-store';

export async function render(url) {
  const ctx = {}; // 用于存储 SSR 上下文的空对象
  const app = createSSRApp(App);

  // 创建 Store 时绑定到上下文
  const store = createStore({ ssrContext: ctx });

  // 渲染组件（收集期间所有 Store 的状态会被记录到 ctx）
  const html = await renderToString(app);

  // 将状态序列化到 HTML
  const initialState = serializeState(ctx);
  return `
    <html>
      <head>
        <script>window.__INITIAL_STATE__ = ${JSON.stringify(
          initialState
        )}</script>
      </head>
      <body>${html}</body>
    </html>
  `;
}
```

#### 客户端水合逻辑

```js
// 客户端入口
import { createStore, hydrateStores } from 'your-store';

// 从全局变量读取服务端注入的状态
const initialState = window.__INITIAL_STATE__;

// 初始化 Store 前先水合
hydrateStores(initialState);

const store = createStore();
const app = createApp(App);
app.use(store);
app.mount('#app');
```

#### 核心 API 实现 - 状态序列化（服务端）

```js
// 序列化所有 Store 状态
export function serializeState(ssrContext) {
  const state = {};
  for (const storeId in ssrContext.stores) {
    state[storeId] = toRaw(ssrContext.stores[storeId].$state);
  }
  return state;
}
```

#### 核心 API 实现 - 水合函数（客户端）

```js
// 将状态注入到 Store 实例
let isHydrated = false;

export function hydrateStores(initialState) {
  if (isHydrated) return;
  for (const storeId in initialState) {
    const store = getStoreById(storeId);
    if (store) {
      store.$state = reactive(initialState[storeId]);
    }
  }
  isHydrated = true;
}
```

#### 改造 Store 构造函数

```js
class Store {
  constructor(id, options, ssrContext) {
    this.$id = id;
    // 服务端渲染时记录状态
    if (ssrContext && !ssrContext.stores) {
      ssrContext.stores = {};
    }
    if (ssrContext) {
      ssrContext.stores[id] = this;
    }
  }
}
```

#### 创建 Store 的工厂函数

```js
export function createStore(options, ssrContext) {
  return new Store(generateUniqueId(), options, ssrContext);
}
```
