<script setup lang="ts">
/**
 * Earth 节点组件
 *
 * 声明新的 CountdownService 和 COUNTDOWN_THEME，
 * 作为树形结构的第二层节点。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { CountdownService } from '../../services/CountdownService';
import { COUNTDOWN_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';
import China from './China.vue';

declareProviders((container) => {
  container.bind(CountdownService).toSelf();
  container.bind(COUNTDOWN_THEME).toConstantValue('#5cdbd3');
});

const counterService = useService(CounterService);
</script>

<template>
  <div class="container">
    <h4>Earth</h4>
    <div>
      <CounterView name="Earth Counter" :counter="counterService" />
    </div>
    <div class="mt5">
      <CountdownView name="Earth Countdown" :minus="10" :add="10" />
    </div>
    <div>
      <China />
    </div>
  </div>
</template>
