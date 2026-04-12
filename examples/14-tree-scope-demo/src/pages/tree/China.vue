<script setup lang="ts">
/**
 * China 节点组件
 *
 * 声明新的 CounterService 和 COUNTER_THEME，
 * 包含 ProvinceA 和 ProvinceB 两个子节点。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { COUNTER_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';
import ProvinceA from './ProvinceA.vue';
import ProvinceB from './ProvinceB.vue';

declareProviders((container) => {
  container.bind(CounterService).toSelf();
  container.bind(COUNTER_THEME).toConstantValue('#d3f261');
});

const counterService = useService(CounterService);
</script>

<template>
  <div class="container">
    <h4>China</h4>
    <div>
      <CounterView name="China Counter" :counter="counterService" />
    </div>
    <div class="mt5">
      <CountdownView name="China Countdown" :minus="60" :add="60" />
    </div>
    <div class="box">
      <ProvinceA />
      <ProvinceB />
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 4000px;
  margin: 0 auto;
  display: flex;
}
</style>
