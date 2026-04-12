<script setup lang="ts">
/**
 * 基本用法示例
 *
 * 演示 declareProviders 声明服务 + useService 获取服务实例的基本流程：
 * 1. 使用 declareProviders 在当前组件声明服务提供者
 * 2. 使用 useService 获取服务实例
 * 3. 服务实例是响应式的，属性变更会自动更新视图
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CountService } from './CountService';

// 在当前组件声明服务提供者，子组件也可以通过 useService 获取同一实例
declareProviders([CountService]);

// 获取 CountService 的实例，该实例已被 reactive 包装
const countService = useService(CountService);
</script>

<template>
  <div>
    <h1>01 - 基本用法</h1>
    <p>演示 declareProviders + useService 的基本用法</p>

    <div>
      <p>当前计数：{{ countService.count }}</p>
      <button @click="countService.addOne">加一</button>
    </div>
  </div>
</template>
