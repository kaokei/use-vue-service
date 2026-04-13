# 01 - 基本用法

最简单的入门示例，展示 `@kaokei/use-vue-service` 的核心使用流程。

## 演示内容

- `declareProviders([ServiceClass])` — 在当前组件声明服务提供者
- `useService(ServiceClass)` — 获取服务实例
- 服务实例被 Vue 的 `reactive` 包装，属性变更自动更新视图

## 关键代码

```ts
// 定义服务类（普通 class 即可，无需装饰器）
export class CountService {
  public count = 0;
  public addOne() { this.count++; }
}
```

```vue
<script setup lang="ts">
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';

declareProviders([CountService]);
const countService = useService(CountService);
</script>
```

## 要点

- 服务类不需要任何装饰器，普通 class 就可以被 DI 容器管理
- `declareProviders` 在当前组件建立容器，子组件也可以通过 `useService` 获取同一实例
- 服务实例已被 `reactive` 包装，修改属性会自动触发视图更新

## 运行

```bash
pnpm install
pnpm start
```
