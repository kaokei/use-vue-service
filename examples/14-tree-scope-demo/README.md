# 14 - 树形作用域演示

综合实战示例，演示多层级组件树中的服务作用域隔离与继承。

## 演示内容

- 多层级组件树（Global → Earth → China → Province → School → Class）
- 每个层级可以声明自己的服务实例，覆盖父级的绑定
- 相同背景色的区域共享同一个服务实例
- 结合 Vue Router 实现多页面演示

## 包含三个子页面

1. **树形作用域** — 展示多层级组件树中的服务作用域隔离与继承
2. **局部作用域** — 展示多个组件共享同一个 CounterService 实例，数据响应式同步更新
3. **Ref 与 Reactive** — 验证 Vue 响应式数据的深层响应特性

## 关键代码

```ts
// 在最顶层声明全局服务
declareProviders((container) => {
  container.bind(LoggerService).toSelf();
  container.bind(SwitchService).toSelf();
  container.bind(CounterService).toSelf();
  container.bind(CountdownService).toSelf();
  container.bind(COUNTER_THEME).toConstantValue('#69c0ff');
  container.bind(COUNTDOWN_THEME).toConstantValue('#69c0ff');
});
```

## 涉及的服务

- `CounterService` — 计数器服务，提供 count 和 age 两个计数属性
- `CountdownService` — 倒计时服务，支持自动倒计时
- `LoggerService` — 日志服务
- `SwitchService` — 开关服务，控制背景色显示/隐藏
- `COUNTER_THEME` / `COUNTDOWN_THEME` — Token，标识背景色

## 要点

- 通过背景色可以直观地看到哪些组件共享同一个服务实例
- 子层级声明新的服务实例会覆盖父级的绑定
- 未声明新服务的组件会继承最近祖先的服务实例
- 这是一个综合性的实战示例，涵盖了 Token、FunctionProvider、@Inject、多层级作用域等多个知识点

## 文件结构

```
src/
├── App.vue                    # 根组件，路由导航
├── router.ts                  # 路由配置
├── components/
│   ├── CounterView.vue        # 计数器展示组件
│   └── CountdownView.vue      # 倒计时展示组件
├── pages/
│   ├── TestTreeScope.vue      # 树形作用域页面
│   ├── TestPartialScope.vue   # 局部作用域页面
│   ├── TestRefAndReactive.vue # Ref 与 Reactive 页面
│   ├── tree/                  # 树形结构组件
│   └── partial/               # 局部作用域组件
└── services/
    ├── CounterService.ts      # 计数器服务
    ├── CountdownService.ts    # 倒计时服务
    ├── LoggerService.ts       # 日志服务
    ├── SwitchService.ts       # 开关服务
    └── tokens.ts              # Token 定义
```

## 运行

```bash
pnpm install
pnpm start
```
