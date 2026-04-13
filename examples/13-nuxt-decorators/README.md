# 13 - Nuxt 装饰器集成

演示在 Nuxt 4 项目中使用 TC39 Stage 3 装饰器配合 DI 系统。

## 演示内容

- Nuxt 4 的 `experimental.decorators: true` 配置
- 在 Nuxt 项目中使用 `@Injectable`、`@Inject`、`@Computed` 装饰器
- SSR 关闭（`ssr: false`）的客户端渲染模式

## 配置要点

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: { decorators: true },
  ssr: false,
});
```

## 关键代码

```ts
// CountService.ts — 综合使用 @Injectable、@Inject、@Computed
@Injectable()
export class CountService {
  public count = 0;

  @Inject(LoggerService)
  public logger!: LoggerService;

  @Computed
  public get displayCount(): string {
    return `当前计数：${this.count}`;
  }
}
```

```ts
// GreetingService.ts — 使用 @Computed
export class GreetingService {
  public name = 'Nuxt';

  @Computed
  public get greeting(): string {
    return `你好，${this.name}！欢迎使用 Nuxt 装饰器 🎉`;
  }
}
```

## 要点

- `@kaokei/use-vue-service` 可以无缝集成到 Nuxt 项目中
- 只需开启 `experimental.decorators: true` 即可使用全部 DI 功能
- 本示例关闭了 SSR，以客户端渲染模式运行

## 文件结构

- `nuxt.config.ts` — Nuxt 配置，开启装饰器支持
- `app/app.vue` — 根组件
- `app/services/CountService.ts` — 计数服务（@Injectable + @Inject + @Computed）
- `app/services/GreetingService.ts` — 问候服务（@Computed）
- `app/services/LoggerService.ts` — 日志服务

## 运行

```bash
pnpm install
pnpm run dev
```
