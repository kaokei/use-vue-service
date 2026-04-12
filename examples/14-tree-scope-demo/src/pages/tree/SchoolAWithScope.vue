<script setup lang="ts">
/**
 * SchoolA 节点组件（带作用域）
 *
 * 声明新的 CounterService 和 COUNTER_THEME，
 * 使得子组件获取到的是本层级的服务实例。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { COUNTER_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';
import ClassAWithScope from './ClassAWithScope.vue';
import ClassLeaf from './ClassLeaf.vue';

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
    <div class="box">
      <ClassAWithScope :label="`${label}/ClassA`" theme-color="#ff7875" />
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
