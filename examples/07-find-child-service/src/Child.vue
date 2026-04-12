<script setup lang="ts">
/**
 * 子组件
 *
 * 使用 declareProviders 声明 ChildService，
 * 并通过 props 接收唯一名称，设置到服务实例上。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { ChildService } from './ChildService';

// 接收父组件传入的名称
const props = defineProps<{
  name: string;
}>();

// 在当前组件声明 ChildService 提供者
declareProviders([ChildService]);

// 获取当前组件的 ChildService 实例
const childService = useService(ChildService);

// 设置唯一名称
childService.name = props.name;
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 8px; margin: 4px 0;">
    <p>子组件：{{ childService.name }}</p>
    <p>问候语：{{ childService.greet() }}</p>
  </div>
</template>
