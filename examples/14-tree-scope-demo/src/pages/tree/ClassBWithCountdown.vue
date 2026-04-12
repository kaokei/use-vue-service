<script setup lang="ts">
/**
 * ClassB 节点组件（带 Countdown 作用域）
 *
 * 声明新的 CountdownService 和 COUNTDOWN_THEME，
 * 展示最底层的倒计时服务覆盖。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { CountdownService } from '../../services/CountdownService';
import { COUNTDOWN_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';

const props = defineProps<{
  label: string;
  themeColor: string;
}>();

declareProviders((container) => {
  container.bind(CountdownService).toSelf();
  container.bind(COUNTDOWN_THEME).toConstantValue(props.themeColor);
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
