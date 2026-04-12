<script setup lang="ts">
/**
 * School 节点组件（通用）
 *
 * 用于不声明新服务的 School 节点（如 ProvinceA/SchoolB、ProvinceB/SchoolA）。
 * 直接从最近的祖先容器获取 CounterService。
 */
import { useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';
import ClassLeaf from './ClassLeaf.vue';

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
    <div class="box">
      <ClassLeaf :label="`${label}/ClassA`" />
      <ClassLeaf :label="`${label}/ClassB`" />
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 1000px;
  margin: 0 auto;
  display: flex;
}
</style>
