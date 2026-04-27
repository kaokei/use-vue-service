# 16 - 服务继承

演示多层类继承结构中，`@Inject`、`@PostConstruct`、`@Computed` 装饰器的行为。

## 演示内容

- 三层继承：`TopService` → `MiddleService` → `BaseService`（`@Inject` 注入 `LogService`）
- 子类可访问父类通过 `@Inject` 注入的依赖
- 每个继承层级各自维护独立的计数属性，`increaseXxx` 只修改本层的计数
- `@PostConstruct` 在子类中使用，在依赖注入完成后执行初始化
- `@Computed` 在继承链的顶层服务中正常工作

## 继承结构

```
TopService
  └── MiddleService
        └── BaseService  ← @Inject(LogService)
```

## 关键代码

```ts
@Injectable()
export class BaseService {
  public countBase = 0;

  @Inject(LogService)
  public logService!: LogService;

  public increaseBase() { this.countBase++; }
}

export class MiddleService extends BaseService {
  public countMiddle = 0;
  public increaseMiddle() { this.countMiddle++; }
}

@Injectable()
export class TopService extends MiddleService {
  public countTop = 0;

  @Computed
  public get summary() {
    return `Base:${this.countBase} | Middle:${this.countMiddle} | Top:${this.countTop}`;
  }

  @PostConstruct()
  public init() {
    this.logService.log('TopService 初始化完成');
  }
}
```

## 要点

- 使用了 `@Inject` 的类需要标注 `@Injectable()`
- 子类如果也使用了 `@PostConstruct`，同样需要标注 `@Injectable()`
- 父类注入的依赖在子类中可以直接通过 `this.xxx` 访问
- 各层级的 `increaseXxx` 方法只影响本层的计数属性

## 运行

```bash
pnpm install
pnpm start
```
