<script setup lang="ts">
/**
 * 倒计时展示组件
 *
 * 非受控组件，通过 useService 从最近的容器中获取 CountdownService 实例。
 * 同时获取 COUNTDOWN_THEME 和 SwitchService 来控制背景色。
 */
import { computed } from 'vue';
import { useService } from '@kaokei/use-vue-service';
import { COUNTDOWN_THEME } from '../services/tokens';
import { CountdownService } from '../services/CountdownService';
import { SwitchService } from '../services/SwitchService';

const props = defineProps<{
  name: string;
  add: number;
  minus: number;
}>();

const countdownService = useService(CountdownService);
const theme = useService(COUNTDOWN_THEME);
const switchService = useService(SwitchService);

const bgTheme = computed(() => {
  if (switchService.countdownStatus === 1) {
    return theme;
  }
  return 'transparent';
});
</script>

<template>
  <div class="container" :style="{ background: bgTheme }">
    <span class="title">{{ name }}:</span>
    <button type="button" @click="countdownService.minus(minus)">
      - {{ minus }}
    </button>
    <span class="count-num">{{ countdownService.time }}</span>
    <button type="button" @click="countdownService.add(add)">
      + {{ add }}
    </button>
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
