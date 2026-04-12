<script setup lang="ts">
/**
 * 叶子节点 Class 组件（通用）
 *
 * 不声明新的服务提供者，直接从最近的祖先容器中获取 CounterService。
 * 用于 SchoolB 下的 ClassA/ClassB 等不需要声明新服务的叶子节点。
 */
import { useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';

const props = defineProps<{
  label: string;
}>();

const counterService = useService(CounterService);
</script>

<template>
  <div class="container">
    <h4>{{ label }}</h4>
    <div>
      <CounterView :name="`${label} Counter`" :counter="counterService" />
    </div>
    <div class="mt5">
      <CountdownView :name="`${label} Countdown`" :minus="10" :add="10" />
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
}
</style>
