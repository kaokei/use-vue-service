<script setup lang="ts">
/**
 * ProvinceB 节点组件
 *
 * 声明新的 CountdownService 和 COUNTDOWN_THEME，
 * 包含 SchoolA（通用节点）和 SchoolB（带 Countdown 作用域）。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { CountdownService } from '../../services/CountdownService';
import { COUNTDOWN_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';
import SchoolNode from './SchoolNode.vue';
import SchoolBWithCountdown from './SchoolBWithCountdown.vue';

declareProviders((container) => {
  container.bind(CountdownService).toSelf();
  container.bind(COUNTDOWN_THEME).toConstantValue('#85a5ff');
});

const counterService = useService(CounterService);
</script>

<template>
  <div class="container">
    <h4>ProvinceB</h4>
    <div>
      <CounterView name="ProvinceB Counter" :counter="counterService" />
    </div>
    <div class="mt5">
      <CountdownView name="ProvinceB Countdown" :minus="30" :add="30" />
    </div>
    <div class="box">
      <SchoolNode label="ProvinceB/SchoolA" />
      <SchoolBWithCountdown
        label="ProvinceB/SchoolB"
        theme-color="#b37feb"
        :countdown-minus="20"
        :countdown-add="20"
      />
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
