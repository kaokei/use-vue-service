# 02 - 服务间依赖注入

演示服务之间如何通过 `@Inject` 装饰器自动注入依赖。

## 演示内容

- `@Inject(ServiceClass)` — 属性装饰器，声明对其他服务的依赖
- `@Injectable()` — 类装饰器，凡是使用了 `@Inject` 的类都必须添加
- DI 容器自动解析依赖关系

## 关键代码

```ts
@Injectable()
export class CountService {
  public count = 0;

  @Inject(LoggerService)
  logger!: LoggerService;

  public addOne() {
    this.count++;
    this.logger.log('addOne ==>', this.count);
  }
}
```

```vue
<script setup lang="ts">
// 声明两个服务，DI 容器会自动处理 CountService 对 LoggerService 的依赖
declareProviders([CountService, LoggerService]);
const countService = useService(CountService);
</script>
```

## 要点

- `@Injectable()` 是必须的——凡是使用了 `@Inject` 等成员装饰器的类，都需要添加
- `declareProviders` 声明多个服务后，容器会在实例化时自动注入依赖
- 打开浏览器控制台可以看到 `LoggerService` 输出的日志

## 运行

```bash
pnpm install
pnpm start
```
