<script setup lang="ts">
/**
 * ProvinceA 节点组件
 *
 * 声明新的 CounterService 和 COUNTER_THEME，
 * 包含 SchoolA（带 Counter 作用域）和 SchoolB（通用节点）。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { COUNTER_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';
import SchoolAWithScope from './SchoolAWithScope.vue';
import SchoolNode from './SchoolNode.vue';

declareProviders((container) => {
  container.bind(CounterService).toSelf();
  container.bind(COUNTER_THEME).toConstantValue('#ffc069');
});

const counterService = useService(CounterService);
</script>

<template>
  <div class="container">
    <h4>ProvinceA</h4>
    <div>
      <CounterView name="ProvinceA Counter" :counter="counterService" />
    </div>
    <div class="mt5">
      <CountdownView name="ProvinceA Countdown" :minus="10" :add="10" />
    </div>
    <div class="box">
      <SchoolAWithScope label="ProvinceA/SchoolA" theme-color="#ff9c6e" />
      <SchoolNode label="ProvinceA/SchoolB" />
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 2000px;
  margin: 0 auto;
  display: flex;
}
</style>
