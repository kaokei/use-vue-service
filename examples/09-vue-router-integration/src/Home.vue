<script setup lang="ts">
/**
 * 首页路由组件
 *
 * 通过 declareProviders 声明自己的 CountService 实例。
 * 该实例的作用域绑定在当前路由组件上：
 * - 进入首页时创建新的 CountService 实例
 * - 离开首页时实例随组件销毁
 * - 与 About 页面的 CountService 实例完全独立
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';

// 在当前路由组件中声明服务，作用域为组件级
declareProviders([CountService]);

// 获取当前组件作用域内的 CountService 实例
const countService = useService(CountService);
</script>

<template>
  <div>
    <h2>首页</h2>
    <p>这是首页的 CountService 实例（组件级作用域）</p>
    <p>当前计数：{{ countService.count }}</p>
    <button @click="countService.increment">加一</button>
    <p style="color: gray; font-size: 14px;">
      提示：切换到关于页再切回来，计数会重置为 0（因为组件被销毁重建）
    </p>
  </div>
</template>
