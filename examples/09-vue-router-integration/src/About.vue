<script setup lang="ts">
/**
 * 关于页路由组件
 *
 * 同样通过 declareProviders 声明自己的 CountService 实例。
 * 该实例与首页的 CountService 完全独立，互不影响。
 * 每次进入关于页都会创建全新的实例，离开时销毁。
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
    <h2>关于</h2>
    <p>这是关于页的 CountService 实例（组件级作用域）</p>
    <p>当前计数：{{ countService.count }}</p>
    <button @click="countService.increment">加一</button>
    <p style="color: gray; font-size: 14px;">
      提示：这里的计数与首页完全独立，切换路由后各自重置
    </p>
  </div>
</template>
