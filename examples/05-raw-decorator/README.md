# 05 - @Raw 装饰器

演示 `@Raw` 装饰器标记属性不参与 Vue 响应式追踪。

## 演示内容

1. `@Raw` + 普通字段（field）
2. `@Raw()` + 普通字段（field）
3. `@Raw` + auto-accessor
4. `@Raw()` + auto-accessor
5. 与普通响应式属性的对比

## 适用场景

第三方 SDK 对象（如 ECharts 实例、Monaco Editor 实例、地图 SDK 等），这些对象被 Vue 的响应式系统代理后可能导致性能问题或功能异常。

## 关键代码

```ts
export class ChartService {
  @Raw
  chartInstance: Record<string, any> = { type: 'echarts' };

  @Raw()
  editorInstance: Record<string, any> = { type: 'monaco' };

  @Raw
  accessor mapInstance: Record<string, any> = { type: 'mapbox' };

  @Raw()
  accessor canvasInstance: Record<string, any> = { type: 'canvas2d' };
}
```

## 要点

- `@Raw` 和 `@Raw()` 效果完全相同，支持 field 和 auto-accessor 两种目标
- 初始值和后续赋值都会自动调用 `markRaw`
- 被标记的属性值不会被 Vue 的响应式系统代理（`isReactive` 返回 `false`）

## 运行

```bash
pnpm install
pnpm start
```
