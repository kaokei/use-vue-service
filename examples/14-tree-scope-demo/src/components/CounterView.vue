<script setup lang="ts">
/**
 * 计数器展示组件
 *
 * 受控组件，依赖父组件传入的 counter 实例。
 * 通过 useService 获取 COUNTER_THEME 和 SwitchService 来控制背景色。
 */
import { computed } from 'vue';
import { useService } from '@kaokei/use-vue-service';
import { COUNTER_THEME } from '../services/tokens';
import { SwitchService } from '../services/SwitchService';
import type { CounterService } from '../services/CounterService';

const props = defineProps<{
  name: string;
  counter: CounterService;
  bgColor?: string;
}>();

const theme = useService(COUNTER_THEME);
const switchService = useService(SwitchService);

const bgTheme = computed(() => {
  if (switchService.counterStatus === 1) {
    return props.bgColor || theme;
  }
  return 'transparent';
});
</script>

<template>
  <div class="container" :style="{ background: bgTheme }">
    <span class="title">{{ name }}:</span>
    <button type="button" @click="counter.decrement">-</button>
    <span class="count-num">{{ counter.count }}</span>
    <button type="button" @click="counter.increment">+</button>
  </div>
</template>

<style scoped>
.container {
  display: inline-block;
  padding: 2px 5px;
}
.title {
  font-weight: bold;
  margin-right: 10px;
  font-size: 14px;
}
.count-num {
  padding: 0 5px;
}
</style>
