<script setup lang="ts">
/**
 * ClassA 节点组件（带作用域）
 *
 * 声明新的 CounterService 和 COUNTER_THEME，
 * 展示当前层级和父层级的 Counter 对比。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { COUNTER_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';

const props = defineProps<{
  label: string;
  themeColor: string;
}>();

declareProviders((container) => {
  container.bind(CounterService).toSelf();
  container.bind(COUNTER_THEME).toConstantValue(props.themeColor);
});

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
