# 10 - @PostConstruct 生命周期

演示 `@PostConstruct` 装饰器在服务实例化后自动执行初始化方法。

## 演示内容

- `@PostConstruct` — 标记的方法会在实例创建并完成所有依赖注入后自动调用
- 无需手动调用初始化方法
- 适合用于依赖注入完成后的初始化操作

## 关键代码

```ts
@Injectable()
export class DataService {
  public data: string[] = [];
  public initialized = false;
  public logs: string[] = ['constructor: 服务实例已创建'];

  @PostConstruct
  public init() {
    this.initialized = true;
    this.data = ['苹果', '香蕉', '橙子'];
    this.logs.push('PostConstruct: init() 已自动执行');
  }
}
```

## 要点

- 获取服务实例时，`@PostConstruct` 标记的 `init()` 已经自动执行完毕
- 适合用于加载初始数据、建立连接等初始化操作
- 需要配合 `@Injectable()` 类装饰器使用

## 运行

```bash
pnpm install
pnpm start
```
