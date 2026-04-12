import { Raw } from '@kaokei/use-vue-service';

/**
 * ChartService — 演示 @Raw 装饰器的四种组合用法
 *
 * @Raw 装饰器用于标记属性不参与 Vue 响应式追踪。
 * 当服务实例被 reactive() 包裹后，默认所有属性都会被递归转为响应式对象。
 * 对于复杂的第三方 SDK 对象（如 ECharts 实例、Monaco Editor 实例等），
 * 转为响应式会导致性能问题甚至功能异常。
 *
 * 四种组合：
 *   1. @Raw    + field          — 不带括号，装饰普通字段
 *   2. @Raw()  + field          — 带括号，装饰普通字段
 *   3. @Raw    + auto-accessor  — 不带括号，装饰 auto-accessor
 *   4. @Raw()  + auto-accessor  — 带括号，装饰 auto-accessor
 */
export class ChartService {
  // ========== 用法一：@Raw（不带括号）装饰普通字段 ==========
  // 模拟 ECharts 实例，不参与响应式追踪
  @Raw
  chartInstance: Record<string, any> = { type: 'echarts', bindings: [1, 2, 3] };

  // ========== 用法二：@Raw()（带括号）装饰普通字段 ==========
  // 模拟 Monaco Editor 实例，不参与响应式追踪
  @Raw()
  editorInstance: Record<string, any> = { type: 'monaco', language: 'typescript' };

  // ========== 用法三：@Raw（不带括号）装饰 auto-accessor ==========
  // 模拟地图 SDK 实例，不参与响应式追踪
  @Raw
  accessor mapInstance: Record<string, any> = { type: 'mapbox', zoom: 5 };

  // ========== 用法四：@Raw()（带括号）装饰 auto-accessor ==========
  // 模拟 Canvas 渲染上下文，不参与响应式追踪
  @Raw()
  accessor canvasInstance: Record<string, any> = { type: 'canvas2d', width: 800 };

  // ========== 对比：普通响应式属性 ==========
  // 未使用 @Raw，会被 Vue 转为响应式对象
  zoom = 10;

  // ========== 方法：演示赋值时也会自动 markRaw ==========

  /** 重新设置 chartInstance（@Raw field），新值也会被 markRaw */
  setChartInstance() {
    this.chartInstance = { type: 'echarts', bindings: [4, 5, 6], updated: true };
  }

  /** 重新设置 editorInstance（@Raw() field），新值也会被 markRaw */
  setEditorInstance() {
    this.editorInstance = { type: 'monaco', language: 'javascript', updated: true };
  }

  /** 重新设置 mapInstance（@Raw accessor），新值也会被 markRaw */
  setMapInstance() {
    this.mapInstance = { type: 'mapbox', zoom: 12, updated: true };
  }

  /** 重新设置 canvasInstance（@Raw() accessor），新值也会被 markRaw */
  setCanvasInstance() {
    this.canvasInstance = { type: 'canvas2d', width: 1920, updated: true };
  }

  /** 修改普通响应式属性 */
  incrementZoom() {
    this.zoom++;
  }
}
