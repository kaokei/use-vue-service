<script setup lang="ts">
/**
 * SchoolB 节点组件（带 Countdown 作用域）
 *
 * 声明新的 CountdownService 和 COUNTDOWN_THEME，
 * 使得子组件获取到的是本层级的倒计时服务实例。
 */
import { declareProviders, useService } from '@kaokei/use-vue-service';
import { CounterService } from '../../services/CounterService';
import { CountdownService } from '../../services/CountdownService';
import { COUNTDOWN_THEME } from '../../services/tokens';
import CounterView from '../../components/CounterView.vue';
import CountdownView from '../../components/CountdownView.vue';
import ClassLeaf from './ClassLeaf.vue';
import ClassBWithCountdown from './ClassBWithCountdown.vue';

const props = defineProps<{
  label: string;
  themeColor: string;
  countdownMinus?: number;
  countdownAdd?: number;
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
      <CountdownView
        :name="`${label} Countdown`"
        :minus="countdownMinus || 20"
        :add="countdownAdd || 20"
      />
    </div>
    <div class="box">
      <ClassLeaf :label="`${label}/ClassA`" />
      <ClassBWithCountdown :label="`${label}/ClassB`" theme-color="#ff85c0" />
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
