<script setup lang="ts">
/**
 * @Raw 装饰器示例
 *
 * 演示内容：
 * 1. @Raw（不带括号）装饰普通字段
 * 2. @Raw()（带括号）装饰普通字段
 * 3. @Raw（不带括号）装饰 auto-accessor
 * 4. @Raw()（带括号）装饰 auto-accessor
 * 5. 与普通响应式属性的对比
 *
 * 使用 isReactive 检测各属性的响应式状态，
 * @Raw 标记的属性始终为非响应式（isReactive 返回 false）。
 */
import { isReactive } from 'vue';
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { ChartService } from './ChartService';

// 声明服务提供者
declareProviders([ChartService]);

// 获取服务实例（已被 reactive 包装）
const chartService = useService(ChartService);

/**
 * 检查属性是否为响应式对象
 * @Raw 标记的属性应返回 false，普通对象属性应返回 true
 */
function checkReactive(value: unknown): string {
  if (typeof value !== 'object' || value === null) {
    return '非对象（不适用）';
  }
  return isReactive(value) ? '✅ 响应式' : '❌ 非响应式（Raw）';
}
</script>

<template>
  <div>
    <h1>05 - @Raw 装饰器</h1>
    <p>
      <code>@Raw</code> 装饰器用于标记属性不参与 Vue 响应式追踪。
      适用于第三方 SDK 对象（如 ECharts、Monaco Editor 等），避免性能问题。
    </p>

    <!-- 用法一：@Raw（不带括号）+ 普通字段 -->
    <section>
      <h2>用法一：@Raw + field</h2>
      <p>chartInstance = <code>{{ JSON.stringify(chartService.chartInstance) }}</code></p>
      <p>响应式状态：<strong>{{ checkReactive(chartService.chartInstance) }}</strong></p>
      <button @click="chartService.setChartInstance()">重新赋值 chartInstance</button>
    </section>

    <!-- 用法二：@Raw()（带括号）+ 普通字段 -->
    <section>
      <h2>用法二：@Raw() + field</h2>
      <p>editorInstance = <code>{{ JSON.stringify(chartService.editorInstance) }}</code></p>
      <p>响应式状态：<strong>{{ checkReactive(chartService.editorInstance) }}</strong></p>
      <button @click="chartService.setEditorInstance()">重新赋值 editorInstance</button>
    </section>

    <!-- 用法三：@Raw（不带括号）+ auto-accessor -->
    <section>
      <h2>用法三：@Raw + auto-accessor</h2>
      <p>mapInstance = <code>{{ JSON.stringify(chartService.mapInstance) }}</code></p>
      <p>响应式状态：<strong>{{ checkReactive(chartService.mapInstance) }}</strong></p>
      <button @click="chartService.setMapInstance()">重新赋值 mapInstance</button>
    </section>

    <!-- 用法四：@Raw()（带括号）+ auto-accessor -->
    <section>
      <h2>用法四：@Raw() + auto-accessor</h2>
      <p>canvasInstance = <code>{{ JSON.stringify(chartService.canvasInstance) }}</code></p>
      <p>响应式状态：<strong>{{ checkReactive(chartService.canvasInstance) }}</strong></p>
      <button @click="chartService.setCanvasInstance()">重新赋值 canvasInstance</button>
    </section>

    <!-- 对比：普通响应式属性 -->
    <section>
      <h2>对比：普通响应式属性</h2>
      <p>zoom = <strong>{{ chartService.zoom }}</strong></p>
      <p>
        <small>zoom 是基本类型，不适用 isReactive 检测；但它作为 reactive 对象的属性，修改后视图会自动更新。</small>
      </p>
      <button @click="chartService.incrementZoom()">zoom++</button>
    </section>

    <!-- 总结说明 -->
    <section>
      <h2>总结</h2>
      <ul>
        <li><code>@Raw</code> 和 <code>@Raw()</code> 效果完全相同，只是语法形式不同</li>
        <li>支持装饰普通字段（field）和 auto-accessor 两种目标</li>
        <li>初始值和后续赋值都会自动调用 <code>markRaw</code></li>
        <li>被标记的属性值不会被 Vue 的响应式系统代理</li>
      </ul>
    </section>
  </div>
</template>
